import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/klarna';

const ProductPage = ({ onAddToCart }) => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('widget');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('📦 Loading products...');
      const response = await apiService.getProducts();
      setProducts(response.data);
      console.log('✅ Products loaded:', response.data);
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      setError('Failed to load products. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const product = products[selectedProduct];
    if (product) {
      onAddToCart({ ...product, productId: selectedProduct }, quantity);
    }
  };

  if (loading) {
    return (
      <div className="product-page loading">
        <div className="loader">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page error">
        <div className="error-message">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={loadProducts} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const product = products[selectedProduct];

  if (!product) {
    return (
      <div className="product-page error">
        <div className="error-message">
          <h3>Product not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-image">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200/007acc/ffffff?text=Demo+Product';
            }}
          />
        </div>

        <div className="product-details">
          <h2>{product.name}</h2>
          <p className="product-description">{product.description}</p>

          <div className="price-section">
            <div className="price">
              {formatPrice(product.price, product.currency)}
            </div>
            <div className="tax-info">
              Includes {(product.tax_rate / 100)}% VAT
            </div>
          </div>

          <div className="product-options">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <button
              className="add-to-cart-button"
              onClick={handleAddToCart}
            >
              🛒 Add to Cart - {formatPrice(product.price * quantity, product.currency)}
            </button>
          </div>

          <div className="product-features">
            <h3>Product Features:</h3>
            <ul>
              <li>✅ Educational demo product</li>
              <li>🔒 Secure Klarna payment processing</li>
              <li>🚀 Instant payment authorization</li>
              <li>📱 Mobile-friendly checkout</li>
            </ul>
          </div>

          <div className="payment-info">
            <h3>Payment Options with Klarna:</h3>
            <ul>
              <li>💳 Pay Later - Pay in 30 days</li>
              <li>📅 Pay in Installments - Split your payment</li>
              <li>⚡ Pay Now - Direct bank payment</li>
            </ul>
            <p className="demo-note">
              <strong>Note:</strong> This is a demo using Klarna's Playground environment.
              No real money will be charged.
            </p>
          </div>
        </div>
      </div>

      <div className="api-status">
        <h3>🔧 Developer Information</h3>
        <div className="dev-info">
          <p><strong>Backend Status:</strong> <span className="status-connected">Connected</span></p>
          <p><strong>Product ID:</strong> <code>{selectedProduct}</code></p>
          <p><strong>Price (cents):</strong> <code>{product.price}</code></p>
          <p><strong>Tax Rate:</strong> <code>{product.tax_rate} basis points</code></p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;