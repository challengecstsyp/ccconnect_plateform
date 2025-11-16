import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // For security, don't reveal if user exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        alreadyVerified: true,
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours expiry

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(user.email, verificationToken, user.name);
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        return NextResponse.json(
          { error: 'Failed to send verification email. Please check your SMTP configuration and try again later.' },
          { status: 500 }
        );
      }
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please check your SMTP configuration and try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a verification link has been sent.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

