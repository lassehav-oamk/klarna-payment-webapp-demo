import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

import Product from './Product';

const ProductPage = ({ onAddToCart, goToCheckout, isAbleToCheckout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);



  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Loading products...');
      const responseProducts = await apiService.getProducts();
      setProducts(responseProducts);
      console.log('Products loaded:', responseProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, quantity) => {
    if (product) {
      onAddToCart({ ...product }, quantity);
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
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadProducts} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-page error">
        <div className="error-message">
          <h3>Products not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      { products?.map((prod, index) => (
        <Product key={index} product={prod} addToCart={handleAddToCart} onClickProduct={() => setSelectedProductIndex(index)} />
      )) }
      <button onClick={goToCheckout} className="checkout-button" disabled={!isAbleToCheckout}>
        Go to Checkout
      </button>
    </div>
  );
};

export default ProductPage;