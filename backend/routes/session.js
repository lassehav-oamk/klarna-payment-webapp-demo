const express = require('express');
const axios = require('axios');
const { createKlarnaHeaders, demoProducts } = require('../utils/shared');

const router = express.Router();

// POST /api/create-session - Creates Klarna payment session
router.post('/create-session', async (req, res) => {
  try {
    console.log('Creating Klarna payment session...');

    const { cart, customerInfo } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is required and must be a non-empty array' });
    }

    // Build order lines and calculate totals
    const orderLines = [];
    let totalOrderAmount = 0;
    let totalTaxAmount = 0;
    let currency = null;

    for (const cartItem of cart) {
      // Find product in demoProducts array
      const product = demoProducts.find(p => p.productId === cartItem.productId);

      if (!product) {
        return res.status(400).json({ error: `Product with ID ${cartItem.productId} not found` });
      }

      // Ensure all products have the same currency
      if (currency === null) {
        currency = product.currency;
      } else if (currency !== product.currency) {
        return res.status(400).json({ error: 'All products must have the same currency' });
      }

      // Calculate amounts for this line item
      const unitPrice = product.price;
      const lineAmount = unitPrice * cartItem.quantity;
      const lineTaxAmount = Math.round((lineAmount * product.tax_rate) / 10000);

      totalOrderAmount += lineAmount;
      totalTaxAmount += lineTaxAmount;

      // Add to order lines
      orderLines.push({
        type: "physical",
        reference: product.productId.toString(),
        name: product.name,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        tax_rate: product.tax_rate,
        total_amount: lineAmount,
        total_discount_amount: 0,
        total_tax_amount: lineTaxAmount,
        product_url: "https://example.com/product",
        image_url: product.image_url
      });
    }

    const totalAmountWithTax = totalOrderAmount + totalTaxAmount;

    // Prepare session data for Klarna
    const sessionData = {
      intent: "buy",
      purchase_country: "FI", // Finland for demo
      purchase_currency: "EUR",
      locale: "fi-FI",
      order_amount: totalAmountWithTax,
      order_tax_amount: totalTaxAmount,
      order_lines: orderLines,      
    };

    console.log('Session data prepared:', JSON.stringify(sessionData, null, 2));

    // Make request to Klarna API
    const response = await axios.post(
      `${process.env.KLARNA_API_URL}/payments/v1/sessions`,
      sessionData,
      { headers: createKlarnaHeaders() }
    );

    console.log('Klarna session created successfully');
    console.log('Session ID:', response.data.session_id);

    // Return session data to frontend
    res.json({
      session_id: response.data.session_id,
      client_token: response.data.client_token,
      payment_method_categories: response.data.payment_method_categories,
      order_amount: totalAmountWithTax,
      order_tax_amount: totalTaxAmount,
      purchase_currency: currency
    });

  } catch (error) {
    console.error('Error creating Klarna session:', error.message);

    if (error.response) {
      console.error('Klarna API response:', error.response.data);
      res.status(error.response.status).json({
        error: 'Klarna API error',
        details: error.response.data,
        message: 'Failed to create payment session'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create payment session'
      });
    }
  }
});

module.exports = router;