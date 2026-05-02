// ============================================================
// M H Mahin Portfolio - Backend Server
// Express + MongoDB Atlas
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ──
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON request body

// ── MONGODB CONNECTION ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── CONTACT SCHEMA ──
// This defines how contact form data will be saved in MongoDB
const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, default: 'Not provided' },
  subject:   { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create the model (this becomes a "collection" in MongoDB)
const Contact = mongoose.model('Contact', contactSchema);

// ── ROUTES ──

// Test route - check if server is running
app.get('/', (req, res) => {
  res.json({ message: '🚀 Mahin Portfolio Backend is running!' });
});

// POST /contact - Save form data to MongoDB
app.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields.'
      });
    }

    // Save to MongoDB
    const newContact = new Contact({ name, email, phone, subject, message });
    await newContact.save();

    console.log(`📩 New contact from: ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Message received! Mahin will contact you soon.'
    });

  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// GET /contacts - View all messages (only you can use this)
app.get('/contacts', async (req, res) => {
  try {
    // Get all contacts, newest first
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      total: contacts.length,
      contacts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
