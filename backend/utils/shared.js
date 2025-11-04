const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Demo product catalog for educational purposes
const demoProducts = [
  {
    productId: 12345,
    name: "Boots",
    description: "These boots are made for walking",
    price: 2500, // in cents (25.00 EUR)
    currency: "EUR",
    tax_rate: 2500, // 25% VAT in basis points
    image_url: "https://placehold.co/400x400?text=Boots"
  },
  {
    productId: 12346,
    name: "Banana",
    description: "Yellow banana, rich in potassium",
    price: 80, // in cents (0.80 EUR)
    currency: "EUR",
    tax_rate: 2500, // 25% VAT in basis points
    image_url: "https://placehold.co/400x400?text=Banana"
  }
];

// Utility function to create Klarna API headers
const createKlarnaHeaders = () => {
  const credentials = Buffer.from(`${process.env.KLARNA_USERNAME}:${process.env.KLARNA_PASSWORD}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
};

module.exports = {
  demoProducts,
  createKlarnaHeaders
};
