import { verifyToken, getTokenFromRequest } from './auth';
import connectDB from './mongodb';
import { User } from '@/models';

/**
 * Middleware to verify authentication
 * Returns user object if authenticated, null otherwise
 */
export async function authenticateRequest(request) {
  try {
    await connectDB();
    
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return { success: false, user: null };
    }

    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return { success: false, user: null };
    }

    const user = await User.findById(decoded.userId).select('-password_hash');
    
    if (!user) {
      return { success: false, user: null };
    }

    const userData = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role === 'job_seeker' ? 'candidate' : user.role === 'recruiter' ? 'company' : 'admin',
      location: user.location,
      bio: user.bio,
      skills: user.skills,
      emailVerified: user.emailVerified,
    };

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, user: null };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user, requiredRoles) {
  if (!user || !user.role) return false;
  return requiredRoles.includes(user.role);
}

