import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getResumeByUserId } from '@/lib/db-utils';

/**
 * GET /api/resume/me
 * Get current user's resume
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

    const resume = await getResumeByUserId(authResult.user._id || authResult.user.id);

    if (!resume) {
      return NextResponse.json({
        success: false,
        error: 'Resume not found',
        hasResume: false,
      });
    }

    // Combine original_text and parsed_data into a single text for matching
    let cvText = '';
    if (resume.original_text) {
      cvText += resume.original_text + '\n';
    }

    if (resume.parsed_data) {
      const parsed = resume.parsed_data;
      
      if (parsed.education && parsed.education.length > 0) {
        const edParts = parsed.education.map(edu => 
          `${edu.degree || ''} in ${edu.field || ''} from ${edu.school || ''} ${edu.year || ''}`
        );
        cvText += 'Education: ' + edParts.join(' | ') + '\n';
      }

      if (parsed.experience && parsed.experience.length > 0) {
        const expParts = parsed.experience.map(exp => 
          `${exp.title || ''} at ${exp.company || ''} - ${exp.description || ''}`
        );
        cvText += 'Experience: ' + expParts.join(' | ') + '\n';
      }

      if (parsed.skills && parsed.skills.length > 0) {
        cvText += 'Skills: ' + parsed.skills.join(', ') + '\n';
      }

      if (parsed.certifications && parsed.certifications.length > 0) {
        const certParts = parsed.certifications.map(cert => 
          `${cert.name || ''} from ${cert.issuer || ''}`
        );
        cvText += 'Certifications: ' + certParts.join(' | ') + '\n';
      }
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume._id.toString(),
        cvText: cvText.trim(),
        hasResume: true,
      },
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


