import { NextResponse } from 'next/server';
import { getJobListings, createJobListing } from '@/lib/db-utils';
import { authenticateRequest } from '@/lib/auth-middleware';
import mongoose from 'mongoose';

/**
 * GET /api/jobs
 * Fetch all active job listings
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    const filters = {};
    if (location && location !== 'Localisation') {
      filters.location = new RegExp(location, 'i');
    }

    let jobs = await getJobListings(filters);

    // Apply text search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Transform to frontend format
    const formattedJobs = jobs.map(job => ({
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary_range || 'Non spécifié',
      type: 'CDI', // Default, can be added to schema later
      tags: job.tags || [],
      description: job.description,
      requirements: job.requirements || [],
      metadata: {
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        salary_range: job.salary_range,
        tags: job.tags || [],
        requirements: job.requirements || [],
      },
      isSaved: false, // Will be handled client-side
      isApplied: false, // Will be handled client-side
    }));

    return NextResponse.json({ success: true, jobs: formattedJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Create a new job listing (company only)
 */
export async function POST(request) {
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
        { success: false, error: 'Only companies can create job listings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, location, description, salary, requirements, tags, status } = body;

    // Validation
    if (!title || !location || !description) {
      return NextResponse.json(
        { success: false, error: 'Title, location, and description are required' },
        { status: 400 }
      );
    }

    // Extract company name from user (use name or email as fallback)
    const companyName = authResult.user.name || authResult.user.email?.split('@')[0] || 'Company';

    // Convert recruiter_id to ObjectId if it's a string
    let recruiterId = authResult.user._id || authResult.user.id;
    if (!recruiterId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 400 }
      );
    }
    if (typeof recruiterId === 'string') {
      recruiterId = new mongoose.Types.ObjectId(recruiterId);
    }

    // Prepare job data
    const jobData = {
      title: title.trim(),
      company: companyName,
      location: location.trim(),
      description: description.trim(),
      salary_range: salary ? `${salary}` : '',
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      status: status === 'Brouillon' ? 'draft' : status === 'Fermée' ? 'closed' : 'active',
      recruiter_id: recruiterId,
      source: 'UtopiaHire',
    };

    console.log('Creating job with data:', {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      status: jobData.status,
      recruiter_id: recruiterId,
    });

    // Create job listing
    const newJob = await createJobListing(jobData);
    
    console.log('Job created successfully:', {
      id: newJob._id.toString(),
      title: newJob.title,
    });

    return NextResponse.json({
      success: true,
      message: 'Job listing created successfully',
      job: {
        id: newJob._id.toString(),
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        status: newJob.status,
      },
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create job listing' },
      { status: 500 }
    );
  }
}

