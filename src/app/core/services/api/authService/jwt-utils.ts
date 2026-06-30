const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRoles(payload: Record<string, unknown>): string[] {
  const raw = payload['role'] ?? payload[ROLE_CLAIM] ?? payload['roles'];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  return [String(raw)];
}

export function tokenHasAdminRole(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  return normalizeRoles(payload).some((role) => role.toLowerCase() === 'admin');
}

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const id = payload['sub']
    ?? payload['nameid']
    ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  return id ? String(id) : null;
}
