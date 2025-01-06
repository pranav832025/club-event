// Load environment variables from the .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL client setup using DATABASE_URL from .env file
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Uses the DATABASE_URL from .env
  ssl: { rejectUnauthorized: false },
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error:', err));

// Home route - Serving index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to store participant details and scores
app.post('/submit-scores', async (req, res) => {
  const { name, class_name, round_1_score, round_2_score, round_3_score } = req.body;

  try {
    const result = await client.query(
      'INSERT INTO participants (name, class, round_1_score, round_2_score, round_3_score) VALUES ($1, $2, $3, $4, $5)',
      [name, class_name, round_1_score, round_2_score, round_3_score]
    );
    res.status(200).json({ message: 'Participant data saved successfully!' });
  } catch (err) {
    console.error('Error saving participant data:', err);
    res.status(500).json({ message: 'Error saving data.' });
  }
});

// Route to get all participants
app.get('/participants', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM participants');
    res.status(200).json(result.rows); // Return the rows as JSON
  } catch (err) {
    console.error('Error fetching participants:', err);
    res.status(500).json({ message: 'Error fetching participants.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
