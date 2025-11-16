import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['job_seeker','recruiter','admin'], required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpiry: { type: Date, default: null },
}, { timestamps: true });

// Keep only non-duplicate indexes
userSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
