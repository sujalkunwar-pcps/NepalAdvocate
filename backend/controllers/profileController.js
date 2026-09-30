const User = require('../models/User');
const LawyerProfile = require('../models/LawyerProfile');
const Appointment = require('../models/Appointment');
const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');

// @route   GET /api/profile/dashboard
// @desc    Get aggregated user dashboard data (profile, stats, appointments, docs, recommendations)
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. User Profile
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 2. Lawyer details if role === 'LAWYER'
    let lawyerDetails = null;
    if (user.role === 'LAWYER') {
      const profile = await LawyerProfile.findOne({ user: userId });
      if (profile) {
        lawyerDetails = {
          id: profile._id.toString(),
          userId: profile.user.toString(),
          barLicenseNumber: profile.barLicenseNumber,
          specialization: profile.specialization,
          experience: profile.experience,
          hourlyRate: profile.hourlyRate,
          bio: profile.bio || '',
          education: profile.education || [],
          languages: profile.languages || [],
          rating: profile.rating,
          totalReviews: profile.totalReviews,
          isVerified: profile.isVerified,
          casesWon: profile.casesWon,
          officeLocation: profile.officeLocation || '',
        };
      }
    }

    // 3. User Appointments
    const isLawyer = user.role === 'LAWYER';
    const query = isLawyer ? { lawyer: userId } : { client: userId };

    const rawAppointments = await Appointment.find(query)
      .populate('client', 'firstName lastName email')
      .populate('lawyer', 'firstName lastName email')
      .sort({ proposedDate: -1, createdAt: -1 });

    const totalAppointments = rawAppointments.length;
    const activeCases = rawAppointments.filter((apt) =>
      ['PENDING', 'PROPOSED', 'CONFIRMED'].includes(apt.status)
    ).length;

    const upcomingAppointments = rawAppointments
      .filter((apt) => ['PENDING', 'PROPOSED', 'CONFIRMED'].includes(apt.status))
      .slice(0, 5)
      .map((apt) => {
        const clientName = apt.client
          ? `${apt.client.firstName} ${apt.client.lastName}`.trim()
          : 'Client';
        const lawyerName = apt.lawyer
          ? `Adv. ${apt.lawyer.firstName} ${apt.lawyer.lastName}`.trim()
          : 'Advocate';

        const statusMap = {
          CONFIRMED: 'UPCOMING',
          PROPOSED: 'UPCOMING',
          PENDING: 'UPCOMING',
          COMPLETED: 'COMPLETED',
          CANCELLED: 'CANCELLED',
        };

        const formattedDate = apt.confirmedDate
          ? new Date(apt.confirmedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : apt.proposedDate
          ? new Date(apt.proposedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'TBD';

        return {
          id: apt._id.toString(),
          clientName,
          lawyerName,
          specialization: apt.reason || 'General Legal Counsel',
          date: formattedDate,
          timeSlot: apt.confirmedTime || apt.proposedTime || 'Flexible',
          status: statusMap[apt.status] || 'UPCOMING',
          fee: apt.amount || 2500,
          notes: apt.notes || apt.reason || '',
        };
      });

    // 4. Documents
    const rawDocuments = await Document.find({
      $or: [{ owner: userId }, { sharedWith: userId }],
    }).sort({ updatedAt: -1 });

    const savedDocuments = rawDocuments.length;
    const recentDocuments = rawDocuments.slice(0, 5).map((doc) => {
      const sizeMb = (doc.fileSize / (1024 * 1024)).toFixed(1);
      const fileSizeStr = doc.fileSize >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(doc.fileSize / 1024)} KB`;

      const categoryMap = {
        contract: 'Corporate Law',
        legal_document: 'Civil Law',
        evidence: 'Litigation',
        other: 'General Legal',
      };

      return {
        id: doc._id.toString(),
        title: doc.originalName || doc.fileName,
        category: categoryMap[doc.category] || 'General Legal',
        fileSize: fileSizeStr,
        updatedAt: new Date(doc.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: doc.isShared ? 'VERIFIED' : 'DRAFT',
      };
    });

    // 5. Recommended Lawyers
    const recommendedLawyersRaw = await LawyerProfile.find({ isVerified: true })
      .populate('user', 'firstName lastName profilePicture')
      .limit(4);

    const recommendedLawyers = recommendedLawyersRaw.map((lwy) => ({
      id: lwy._id.toString(),
      name: lwy.user
        ? `Adv. ${lwy.user.firstName} ${lwy.user.lastName}`.trim()
        : 'Advocate',
      specialization: lwy.specialization?.[0] || 'General Practice',
      rating: lwy.rating || 4.8,
      hourlyRate: lwy.hourlyRate || 2500,
      officeLocation: lwy.officeLocation || 'Kathmandu, Nepal',
      isVerified: lwy.isVerified,
      image: lwy.user?.profilePicture || undefined,
    }));

    const completedAppts = rawAppointments.filter((apt) => apt.status === 'COMPLETED').length;
    const consultationHours = completedAppts * 2 || totalAppointments * 2 || 12;

    const userProfile = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      profilePicture: user.profilePicture || null,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };

    const dashboardData = {
      user: userProfile,
      ...(lawyerDetails ? { lawyerDetails } : {}),
      stats: {
        totalAppointments,
        activeCases,
        savedDocuments,
        consultationHours,
        ...(lawyerDetails ? { rating: lawyerDetails.rating } : {}),
      },
      upcomingAppointments,
      recentDocuments,
      recommendedLawyers,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data',
      error: error.message,
    });
  }
};

// @route   POST /api/profile/picture
// @desc    Upload profile picture (store as base64)
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Read file and convert to base64
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    // Delete the temporary file
    fs.unlinkSync(filePath);

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: dataUri },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   DELETE /api/profile/picture
// @desc    Delete profile picture
// @access  Private
exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: null },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

