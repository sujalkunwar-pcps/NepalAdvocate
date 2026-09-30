import { Request, Response } from 'express';
import { db } from '../models/db';

export const getLawyers = async (req: Request, res: Response) => {
  try {
    const { search, specialization, location, verified } = req.query;

    let lawyers = db.lawyers;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      lawyers = lawyers.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.specialization.toLowerCase().includes(q) ||
          l.officeLocation.toLowerCase().includes(q)
      );
    }

    if (specialization && typeof specialization === 'string' && specialization !== 'All') {
      const s = specialization.toLowerCase();
      lawyers = lawyers.filter((l) => l.specialization.toLowerCase().includes(s));
    }

    if (location && typeof location === 'string') {
      lawyers = lawyers.filter((l) => l.officeLocation.toLowerCase().includes(location.toLowerCase()));
    }

    if (verified === 'true') {
      lawyers = lawyers.filter((l) => l.isVerified);
    }

    return res.json({
      success: true,
      count: lawyers.length,
      data: lawyers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve lawyers.',
    });
  }
};

export const getLawyerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lawyer = db.findLawyerById(id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found.',
      });
    }

    return res.json({
      success: true,
      data: lawyer,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve lawyer profile.',
    });
  }
};
