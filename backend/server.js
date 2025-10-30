const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Demo product catalog for educational purposes
const demoProducts = {
  widget: {
    name: "Demo Widget",
    description: "A sample product for payment demonstration",
    price: 2500, // in cents (25.00 EUR)
    currency: "EUR",
    tax_rate: 2500, // 25% VAT in basis points
    image_url: "https://via.placeholder.com/300x200/007acc/ffffff?text=Demo+Widget"
  }
};

// Utility function to create Klarna API headers
const createKlarnaHeaders = () => {
  const credentials = Buffer.from(`${process.env.KLARNA_USERNAME}:${process.env.KLARNA_PASSWORD}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
};

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
  console.log('📦 Fetching demo products');
  res.json(demoProducts);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err);
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
  console.log(`🚀 Klarna Demo Backend running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

  if (!process.env.KLARNA_USERNAME || !process.env.KLARNA_PASSWORD) {
    console.warn('⚠️  Klarna credentials not configured. Please check your .env file.');
  }
});

module.exports = { app, createKlarnaHeaders, demoProducts };