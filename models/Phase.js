import mongoose from 'mongoose';

const phaseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    name: {
      type: String,
      enum: ['Grey', 'Finishing'],
      required: [true, 'Phase name is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Phase || mongoose.model('Phase', phaseSchema);
