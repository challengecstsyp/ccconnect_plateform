import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

/**
 * Check if current user's email is verified
 * GET /api/auth/check-verification
 */
export async function GET(request) {
  const authResult = await authenticateRequest(request);

  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    emailVerified: authResult.user.emailVerified || false,
  });
}

