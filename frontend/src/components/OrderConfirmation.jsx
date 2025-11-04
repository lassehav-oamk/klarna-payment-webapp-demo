import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/klarna';

const OrderConfirmation = ({ orderData, onStartOver }) => {
  const [detailedOrder, setDetailedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderData && orderData.order_id) {
      fetchOrderDetails();
    }
  }, [orderData]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details...');

      const response = await apiService.getOrder(orderData.order_id);
      setDetailedOrder(response.data);

      console.log('Order details fetched:', response.data);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to fetch order details');
      // Fallback to provided order data
      setDetailedOrder(orderData);
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="order-confirmation">
        <div className="error-state">
          <h2>No Order Found</h2>
          <p>Order data is missing.</p>
          <button onClick={onStartOver} className="start-over-button">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="loading-state">
          <div className="loader">Loading order details...</div>
        </div>
      </div>
    );
  }

  const order = detailedOrder || orderData;

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully processed.</p>
        </div>

        {/* Order Details */}
        <div className="order-details">
          <h2>Order Details</h2>

          <div className="order-summary-grid">
            <div className="order-info">
              <div className="info-item">
                <label>Order ID:</label>
                <span className="order-id">{order.order_id}</span>
              </div>

              {order.klarna_reference && (
                <div className="info-item">
                  <label>Klarna Reference:</label>
                  <span>{order.klarna_reference}</span>
                </div>
              )}

              <div className="info-item">
                <label>Status:</label>
                <span className="status-badge status-success">
                  {order.status || order.klarna_status || 'AUTHORIZED'}
                </span>
              </div>

              <div className="info-item">
                <label>Order Date:</label>
                <span>{new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
              </div>

              <div className="info-item">
                <label>Total Amount:</label>
                <span className="total-amount">
                  {formatPrice(order.order_amount, order.purchase_currency)}
                </span>
              </div>
            </div>

            {/* Product Information */}
            {(order.items || order.product) && (
              <div className="product-info">
                <h3>{order.items ? 'Products' : 'Product'}</h3>
                {order.items ? (
                  // Display multiple items
                  <div className="products-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="product-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Unit Price: {formatPrice(item.unit_price, order.purchase_currency)}</p>
                        <p>Total: {formatPrice(item.unit_price * item.quantity, order.purchase_currency)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback for old single product format
                  <div className="product-details">
                    <h4>{order.product.name}</h4>
                    <p>Quantity: {order.product.quantity}</p>
                    <p>Unit Price: {formatPrice(order.product.unit_price, order.purchase_currency)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Customer Information */}
            {order.customer_info && (
              <div className="customer-info">
                <h3>Billing Information</h3>
                <div className="address-details">
                  <p>{order.customer_info.firstName} {order.customer_info.lastName}</p>
                  <p>{order.customer_info.email}</p>
                  <p>{order.customer_info.address}</p>
                  <p>{order.customer_info.city}, {order.customer_info.postalCode}</p>
                  <p>{order.customer_info.country}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What happens next?</h3>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Order Confirmation</h4>
                <p>You'll receive an email confirmation with your order details.</p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Payment Processing</h4>
                <p>Your payment will be processed according to your selected Klarna payment method.</p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Order Fulfillment</h4>
                <p>In a real application, your order would now be prepared for shipment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Klarna Information */}
        <div className="klarna-info">
          <h3>About Your Klarna Payment</h3>
          <div className="klarna-details">
            <p>
              This order was processed using Klarna's secure payment platform.
              Klarna will send you separate communication about your payment schedule and options.
            </p>

            {order.redirect_url && (
              <div className="klarna-redirect">
                <p><strong>Klarna Customer Portal:</strong></p>
                <a
                  href={order.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="klarna-link"
                >
                  Manage your payment →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions">
          <button onClick={onStartOver} className="start-over-button">
            🛍️ Shop Again
          </button>

          <button
            onClick={() => window.print()}
            className="print-button secondary"
          >
            🖨️ Print Order
          </button>
        </div>

        {/* Developer Information */}
        <div className="dev-info-section">
          <h3>🔧 Developer Information</h3>
          <div className="dev-details">
            <p><strong>Environment:</strong> <code>Klarna Playground</code></p>
            <p><strong>Order Status:</strong> <code>{order.status || 'AUTHORIZED'}</code></p>
            {order.fraud_status && (
              <p><strong>Fraud Status:</strong> <code>{order.fraud_status}</code></p>
            )}
            {order.expires_at && (
              <p><strong>Authorization Expires:</strong> <code>{new Date(order.expires_at).toLocaleString()}</code></p>
            )}

            {error && (
              <div className="dev-error">
                <p><strong>Note:</strong> Could not fetch latest order status from Klarna API.</p>
                <p>Error: {error}</p>
              </div>
            )}

            <div className="order-json">
              <details>
                <summary>View Full Order Data (JSON)</summary>
                <pre>{JSON.stringify(order, null, 2)}</pre>
              </details>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="demo-notice">
          <h3>Demo Application Notice</h3>
          <p>
            This is a demo of Klarna payment integration.
            No real payments were processed, and no actual products were purchased.
            This application uses Klarna's Playground environment for safe testing and learning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;