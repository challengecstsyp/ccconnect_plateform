import mongoose from 'mongoose';

const careerReportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // removed unique:true to avoid duplicate index warning
  },
  summary: { type: String, required: true },
  strengths: { type: [String], default: [] },
  areas_to_improve: { type: [String], default: [] },
  recommended_jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobListing' }],
  career_path_suggestions: [{
    role: String,
    timeline: String,
    skills_needed: [String],
    description: String,
  }],
  market_insights: {
    demand_score: { type: Number, min: 0, max: 100, default: 0 },
    salary_trends: { type: String, default: '' },
    growth_opportunities: { type: [String], default: [] },
  },
  last_updated: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes
// Keep only schema-level indexes
careerReportSchema.index({ user_id: 1 });
careerReportSchema.index({ last_updated: -1 });

const CareerReport = mongoose.models.CareerReport || mongoose.model('CareerReport', careerReportSchema);

export default CareerReport;
