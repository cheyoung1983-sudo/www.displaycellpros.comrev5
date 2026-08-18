import React from 'react';

/**
 * Button that starts the Vercel OAuth flow.
 * It simply links to the /api/auth/start endpoint.
 */
export default function VercelLoginButton({
  userId = 'usr_123',
}: {
  userId?: string;
}) {
  return (
    <a
      href={`/api/auth/start?userId=${userId}`}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
    >
      Sign in with Vercel
    </a>
  );
}
