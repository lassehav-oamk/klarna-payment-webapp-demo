const express = require('express');
const axios = require('axios');
const { createKlarnaHeaders, demoProducts } = require('../server');

const router = express.Router();

// POST /api/create-session - Creates Klarna payment session
router.post('/create-session', async (req, res) => {
  try {
    console.log('🔄 Creating Klarna payment session...');

    const { productId = 'widget', quantity = 1, customerInfo } = req.body;

    // Get product details
    const product = demoProducts[productId];
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Calculate totals
    const unitPrice = product.price;
    const totalAmount = unitPrice * quantity;
    const taxAmount = Math.round((totalAmount * product.tax_rate) / 10000);
    const totalAmountWithTax = totalAmount + taxAmount;

    // Prepare session data for Klarna
    const sessionData = {
      purchase_country: "SE", // Sweden for demo
      purchase_currency: product.currency,
      locale: "en-SE",
      order_amount: totalAmountWithTax,
      order_tax_amount: taxAmount,
      order_lines: [
        {
          type: "physical",
          reference: productId,
          name: product.name,
          quantity: quantity,
          unit_price: unitPrice,
          tax_rate: product.tax_rate,
          total_amount: totalAmount,
          total_discount_amount: 0,
          total_tax_amount: taxAmount,
          product_url: "https://example.com/product",
          image_url: product.image_url
        }
      ],
      // Optional: Add customer information if provided
      ...(customerInfo && {
        billing_address: {
          given_name: customerInfo.firstName,
          family_name: customerInfo.lastName,
          email: customerInfo.email,
          street_address: customerInfo.address,
          postal_code: customerInfo.postalCode,
          city: customerInfo.city,
          country: customerInfo.country || "SE"
        }
      })
    };

    console.log('📋 Session data prepared:', JSON.stringify(sessionData, null, 2));

    // Make request to Klarna API
    const response = await axios.post(
      `${process.env.KLARNA_API_URL}/payments/v1/sessions`,
      sessionData,
      { headers: createKlarnaHeaders() }
    );

    console.log('✅ Klarna session created successfully');
    console.log('📄 Session ID:', response.data.session_id);

    // Return session data to frontend
    res.json({
      session_id: response.data.session_id,
      client_token: response.data.client_token,
      payment_method_categories: response.data.payment_method_categories,
      order_amount: totalAmountWithTax,
      order_tax_amount: taxAmount,
      purchase_currency: product.currency
    });

  } catch (error) {
    console.error('❌ Error creating Klarna session:', error.message);

    if (error.response) {
      console.error('📋 Klarna API response:', error.response.data);
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