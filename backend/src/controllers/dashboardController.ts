import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getDashboardData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = req.user;
    const { password: _, ...sanitizedUser } = user;

    const isLawyer = user.role === 'LAWYER';
    const lawyerProfile = isLawyer ? db.findLawyerByUserId(user.id) : null;
    const userAppointments = db.findAppointmentsByUserId(user.id);
    const userDocs = db.findDocumentsByUserId(user.id);

    const pendingAppointments = userAppointments.filter((a) => a.status === 'UPCOMING');
    const confirmedCount = userAppointments.filter((a) => a.status === 'CONFIRMED').length;
    const appointmentsToShow = isLawyer ? pendingAppointments : userAppointments;
    const docsToShow = userDocs;
    const upcomingCount = pendingAppointments.length;

    const stats = isLawyer
      ? {
          totalAppointments: userAppointments.length,
          activeCases: upcomingCount + confirmedCount,
          savedDocuments: docsToShow.length,
          consultationHours: userAppointments.length,
          pendingRequests: upcomingCount,
          totalEarnings: userAppointments.reduce((acc, curr) => acc + (curr.fee || 0), 0),
          rating: lawyerProfile?.rating || 5.0,
        }
      : {
          totalAppointments: userAppointments.length,
          activeCases: upcomingCount + confirmedCount,
          savedDocuments: docsToShow.length,
          consultationHours: userAppointments.length,
          rating: 5.0,
        };

    const lawyerDetails = lawyerProfile
      ? {
          id: lawyerProfile.id,
          userId: lawyerProfile.userId || user.id,
          barLicenseNumber: lawyerProfile.barLicenseNumber || lawyerProfile.barNumber,
          specialization: [lawyerProfile.specialization],
          experience: lawyerProfile.experience,
          hourlyRate: lawyerProfile.hourlyRate,
          bio: lawyerProfile.bio || 'Licensed advocate registered with Nepal Bar Council.',
          education: [{ degree: 'LL.B / LL.M', institution: 'Nepal Law Campus, Tribhuvan University', year: 2018 }],
          languages: ['Nepali', 'English'],
          rating: lawyerProfile.rating,
          totalReviews: 0,
          isVerified: lawyerProfile.isVerified,
          casesWon: 0,
          officeLocation: lawyerProfile.officeLocation,
        }
      : undefined;

    return res.json({
      success: true,
      data: {
        user: sanitizedUser,
        lawyerDetails,
        stats,
        upcomingAppointments: appointmentsToShow,
        recentDocuments: docsToShow,
        recommendedLawyers: isLawyer ? undefined : db.lawyers.slice(0, 3),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve dashboard data.',
    });
  }
};
