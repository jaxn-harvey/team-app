import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const yourNameAndEmoji = { name: 'Jackson', emoji: '☀️' };

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function getDb() {
  return client.db('cis486');
}

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

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.post('/api/get-name', async (req, res) => {
  try {
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ error: 'missing name' });
    }

    const db = getDb();
    const collection = db.collection('exam');

    const result = await collection.findOne({ name: userName });

    if (!result) {
      return res.status(404).json({ error: 'Name not found' });
    }

    res.json({
      message: 'Name found',
      name: result.name,
      emoji: result.emoji
    });
  } catch (error) {
    console.error('Error retrieving name:', error);
    res.status(500).json({ error: 'Failed to retrieve name' });
  }
});

app.get('/api/init-emoji', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection('exam');

    const existingEntry = await collection.findOne({ name: yourNameAndEmoji.name });

    if (existingEntry) {
      return res.json({
        message: 'Name already exists',
        data: existingEntry
      });
    }

    const result = await collection.insertOne(yourNameAndEmoji);
    res.json({ message: 'name & emoji recorded', id: result.insertedId });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to retrieve emoji' });
  }
});

/* =========================
   ADMIN AUTH ROUTES
========================= */

app.post('/api/setup/create-admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const db = getDb();
    const admins = db.collection('admins');

    const existingAdmin = await admins.findOne({ username: username.trim() });
    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await admins.insertOne({
      username: username.trim(),
      passwordHash,
      role: 'admin',
      createdAt: new Date()
    });

    res.status(201).json({
      message: 'Admin created successfully.',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const db = getDb();
    const admins = db.collection('admins');
    const users = db.collection('users');

    let account = await admins.findOne({ username: username.trim() });
    let role = 'admin';

    if (!account) {
      account = await users.findOne({ username: username.trim() });
      role = 'user';
    }

    if (!account) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, account.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        userId: String(account._id),
        username: account.username,
        role
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    userId: req.user.userId,
    username: req.user.username,
    role: req.user.role
  });
});

/* =========================
   RESTAURANT ROUTES
========================= */

app.get('/api/restaurants', async (req, res) => {
  try {
    const db = getDb();
    const restaurants = db.collection('restaurants');

    const result = await restaurants.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
});

app.get('/api/admin/restaurants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const restaurants = db.collection('restaurants');

    const result = await restaurants.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching admin restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
});

app.post('/api/admin/restaurants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const restaurants = db.collection('restaurants');

    const newRestaurant = {
      name: req.body.name?.trim() || '',
      cuisine: req.body.cuisine?.trim() || '',
      description: req.body.description?.trim() || '',
      address: req.body.address?.trim() || '',
      phone: req.body.phone?.trim() || '',
      hours: req.body.hours?.trim() || '',
      rating: Number(req.body.rating) || 0,
      reviews: Number(req.body.reviews) || 0,
      image: req.body.image?.trim() || '',
      lat: Number(req.body.lat) || 0,
      lng: Number(req.body.lng) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!newRestaurant.name || !newRestaurant.cuisine || !newRestaurant.address) {
      return res.status(400).json({ error: 'Name, cuisine, and address are required.' });
    }

    const result = await restaurants.insertOne(newRestaurant);

    res.status(201).json({
      message: 'Restaurant created successfully.',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant.' });
  }
});

app.delete('/api/admin/restaurants/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid restaurant id.' });
    }

    const db = getDb();
    const restaurants = db.collection('restaurants');

    const result = await restaurants.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.json({ message: 'Restaurant deleted successfully.' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Failed to delete restaurant.' });
  }
});

async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();