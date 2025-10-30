# 🛍️ Klarna Payment Integration Demo

A comprehensive educational demonstration of Klarna payment integration using React frontend and Express backend. This project is designed for teaching students about modern payment system implementation and provides hands-on experience with Klarna's payment APIs.

## 📚 Educational Objectives

This demo teaches students:

- **Payment Integration Fundamentals**: Understanding payment flows, authorization, and order creation
- **API Security**: Proper handling of sensitive payment credentials and tokens
- **Full-Stack Development**: React frontend communicating with Express backend
- **Third-Party Integration**: Working with external payment provider APIs (Klarna)
- **Error Handling**: Robust error handling in payment processing
- **User Experience**: Creating smooth checkout flows with real-time feedback

## 🏗️ Project Structure

```
klarna-demo/
├── backend/                 # Express.js API server
│   ├── server.js           # Main server file
│   ├── routes/             # API route handlers
│   │   ├── session.js      # Payment session creation
│   │   └── orders.js       # Order management
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ProductPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── OrderConfirmation.jsx
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── utils/          # Utility functions
│   │   │   └── klarna.js   # Klarna SDK utilities
│   │   ├── App.jsx         # Main app component
│   │   └── App.css         # Styling
│   ├── package.json        # Frontend dependencies
│   └── .env.example        # Environment variables template
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Klarna Playground Account** (free for testing)

### 1. Clone and Setup

```bash
# Clone or download this repository
cd klarna-demo

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Get Klarna Credentials

1. Sign up for a free Klarna Playground account: https://playground.eu.portal.klarna.com/
2. Create a new application to get your credentials
3. Note down your:
   - **Username** (Merchant ID)
   - **Password** (Shared Secret)

### 3. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your Klarna credentials:

KLARNA_USERNAME=your_merchant_id_here
KLARNA_PASSWORD=your_shared_secret_here
KLARNA_API_URL=https://api.playground.klarna.com
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Default values should work for local development:

VITE_API_URL=http://localhost:3001/api
VITE_KLARNA_ENV=playground
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 5. Test the Demo

1. Open http://localhost:3000 in your browser
2. Add the demo product to cart
3. Fill in the checkout form (pre-filled with test data)
4. Complete the payment using Klarna's test environment
5. View the order confirmation

## 🔧 Technical Implementation

### Payment Flow Explained

#### 1. **Session Creation** (`POST /api/create-session`)
```javascript
// Backend creates session with Klarna
const sessionData = {
  purchase_country: "SE",
  purchase_currency: "EUR",
  order_amount: totalAmount,
  order_lines: [productDetails]
};

const response = await axios.post(
  `${KLARNA_API_URL}/payments/v1/sessions`,
  sessionData,
  { headers: authHeaders }
);
```

#### 2. **Widget Initialization** (Frontend)
```javascript
// Load Klarna SDK and initialize widget
const Klarna = await loadKlarnaScript();
Klarna.Payments.init({ client_token: sessionData.client_token });

// Load payment method in container
Klarna.Payments.load({
  container: '#klarna-payments-container',
  payment_method_category: 'pay_later'
});
```

#### 3. **Payment Authorization** (Frontend)
```javascript
// Authorize payment with customer data
const authResult = await authorizePayment(
  paymentsInstance,
  'pay_later',
  { billing_address: customerInfo }
);
```

#### 4. **Order Creation** (`POST /api/create-order`)
```javascript
// Backend creates order with authorization token
const orderResponse = await axios.post(
  `${KLARNA_API_URL}/payments/v1/authorizations/${authToken}/order`,
  orderData,
  { headers: authHeaders }
);
```

### Key Security Practices

1. **API Credentials**: Never expose Klarna credentials in frontend code
2. **Server-Side Processing**: All sensitive operations happen on the backend
3. **Environment Variables**: Use `.env` files for configuration
4. **CORS Configuration**: Properly configured cross-origin requests
5. **Input Validation**: Validate customer data before processing

### Error Handling

The application includes comprehensive error handling for:

- **Network Failures**: API timeout and connection issues
- **Validation Errors**: Invalid customer information
- **Payment Failures**: Declined payments or authorization issues
- **Server Errors**: Backend processing failures

## 🧪 Testing with Klarna Playground

### Test Scenarios

The Klarna Playground environment allows testing various scenarios:

1. **Successful Payment**: Use valid test data (pre-filled in demo)
2. **Payment Decline**: Test with invalid postal codes
3. **Network Issues**: Simulate API failures
4. **Different Payment Methods**: Try pay_now, pay_later, pay_over_time

### Test Data

The demo includes pre-filled test data:
- **Name**: John Doe
- **Email**: john.doe@example.com
- **Address**: 123 Demo Street, Stockholm, 12345, SE

You can modify this data to test different scenarios.

## 📖 Learning Exercises

### For Students

1. **Modify Payment Methods**:
   - Change from `pay_later` to `pay_now` or `pay_over_time`
   - Observe how the widget changes

2. **Add Products**:
   - Extend the product catalog in `backend/server.js`
   - Add product selection to the frontend

3. **Enhance Validation**:
   - Add more customer validation rules
   - Implement real-time validation feedback

4. **Error Scenarios**:
   - Intentionally break the API connection
   - Test how the application handles failures

