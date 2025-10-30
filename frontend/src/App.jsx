import { useState } from 'react';
import ProductPage from './components/ProductPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('product'); // product, checkout, confirmation
  const [cart, setCart] = useState([]);
  const [orderData, setOrderData] = useState(null);

  const addToCart = (product, quantity) => {
    console.log('🛒 Adding to cart:', product, 'Quantity:', quantity);
    setCart([{ ...product, quantity }]);
    setCurrentStep('checkout');
  };

  const handleOrderComplete = (order) => {
    console.log('✅ Order completed:', order);
    setOrderData(order);
    setCurrentStep('confirmation');
  };

  const resetFlow = () => {
    setCurrentStep('product');
    setCart([]);
    setOrderData(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛍️ Klarna Payment Demo</h1>
        <p>Educational demonstration of Klarna payment integration</p>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step ${currentStep === 'product' ? 'active' : currentStep !== 'product' ? 'completed' : ''}`}>
            1. Product
          </div>
          <div className={`step ${currentStep === 'checkout' ? 'active' : currentStep === 'confirmation' ? 'completed' : ''}`}>
            2. Checkout
          </div>
          <div className={`step ${currentStep === 'confirmation' ? 'active' : ''}`}>
            3. Confirmation
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentStep === 'product' && (
          <ProductPage onAddToCart={addToCart} />
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
      </main>

      <footer className="app-footer">
        <p>
          📚 This is a demo application for educational purposes only.
          It uses Klarna's Playground environment - no real transactions are processed.
        </p>
      </footer>
    </div>
  );
}

export default App
