//import mongoose to create a schema for the user model
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ============================================
// Admin Schema
// ============================================
const adminSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'fullName is require']
    },
    email: {
      type: String,
      required: [true, 'Email is require'],
      unique: [true, 'Email should be unique']
    },
    password: {
      type: String,
      select: false,
      required: [true, 'Password is require']
    },
    role: {
      type: String,
      enum: 'admin',
      default: 'admin'
    },
    profileImage: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'online'
    }
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const adminModel = mongoose.model('admin', adminSchema);

export default adminModel;
