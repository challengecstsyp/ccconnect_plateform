import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

/**
 * Test email sending - for debugging
 * POST /api/test-email
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST ? '✓ Set' : '✗ Missing',
      SMTP_USER: process.env.SMTP_USER ? '✓ Set' : '✗ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✓ Set' : '✗ Missing',
      SMTP_PORT: process.env.SMTP_PORT || '587 (default)',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000 (default)',
    };

    console.log('📧 Test Email - Environment Check:');
    console.log(envCheck);

    // Try to send test email
    const testToken = 'test-token-123';
    const result = await sendVerificationEmail(email, testToken, 'Test User');

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Test email sent successfully! Check your inbox.' 
        : 'Failed to send email: ' + (result.error || 'Unknown error'),
      envCheck,
      error: result.error,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test-email - Check environment variables
 */
export async function GET() {
  return NextResponse.json({
    envCheck: {
      SMTP_HOST: process.env.SMTP_HOST ? '✓ Set (hidden)' : '✗ Missing',
      SMTP_USER: process.env.SMTP_USER ? '✓ Set (hidden)' : '✗ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✓ Set (hidden)' : '✗ Missing',
      SMTP_PORT: process.env.SMTP_PORT || '587 (default)',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000 (default)',
    },
    message: 'Check server console for detailed logs. POST to this endpoint with { email: "test@example.com" } to send a test email.',
  });
}

