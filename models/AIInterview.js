import mongoose from 'mongoose';

const aiInterviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // removed unique:true to avoid duplicate index warning
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobListing',
    default: null,
  },
  interviewer_profile: {
    name: { type: String, default: 'AI Recruiter' },
    specialization: { type: String, default: '' },
    tone: {
      type: String,
      enum: ['friendly', 'professional', 'technical', 'casual'],
      default: 'professional',
    },
  },
  questions: [{
    q: { type: String, required: true },
    user_answer: { type: String, default: '' },
    expected_keywords: { type: [String], default: [] },
    question_type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'general'],
      default: 'general',
    },
    timestamp: { type: Date, default: Date.now },
  }],
  ai_feedback: {
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    overall_score: { type: Number, min: 0, max: 10, default: 0 },
    communication_score: { type: Number, min: 0, max: 10, default: 0 },
    technical_score: { type: Number, min: 0, max: 10, default: 0 },
    detailed_feedback: { type: String, default: '' },
  },
  date: { type: Date, default: Date.now },
  duration_minutes: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

// Indexes
// Keep schema-level indexes only
aiInterviewSchema.index({ user_id: 1, date: -1 });
aiInterviewSchema.index({ job_id: 1 });
aiInterviewSchema.index({ status: 1 });

const AIInterview = mongoose.models.AIInterview || mongoose.model('AIInterview', aiInterviewSchema);

export default AIInterview;
