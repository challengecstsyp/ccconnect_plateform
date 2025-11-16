import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import connectDB from '@/lib/mongodb';
import { JobListing } from '@/models';

/**
 * GET /api/jobs/my
 * Get all job listings created by the authenticated company
 */
export async function GET(request) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a company
    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can access their job listings' },
        { status: 403 }
      );
    }

    await connectDB();
    const userId = authResult.user._id || authResult.user.id;

    // Get all jobs created by this company
    const jobs = await JobListing.find({ recruiter_id: userId })
      .sort({ created_at: -1 });

    // Transform to frontend format
    const formattedJobs = jobs.map(job => {
      const createdDate = new Date(job.created_at || job.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

      return {
        id: job._id.toString(),
        title: job.title,
        location: job.location,
        description: job.description,
        salary: job.salary_range ? parseInt(job.salary_range) : null,
        status: job.status === 'draft' ? 'Brouillon' : job.status === 'closed' ? 'Fermée' : 'Active',
        candidates: 0, // TODO: Count actual candidates when application system is implemented
        publishedDays: daysDiff,
        isUrgent: false, // Can be added to schema later
      };
    });

    return NextResponse.json({ success: true, jobs: formattedJobs });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch job listings' },
      { status: 500 }
    );
  }
}


