const mongoose = require('mongoose');

const legalDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    docType: {
      type: String,
      enum: ['LAW', 'PRECEDENT'],
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: '',
    },
    caseNo: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      default: null,
    },
    precedentRule: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: null,
      index: true,
    },
    keywords: [
      {
        type: String,
        index: true,
      }
    ],
    citedLaws: [
      {
        type: String,
      }
    ],
    externalId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for text search
legalDocumentSchema.index({
  title: 'text',
  content: 'text',
  summary: 'text',
  precedentRule: 'text',
  keywords: 'text',
});

module.exports = mongoose.model('LegalDocument', legalDocumentSchema);
