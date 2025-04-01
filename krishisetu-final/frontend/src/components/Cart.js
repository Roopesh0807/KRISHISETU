import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

const CartPage = () => {
  const { cart, setCart, removeFromCart, setCartCount, updateQuantity, calculateTotal } = useCart();
  const { consumer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!consumer?.consumer_id) return;

    const storedCart = localStorage.getItem(`krishiCart_${consumer.consumer_id}`);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
          setCartCount(parsedCart.length);
        }
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
  }, [consumer, setCart, setCartCount]);

  useEffect(() => {
    if (consumer?.consumer_id) {
      localStorage.setItem(`krishiCart_${consumer.consumer_id}`, JSON.stringify(cart));
    }
  }, [cart, consumer]);

  const handleAddMoreItems = () => navigate("/consumer-dashboard");
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/orderpage", { state: { cart } });
  };

  return (
    <div className="krishi-cart-container">
      <div className="krishi-cart-card">
        <h2 className="krishi-cart-title">
          <span className="krishi-cart-icon">🛒</span> Your Farming Cart
        </h2>

        {cart.length === 0 ? (
          <div className="krishi-cart-empty">
            <div className="krishi-cart-empty-icon">🌾</div>
            <p className="krishi-cart-empty-text">Your cart is empty. Let's harvest some fresh produce!</p>
            <button className="krishi-btn-primary" onClick={handleAddMoreItems}>
              Browse Farm Products
            </button>
          </div>
        ) : (
          <>
            <div className="krishi-cart-items">
              {cart.map((product) => (
                <div key={product.product_id} className="krishi-cart-item">
                  <div className="krishi-cart-item-img-container">
                    <img
                      src={`/images/${product.product_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                      alt={product.product_name}
                      className="krishi-cart-item-img"
                      onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
                    />
                  </div>
                  <div className="krishi-cart-item-details">
                    <h3 className="krishi-cart-item-name">{product.product_name}</h3>
                    <div className="krishi-cart-item-meta">
                      <span className="krishi-cart-item-price">₹{product.price_1kg}/kg</span>
                      <span className="krishi-cart-item-category">{product.category}</span>
                    </div>
                    <div className="krishi-cart-item-controls">
                      <div className="krishi-quantity-selector">
                        <button 
                          className="krishi-quantity-btn" 
                          onClick={() => updateQuantity(product.product_id, -1)}
                        >
                          −
                        </button>
                        <span className="krishi-quantity-value">{product.quantity}</span>
                        <button 
                          className="krishi-quantity-btn" 
                          onClick={() => updateQuantity(product.product_id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="krishi-remove-btn"
                        onClick={() => removeFromCart(product.product_id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="krishi-cart-item-total">
                      Total: ₹{product.price_1kg * product.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="krishi-cart-summary">
              <div className="krishi-summary-card">
                <h3 className="krishi-summary-title">Order Summary</h3>
                <div className="krishi-summary-row">
                  <span>Items:</span>
                  <span>{cart.length}</span>
                </div>
                <div className="krishi-summary-row krishi-summary-total">
                  <span>Total:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>

              <div className="krishi-cart-actions">
                <button 
                  className="krishi-btn-checkout" 
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </button>
                <button 
                  className="krishi-btn-continue"
                  onClick={handleAddMoreItems}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;