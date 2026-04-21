import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, BCRYPT_ROUNDS } from '../config/constants.mjs';
import { adminsCollection } from '../models/collections.mjs';

export async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePasswords(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function generateToken(userId, username, role) {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function authenticateAdmin(username, password) {
  const admin = await adminsCollection().findOne({ username });

  if (!admin) {
    throw new Error('Invalid credentials');
  }

  if (!admin.passwordHash) {
    throw new Error('Invalid credentials');
  }

  const passwordMatch = await comparePasswords(password, admin.passwordHash);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  return admin;
}

export async function createAdmin(username, password) {
  const existingAdmin = await adminsCollection().findOne({ username });

  if (existingAdmin) {
    throw new Error('Admin already exists');
  }

  const passwordHash = await hashPassword(password);

  const result = await adminsCollection().insertOne({
    username,
    passwordHash,
    role: 'admin',
    createdAt: new Date(),
  });

  return result.insertedId;
}
