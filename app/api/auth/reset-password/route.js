import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, email, newPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: 'Token, email, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetToken: token,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword);

    // Update password and clear reset token
    user.password_hash = password_hash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

