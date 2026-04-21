import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Modular imports
import { connectDB } from './src/config/database.mjs';
import { PORT } from './src/config/constants.mjs';
import { errorHandler } from './src/middleware/errorHandler.mjs';
import { initializeSentry } from './src/config/sentry.mjs';
import requestLogger from './src/middleware/requestLogger.mjs';
import logger from './src/utils/logger.mjs';
import { authenticateToken, requireAdmin } from './src/middleware/auth.mjs';
import { validateRestaurantData, validateAuthData, validateContactMessage } from './src/middleware/validation.mjs';
import { upload } from './src/utils/multerConfig.mjs';
import {
  login,
  setupAdmin,
  getCurrentAdmin,
} from './src/controllers/authController.mjs';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurantHandler,
  updateRestaurantHandler,
  deleteRestaurantHandler,
} from './src/controllers/restaurantController.mjs';
import { sendContactMessage } from './src/controllers/contactController.mjs';
import { contactMessagesCollection } from './src/models/collections.mjs';
import { getMailTransporter } from './src/controllers/contactController.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = createServer(app);

// Initialize Sentry error tracking
initializeSentry(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Public routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ============ PUBLIC API ROUTES ============

// Get all restaurants
app.get('/api/restaurants', getRestaurants);

// Get single restaurant
app.get('/api/restaurants/:id', getRestaurantById);

// ============ AUTHENTICATION ROUTES ============

// Login endpoint
app.post('/api/auth/login', validateAuthData, login);

// Get current auth info
app.get('/api/auth/me', authenticateToken, getCurrentAdmin);

// Setup endpoint for first admin
app.post('/api/setup/create-admin', validateAuthData, setupAdmin);

// ============ ADMIN ROUTES (Protected) ============

// Get admin restaurants
app.get(
  '/api/admin/restaurants',
  authenticateToken,
  requireAdmin,
  getRestaurants
);

// Create restaurant
app.post(
  '/api/admin/restaurants',
  authenticateToken,
  requireAdmin,
  validateRestaurantData,
  createRestaurantHandler
);

// Update restaurant
app.put(
  '/api/admin/restaurants/:id',
  authenticateToken,
  requireAdmin,
  validateRestaurantData,
  updateRestaurantHandler
);

// Delete restaurant
app.delete(
  '/api/admin/restaurants/:id',
  authenticateToken,
  requireAdmin,
  deleteRestaurantHandler
);

// Upload restaurant image
app.post(
  '/api/upload/restaurant-image',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        logger.warn('Image upload failed: no file provided', { path: req.path });
        return res.status(400).json({ error: 'No image file provided' });
      }

      logger.info('Image uploaded successfully', { filename: req.file.filename, size: req.file.size });
      res.json({
        success: true,
        filename: req.file.filename,
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      logger.error('Image upload error', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// ============ CONTACT / EMAIL ROUTES ============

app.post('/api/contact', validateContactMessage, sendContactMessage);

// ============ WEBSOCKET HANDLERS ============

io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  socket.on('send-contact-email', async (data) => {
    const { senderName, senderEmail, subject, message } = data;

    try {
      if (!senderName || !senderEmail || !subject || !message) {
        logger.warn('WebSocket: missing required fields', { socketId: socket.id, senderName, senderEmail });
        socket.emit('email-status', {
          status: 'error',
          message: 'All fields required',
        });
        return;
      }

      // Store in database
      try {
        await contactMessagesCollection().insertOne({
          name: senderName,
          email: senderEmail,
          subject,
          message,
          timestamp: new Date(),
          status: 'received',
        });
      } catch (dbError) {
        logger.warn('WebSocket: database error storing message', { error: dbError.message, socketId: socket.id });
      }

      // Send email
      const transporter = getMailTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER,
        subject: `New Contact: ${subject}`,
        text: `From: ${senderName} (${senderEmail})\n\n${message}`,
      };

      await transporter.sendMail(mailOptions);
      logger.info('Contact email sent successfully', { senderEmail, socketId: socket.id });
      socket.emit('email-status', {
        status: 'success',
        message: 'Email sent successfully!',
      });
    } catch (error) {
      logger.error('WebSocket email error', { error: error.message, socketId: socket.id, senderEmail });
      socket.emit('email-status', {
        status: 'error',
        message: 'Failed to send email',
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });
});

// ============ ERROR HANDLING ============

app.use(errorHandler);

// ============ SERVER STARTUP ============

async function startServer() {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');

    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`, { port: PORT, environment: process.env.NODE_ENV || 'development' });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();