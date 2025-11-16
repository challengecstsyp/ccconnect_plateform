'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle, Loader, MailCheck } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const VerifyEmailPage = () => {
  const { resendVerification } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('pending'); // 'pending' | 'verifying' | 'success' | 'error' | 'expired'
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  const verifyEmail = useCallback(async (verifyToken, verifyEmailAddress) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verifyToken,
          email: verifyEmailAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyVerified) {
          setStatus('success');
          setMessage('Your email is already verified!');
        } else {
          setStatus('success');
          setMessage('Email verified successfully! You can now access all features.');
        }
      } else {
        if (data.error?.includes('expired')) {
          setStatus('expired');
          setMessage(data.error);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    }
  }, []);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    // Try to get email from localStorage as fallback (if user just signed up)
    let userEmail = emailParam;
    if (!userEmail) {
      try {
        const storedUser = localStorage.getItem('utopiaHireUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          userEmail = user.email;
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    if (tokenParam && emailParam) {
      // User clicked the verification link from email
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
      setStatus('verifying');
      verifyEmail(tokenParam, decodeURIComponent(emailParam));
    } else if (emailParam) {
      // User just signed up - show "check your email" message
      const decodedEmail = decodeURIComponent(emailParam);
      setEmail(decodedEmail);
      setStatus('pending');
      setMessage(`An email verification has been sent to ${decodedEmail}. Please check your inbox and click the verification link to complete your registration.`);
    } else if (userEmail) {
      // User just signed up but email not in URL - get from localStorage
      setEmail(userEmail);
      setStatus('pending');
      setMessage(`An email verification has been sent to ${userEmail}. Please check your inbox and click the verification link to complete your registration.`);
    } else {
      // No token and no email - user might have just signed up
      // Show a helpful message instead of an error
      setStatus('pending');
      setMessage('An email verification is being sent to you. Please check your inbox and click the verification link to complete your registration.');
    }
  }, [searchParams, verifyEmail]);

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    const result = await resendVerification(email);
    setResending(false);

    if (result.success) {
      setMessage(`A new verification email has been sent to ${email}. Please check your inbox.`);
      setStatus('pending'); // Show success state after resend
    } else {
      setMessage(result.error || 'Failed to resend verification email.');
      setStatus('error');
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Confirm your email address to complete your registration."
    >
      <div className="space-y-6">
        {status === 'pending' && (
          <div className="text-center py-8">
            <MailCheck className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Verification Sent</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            {email && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-indigo-800">
                  <strong>Didn't receive the email?</strong>
                  <br />
                  Check your spam folder or click the button below to resend.
                </p>
              </div>
            )}
            {email ? (
              <div className="space-y-4">
                <Button
                  onClick={handleResend}
                  disabled={resending}
                  primary={true}
                  className="w-full"
                >
                  <Mail className="w-5 h-5 mr-2 inline-block" />
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  If you just created an account, please wait a moment for the email to arrive.
                </p>
                <Link href="/login">
                  <Button primary={false} className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
            {email && (
              <div className="mt-6 space-y-2">
                <Link href="/login" className="block text-sm text-indigo-600 hover:text-indigo-500">
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        )}

        {status === 'verifying' && (
          <div className="text-center py-8">
            <Loader className="w-12 h-12 text-indigo-600 mx-auto animate-spin mb-4" />
            <p className="text-gray-600">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login">
              <Button primary={true} className="w-full">
                Continue to Login
              </Button>
            </Link>
          </div>
        )}

        {(status === 'error' || status === 'expired') && (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {status === 'expired' ? 'Verification Link Expired' : 'Verification Failed'}
            </h3>
            <p className="text-gray-600 mb-6">{message}</p>

            {email && (
              <div className="space-y-4">
                <Button
                  onClick={handleResend}
                  disabled={resending}
                  primary={true}
                  className="w-full"
                >
                  <Mail className="w-5 h-5 mr-2 inline-block" />
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Link href="/login" className="block text-sm text-indigo-600 hover:text-indigo-500">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;

