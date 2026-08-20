import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { sub, email, groups = [], permissions = [] } = body || {};
  const isSuperAdminMember =
    sub === 'google-oauth2|102574138357203183279' ||
    (email && email.toLowerCase() === 'cheyoung1983@gmail.com') ||
    groups.includes('SuperAdmin');

  const hasDcp = permissions.includes('dcp') || isSuperAdminMember;

  return NextResponse.json({
    status: 'ok',
    sub,
    isSuperAdmin: isSuperAdminMember,
    roles: isSuperAdminMember ? ['SuperAdmin'] : groups,
    permissions: hasDcp ? ['dcp', ...permissions] : permissions,
    accessLevel: isSuperAdminMember ? 'Root Administrator' : 'Technician',
    timestamp: new Date().toISOString(),
  });
}
