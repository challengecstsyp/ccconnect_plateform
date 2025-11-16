import connectDB from './mongodb';
import { User, Resume, JobListing, Match, AIInterview, Footprint, CareerReport } from '@/models';

/**
 * Database utility functions for common operations
 */

// User operations
export async function getUserByEmail(email) {
  await connectDB();
  return await User.findOne({ email }).populate('resume_id');
}

export async function getUserById(userId) {
  await connectDB();
  return await User.findById(userId).populate('resume_id');
}

export async function createUser(userData) {
  await connectDB();
  return await User.create(userData);
}

// Resume operations
export async function getResumeByUserId(userId) {
  await connectDB();
  return await Resume.findOne({ user_id: userId });
}

export async function createOrUpdateResume(userId, resumeData) {
  await connectDB();
  return await Resume.findOneAndUpdate(
    { user_id: userId },
    { ...resumeData, updated_at: new Date() },
    { upsert: true, new: true }
  );
}

// Job Listing operations
export async function getJobListings(filters = {}) {
  await connectDB();
  const query = { status: 'active', ...filters };
  return await JobListing.find(query).sort({ created_at: -1 });
}

export async function getJobListingById(jobId) {
  await connectDB();
  return await JobListing.findById(jobId);
}

export async function createJobListing(jobData) {
  await connectDB();
  try {
    const job = await JobListing.create(jobData);
    console.log('Job listing created in database:', job._id.toString());
    return job;
  } catch (error) {
    console.error('Error creating job listing:', error);
    console.error('Job data:', jobData);
    throw error;
  }
}

// Match operations
export async function getMatchesByUserId(userId, status = null) {
  await connectDB();
  const query = { user_id: userId };
  if (status) query.status = status;
  return await Match.find(query)
    .populate('job_id')
    .sort({ match_score: -1 });
}

export async function createMatch(matchData) {
  await connectDB();
  return await Match.create(matchData);
}

export async function updateMatchStatus(matchId, status) {
  await connectDB();
  return await Match.findByIdAndUpdate(
    matchId,
    { status, applied_at: status === 'applied' ? new Date() : null },
    { new: true }
  );
}

// AI Interview operations
export async function getInterviewsByUserId(userId) {
  await connectDB();
  return await AIInterview.find({ user_id: userId })
    .populate('job_id')
    .sort({ date: -1 });
}

export async function createAIInterview(interviewData) {
  await connectDB();
  return await AIInterview.create(interviewData);
}

// Footprint operations
export async function getFootprintByUserId(userId) {
  await connectDB();
  return await Footprint.findOne({ user_id: userId });
}

export async function createOrUpdateFootprint(userId, footprintData) {
  await connectDB();
  return await Footprint.findOneAndUpdate(
    { user_id: userId },
    { ...footprintData, last_updated: new Date() },
    { upsert: true, new: true }
  );
}

// Career Report operations
export async function getCareerReportByUserId(userId) {
  await connectDB();
  return await CareerReport.findOne({ user_id: userId })
    .populate('recommended_jobs');
}

export async function createOrUpdateCareerReport(userId, reportData) {
  await connectDB();
  return await CareerReport.findOneAndUpdate(
    { user_id: userId },
    { ...reportData, last_updated: new Date() },
    { upsert: true, new: true }
  );
}

