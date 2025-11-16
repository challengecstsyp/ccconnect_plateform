# Testing Guide

## Test Login Flow

1. **Sign up a new user:**
   - Go to: http://localhost:3000/register
   - Fill in the form
   - Submit
   - Check console for verification email link (dev mode)

2. **Verify email:**
   - Copy the verification link from console
   - Visit the link or go to `/verify-email?token=xxx&email=xxx`
   - Should see success message

3. **Login:**
   - Go to: http://localhost:3000/login
   - Enter email and password
   - Should redirect to `/dashboard` (candidate) or `/company/dashboard` (company)

## Test Database Connection

Visit: http://localhost:3000/api/test-db

Should return:
```json
{
  "success": true,
  "message": "Database connection successful!",
  "userCount": 0
}
```

## Common Issues & Fixes

### Login doesn't redirect
- Check browser console for errors
- Check if user is verified (emailVerified: true)
- Check network tab for API response
- Verify token is stored in localStorage

### "Not authenticated" error
- Check if token exists in localStorage
- Verify token is valid by calling `/api/auth/me`
- Check if user state is set in AuthContext

### Redirect loop
- Clear localStorage and try again
- Check if user role matches route
- Verify middleware isn't blocking requests

## Debug Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for any error messages
4. Go to Network tab
5. Try to login and check API responses
6. Go to Application tab → Local Storage
7. Check if `auth_token` and `utopiaHireUser` are stored

