import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    phaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Phase',
      required: [true, 'Phase ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 3, // Allow up to 3 levels of nesting
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

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
