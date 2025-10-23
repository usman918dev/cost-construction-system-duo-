import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['Budget Alert', 'Purchase Reminder', 'Phase Completion', 'System'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Project', 'Phase', 'Category', 'Purchase', 'Item'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    actionUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of unread notifications
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
