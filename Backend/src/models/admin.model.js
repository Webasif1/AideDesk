//import mongoose to create a schema for the user model
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ============================================
// Admin Schema
// ============================================
const adminSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName is require"]
    },
    email: {
      type: String,
      required: [true, "Email is require"],
      unique: [true, "Email should be unique"]
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is require"]
    },
    role: {
      type: String,
      enum: "admin",
      default: "admin"
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
      default: Date.now
    },
    // Effective presence, driven by socket connect/disconnect. Defaulted to
    // offline like every other role — defaulting to "online" only made admins
    // look correct while nothing was actually tracking presence.
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline"
    },

    // A deliberate choice from the header menu; null = follow the socket.
    manualPresence: {
      type: String,
      enum: ["away", "offline", null],
      default: null
    },

    // Populated after the admin creates their company during onboarding
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      default: null
    },
  },
  { timestamps: true },
);

adminSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

adminSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const adminModel = mongoose.model("admin", adminSchema);

export default adminModel;
