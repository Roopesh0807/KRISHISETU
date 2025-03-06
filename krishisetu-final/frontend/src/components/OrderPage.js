import React, { useState } from "react";
import Rice from "../assets/rice.jpg"; // Correctly imported image
import "./OrderPage.css"; // Import CSS file

const CartComponent = ({ product, onUpdateQuantity, onRemove }) => {
  return (
    <div className="cart-item">
      <img src={Rice} alt={product.name} className="product-image" /> {/* Fixed Image Issue */}
      <div className="product-details">
        <h3>{product.name}</h3>
        <p>₹ {product.price}/kg</p>
      </div>
      <div className="quantity-control"> {/* Centered Buttons */}
        <button onClick={() => onUpdateQuantity(product.id, -1)}>-</button>
        <span>{product.quantity}</span>
        <button onClick={() => onUpdateQuantity(product.id, 1)}>+</button>
      </div>
      <p className="total-price">₹ {product.price * product.quantity}</p>
      <button className="remove-btn" onClick={() => onRemove(product.id)}>Remove</button>
    </div>
  );
};

const CartPage = () => {
  const [cart, setCart] = useState([
    { id: 1, name: "Rice", price: 53, quantity: 2 },
  ]);

  const updateQuantity = (id, change) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  return (
    <div className="cart-page">
      <h2>My Cart</h2>
      {cart.length > 0 ? (
        cart.map((product) => (
          <CartComponent
            key={product.id}
            product={product}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))
      ) : (
        <p>Your cart is empty.</p>
      )}
      {cart.length > 0 && <button className="buy-now">Buy Now</button>}
    </div>
  );
};

export default CartPage;
