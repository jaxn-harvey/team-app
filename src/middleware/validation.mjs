import { AppError } from './errorHandler.mjs';

export function validateRestaurantData(req, res, next) {
  const { name, cuisine, address, description, hours } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Restaurant name is required');
  }

  if (!cuisine || cuisine.trim().length === 0) {
    errors.push('Cuisine type is required');
  }

  if (!address || address.trim().length === 0) {
    errors.push('Address is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  next();
}

export function validateAuthData(req, res, next) {
  const { username, password } = req.body;

  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  next();
}

export function validateContactMessage(req, res, next) {
  const { name, email, message } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  next();
}
