import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // no index:true here to avoid duplicate index warnings
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobListing',
    required: true,
  },
  match_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  explanation: { type: String, default: '' },
  status: {
    type: String,
    enum: ['recommended', 'applied', 'rejected', 'hired', 'interviewed'],
    default: 'recommended',
  },
  created_at: { type: Date, default: Date.now },
  applied_at: { type: Date, default: null },
}, {
  timestamps: true,
});

// Indexes
matchSchema.index({ user_id: 1, status: 1 });
matchSchema.index({ job_id: 1 });
matchSchema.index({ match_score: -1 });
matchSchema.index({ user_id: 1, job_id: 1 }, { unique: true });

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

export default Match;
