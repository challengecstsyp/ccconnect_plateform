import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

/**
 * Check if current user's email is verified
 * GET /api/auth/check-verification
 */
export async function GET(request) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    emailVerified: user.emailVerified || false,
  });
}

