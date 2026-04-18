import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = process.env.DB_NAME || 'shoals_dining_guide';

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env');
}

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function db() {
  return client.db(DB_NAME);
}

function usersCollection() {
  return db().collection('users');
}

function adminsCollection() {
  return db().collection('admins');
}

function restaurantsCollection() {
  return db().collection('restaurants');
}

function contactCollection() {
  return db().collection('contact_messages');
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only.' });
  }

  next();
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
}

function buildRestaurantPayload(body) {
  return {
    name: body.name?.trim() || '',
    cuisine: body.cuisine?.trim() || '',
    description: body.description?.trim() || '',
    image: body.image?.trim() || '',
    address: body.address?.trim() || '',
    phone: body.phone?.trim() || '',
    hours: body.hours?.trim() || '',
    rating: Number(body.rating) || 0,
    reviews: Number(body.reviews) || 0,
    liveMusic: parseBoolean(body.liveMusic),
    musicSchedule: body.musicSchedule?.trim() || '',
    featured: parseBoolean(body.featured),
    heritage: body.heritage?.trim() || '',
    lat: Number(body.lat) || 0,
    lng: Number(body.lng) || 0,
  };
}

function validateRestaurantPayload(restaurant) {
  if (!restaurant.name || !restaurant.cuisine || !restaurant.description || !restaurant.address) {
    return 'Name, cuisine, description, and address are required.';
  }

  return null;
}

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

//
// PUBLIC READ ONLY ROUTES
//

app.get('/api/restaurants', async (req, res) => {
  try {
    console.log('[API] GET /api/restaurants - fetching restaurants...');
    const restaurants = await restaurantsCollection().find({}).toArray();
    console.log(`[API] Successfully retrieved ${restaurants.length} restaurants`);
    res.json(restaurants);
  } catch (error) {
    console.error('[API ERROR] Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await restaurantsCollection().findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant.' });
  }
});

//
// AUTH ROUTES
// checks admins first, then users
//

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check MongoDB users collection only
    console.log(`[LOGIN] Attempting login for user: ${username}`);
    let account = await usersCollection().findOne({ username });
    console.log(`[LOGIN] Account found:`, !!account);
    
    let role = 'user';

    if (!account) {
      console.log(`[LOGIN] User not found in database`);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check role and password
    let passwordMatch = false;
    
    if (account.passwordHash) {
      // If passwordHash exists, use bcrypt comparison
      console.log(`[LOGIN] Comparing bcrypt password`);
      passwordMatch = await bcrypt.compare(password, account.passwordHash);
    } else if (account.password) {
      // Fallback: plain text password comparison (not recommended for production)
      console.log(`[LOGIN] Comparing plain text password`);
      passwordMatch = password === account.password;
    } else {
      console.log(`[LOGIN] No password field found in document`);
    }

    console.log(`[LOGIN] Password match:`, passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Extract role from account if it exists
    if (account.role) {
      role = account.role;
    }
    console.log(`[LOGIN] Role assigned:`, role);

    const token = jwt.sign(
      {
        userId: String(account._id),
        username: account.username,
        role,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log(`[LOGIN] Login successful for user: ${username}`);
    res.json({
      message: 'Login successful.',
      token,
      role,
    });
  } catch (error) {
    console.error('[LOGIN ERROR]:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({
    userId: req.user.userId,
    username: req.user.username,
    role: req.user.role,
  });
});

//
// ADMIN ROUTES: FULL CRUD
//

app.get('/api/admin/restaurants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const restaurants = await restaurantsCollection().find({}).toArray();
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching admin restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
});

app.post('/api/admin/restaurants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const restaurant = buildRestaurantPayload(req.body);
    const validationError = validateRestaurantPayload(restaurant);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const result = await restaurantsCollection().insertOne({
      ...restaurant,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: 'Restaurant created successfully.',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant.' });
  }
});

app.put('/api/admin/restaurants/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const restaurant = buildRestaurantPayload(req.body);
    const validationError = validateRestaurantPayload(restaurant);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const result = await restaurantsCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          ...restaurant,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.json({ message: 'Restaurant updated successfully.' });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant.' });
  }
});

app.delete('/api/admin/restaurants/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await restaurantsCollection().deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.json({ message: 'Restaurant deleted successfully.' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant.' });
  }
});

//
// OPTIONAL SEED ROUTE FOR FIRST ADMIN
// remove or protect later if your instructor wants
//

app.post('/api/setup/create-admin', async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existingAdmin = await adminsCollection().findOne({ username });

    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await adminsCollection().insertOne({
      username,
      passwordHash,
      role: 'admin',
      createdAt: new Date(),
    });

    res.status(201).json({
      message: 'Admin created successfully.',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
});

// ==================== CONTACT / EMAIL ROUTES ====================

app.post('/api/contact', async (req, res) => {
  const { senderName, senderEmail, subject, message } = req.body;

  try {
    if (!senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({ error: 'All fields required' });
    }

    try {
      await contactCollection().insertOne({
        name: senderName,
        email: senderEmail,
        subject: subject,
        message: message,
        timestamp: new Date(),
        status: 'received',
      });
    } catch (dbError) {
      console.warn('Database error (continuing anyway):', dbError.message);
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: `New Contact: ${subject}`,
      text: `From: ${senderName} (${senderEmail})\n\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ status: 'success', message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ==================== WEBSOCKET & EMAIL HANDLING ====================

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('send-contact-email', async (data) => {
    const { senderName, senderEmail, subject, message } = data;

    try {
      if (!senderName || !senderEmail || !subject || !message) {
        socket.emit('email-status', { status: 'error', message: 'All fields required' });
        return;
      }

      try {
        await contactCollection().insertOne({
          name: senderName,
          email: senderEmail,
          subject: subject,
          message: message,
          timestamp: new Date(),
          status: 'received',
        });
      } catch (dbError) {
        console.warn('Database error (continuing anyway):', dbError.message);
      }

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER,
        subject: `New Contact: ${subject}`,
        text: `From: ${senderName} (${senderEmail})\n\n${message}`,
      };

      await transporter.sendMail(mailOptions);
      socket.emit('email-status', { status: 'success', message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Email error:', error);
      socket.emit('email-status', { status: 'error', message: 'Failed to send email' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();