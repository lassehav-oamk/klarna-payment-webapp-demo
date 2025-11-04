const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { demoProducts } = require('./utils/shared');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import route handlers
const sessionRoutes = require('./routes/session');
const orderRoutes = require('./routes/orders');

// Use routes
app.use('/api', sessionRoutes);
app.use('/api', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    klarna_configured: !!(process.env.KLARNA_USERNAME && process.env.KLARNA_PASSWORD)
  });
});

// Get demo products
app.get('/api/products', (req, res) => {
  console.log('Fetching demo products');
  res.json({ products: demoProducts });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Klarna Demo Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled`);

  if (!process.env.KLARNA_USERNAME || !process.env.KLARNA_PASSWORD) {
    console.warn('Klarna credentials not configured. Please check your .env file.');
  }
});
