// Server.js - Simple Express server for the Number Sum App
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const SUM_FILE = path.join(DATA_DIR, 'sum.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(SUM_FILE)) {
  fs.writeFileSync(SUM_FILE, JSON.stringify({ sum: 0, contributions: 0 }));
}

if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// API Routes
// Get the current sum
app.get('/api/sum', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SUM_FILE));
    res.json(data);
  } catch (error) {
    console.error('Error reading sum:', error);
    res.status(500).json({ error: 'Failed to read sum' });
  }
});

// Get the history
app.get('/api/history', (req, res) => {
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    res.json(history);
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ error: 'Failed to read history' });
  }
});

// Add a number to the sum
app.post('/api/add', (req, res) => {
  try {
    const { number } = req.body;
    
    if (typeof number !== 'number' || isNaN(number)) {
      return res.status(400).json({ error: 'Invalid number' });
    }
    
    // Read current sum data
    const sumData = JSON.parse(fs.readFileSync(SUM_FILE));
    
    // Read history
    let history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    
    // Update sum and contributions
    sumData.sum += number;
    sumData.contributions += 1;
    
    // Add to history
    const newEntry = {
      number: number,
      timestamp: new Date().toISOString()
    };
    
    history.unshift(newEntry);
    
    // Keep history limited to last 50 entries
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    // Save updated data
    fs.writeFileSync(SUM_FILE, JSON.stringify(sumData));
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
    
    // Return updated data
    res.json({
      sum: sumData.sum,
      contributions: sumData.contributions,
      history: history
    });
  } catch (error) {
    console.error('Error adding number:', error);
    res.status(500).json({ error: 'Failed to add number' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});