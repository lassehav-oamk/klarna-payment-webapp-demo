import { formatPrice } from '../utils/klarna';
import { useState } from 'react';

export default function Product({ product, addToCart, onClickProduct }) {
  const [quantity, setQuantity] = useState(1);  

  return (
      <div className="product-container" onClick={onClickProduct}>
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
              onClick={() => addToCart(product, quantity)}
            >
              Add to Cart - {formatPrice(product.price * quantity, product.currency)}
            </button>
          </div>

          <div>
            <p className="demo-note">
              <strong>Note:</strong> This is a demo using Klarna's Playground environment.
              No real money will be charged.
            </p>
          </div>
        </div>
      </div>
  )
}
