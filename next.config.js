/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=*, microphone=*, geolocation=*' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self' https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https:",
      "font-src 'self' https://fonts.gstatic.com data: https:",
      "img-src 'self' data: blob: https://images.unsplash.com https:",
      "connect-src 'self' https: wss: ws: http:",
      "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app https://*.aistudio.google.com https://*.googleusercontent.com *",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactProductionProfiling: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
