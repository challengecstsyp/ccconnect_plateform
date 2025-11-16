import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    // Find user with matching token and email
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationToken: token,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        alreadyVerified: true,
      });
    }

    // Check if token is expired
    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Send welcome email
    try {
      const emailResult = await sendWelcomeEmail(user.email, user.name);
      if (emailResult.success) {
        console.log(`✅ Welcome email sent to ${user.email}`);
      } else {
        console.error('⚠️ Failed to send welcome email:', emailResult.error);
        // Continue even if email fails - verification is still successful
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
      // Continue even if email fails - verification is still successful
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

