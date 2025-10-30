// Klarna SDK utilities

// Load Klarna Payments SDK dynamically
export const loadKlarnaScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.Klarna && window.Klarna.Payments) {
      console.log('✅ Klarna SDK already loaded');
      resolve(window.Klarna);
      return;
    }

    console.log('📥 Loading Klarna SDK...');

    const script = document.createElement('script');
    script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Klarna SDK loaded successfully');
      if (window.Klarna && window.Klarna.Payments) {
        resolve(window.Klarna);
      } else {
        reject(new Error('Klarna SDK loaded but API not available'));
      }
    };
    script.onerror = () => {
      console.error('❌ Failed to load Klarna SDK');
      reject(new Error('Failed to load Klarna SDK'));
    };

    document.head.appendChild(script);
  });
};

// Initialize Klarna Payments with client token
export const initializeKlarnaPayments = async (clientToken) => {
  try {
    console.log('🔄 Initializing Klarna Payments...');
    const Klarna = await loadKlarnaScript();

    return new Promise((resolve, reject) => {
      Klarna.Payments.init({
        client_token: clientToken,
      });

      console.log('✅ Klarna Payments initialized');
      resolve(Klarna.Payments);
    });
  } catch (error) {
    console.error('❌ Failed to initialize Klarna Payments:', error);
    throw error;
  }
};

// Load payment method in container
export const loadPaymentMethod = (paymentsInstance, containerId, paymentMethodCategory = 'pay_later') => {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Loading payment method: ${paymentMethodCategory}`);

    paymentsInstance.load({
      container: `#${containerId}`,
      payment_method_category: paymentMethodCategory,
    }, (res) => {
      if (res.show_form) {
        console.log('✅ Payment method loaded successfully');
        resolve(res);
      } else {
        console.warn('⚠️ Payment method not available');
        reject(new Error('Payment method not available'));
      }
    });
  });
};

// Authorize payment
export const authorizePayment = (paymentsInstance, paymentMethodCategory, paymentData) => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Authorizing payment...');

    paymentsInstance.authorize({
      payment_method_category: paymentMethodCategory,
    }, paymentData, (res) => {
      if (res.approved) {
        console.log('✅ Payment authorized successfully');
        console.log('🎫 Authorization token:', res.authorization_token);
        resolve(res);
      } else {
        console.warn('⚠️ Payment authorization failed');
        reject(new Error(res.error || 'Payment authorization failed'));
      }
    });
  });
};

// Format price for display (converts cents to currency)
export const formatPrice = (priceInCents, currency = 'EUR') => {
  const price = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

// Validate customer information
export const validateCustomerInfo = (customerInfo) => {
  const required = ['firstName', 'lastName', 'email', 'address', 'city', 'postalCode'];
  const missing = required.filter(field => !customerInfo[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerInfo.email)) {
    throw new Error('Invalid email address');
  }

  return true;
};