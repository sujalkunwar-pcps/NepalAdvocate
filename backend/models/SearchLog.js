const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    clickedResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LegalDocument',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

searchLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);
