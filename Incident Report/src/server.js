require('dotenv').config();
const express = require('express');
const incidentRoutes = require('./routes/incidents');

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', module: 'incident-management' }));

// Module 9: Incident Management routes
app.use('/api', incidentRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Incident Management backend running on port ${PORT}`);
});
