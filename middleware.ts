import { NextResponse, type NextRequest } from 'next/server';
import { auth0, isAuth0ServerConfigured } from './src/lib/auth0Server';

export async function middleware(request: NextRequest) {
  // auth0.middleware() throws a DomainResolutionError on every request when
  // AUTH0_DOMAIN/AUTH0_CLIENT_ID/AUTH0_SECRET aren't set, which otherwise
  // turns into a site-wide 500 since this matcher covers almost every route.
  // Pass through unmodified until Auth0 is actually configured.
  if (!isAuth0ServerConfigured()) {
    return NextResponse.next();
  }
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
