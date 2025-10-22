export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

export function canAdmin(role) {
  return role === ROLES.ADMIN;
}

export function canManager(role) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

export function canViewer(role) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER || role === ROLES.VIEWER;
}

export function requireRole(userRole, requiredRoles) {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
}
