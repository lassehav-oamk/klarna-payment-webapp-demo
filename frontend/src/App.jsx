import { useState } from 'react';
import ProductPage from './components/ProductPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('product'); // product, checkout, confirmation
  /* cart is an array of { product, quantity } */
  const [cart, setCart] = useState([]);
  const [orderData, setOrderData] = useState(null);

  const addToCart = (product, quantity) => {
    console.log('Adding to cart:', product, 'Quantity:', quantity);
    const newCart = [...cart];
    newCart.push({ ...product, quantity });
    setCart(newCart);
  };

  const handleOrderComplete = (order) => {
    console.log('Order completed:', order);
    setOrderData(order);
    setCurrentStep('confirmation');
  };

  const resetFlow = () => {
    setCurrentStep('product');
    setCart([]);
    setOrderData(null);
  };

  const goToCheckout = () => {
    console.log('Going to checkout');
    if(cart.length === 0) {
      console.warn('Cart is empty, cannot proceed to checkout');
      return;
    }   
    setCurrentStep('checkout');
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Klarna Payment Demo</h1>
        <p>Demonstration of Klarna payment integration</p>

        {/* Step indicator */}
        
        <h2>
          Purchase Process Step
        </h2>
        <div className="step-indicator">
          <div className={`step ${currentStep === 'product' ? 'active' : currentStep !== 'product' ? 'completed' : ''}`}>
            1. Product Display
          </div>
          <div className={`step ${currentStep === 'checkout' ? 'active' : currentStep === 'confirmation' ? 'completed' : ''}`}>
            2. Checkout
          </div>
          <div className={`step ${currentStep === 'confirmation' ? 'active' : ''}`}>
            3. Confirmation
          </div>
        </div>
      </header>

      <div className="app-main">
        {currentStep === 'product' && (
          <ProductPage onAddToCart={addToCart} goToCheckout={goToCheckout} isAbleToCheckout={cart.length > 0} />
        )}

        {currentStep === 'checkout' && (
          <CheckoutPage
            cart={cart}
            onOrderComplete={handleOrderComplete}
            onBack={() => setCurrentStep('product')}
          />
        )}

        {currentStep === 'confirmation' && (
          <OrderConfirmation
            orderData={orderData}
            onStartOver={resetFlow}
          />
        )}
      </div>
    
      <div className='cart-overview'>
        <h2>Cart contents</h2>
        {  cart.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <div>
              <ul>
                {cart.map((item, index) => (
                  <li key={index}>
                    {item.name} - Quantity: {item.quantity} - Price per unit: {(item.price / 100).toFixed(2)} {item.currency}
                  </li>
                ))}
              </ul>
              <div>
                <strong>Total:</strong> { (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) / 100).toFixed(2) } { cart[0].currency }
              </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>
          This is a demo app uses Klarna's Playground environment - no real transactions are processed.
        </p>
      </footer>
    </div>
  );
}

export default App
