
import 'dotenv/config'; 
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const uri = process.env.MONGO_URI;

const PORT = process.env.PORT || 3000;

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const yourNameAndEmoji = { name: 'Jackson', emoji: '☀️' };


//app instantiations
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
})

app.post('/api/get-name', async (req, res) => {
  try {
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ error: 'missing name' });
    }

    const db = client.db('cis486');
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
  }
  catch (error) {
    console.error('Error retrieving name:', error);
    res.status(500).json({ error: 'Failed to retrieve name' });
  }

})

/* 
👇🏻no modifications needed for this endpoint, but you do have to figure out where, when, & how to call it at least once!
*/
app.get('/api/init-emoji', async (req, res) => {
  try {
    
    const db = client.db('cis486');
    const collection = db.collection('exam');
    
    // Check if name already exists
    const existingEntry = await collection.findOne({ name: yourNameAndEmoji.name });
    
    if (existingEntry) {
      return res.json({ 
        message: 'Name already exists', 
        data: existingEntry 
      });
    }
    
    // Only insert if name doesn't exist
    const result = await collection.insertOne(yourNameAndEmoji);
    res.json({ message: 'name & emoji recorded', id: result.insertedId });
  }
  catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to retrieve emoji' });
  }
})

// ==================== WEBSOCKET & EMAIL HANDLING ====================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('send-contact-email', async (data) => {
    const { senderName, senderEmail, subject, message } = data;

    try {
      // Validate input
      if (!senderName || !senderEmail || !subject || !message) {
        socket.emit('email-status', { status: 'error', message: 'All fields required' });
        return;
      }

      // Try to store message in MongoDB (optional - continues if fails)
      try {
        const db = client.db('cis486');
        const contactCollection = db.collection('contact_messages');
        
        await contactCollection.insertOne({
          name: senderName,
          email: senderEmail,
          subject: subject,
          message: message,
          timestamp: new Date(),
          status: 'received'
        });
      } catch (dbError) {
        console.warn('Database error (continuing anyway):', dbError.message);
      }

      // Send email regardless of DB status
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER,
        subject: `New Contact: ${subject}`,
        text: `From: ${senderName} (${senderEmail})\n\n${message}`
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

// ==================== REST ENDPOINT (FALLBACK) ====================
app.post('/api/contact', async (req, res) => {
  const { senderName, senderEmail, subject, message } = req.body;

  try {
    if (!senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Try to store message in MongoDB (optional - continues if fails)
    try {
      const db = client.db('cis486');
      const contactCollection = db.collection('contact_messages');
      
      await contactCollection.insertOne({
        name: senderName,
        email: senderEmail,
        subject: subject,
        message: message,
        timestamp: new Date(),
        status: 'received'
      });
    } catch (dbError) {
      console.warn('Database error (continuing anyway):', dbError.message);
    }

    // Send email regardless of DB status
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: `New Contact: ${subject}`,
      text: `From: ${senderName} (${senderEmail})\n\n${message}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ status: 'success', message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ==================== STATIC ROUTE ====================
app.get('/contact.html', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'contact.html'));
});

/*
👇🏻notice the refactored app.listen:
no code mods needed but this uses the PORT variable for PaaS deployments
*/ 
//start the server. 
server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})