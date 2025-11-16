import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import connectDB from '@/lib/mongodb';
import { JobListing, Match } from '@/models';

/**
 * GET /api/company/activity
 * Get recent activity for the authenticated company
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
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '10');

    // Get company's jobs
    const jobs = await JobListing.find({ recruiter_id: userId })
      .sort({ created_at: -1 })
      .limit(limit);

    // Get job IDs
    const jobIds = jobs.map(job => job._id);

    // Get recent matches/applications
    const matches = await Match.find({ job_id: { $in: jobIds } })
      .populate('user_id', 'name email')
      .populate('job_id', 'title')
      .sort({ created_at: -1 })
      .limit(limit);

    // Format activities
    const activities = [];

    // Add job postings as activities
    jobs.slice(0, 5).forEach(job => {
      const createdDate = new Date(job.created_at || job.createdAt);
      const now = new Date();
      const hoursAgo = Math.floor((now - createdDate) / (1000 * 60 * 60));
      const daysAgo = Math.floor(hoursAgo / 24);

      let timeAgo;
      if (hoursAgo < 1) {
        timeAgo = 'Il y a moins d\'une heure';
      } else if (hoursAgo < 24) {
        timeAgo = `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`;
      } else if (daysAgo === 1) {
        timeAgo = 'Hier';
      } else {
        timeAgo = `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`;
      }

      activities.push({
        id: `job-${job._id}`,
        title: `Publication de "${job.title}"`,
        type: 'Offre',
        date: timeAgo,
        timestamp: createdDate,
      });
    });

    // Add matches/applications as activities
    matches.slice(0, 5).forEach(match => {
      const matchDate = new Date(match.created_at || match.createdAt);
      const now = new Date();
      const hoursAgo = Math.floor((now - matchDate) / (1000 * 60 * 60));
      const daysAgo = Math.floor(hoursAgo / 24);

      let timeAgo;
      if (hoursAgo < 1) {
        timeAgo = 'Il y a moins d\'une heure';
      } else if (hoursAgo < 24) {
        timeAgo = `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`;
      } else if (daysAgo === 1) {
        timeAgo = 'Hier';
      } else {
        timeAgo = `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`;
      }

      const candidateName = match.user_id?.name || 'Candidat';
      const score = Math.round(match.match_score * 100);
      const jobTitle = match.job_id?.title || 'Poste';

      if (match.status === 'applied') {
        activities.push({
          id: `match-${match._id}`,
          title: `Candidature de ${candidateName} pour "${jobTitle}"`,
          type: 'Candidat',
          date: timeAgo,
          timestamp: matchDate,
        });
      } else if (match.match_score >= 0.8) {
        activities.push({
          id: `match-${match._id}`,
          title: `Analyse du CV de ${candidateName} (Score ${score}%)`,
          type: 'Candidat',
          date: timeAgo,
          timestamp: matchDate,
        });
      }
    });

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      success: true,
      activities: limitedActivities,
    });
  } catch (error) {
    console.error('Error fetching company activity:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}


