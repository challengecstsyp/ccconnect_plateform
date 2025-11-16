import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

/**
 * Verify authentication token
 * GET /api/auth/verify
 */
export async function GET(request) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}

