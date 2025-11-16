# Email Verification System

## Overview

Complete email verification system that requires users to verify their email address after signup.

## Features

✅ **Automatic Verification Email** - Sent on signup  
✅ **Verification Token** - Secure token with 24-hour expiry  
✅ **Resend Verification** - Users can request new verification emails  
✅ **Welcome Email** - Sent after successful verification  
✅ **Development Mode** - Logs email links to console for testing  
✅ **Production Ready** - Easy integration with email services  

## Flow

1. **User Signs Up**
   - Account created with `emailVerified: false`
   - Verification token generated (24-hour expiry)
   - Verification email sent automatically

2. **User Clicks Verification Link**
   - Token validated
   - Email marked as verified
   - Welcome email sent
   - User redirected to login

3. **User Logs In (Unverified)**
   - Can login but redirected to verification page
   - Can request resend verification email

## API Endpoints

### 1. Verify Email
**POST** `/api/auth/verify-email`

**Request Body:**
```json
{
  "token": "verification_token",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!"
}
```

### 2. Resend Verification
**POST** `/api/auth/resend-verification`

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
  "message": "If an account exists with this email, a verification link has been sent."
}
```

### 3. Check Verification Status
**GET** `/api/auth/check-verification`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "emailVerified": true
}
```

## Frontend Pages

### Verification Page
**Route:** `/verify-email`

**Query Parameters:**
- `token` - Verification token (from email link)
- `email` - User email address

**Features:**
- Auto-verifies if token and email provided
- Shows success/error states
- Resend verification button
- Link to login page

## Database Schema

User model includes:
```javascript
{
  emailVerified: Boolean,           // Default: false
  emailVerificationToken: String,    // Generated on signup
  emailVerificationExpiry: Date     // 24 hours from creation
}
```

## Email Service Integration

### Development Mode
In development, verification links are logged to console:
```
📧 EMAIL VERIFICATION (DEV MODE)
=====================================
To: user@example.com
Subject: Verify your UtopiaHire account

Hello John Doe,

Please verify your email address by clicking the link below:

http://localhost:3000/verify-email?token=xxx&email=user@example.com

This link will expire in 24 hours.
=====================================
```

### Production Integration

#### Option 1: SendGrid
```javascript
// In lib/email.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: email,
  from: process.env.EMAIL_FROM,
  subject: 'Verify your UtopiaHire account',
  html: `<a href="${verificationLink}">Verify Email</a>`,
};

await sgMail.send(msg);
```

#### Option 2: Resend
```javascript
// In lib/email.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.EMAIL_FROM,
  to: email,
  subject: 'Verify your UtopiaHire account',
  html: `<a href="${verificationLink}">Verify Email</a>`,
});
```

#### Option 3: Nodemailer
```javascript
// In lib/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: email,
  subject: 'Verify your UtopiaHire account',
  html: `<a href="${verificationLink}">Verify Email</a>`,
});
```

## Environment Variables

Add to `.env.local`:
```env
EMAIL_FROM=noreply@utopiahire.com
# For SendGrid:
# SENDGRID_API_KEY=your_sendgrid_api_key

# For Resend:
# RESEND_API_KEY=your_resend_api_key

# For SMTP:
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your_smtp_user
# SMTP_PASS=your_smtp_password
```

## Usage in Components

```jsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, resendVerification } = useAuth();

  const handleResend = async () => {
    const result = await resendVerification(user.email);
    if (result.success) {
      alert('Verification email sent!');
    }
  };

  return (
    <div>
      {!user.emailVerified && (
        <div>
          <p>Please verify your email</p>
          <button onClick={handleResend}>Resend Verification</button>
        </div>
      )}
    </div>
  );
}
```

## Security Features

1. **Token Expiry** - 24-hour expiration
2. **One-Time Use** - Token cleared after verification
3. **Secure Tokens** - Cryptographically random tokens
4. **Email Validation** - Token must match email
5. **No User Enumeration** - Same response for existing/non-existing users

## Testing

1. **Sign up** with a new email
2. **Check console** for verification link (dev mode)
3. **Click link** or visit `/verify-email?token=xxx&email=xxx`
4. **Verify** email is marked as verified
5. **Login** - should redirect to dashboard (not verification page)

## Next Steps

1. Integrate with email service (SendGrid, Resend, etc.)
2. Add email templates for better UX
3. Add rate limiting for resend requests
4. Add email verification reminder emails
5. Add option to change email address

