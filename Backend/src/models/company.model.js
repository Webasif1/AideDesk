import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },

    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: [true, 'Slug must be unique'],
      lowercase: true,
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },

    // String — not Number — to support international formats like +92-300-1234567
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },

    website: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true
    },

    industry: {
      type: String,
      default: '',
      trim: true
    },

    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      required: [true, 'Company size is required']
    },

    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },

    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin',
      required: [true, 'Admin is required']
    },

    workSpaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace'
    },

    // Custom branding for multi-tenant white-labeling
    branding: {
      logo: { type: String, default: '' },
      primaryColor: { type: String, default: '#2563eb' },
      secondaryColor: { type: String, default: '#64748b' }
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },

    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    }
  },
  { timestamps: true }
);

const companyModel = mongoose.model('company', companySchema);
export default companyModel;
