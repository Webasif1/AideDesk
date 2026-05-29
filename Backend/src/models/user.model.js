import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },

    role: {
      type: String,
      enum: ["customer"],
      default: "customer"
    },

    // Scopes this customer to a specific company"s support portal
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: [true, "Company is required"]
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspace",
      required: [true, "Workspace is required"]
    },

    profileImage: {
      type: String,
      default: ""
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    lastLogin: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;
