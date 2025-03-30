import React, { useEffect } from "react";  // Removed useState
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Import useCart from context
import { useAuth } from "../context/AuthContext"; // Import consumer authentication
import "./Cart.css";

const CartPage = () => {
  const { cart, setCart, removeFromCart,setCartCount, updateQuantity, calculateTotal } = useCart();
  const { consumer } = useAuth();
  
// const consumer_id = consumer?.consumer_id; // Ensure it doesn't break if consumer is null
 // Assuming authentication provides consumer_id
  const navigate = useNavigate();

  useEffect(() => {
    if (!consumer || !consumer.consumer_id) return;

    // Fetch cart for logged-in user
    const storedCart = localStorage.getItem(`cart_${consumer.consumer_id}`);
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
  }, [consumer, setCart, setCartCount]);  // ✅ Add setCart and setCartCount
   
  // Update localStorage when cart changes
  useEffect(() => {
    if (consumer && consumer.consumer_id) {
      localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(cart));
    }
  }, [cart, consumer]);
  const handleAddMoreItems = () => {
    navigate("/consumer-dashboard");
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/orderpage", { state: { cart } }); // Pass cart data via state
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty. Do you want to add items?</p>
          <button className="add-more" onClick={handleAddMoreItems}>
            Add Items
          </button>
        </div>
      ) : (
        <>
          {cart.map((product) => (
            <div key={product.product_id} className="cart-item">
              <img
                src={`/images/${product.product_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                alt={product.product_name}
                className="product-image"
                onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
              />
              <div className="product-details">
                <h3>{product.product_name}</h3>
                <p>₹ {product.price_1kg}/1 kg</p>
                <p>Category: {product.category}</p>
                <p>Product ID: {product.product_id}</p>
                <p>Buy Type: {product.buy_type}</p>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(product.product_id, -1)}>-</button>
                  <span>{product.quantity}</span>
                  <button onClick={() => updateQuantity(product.product_id, 1)}>+</button>
                </div>
                <p className="total-price">
                  Total price of {product.product_name}: ₹ {product.price_1kg * product.quantity}
                </p>
                <button className="remove-btn" onClick={() => removeFromCart(product.product_id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="invoice">
            <h3>Invoice</h3>
            <p>Total Items: {cart.length}</p>
            <p>Total Price: ₹ {calculateTotal()}</p>
          </div>

          <button className="buy-now" onClick={handleProceedToCheckout}>
            Proceed to Checkout
          </button>
          <button className="add-more" onClick={handleAddMoreItems}>
            Add More Items
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
