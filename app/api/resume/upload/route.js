import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { createOrUpdateResume } from '@/lib/db-utils';
import { extractCV } from '@/lib/resume-reviewer-api';

/**
 * POST /api/resume/upload
 * Upload and extract CV, then save to database
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

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload PDF, DOCX, or DOC file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    try {
      // Extract CV using resume-reviewer API
      const extractedData = await extractCV(file);

      if (!extractedData) {
        return NextResponse.json(
          { success: false, error: 'Failed to extract CV data' },
          { status: 500 }
        );
      }

      // Prepare resume data for database
      const resumeData = {
        user_id: authResult.user._id || authResult.user.id,
        original_text: extractedData.full_text || extractedData.text || '',
        parsed_data: {
          education: extractedData.education || [],
          experience: extractedData.experience || [],
          skills: extractedData.skills || [],
          certifications: extractedData.certifications || [],
        },
      };

      // Save to database
      const savedResume = await createOrUpdateResume(
        authResult.user._id || authResult.user.id,
        resumeData
      );

      return NextResponse.json({
        success: true,
        message: 'CV uploaded and processed successfully',
        resume: {
          id: savedResume._id.toString(),
          hasResume: true,
        },
      });
    } catch (extractError) {
      console.error('Error extracting CV:', extractError);
      return NextResponse.json(
        { 
          success: false, 
          error: extractError.message || 'Failed to extract CV. Please ensure the resume-reviewer backend is running on port 8001.' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload resume' },
      { status: 500 }
    );
  }
}


