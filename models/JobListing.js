import mongoose from 'mongoose';

const jobListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  requirements: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  salary_range: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    default: 'UtopiaHire',
  },
  tags: {
    type: [String],
    default: [],
  },
  recruiter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Indexes for search and filtering
jobListingSchema.index({ title: 'text', description: 'text', company: 'text' });
jobListingSchema.index({ location: 1 });
jobListingSchema.index({ tags: 1 });
jobListingSchema.index({ status: 1, created_at: -1 });

const JobListing = mongoose.models.JobListing || mongoose.model('JobListing', jobListingSchema);

export default JobListing;

