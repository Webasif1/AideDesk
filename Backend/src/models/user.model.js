//import mongoose to create a schema for the user model
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ============================================
// User Schema
// ============================================
const userSchema = mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
  },
  email: {
    type: String,
    require: [true, "Email is require"],
    unique: [true, "Email should be unique"],
  },
  password: {
    type: String,
    require: [
      function () {
        return !this.googleId;
      },
      "Contact number is require",
    ],
  },
  fullName: {
    type: String,
    require: [true, "fullName is require"],
  },
  role: {
    type: String,
    enum: ["admin", "agent"],
    default: "admin"
  },
  googleId: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  lastLogin:{
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["online", "offline", "away"],
    default: "online",
  }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;
