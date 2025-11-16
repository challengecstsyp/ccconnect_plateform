import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import connectDB from '@/lib/mongodb';
import { JobListing, Match } from '@/models';

/**
 * GET /api/company/stats
 * Get dashboard statistics for the authenticated company
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

    if (authResult.user.role !== 'company') {
      return NextResponse.json(
        { success: false, error: 'Only companies can access this endpoint' },
        { status: 403 }
      );
    }

    await connectDB();
    const userId = authResult.user._id || authResult.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Get all jobs created by this company
    const allJobs = await JobListing.find({ recruiter_id: userId });
    const activeJobs = allJobs.filter(job => job.status === 'active');
    
    // Get job IDs for this company
    const jobIds = allJobs.map(job => job._id);

    // Get matches/applications for company's jobs
    const matches = await Match.find({ job_id: { $in: jobIds } })
      .populate('user_id', 'name email')
      .populate('job_id', 'title')
      .sort({ created_at: -1 });

    // Calculate statistics
    const totalCandidates = new Set(matches.map(m => m.user_id?._id?.toString())).size;
    
    // Matches with score >= 0.8 (80%)
    const highScoreMatches = matches.filter(m => m.match_score >= 0.8);
    const highScoreCandidates = new Set(highScoreMatches.map(m => m.user_id?._id?.toString())).size;

    // Calculate engagement rate (applied / recommended)
    const recommendedMatches = matches.filter(m => m.status === 'recommended');
    const appliedMatches = matches.filter(m => m.status === 'applied');
    const engagementRate = recommendedMatches.length > 0 
      ? Math.round((appliedMatches.length / recommendedMatches.length) * 100)
      : 0;

    // Calculate average recruitment time (days from job creation to first application)
    let avgRecruitmentDays = 22; // Default
    if (appliedMatches.length > 0) {
      const recruitmentTimes = appliedMatches
        .filter(m => m.applied_at && m.job_id?.created_at)
        .map(m => {
          const jobDate = new Date(m.job_id.created_at || m.job_id.createdAt);
          const appliedDate = new Date(m.applied_at);
          return Math.floor((appliedDate - jobDate) / (1000 * 60 * 60 * 24));
        })
        .filter(days => days >= 0);
      
      if (recruitmentTimes.length > 0) {
        avgRecruitmentDays = Math.round(
          recruitmentTimes.reduce((sum, days) => sum + days, 0) / recruitmentTimes.length
        );
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        activeJobs: activeJobs.length,
        totalCandidates: totalCandidates,
        highScoreCandidates: highScoreCandidates, // Candidates with 80%+ match
        engagementRate: engagementRate,
        avgRecruitmentDays: avgRecruitmentDays,
      },
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

