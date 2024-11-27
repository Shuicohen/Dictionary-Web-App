const express = require('express');
const axios = require('axios');
const fs = require('fs');

const router = express.Router();

const SEARCH_FILE = './data/searched-words.json';

// Ensure the JSON file exists
if (!fs.existsSync(SEARCH_FILE)) {
  fs.writeFileSync(SEARCH_FILE, JSON.stringify([]));
}

// Get search history
router.get('/history', (req, res) => {
  try {
    const history = fs.existsSync(SEARCH_FILE)
      ? JSON.parse(fs.readFileSync(SEARCH_FILE, 'utf8'))
      : [];
    const deduplicatedHistory = [...new Set(history.map((entry) => entry.word))];
    res.status(200).json(deduplicatedHistory);
  } catch (error) {
    console.error('Error retrieving search history:', error.message);
    res.status(500).json({ error: 'Failed to retrieve search history.' });
  }
});

// Fetch word details from the dictionary API
router.get('/:word', async (req, res) => {
  const { word } = req.params;
  console.log(`Received request to fetch word: ${word}`); // Log the request

  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

    // Save the searched word to the history file
    const history = fs.existsSync(SEARCH_FILE)
      ? JSON.parse(fs.readFileSync(SEARCH_FILE, 'utf8'))
      : [];

    const updatedHistory = [
      ...history.filter((entry) => entry.word !== word), // Remove duplicates
      { word, timestamp: new Date().toISOString() },    // Add new entry
    ];
    fs.writeFileSync(SEARCH_FILE, JSON.stringify(updatedHistory, null, 2));

    res.status(200).json(response.data); // Send word data to the frontend
  } catch (error) {
    console.error('Error fetching word data:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ error: `The word "${word}" was not found.` });
    }

    res.status(500).json({ error: 'Failed to fetch word data.' });
  }
});

// Add a word to the search history
router.post('/store-history', (req, res) => {
  const { searchedWords } = req.body;

  if (!Array.isArray(searchedWords) || searchedWords.length === 0) {
    return res.status(400).json({ error: 'Searched words must be a non-empty array.' });
  }

  fs.readFile(SEARCH_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading search file:', err.message);
      return res.status(500).json({ error: 'Failed to read search history.' });
    }

    let history = JSON.parse(data);
    const newEntries = searchedWords.map((word) => ({
      word,
      timestamp: new Date().toISOString(),
    }));

    const updatedHistory = [
      ...history.filter((entry) => !searchedWords.includes(entry.word)), // Remove duplicates
      ...newEntries,
    ];

    fs.writeFile(SEARCH_FILE, JSON.stringify(updatedHistory, null, 2), (err) => {
      if (err) {
        console.error('Error writing to search file:', err.message);
        return res.status(500).json({ error: 'Failed to update search history.' });
      }

      res.status(200).json({ message: 'History updated successfully.' });
    });
  });
});


// Delete a word from the search history
router.delete('/delete-history', (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: 'Word is required.' });
  }

  fs.readFile(SEARCH_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading search file:', err.message);
      return res.status(500).json({ error: 'Failed to read search history.' });
    }

    let history = JSON.parse(data);
    history = history.filter((entry) => entry.word !== word);

    fs.writeFile(SEARCH_FILE, JSON.stringify(history, null, 2), (err) => {
      if (err) {
        console.error('Error writing to search file:', err.message);
        return res.status(500).json({ error: 'Failed to update search history.' });
      }

      res.status(200).json({ message: `Word "${word}" deleted successfully.` });
    });
  });
});

module.exports = router;
