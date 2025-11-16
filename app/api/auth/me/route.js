import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

/**
 * Get current authenticated user
 * GET /api/auth/me
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
    success: true,
    user,
  });
}

