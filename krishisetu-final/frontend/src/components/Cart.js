import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faShoppingCart, faArrowLeft, faTrashAlt, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
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
    <div className="ks-cart-container">
      <div className="ks-cart-card">
        <div className="ks-cart-header">
          <h2 className="ks-cart-title">
            <FontAwesomeIcon icon={faShoppingCart} className="ks-cart-icon" />
            Your Farming Cart
            {cart.length > 0 && <span className="ks-cart-count">{cart.length} items</span>}
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="ks-cart-empty">
            <div className="ks-cart-empty-icon">🌾</div>
            <p className="ks-cart-empty-text">Your cart is empty. Let's harvest some fresh produce!</p>
            <button className="ks-btn-primary" onClick={handleAddMoreItems}>
              <FontAwesomeIcon icon={faArrowLeft} /> Browse Farm Products
            </button>
          </div>
        ) : (
          <>
            <div className="ks-cart-items-container">
              <div className="ks-cart-items">
                {cart.map((product) => (
                  <div key={product.product_id} className="ks-cart-item">
                    <div className="ks-cart-item-img-container">
                      <img
                        src={`/images/${product.product_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                        alt={product.product_name}
                        className="ks-cart-item-img"
                        onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
                      />
                      {product.buy_type === "organic" && (
                        <div className="ks-organic-badge">
                          <FontAwesomeIcon icon={faLeaf} /> Organic
                        </div>
                      )}
                    </div>
                    <div className="ks-cart-item-details">
                      <div className="ks-cart-item-info">
                        <h3 className="ks-cart-item-name">{product.product_name}</h3>
                        <div className="ks-cart-item-meta">
                          <span className={`ks-product-type ${product.buy_type}`}>
                            {product.buy_type}
                          </span>
                          <span className="ks-cart-item-category">{product.category}</span>
                        </div>
                      </div>
                      
                      <div className="ks-cart-item-price-section">
                        <div className="ks-price-container">
                          <span className="ks-price-label">Price:</span>
                          <span className="ks-price-value">₹{product.price_1kg}/kg</span>
                        </div>
                        
                        <div className="ks-cart-item-controls">
                          <div className="ks-quantity-selector">
                            <button 
                              className="ks-quantity-btn" 
                              onClick={() => updateQuantity(product.product_id, -1)}
                              disabled={product.quantity <= 1}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <span className="ks-quantity-value">{product.quantity} kg</span>
                            <button 
                              className="ks-quantity-btn" 
                              onClick={() => updateQuantity(product.product_id, 1)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </div>
                          
                          <div className="ks-cart-item-total-container">
                            <span className="ks-cart-item-total-label">Subtotal:</span>
                            <span className="ks-cart-item-total">₹{(product.price_1kg * product.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="ks-remove-btn"
                      onClick={() => removeFromCart(product.product_id)}
                      title="Remove item"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="ks-cart-summary">
              <div className="ks-summary-card">
                <h3 className="ks-summary-title">Order Summary</h3>
                <div className="ks-summary-details">
                  <div className="ks-summary-row">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  {/* <div className="ks-summary-row">
                    <span>Delivery Charges</span>
                    <span className="ks-free-delivery">FREE</span>
                  </div> */}
                  <div className="ks-summary-divider"></div>
                  <div className="ks-summary-row ks-summary-total">
                    <span>Total Amount</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="ks-cart-actions">
                <button 
                  className="ks-btn-continue"
                  onClick={handleAddMoreItems}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                </button>
                <button 
                  className="ks-btn-checkout" 
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
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