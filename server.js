
// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" folder
app.use(express.static('public'));

// Fallback route
app.get('/', (req, res) => {
  res.send('✅ Quiz App is running on Heroku! 🚀');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
