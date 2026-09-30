import { Response } from 'express';
import { db, DocumentRecord } from '../models/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getMyDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userDocs = db.findDocumentsByUserId(user.id);

    // If new user with no documents yet, provide the standard verified legal templates
    const initialDocs = userDocs.length > 0 ? userDocs : db.documents;

    return res.json({
      success: true,
      data: initialDocs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve documents.',
    });
  }
};

export const createDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, titleNepali, category, contentSnippet, fileSize } = req.body;
    const user = req.user!;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Document title is required.',
      });
    }

    const newDoc: DocumentRecord = {
      id: `doc_${Date.now()}`,
      userId: user.id,
      title,
      titleNepali,
      category: category || 'Contracts',
      fileSize: fileSize || '1.2 MB',
      status: 'VERIFIED',
      updatedAt: 'Today',
      contentSnippet: contentSnippet || 'Secure client uploaded document.',
    };

    db.createDocument(newDoc);

    return res.status(201).json({
      success: true,
      message: 'Document successfully saved to Legal Vault.',
      data: newDoc,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save document.',
    });
  }
};
