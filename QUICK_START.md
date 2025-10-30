# 🚀 Quick Start Guide

Get the Klarna Payment Demo running in 5 minutes!

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Internet connection

## Option 1: Automated Setup

```bash
# Run the setup script
npm run setup

# Or run setup manually
node setup.js
```

## Option 2: Manual Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Get Klarna Credentials

1. Visit https://playground.eu.portal.klarna.com/
2. Create a free account
3. Create a new application
4. Copy your Username (Merchant ID) and Password (Shared Secret)

## Configure Backend

Edit `backend/.env`:

```env
KLARNA_USERNAME=your_merchant_id_here
KLARNA_PASSWORD=your_shared_secret_here
KLARNA_API_URL=https://api.playground.klarna.com
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Test the Demo

1. Open http://localhost:3000
2. Add product to cart
3. Fill checkout form (pre-filled with test data)
4. Complete payment with Klarna
5. View order confirmation

## Using Concurrently (Optional)

Install concurrently to run both servers with one command:

```bash
# From project root
npm install
npm run dev
```

This will start both backend and frontend simultaneously.

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 3001 is available
- Verify Klarna credentials in `.env`

**Frontend shows API errors:**
- Ensure backend is running on port 3001
- Check browser console for CORS errors

**Payment widget not loading:**
- Check internet connection (loads from Klarna CDN)
- Verify client_token in network requests

### Quick Fixes

```bash
# Reset node_modules
rm -rf backend/node_modules frontend/node_modules
npm run install-all

# Check ports
netstat -an | grep 3001  # Backend
netstat -an | grep 3000  # Frontend
```

## Next Steps

- Read the full README.md for detailed documentation
- Explore the code structure
- Try modifying payment methods
- Add new products to the catalog

**Happy coding! 🎉**