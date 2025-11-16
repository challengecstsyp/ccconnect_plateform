import mongoose from 'mongoose';

const footprintSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // removed unique:true to avoid duplicate index warning
  },
  github: {
    username: { type: String, default: '' },
    repos: { type: Number, default: 0 },
    top_languages: { type: [String], default: [] },
    stars: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    profile_url: { type: String, default: '' },
  },
  linkedin: {
    profile_url: { type: String, default: '' },
    endorsements: { type: Number, default: 0 },
    connections: { type: Number, default: 0 },
    recommendations: { type: Number, default: 0 },
  },
  stackoverflow: {
    user_id: { type: String, default: '' },
    reputation: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    answers: { type: Number, default: 0 },
    questions: { type: Number, default: 0 },
  },
  last_updated: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes
footprintSchema.index({ user_id: 1 });

const Footprint = mongoose.models.Footprint || mongoose.model('Footprint', footprintSchema);

export default Footprint;
