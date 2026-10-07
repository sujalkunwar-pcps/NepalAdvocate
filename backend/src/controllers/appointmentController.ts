import { Response } from 'express';
import { db, AppointmentRecord } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lawyerId, date, timeSlot, notes, paymentMethod } = req.body;

    if (!lawyerId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer, date, and time slot are required to book an appointment.',
      });
    }

    const lawyer = db.findLawyerById(lawyerId);
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Selected lawyer not found.',
      });
    }

    const client = req.user!;
    const newAppointment: AppointmentRecord = {
      id: `apt_${Date.now()}`,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      lawyerId: lawyer.id,
      lawyerName: lawyer.name,
      specialization: lawyer.specialization,
      date,
      timeSlot,
      status: 'UPCOMING',
      fee: lawyer.hourlyRate,
      notes: notes || 'Legal consultation session',
      paymentMethod: (paymentMethod as any) || 'ESEWA',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
    };

    db.createAppointment(newAppointment);

    return res.status(201).json({
      success: true,
      message: 'Consultation appointment booked successfully.',
      data: newAppointment,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to book appointment.',
    });
  }
};

export const getMyAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const appointments = db.findAppointmentsByUserId(user.id);
    return res.json({
      success: true,
      data: appointments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve appointments.',
    });
  }
};

export const updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, date, timeSlot, notes } = req.body;

    const apt = db.findAppointmentById(id);
    if (!apt) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    const updates: Partial<AppointmentRecord> = {};
    if (status) updates.status = status;
    if (date) updates.date = date;
    if (timeSlot) updates.timeSlot = timeSlot;
    if (notes) updates.notes = notes;

    const updated = db.updateAppointment(id, updates);

    return res.json({
      success: true,
      message: 'Appointment updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update appointment.',
    });
  }
};

