const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const wordRoutes = require('./routes/words');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/words', wordRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
