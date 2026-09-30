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
    const { email, password, firstName, lastName, role, phone, acceptedTerms, acceptedPrivacy } = req.body;

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

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'LAWYER' ? 'LAWYER' : 'CLIENT';

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

    // If registered as lawyer, auto-seed a lawyer profile
    if (assignedRole === 'LAWYER') {
      db.createLawyer({
        id: `law_${Date.now()}`,
        userId: newUser.id,
        name: `Adv. ${newUser.firstName} ${newUser.lastName}`,
        specialization: 'Civil & Commercial Law',
        barNumber: `NBA-${Math.floor(1000 + Math.random() * 9000)}`,
        rating: 5.0,
        experience: 1,
        hourlyRate: 2000,
        officeLocation: 'Kathmandu, Nepal',
        isVerified: true,
        image: newUser.profilePicture || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
        bio: 'Licensed legal advocate registered with the Nepal Bar Council.',
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
        user: sanitizedUser,
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

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: sanitizedUser,
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
    const { credential, email, name, role, picture } = req.body;

    const payload = credential || { email, name, picture };
    const googleProfile = await GoogleAuthService.verifyGoogleToken(payload);

    let user = db.findUserByEmail(googleProfile.email);

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
        db.createLawyer({
          id: `law_${Date.now()}`,
          userId: user.id,
          name: `Adv. ${user.firstName} ${user.lastName}`,
          specialization: 'Corporate & Civil Law',
          barNumber: `NBA-${Math.floor(1000 + Math.random() * 9000)}`,
          rating: 5.0,
          experience: 1,
          hourlyRate: 2500,
          officeLocation: 'Kathmandu, Nepal',
          isVerified: true,
          image: user.profilePicture || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
          email: user.email,
        });
      }
    } else if (!user.googleId) {
      // Link Google Account to existing user
      db.updateUser(user.id, {
        googleId: googleProfile.googleId,
        profilePicture: user.profilePicture || googleProfile.picture,
      });
    }

    const token = generateToken(user);
    const { password: _, ...sanitizedUser } = user;

    return res.json({
      success: true,
      message: 'Google authentication successful.',
      data: {
        token,
        user: sanitizedUser,
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
    return res.json({
      success: true,
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve profile.',
    });
  }
};
