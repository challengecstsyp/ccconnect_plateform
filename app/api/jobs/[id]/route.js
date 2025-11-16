import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import connectDB from '@/lib/mongodb';
import { JobListing } from '@/models';

/**
 * PUT /api/jobs/[id]
 * Update a job listing (company only, owner only)
 */
export async function PUT(request, { params }) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can update job listings' },
        { status: 403 }
      );
    }

    await connectDB();
    const jobId = params.id;
    const userId = authResult.user._id || authResult.user.id;

    // Find the job
    const job = await JobListing.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job listing not found' },
        { status: 404 }
      );
    }

    // Check if user owns this job
    if (job.recruiter_id?.toString() !== userId.toString()) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own job listings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, location, description, salary, requirements, tags, status } = body;

    // Update job fields
    if (title) job.title = title.trim();
    if (location) job.location = location.trim();
    if (description) job.description = description.trim();
    if (salary !== undefined) job.salary_range = salary ? `${salary}` : '';
    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []);
    }
    if (tags !== undefined) {
      job.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
    }
    if (status) {
      job.status = status === 'Brouillon' ? 'draft' : status === 'Fermée' ? 'closed' : 'active';
    }

    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Job listing updated successfully',
      job: {
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        status: job.status,
      },
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update job listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/[id]
 * Delete a job listing (company only, owner only)
 */
export async function DELETE(request, { params }) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can delete job listings' },
        { status: 403 }
      );
    }

    await connectDB();
    const jobId = params.id;
    const userId = authResult.user._id || authResult.user.id;

    // Find the job
    const job = await JobListing.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job listing not found' },
        { status: 404 }
      );
    }

    // Check if user owns this job
    if (job.recruiter_id?.toString() !== userId.toString()) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own job listings' },
        { status: 403 }
      );
    }

    await JobListing.findByIdAndDelete(jobId);

    return NextResponse.json({
      success: true,
      message: 'Job listing deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete job listing' },
      { status: 500 }
    );
  }
}


