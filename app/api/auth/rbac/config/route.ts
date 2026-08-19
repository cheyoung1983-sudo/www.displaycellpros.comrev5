import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    configuration: [
      {
        _id: 'v1',
        apikey: process.env.AUTH0_RBAC_EXTENSION_API_KEY ? '••••••••' : null,
        rolesInToken: true,
        rolesPassthrough: true,
      },
    ],
    permissions: [
      {
        _id: '8df20543-aa89-4ddb-aa83-cb00cab1801b',
        name: 'dcp',
        description: 'dcp1',
        applicationId: 'iHyCQzrHYenv4lrkCFy4v9528jtJUUHl',
        applicationType: 'client',
      },
    ],
    groups: [
      {
        _id: 'f80d5dc6-aa81-4a1e-89ef-46cafa97b541',
        name: 'SuperAdmin',
        description: 'Root',
        members: ['google-oauth2|102574138357203183279'],
      },
    ],
  });
}
