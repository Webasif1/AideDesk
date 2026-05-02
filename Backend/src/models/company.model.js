import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is require'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long']
    },

    slug: {
      type: String,
      required: [true, 'Slug is require'],
      unique: [true, 'Slug should be unique'],
      lowercase: [true, 'Slug should be in lowercase'],
      trim: [true, 'Slug should not be in trim']
    },

    email: {
      type: String,
      required: [true, 'Email is require'],
      lowercase: [true, 'Email should be in lowercase']
    },

    phone: {
      type: Number,
      required: [true, 'Phone Number is require']
    },

    website: {
      type: String,
      required: [true, 'Website url is require'],
      trim: true
    },

    industry: {
      type: String,
      default: '',
      trim: true
    },

    size: {
      type: String,
      required: [true, 'size is require']
    },

    address: {
      type: String,
      required: [true, 'Address is require'],
      trim: true
    },

    country: {
      type: String,
      required: [true, 'Country is require'],
      trim: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin',
      required: [true, 'Owner is require']
    },
    workSpaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'workspace',
      required: [true, 'Workspace is require']
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },

    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    }
  },
  {
    timestamps: true
  }
);

const companyModel = mongoose.model('company', companySchema);
module.exports = companyModel;
