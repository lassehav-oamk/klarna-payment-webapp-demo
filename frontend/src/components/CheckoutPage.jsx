import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  initializeKlarnaPayments,
  loadPaymentMethod,
  authorizePayment,
  formatPrice,
  validateCustomerInfo
} from '../utils/klarna';

const CheckoutPage = ({ cart, onOrderComplete, onBack }) => {
  const [sessionData, setSessionData] = useState(null);
  const [paymentsInstance, setPaymentsInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethodLoaded, setPaymentMethodLoaded] = useState(false);

  // Customer form data
  const [customerInfo, setCustomerInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    address: '123 Demo Street',
    city: 'Helsinki',
    postalCode: '12345',
    country: 'FI'
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (cart.length > 0) {
      initializePaymentSession();
    }
  }, [cart]);

  const initializePaymentSession = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Initializing payment session...');

      // Create session with backend - send full cart
      const sessionResponse = await apiService.createSession({
        cart: cart,
        customerInfo: customerInfo
      });

      console.log('Session created:', sessionResponse.data);
      setSessionData(sessionResponse.data);

      // Initialize Klarna Payments
      const KlarnaPaymentsInstance = await initializeKlarnaPayments(sessionResponse.data.client_token);
      setPaymentsInstance(KlarnaPaymentsInstance);

      // Load payment method
      await loadPaymentMethod(KlarnaPaymentsInstance, 'klarna-payments-container', 'pay_now');
      setPaymentMethodLoaded(true);

      console.log('Klarna payment widget loaded');

    } catch (err) {
      console.error('Failed to initialize payment session:', err);
      setError(`Failed to initialize payment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    try {
      validateCustomerInfo(customerInfo);
    } catch (err) {
      // Parse validation error message
      if (err.message.includes('Missing required fields:')) {
        const missingFields = err.message.replace('Missing required fields: ', '').split(', ');
        missingFields.forEach(field => {
          errors[field] = 'This field is required';
        });
      } else if (err.message.includes('Invalid email')) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      console.log('Processing payment...');

      // Validate form
      if (!validateForm()) {
        setProcessingPayment(false);
        return;
      }

      if (!paymentsInstance) {
        throw new Error('Payment system not initialized');
      }

      // Prepare payment data for authorization
      const paymentData = {
        billing_address: {
          given_name: customerInfo.firstName,
          family_name: customerInfo.lastName,
          email: customerInfo.email,
          street_address: customerInfo.address,
          postal_code: customerInfo.postalCode,
          city: customerInfo.city,
          country: customerInfo.country
        }
      };

      // Authorize payment with Klarna
      const authResult = await authorizePayment(paymentsInstance, 'pay_later', paymentData);

      console.log('Payment authorized:', authResult);

      // Create order with backend - send full cart
      const orderResponse = await apiService.createOrder({
        authorization_token: authResult.authorization_token,
        cart: cart,
        customerInfo: customerInfo
      });

      console.log('Order created:', orderResponse.data);

      // Complete the flow
      onOrderComplete(orderResponse.data);

    } catch (err) {
      console.error('Payment processing failed:', err);
      setError(`Payment failed: ${err.message}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <button onClick={onBack} className="back-button">
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate subtotal from all cart items
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = sessionData ? sessionData.order_tax_amount : 0;
  const total = sessionData ? sessionData.order_amount : subtotal;
  const currency = cart[0]?.currency || 'EUR';

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={onBack} className="back-button">
            ← Back to Products
          </button>
          <h2>Checkout</h2>
        </div>

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Unit Price: {formatPrice(item.price, item.currency)}</p>
                </div>
                <div className="item-total">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </div>
              </div>
            ))}

            <div className="order-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="total-line">
                <span>Tax:</span>
                <span>{formatPrice(taxAmount, currency)}</span>
              </div>
              <div className="total-line total">
                <span><strong>Total:</strong></span>
                <span><strong>{formatPrice(total, currency)}</strong></span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="customer-form">
            <h3>Billing Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={customerInfo.firstName}
                  onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                  className={validationErrors.firstName ? 'error' : ''}
                />
                {validationErrors.firstName && (
                  <span className="error-text">{validationErrors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={customerInfo.lastName}
                  onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                  className={validationErrors.lastName ? 'error' : ''}
                />
                {validationErrors.lastName && (
                  <span className="error-text">{validationErrors.lastName}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  className={validationErrors.email ? 'error' : ''}
                />
                {validationErrors.email && (
                  <span className="error-text">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                  className={validationErrors.address ? 'error' : ''}
                />
                {validationErrors.address && (
                  <span className="error-text">{validationErrors.address}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  value={customerInfo.city}
                  onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                  className={validationErrors.city ? 'error' : ''}
                />
                {validationErrors.city && (
                  <span className="error-text">{validationErrors.city}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Postal Code *</label>
                <input
                  type="text"
                  id="postalCode"
                  value={customerInfo.postalCode}
                  onChange={(e) => handleCustomerInfoChange('postalCode', e.target.value)}
                  className={validationErrors.postalCode ? 'error' : ''}
                />
                {validationErrors.postalCode && (
                  <span className="error-text">{validationErrors.postalCode}</span>
                )}
              </div>
            </div>
          </div>

          {/* Klarna Payment Widget */}
          <div className="payment-section">
            <h3>Payment Method</h3>

            {loading && (
              <div className="payment-loading">
                <div className="loader">Loading payment options...</div>
              </div>
            )}

            {error && (
              <div className="payment-error">
                <p>Error: {error}</p>
                <button onClick={initializePaymentSession} className="retry-button">
                  Retry
                </button>
              </div>
            )}

            {/* Klarna Payments Container */}
            <div
              id="klarna-payments-container"
              className={`klarna-payments ${!paymentMethodLoaded ? 'hidden' : ''}`}
            ></div>

            {paymentMethodLoaded && (
              <div className="payment-actions">
                <button
                  onClick={handlePlaceOrder}
                  disabled={processingPayment || loading}
                  className="place-order-button"
                >
                  {processingPayment ? (
                    <>
                      <span className="spinner"></span>
                      Processing Payment...
                    </>
                  ) : (
                    `Place Order - ${formatPrice(total, currency)}`
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Developer Information */}
          <div className="dev-info-section">
            <h3>🔧 Developer Information</h3>
            <div className="dev-details">
              <p><strong>Session ID:</strong> <code>{sessionData?.session_id || 'Loading...'}</code></p>
              <p><strong>Order Amount:</strong> <code>{total} cents</code></p>
              <p><strong>Payment Method:</strong> <code>pay_later</code></p>
              <p><strong>Widget Status:</strong>
                <span className={paymentMethodLoaded ? 'status-success' : 'status-loading'}>
                  {paymentMethodLoaded ? ' Loaded' : ' Loading...'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;