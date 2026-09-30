const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: String,
      enum: ['USER', 'AI'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    recommendedLawyers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
  },
  {
    timestamps: true,
  }
);

aiChatSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('AiChat', aiChatSchema);
