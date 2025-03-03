const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
app.get('/api/sum', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SUM_FILE));
    res.json(data);
  } catch (error) {
    console.error('Error reading sum:', error);
    res.status(500).json({ error: 'Failed to read sum' });
  }
});

app.get('/api/history', (req, res) => {
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    res.json(history);
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ error: 'Failed to read history' });
  }
});

app.post('/api/add', (req, res) => {
  try {
    const { number } = req.body;

    if (typeof number !== 'number' || isNaN(number)) {
      return res.status(400).json({ error: 'Invalid number' });
    }

    const sumData = JSON.parse(fs.readFileSync(SUM_FILE));
    let history = JSON.parse(fs.readFileSync(HISTORY_FILE));

    sumData.sum += number;
    sumData.contributions += 1;

    const newEntry = {
      number: number,
      timestamp: new Date().toISOString(),
    };

    history.unshift(newEntry);
    if (history.length > 50) history = history.slice(0, 50);

    fs.writeFileSync(SUM_FILE, JSON.stringify(sumData));
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));

    res.json({ sum: sumData.sum, contributions: sumData.contributions, history });
  } catch (error) {
    console.error('Error adding number:', error);
    res.status(500).json({ error: 'Failed to add number' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
