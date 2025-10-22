import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    ratePerUnit: {
      type: Number,
      required: [true, 'Rate per unit is required'],
      min: 0,
    },
    defaultVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
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

export default mongoose.models.Item || mongoose.model('Item', itemSchema);
