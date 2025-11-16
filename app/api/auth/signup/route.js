import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { hashPassword, generateToken } from '@/lib/auth';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, name, role = 'job_seeker', location, bio, skills, languages } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours expiry

    // Create user with emailVerified set to false
    const user = await User.create({
      email: email.toLowerCase(),
      password_hash,
      name,
      role,
      location: location || '',
      bio: bio || '',
      skills: skills || [],
      languages: languages || [],
      emailVerified: false, // User must verify email
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
      created_at: new Date(),
    });

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(user.email, verificationToken, user.name);
      if (emailResult.success) {
        console.log(`✅ Verification email sent to ${user.email}`);
      } else {
        console.error('❌ Failed to send verification email:', emailResult.error);
        // Continue even if email fails - user can request resend
      }
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Continue even if email fails - user can request resend
    }

    // Generate token (but user needs to verify email for full access)
    const token = generateToken({ userId: user._id.toString(), email: user.email });

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role === 'job_seeker' ? 'candidate' : user.role === 'recruiter' ? 'company' : 'admin',
          location: user.location,
          bio: user.bio,
          skills: user.skills,
          emailVerified: user.emailVerified || false,
        },
        token,
        message: 'Account created successfully! Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

