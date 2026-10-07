import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from '../models/db';
import { config } from '../config';
import { GoogleAuthService } from '../services/googleAuthService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const generateToken = (user: UserRecord): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      acceptedTerms,
      acceptedPrivacy,
      barLicenseNumber,
      specialization,
      experience,
      hourlyRate,
      officeLocation,
      bio,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required.',
      });
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the Terms of Service and Privacy Policy to register.',
      });
    }

    const assignedRole = role === 'LAWYER' ? 'LAWYER' : 'CLIENT';

    // Verify license number if registering as a lawyer
    if (assignedRole === 'LAWYER' && (!barLicenseNumber || !barLicenseNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Nepal Bar Council License Number is required to register as an Advocate / Lawyer.',
      });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: UserRecord = {
      id: `usr_${Date.now()}`,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: assignedRole,
      phone: phone ? phone.trim() : undefined,
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // If registered as lawyer, create complete lawyer profile
    let lawyerProfile = null;
    if (assignedRole === 'LAWYER') {
      lawyerProfile = db.createLawyer({
        id: `law_${Date.now()}`,
        userId: newUser.id,
        name: `Adv. ${newUser.firstName} ${newUser.lastName}`,
        specialization: specialization || 'Corporate & Civil Law',
        barNumber: barLicenseNumber ? barLicenseNumber.trim() : `NBA-${Math.floor(1000 + Math.random() * 9000)}`,
        barLicenseNumber: barLicenseNumber ? barLicenseNumber.trim() : undefined,
        rating: 5.0,
        experience: experience ? Number(experience) : 1,
        hourlyRate: hourlyRate ? Number(hourlyRate) : 2500,
        officeLocation: officeLocation || 'Kathmandu, Nepal',
        isVerified: true,
        image: newUser.profilePicture || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
        bio: bio || 'Licensed legal advocate registered with the Nepal Bar Council.',
        email: newUser.email,
        phone: newUser.phone,
      });
    }

    const token = generateToken(newUser);
    const { password: _, ...sanitizedUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: {
          ...sanitizedUser,
          lawyerProfile,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed.',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = db.findUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user);
    const { password: _, ...sanitizedUser } = user;
    const lawyerProfile = user.role === 'LAWYER' ? db.findLawyerByUserId(user.id) : null;

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          ...sanitizedUser,
          lawyerProfile,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed.',
    });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const {
      credential,
      email,
      name,
      role,
      picture,
      barLicenseNumber,
      specialization,
      experience,
      hourlyRate,
      officeLocation,
      bio,
    } = req.body;

    const payload = credential || { email, name, picture };
    const googleProfile = await GoogleAuthService.verifyGoogleToken(payload);

    let user = db.findUserByEmail(googleProfile.email);
    let lawyerProfile = null;

    if (!user) {
      // Auto-register new user from Google
      const assignedRole = role === 'LAWYER' ? 'LAWYER' : 'CLIENT';
      user = {
        id: `usr_${Date.now()}`,
        email: googleProfile.email.toLowerCase(),
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        role: assignedRole,
        googleId: googleProfile.googleId,
        profilePicture: googleProfile.picture,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      db.createUser(user);

      if (assignedRole === 'LAWYER') {
        // Check if a seeded lawyer with this email already exists
        const existingLawyer = db.lawyers.find((l) => l.email?.toLowerCase() === user!.email.toLowerCase());
        if (existingLawyer) {
          existingLawyer.userId = user!.id;
          lawyerProfile = existingLawyer;
        } else {
          lawyerProfile = db.createLawyer({
            id: `law_${Date.now()}`,
            userId: user!.id,
            name: `Adv. ${user!.firstName} ${user!.lastName}`,
            specialization: specialization || 'Corporate & Civil Law',
            barNumber: barLicenseNumber ? barLicenseNumber.trim() : `NBA-${Math.floor(1000 + Math.random() * 9000)}`,
            barLicenseNumber: barLicenseNumber ? barLicenseNumber.trim() : undefined,
            rating: 5.0,
            experience: experience ? Number(experience) : 1,
            hourlyRate: hourlyRate ? Number(hourlyRate) : 2500,
            officeLocation: officeLocation || 'Kathmandu, Nepal',
            isVerified: true,
            image: user!.profilePicture || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
            bio: bio || 'Licensed legal advocate registered with Nepal Bar Council.',
            email: user!.email,
          });
        }
      }
    } else {
      if (!user.googleId) {
        // Link Google Account to existing user
        db.updateUser(user.id, {
          googleId: googleProfile.googleId,
          profilePicture: user.profilePicture || googleProfile.picture,
        });
      }
      if (role === 'LAWYER' && user.role !== 'LAWYER') {
        user = db.updateUser(user.id, { role: 'LAWYER' }) || user;
      }
      if (user.role === 'LAWYER') {
        lawyerProfile = db.findLawyerByUserId(user.id);
        if (!lawyerProfile) {
          const userEmail = user.email.toLowerCase();
          const existingLawyer = db.lawyers.find((l) => l.email?.toLowerCase() === userEmail);
          if (existingLawyer) {
            existingLawyer.userId = user.id;
            lawyerProfile = existingLawyer;
          } else {
            lawyerProfile = db.createLawyer({
              id: `law_${Date.now()}`,
              userId: user.id,
              name: `Adv. ${user.firstName} ${user.lastName}`,
              specialization: specialization || 'Corporate & Civil Law',
              barNumber: barLicenseNumber ? barLicenseNumber.trim() : `NBA-${Math.floor(1000 + Math.random() * 9000)}`,
              barLicenseNumber: barLicenseNumber ? barLicenseNumber.trim() : undefined,
              rating: 5.0,
              experience: experience ? Number(experience) : 1,
              hourlyRate: hourlyRate ? Number(hourlyRate) : 2500,
              officeLocation: officeLocation || 'Kathmandu, Nepal',
              isVerified: true,
              image: user.profilePicture || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
              bio: bio || 'Licensed legal advocate registered with Nepal Bar Council.',
              email: user.email,
            });
          }
        }
      }
    }

    const token = generateToken(user);
    const { password: _, ...sanitizedUser } = user;

    return res.json({
      success: true,
      message: 'Google authentication successful.',
      data: {
        token,
        user: {
          ...sanitizedUser,
          lawyerProfile,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Google authentication failed.',
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { password: _, ...sanitizedUser } = req.user;
    const lawyerProfile = req.user.role === 'LAWYER' ? db.findLawyerByUserId(req.user.id) : undefined;
    return res.json({
      success: true,
      data: {
        user: {
          ...sanitizedUser,
          lawyerProfile,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve profile.',
    });
  }
};