5. **Order Management**:
   - Implement order listing page
   - Add order search functionality

### Advanced Exercises

1. **Database Integration**:
   - Replace in-memory order storage with a database
   - Add user authentication and order history

2. **Webhook Implementation**:
   - Add Klarna webhook handling for order updates
   - Implement order status synchronization

3. **Multi-Currency Support**:
   - Add currency selection
   - Handle different tax rates by country

4. **Mobile Optimization**:
   - Enhance mobile responsiveness
   - Add mobile-specific payment flows

## 🔍 API Reference

### Backend Endpoints

#### `GET /api/health`
Check server health and configuration status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "klarna_configured": true
}
```

#### `GET /api/products`
Get available demo products.

**Response:**
```json
{
  "widget": {
    "name": "Demo Widget",
    "price": 2500,
    "currency": "EUR",
    "description": "A sample product for payment demonstration"
  }
}
```

#### `POST /api/create-session`
Create a Klarna payment session.

**Request:**
```json
{
  "productId": "widget",
  "quantity": 1,
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "session_id": "klarna-session-id",
  "client_token": "klarna-client-token",
  "order_amount": 3125,
  "order_tax_amount": 625
}
```

#### `POST /api/create-order`
Create order after payment authorization.

**Request:**
```json
{
  "authorization_token": "auth-token-from-klarna",
  "productId": "widget",
  "quantity": 1,
  "customerInfo": { ... }
}
```

**Response:**
```json
{
  "order_id": "klarna-order-id",
  "klarna_reference": "klarna-ref-123",
  "status": "AUTHORIZED",
  "order_amount": 3125
}
```

#### `GET /api/order/:orderId`
Get order details by ID.

**Response:**
```json
{
  "order_id": "klarna-order-id",
  "status": "AUTHORIZED",
  "order_amount": 3125,
  "created_at": "2023-12-07T10:30:00.000Z",
  "product": { ... },
  "customer_info": { ... }
}
```

## 🛠️ Development Guide

### Code Structure Conventions

- **Components**: Functional components with hooks
- **State Management**: Local state with useState
- **API Calls**: Centralized in `services/api.js`
- **Utilities**: Helper functions in `utils/` directory
- **Styling**: CSS modules or inline styles
- **Error Handling**: Try-catch blocks with user-friendly messages

### Adding New Features

1. **Backend Changes**:
   - Add routes in `routes/` directory
   - Update API documentation
   - Add error handling

2. **Frontend Changes**:
   - Create components in `components/` directory
   - Add API calls to service layer
   - Update styling as needed

### Debugging Tips

1. **Check Browser Console**: All API calls are logged
2. **Network Tab**: Inspect actual HTTP requests
3. **Backend Logs**: Server logs all operations
4. **Klarna Playground**: Use dashboard to see API calls

## 🔒 Security Considerations

### For Production Use

1. **Environment Variables**: Never commit secrets to git
2. **HTTPS**: Use SSL/TLS for all communications
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement API rate limiting
5. **Logging**: Log security events and errors
6. **Webhooks**: Verify webhook signatures from Klarna

### Demo Limitations

This is an educational demo with intentional simplifications:

- **In-Memory Storage**: Orders stored in memory (lost on restart)
- **No Authentication**: No user login system
- **Simplified Validation**: Basic validation only
- **Test Environment**: Uses Klarna Playground only

## 🌟 Best Practices Demonstrated

1. **Separation of Concerns**: Clear backend/frontend separation
2. **Error Handling**: Comprehensive error handling throughout
3. **User Experience**: Loading states and error messages
4. **Code Documentation**: Well-commented code for learning
5. **Environment Configuration**: Proper use of environment variables
6. **API Design**: RESTful API structure

## 🐛 Troubleshooting

### Common Issues

**"Failed to load products"**
- Check backend server is running on port 3001
- Verify CORS settings allow frontend requests

**"Klarna credentials not configured"**
- Check `.env` file in backend directory
- Verify KLARNA_USERNAME and KLARNA_PASSWORD are set

**"Payment widget not loading"**
- Check internet connection (Klarna SDK loads from CDN)
- Verify client_token is being returned from session creation

**"Order creation failed"**
- Check authorization_token is being passed correctly
- Verify Klarna API credentials are valid

### Getting Help

1. **Check Console**: Browser and server console logs
2. **Network Tab**: Inspect failed API requests
3. **Klarna Documentation**: https://docs.klarna.com/
4. **Playground Dashboard**: Check API calls in Klarna dashboard

## 📋 TODO / Future Enhancements

- [ ] Add TypeScript support
- [ ] Implement unit tests
- [ ] Add end-to-end testing
- [ ] Database integration example
- [ ] Webhook implementation
- [ ] Multi-language support
- [ ] Advanced error handling
- [ ] Performance optimizations
- [ ] Docker containerization
- [ ] Deployment guides

## 📄 License

This project is for educational purposes only. Use the code as reference for learning Klarna payment integration.

## 🤝 Contributing

This is an educational demo. Feel free to fork and modify for your own learning purposes. Suggestions for improvements are welcome!

---

**Happy Learning! 🎓**

Remember: This demo uses Klarna's Playground environment - no real money will be processed. Always test thoroughly before implementing in production systems.