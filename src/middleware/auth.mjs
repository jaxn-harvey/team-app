import { verifyToken } from '../services/authService.mjs';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[AUTH MIDDLEWARE] Headers:', Object.keys(req.headers));
  console.log('[AUTH MIDDLEWARE] Token present:', !!token);

  if (!token) {
    console.log('[AUTH MIDDLEWARE] No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    console.log('[AUTH MIDDLEWARE] Token verified:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
