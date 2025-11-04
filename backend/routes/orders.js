const express = require('express');
const axios = require('axios');
const { createKlarnaHeaders, demoProducts } = require('../utils/shared');

const router = express.Router();

// In-memory storage for demo orders (use database in production)
const orders = new Map();

// POST /api/create-order - Creates order after authorization
router.post('/create-order', async (req, res) => {
  try {
    console.log('Creating Klarna order...');

    const {
      authorization_token,
      cart,
      customerInfo
    } = req.body;

    if (!authorization_token) {
      return res.status(400).json({ error: 'Authorization token is required' });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is required and must be a non-empty array' });
    }

    // Build order lines and calculate totals (same logic as session creation)
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

    // Prepare order data for Klarna
    const orderData = {
      purchase_country: "SE",
      purchase_currency: currency,
      locale: "en-SE",
      order_amount: totalAmountWithTax,
      order_tax_amount: totalTaxAmount,
      order_lines: orderLines,
      merchant_reference1: `ORDER-${Date.now()}`, // Unique order reference
      merchant_reference2: `DEMO-CART`,
      // Add customer information if provided
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

    console.log(' Order data prepared:', JSON.stringify(orderData, null, 2));

    // Create order with Klarna
    const response = await axios.post(
      `${process.env.KLARNA_API_URL}/payments/v1/authorizations/${authorization_token}/order`,
      orderData,
      { headers: createKlarnaHeaders() }
    );

    console.log('Klarna order created successfully');
    console.log('Order ID:', response.data.order_id);

    // Store order in memory for demo purposes
    const orderRecord = {
      order_id: response.data.order_id,
      klarna_reference: response.data.klarna_reference,
      status: 'AUTHORIZED',
      order_amount: totalAmountWithTax,
      purchase_currency: currency,
      items: cart.map(item => {
        const product = demoProducts.find(p => p.productId === item.productId);
        return {
          productId: item.productId,
          name: product.name,
          quantity: item.quantity,
          unit_price: product.price
        };
      }),
      customer_info: customerInfo,
      created_at: new Date().toISOString(),
      redirect_url: response.data.redirect_url
    };

    orders.set(response.data.order_id, orderRecord);

    // Return order confirmation to frontend
    res.json({
      order_id: response.data.order_id,
      klarna_reference: response.data.klarna_reference,
      redirect_url: response.data.redirect_url,
      status: 'AUTHORIZED',
      order_amount: totalAmountWithTax,
      purchase_currency: currency
    });

  } catch (error) {
    console.error('Error creating Klarna order:', error.message);

    if (error.response) {
      console.error('Klarna API response:', error.response.data);
      res.status(error.response.status).json({
        error: 'Klarna API error',
        details: error.response.data,
        message: 'Failed to create order'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create order'
      });
    }
  }
});

// GET /api/order/:orderId - Retrieves order details
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`Retrieving order details for: ${orderId}`);

    // First check our local storage
    const localOrder = orders.get(orderId);
    if (!localOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    try {
      // Optionally fetch latest status from Klarna
      const response = await axios.get(
        `${process.env.KLARNA_API_URL}/ordermanagement/v1/orders/${orderId}`,
        { headers: createKlarnaHeaders() }
      );

      console.log('Order retrieved from Klarna');

      // Merge local data with Klarna data
      const orderDetails = {
        ...localOrder,
        klarna_status: response.data.status,
        fraud_status: response.data.fraud_status,
        expires_at: response.data.expires_at,
        captures: response.data.captures || [],
        refunds: response.data.refunds || []
      };

      res.json(orderDetails);

    } catch (klarnaError) {
      console.warn('Could not fetch order from Klarna, returning local data');
      // Return local order data if Klarna API fails
      res.json(localOrder);
    }

  } catch (error) {
    console.error('Error retrieving order:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve order'
    });
  }
});

// GET /api/orders - Get all orders (for demo purposes)
router.get('/orders', (req, res) => {
  console.log('Retrieving all orders');
  const allOrders = Array.from(orders.values()).sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );
  res.json(allOrders);
});

module.exports = router;