/**
 * Role-based access control (RBAC) middleware
 * - Extracts role from `req.userRole` (set by auth middleware)
 * - Provides reusable middlewares: isPatient, isDoctor, isAdmin
 */

const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles.map(r => String(r).toLowerCase()) : [String(allowedRoles).toLowerCase()];

  return (req, res, next) => {
    try {
      const role = (req.userRole || '').toString().toLowerCase();

      if (!role) {
        return res.status(401).json({ message: 'User role not found. Authentication required.' });
      }

      if (!roles.includes(role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ message: 'RBAC middleware error', error: err.message });
    }
  };
};

const isPatient = requireRole('patient');
const isDoctor = requireRole('doctor');
const isAdmin = requireRole('admin');

module.exports = {
  requireRole,
  isPatient,
  isDoctor,
  isAdmin
};
