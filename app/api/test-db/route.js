import connectDB from '@/lib/mongodb';
import { User } from '@/models';

/**
 * Test API route to verify database connection
 * GET /api/test-db
 */
export async function GET() {
  try {
    await connectDB();
    
    // Test query
    const userCount = await User.countDocuments();
    
    return Response.json({
      success: true,
      message: 'Database connection successful!',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return Response.json(
      {
        success: false,
        error: error.message,
        message: 'Database connection failed. Check your MONGODB_URI in .env.local',
      },
      { status: 500 }
    );
  }
}

