import { Response } from 'express';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getDashboardData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user || db.users[0];
    const { password: _, ...sanitizedUser } = user;

    const userAppointments = db.findAppointmentsByUserId(user.id);
    const userDocs = db.findDocumentsByUserId(user.id);

    const appointmentsToShow = userAppointments.length > 0 ? userAppointments : db.appointments;
    const docsToShow = userDocs.length > 0 ? userDocs : db.documents;

    const stats = {
      totalAppointments: appointmentsToShow.length,
      activeCases: appointmentsToShow.filter((a) => a.status === 'UPCOMING').length || 1,
      savedDocuments: docsToShow.length,
      consultationHours: appointmentsToShow.length * 2,
    };

    return res.json({
      success: true,
      data: {
        user: sanitizedUser,
        stats,
        upcomingAppointments: appointmentsToShow,
        recentDocuments: docsToShow,
        recommendedLawyers: db.lawyers.slice(0, 3),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve dashboard data.',
    });
  }
};
