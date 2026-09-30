import { Response } from 'express';
import { NepaliLegalRagService } from '../services/nepaliLegalRagService';
import { db } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const askLegalAi = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, language } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid question is required for legal analysis.',
      });
    }

    const ragResult = NepaliLegalRagService.processQuery(question.trim(), language || 'en');

    // Persist query log for audits
    const logEntry = {
      id: `ai_${Date.now()}`,
      userId: req.user?.id,
      question: question.trim(),
      response: ragResult.response,
      citations: ragResult.citations,
      confidenceScore: ragResult.confidenceScore,
      category: ragResult.matchedEntry.actName,
      timestamp: new Date().toISOString(),
    };
    db.logAiQuery(logEntry);

    return res.json({
      success: true,
      data: {
        id: logEntry.id,
        answer: ragResult.response,
        citations: ragResult.citations,
        confidenceScore: ragResult.confidenceScore,
        category: ragResult.matchedEntry.actName,
        disclaimer: ragResult.disclaimer,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing AI query.',
    });
  }
};
