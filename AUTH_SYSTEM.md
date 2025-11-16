# Authentication System Documentation

## Overview

Complete authentication system with signup, login, forgot password, and protected routes.

## API Endpoints

### 1. Signup
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "job_seeker", // optional: "job_seeker" | "recruiter" | "admin"
  "location": "Tunis, Tunisia", // optional
  "bio": "Bio text", // optional
  "skills": ["Python", "React"], // optional
  "languages": ["English", "French"] // optional
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "candidate",
    ...
  },
  "token": "jwt_token_here"
}
```

### 2. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt_token_here"
}
```

### 3. Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

### 4. Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "email": "user@example.com",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### 5. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

## Frontend Usage

### Using AuthContext

```jsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, signup, logout, forgotPassword, resetPassword } = useAuth();

  // Login
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Redirected automatically
    } else {
      console.error(result.error);
    }
  };

  // Signup
  const handleSignup = async () => {
    const result = await signup({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'job_seeker'
    });
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

## Protected Routes

Routes are automatically protected by middleware:

- `/dashboard/*` - Requires authentication + `candidate` role
- `/company/*` - Requires authentication + `company` role

Unauthenticated users are redirected to `/login`.

## Environment Variables

Add to `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/utopiahire
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

## Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Token Expiry**: Tokens expire after 7 days (configurable)
4. **Password Reset**: Secure token-based reset with expiry
5. **Role-Based Access**: Different routes for different user roles
6. **Input Validation**: Email format, password length checks

## Database Schema

User model includes:
- `email` (unique, indexed)
- `password_hash` (hashed password)
- `role` (job_seeker | recruiter | admin)
- `resetToken` (for password reset)
- `resetTokenExpiry` (token expiration)

## Next Steps

1. **Email Service**: Integrate email service (SendGrid, Resend, etc.) for password reset emails
2. **Email Verification**: Add email verification on signup
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **2FA**: Add two-factor authentication option
5. **Session Management**: Add refresh tokens for better security

