import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css"; // Assuming you have a CSS file for styling

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch the cart from localStorage when the component mounts
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);  // Update the cart state
  }, []);  // This runs only once when the component mounts

  // Update quantity in cart
  const updateQuantity = (id, change) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.product_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );
      // Update cart in localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // Remove product from cart
  const removeItem = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.product_id !== id);
      // Update cart in localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price_1kg * item.quantity, 0);
  };

  // Navigate back to consumer dashboard to add more items
  const handleAddMoreItems = () => {
    navigate("/consumer-dashboard");
  };
 // Navigate to the Order Page
 const handleProceedToCheckout = () => {
  navigate("/orderpage"); // Navigate to the Order Page
};

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cart.length > 0 ? (
        <>
          {cart.map((product) => (
            <div key={product.product_id} className="cart-item">
              <img
                src={product.image || "/default-image.jpg"}
                alt={product.product_name}
                className="product-image"
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
                <p className="total-price">Total price of the {product.product_name}: ₹ {product.price_1kg * product.quantity}</p>
                <button className="remove-btn" onClick={() => removeItem(product.product_id)}>
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
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}

      {cart.length > 0 && (
        <>
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
