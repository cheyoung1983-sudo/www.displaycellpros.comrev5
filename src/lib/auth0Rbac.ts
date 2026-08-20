export interface Auth0RbacConfiguration {
  _id: string;
  apikey: string;
  rolesInToken: boolean;
  rolesPassthrough: boolean;
}

export interface Auth0Permission {
  _id: string;
  name: string;
  description: string;
  applicationId: string;
  applicationType: string;
}

export interface Auth0Group {
  _id: string;
  name: string;
  description: string;
  members: string[];
}

export interface Auth0AuthorizationExtensionData {
  configuration: Auth0RbacConfiguration[];
  permissions: Auth0Permission[];
  groups: Auth0Group[];
}

// Initial configuration provided for Auth0 Authorization Extension
export const DEFAULT_AUTH0_RBAC_DATA: Auth0AuthorizationExtensionData = {
  configuration: [
    {
      _id: "v1",
      apikey: "66cb7c53a6b208edaff503f67bf39038d49948109fff330389e2761c6b3a6af5",
      rolesInToken: true,
      rolesPassthrough: true
    }
  ],
  permissions: [
    {
      _id: "8df20543-aa89-4ddb-aa83-cb00cab1801b",
      name: "dcp",
      description: "dcp1",
      applicationId: "iHyCQzrHYenv4lrkCFy4v9528jtJUUHl",
      applicationType: "client"
    }
  ],
  groups: [
    {
      _id: "f80d5dc6-aa81-4a1e-89ef-46cafa97b541",
      name: "SuperAdmin",
      description: "Root",
      members: ["google-oauth2|102574138357203183279"]
    }
  ]
};

const STORAGE_KEY = 'dcp_auth0_rbac_extension_v1';

export function getAuth0RbacData(): Auth0AuthorizationExtensionData {
  if (typeof window === 'undefined') return DEFAULT_AUTH0_RBAC_DATA;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse Auth0 RBAC data, using default:', e);
  }
  return DEFAULT_AUTH0_RBAC_DATA;
}

export function saveAuth0RbacData(data: Auth0AuthorizationExtensionData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save Auth0 RBAC data:', e);
  }
}

export interface UserAuthorizationProfile {
  isSuperAdmin: boolean;
  groups: string[];
  permissions: string[];
  matchedMemberships: Auth0Group[];
  hasDcpPermission: boolean;
}

export function evaluateUserRbac(user: any | null | undefined): UserAuthorizationProfile {
  const rbacData = getAuth0RbacData();
  
  if (!user) {
    return {
      isSuperAdmin: false,
      groups: [],
      permissions: [],
      matchedMemberships: [],
      hasDcpPermission: false
    };
  }

  const userSub = user.sub || '';
  const userEmail = (user.email || '').toLowerCase();
  const tokenGroups = Array.isArray(user['https://dcp.app/groups']) 
    ? user['https://dcp.app/groups'] 
    : Array.isArray(user['groups']) 
    ? user['groups'] 
    : [];
  
  const tokenRoles = Array.isArray(user['https://dcp.app/roles']) 
    ? user['https://dcp.app/roles'] 
    : Array.isArray(user['roles']) 
    ? user['roles'] 
    : [];

  const tokenPermissions = Array.isArray(user['https://dcp.app/permissions']) 
    ? user['https://dcp.app/permissions'] 
    : Array.isArray(user['permissions']) 
    ? user['permissions'] 
    : [];

  // Match groups from RBAC data
  const matchedGroups = rbacData.groups.filter(group => {
    const isExplicitMember = group.members.includes(userSub);
    const hasTokenGroup = tokenGroups.includes(group.name) || tokenRoles.includes(group.name);
    // SuperAdmin fallback for root owner account
    const isOwnerEmail = userEmail === 'cheyoung1983@gmail.com' && group.name === 'SuperAdmin';
    return isExplicitMember || hasTokenGroup || isOwnerEmail;
  });

  const groupNames = Array.from(new Set([
    ...matchedGroups.map(g => g.name),
    ...tokenGroups,
    ...tokenRoles
  ]));

  const isSuperAdmin = groupNames.includes('SuperAdmin') || matchedGroups.some(g => g.name === 'SuperAdmin');

  // Permissions calculation
  const permissions = Array.from(new Set([
    ...rbacData.permissions.map(p => p.name),
    ...tokenPermissions
  ]));

  const hasDcpPermission = permissions.includes('dcp') || isSuperAdmin;

  return {
    isSuperAdmin,
    groups: groupNames.length > 0 ? groupNames : (isSuperAdmin ? ['SuperAdmin'] : ['User']),
    permissions: hasDcpPermission ? ['dcp', ...permissions] : permissions,
    matchedMemberships: matchedGroups,
    hasDcpPermission
  };
}
