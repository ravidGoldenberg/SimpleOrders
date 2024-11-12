require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Item = require('./models/Item');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Routes
app.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ created_at: -1 });
    res.render('index', { items });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Error fetching items');
  }
});

app.post('/items', async (req, res) => {
  try {
    const { name } = req.body;
    await Item.create({ name });
    res.redirect('/');
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).send('Error creating item');
  }
});

// Add update route
app.post('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await Item.findByIdAndUpdate(id, { name });
    res.redirect('/');
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).send('Error updating item');
  }
});

// Add delete route
app.post('/items/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await Item.findByIdAndDelete(id);
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).send('Error deleting item');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
