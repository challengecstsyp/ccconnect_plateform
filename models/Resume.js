import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // no index:true to avoid duplicate index warnings
  },
  original_text: { type: String, default: '' },
  parsed_data: {
    education: [{
      degree: String,
      school: String,
      year: Number,
      field: String,
    }],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
      start_date: Date,
      end_date: Date,
    }],
    skills: [String],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
    }],
  },
  ai_recommendations: {
    summary_score: { type: Number, min: 0, max: 100, default: 0 },
    missing_keywords: { type: [String], default: [] },
    suggested_improvements: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
  },
  updated_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes
resumeSchema.index({ user_id: 1 });
resumeSchema.index({ 'ai_recommendations.summary_score': -1 });

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;
