require('dotenv').config();
const express = require('express');
const emailRoutes = require('./routes/emails');

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Module 2: Email Investigation routes
app.use('/api', emailRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Email Threat Detection backend running on port ${PORT}`);
});
