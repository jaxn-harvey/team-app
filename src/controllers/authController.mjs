import {
  authenticateAdmin,
  createAdmin,
  generateToken,
} from '../services/authService.mjs';
import { adminsCollection } from '../models/collections.mjs';

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    console.log('[AUTH] Login attempt for:', username);

    const admin = await authenticateAdmin(username, password);
    const token = generateToken(admin._id, admin.username, admin.role);

    console.log('[AUTH] Login successful for:', username);

    res.json({
      message: 'Login successful',
      token,
      username: admin.username,
      role: admin.role,
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
}

export async function setupAdmin(req, res, next) {
  try {
    const { username, password } = req.body;

    console.log('[SETUP] Creating admin:', username);

    const adminId = await createAdmin(username, password);

    console.log('[SETUP] Admin created:', adminId);

    res.status(201).json({
      message: 'Admin created successfully',
      insertedId: adminId,
    });
  } catch (error) {
    console.error('[SETUP] Admin creation error:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function getCurrentAdmin(req, res, next) {
  try {
    const admin = await adminsCollection().findOne({ _id: req.user.userId });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      username: admin.username,
      role: admin.role,
    });
  } catch (error) {
    console.error('[AUTH] Get current admin error:', error.message);
    res.status(500).json({ error: 'Failed to get admin info' });
  }
}
