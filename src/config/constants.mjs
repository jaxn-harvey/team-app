export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
export const BCRYPT_ROUNDS = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const DB_NAME = process.env.DB_NAME || 'shoals_dining_guide';
