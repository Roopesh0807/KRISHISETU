// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Cart.css"; // Assuming you have a CSS file for styling
// import { useCart } from "../context/CartContext";

// const CartPage = () => {
  
//   const navigate = useNavigate(); // Hook for navigation
//   const { cart, removeFromCart } = useCart();

//   // Update quantity in cart
//   const updateQuantity = (id, change) => {
//     setCart((prevCart) => {
//       const updatedCart = prevCart.map((item) =>
//         item.product_id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + change) }
//           : item
//       );
//       localStorage.setItem("cart", JSON.stringify(updatedCart));
  
//       // 🔹 Dispatch event to update Navbar
//       window.dispatchEvent(new Event("cartUpdated"));
  
//       return updatedCart;
//     });
//   };
  
// // Remove product from cart
// const handleRemoveItem = (id) => {
//   removeFromCart(id); // Context will handle removing and updating localStorage
// };

//   // Calculate total price
//   const calculateTotal = () => {
//     return cart.reduce((total, item) => total + item.price_1kg * item.quantity, 0);
//   };

//   // Navigate back to consumer dashboard to add more items
//   const handleAddMoreItems = () => {
//     navigate("/consumer-dashboard");
//   };
//  // Navigate to the Order Page
//  const handleProceedToCheckout = () => {
//   navigate("/orderpage"); // Navigate to the Order Page
// };

// return (
//   <div className="cart-page">
//     <h2>Your Cart</h2>
    
//     {cart.length === 0 ? (
//       <div className="empty-cart">
//         <p>Your cart is empty. Do you want to add items?</p>
//         <button className="add-more" onClick={handleAddMoreItems}>
//           Add Items
//         </button>
//       </div>
//     ) : (
//       <>
//         {cart.map((product) => (
//           <div key={product.product_id} className="cart-item">
//             <img
//               src={`/images/${product.product_name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
//               alt={product.product_name}
//               className="product-image"
//               onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
//             />
//             <div className="product-details">
//               <h3>{product.product_name}</h3>
//               <p>₹ {product.price_1kg}/1 kg</p>
//               <p>Category: {product.category}</p>
//               <p>Product ID: {product.product_id}</p>
//               <p>Buy Type: {product.buy_type}</p>
//               <div className="quantity-control">
//                 <button onClick={() => updateQuantity(product.product_id, -1)}>-</button>
//                 <span>{product.quantity}</span>
//                 <button onClick={() => updateQuantity(product.product_id, 1)}>+</button>
//               </div>
//               <p className="total-price">Total price of the {product.product_name}: ₹ {product.price_1kg * product.quantity}</p>
//               <button className="remove-btn" onClick={() => handleRemoveItem(product.product_id)}>
//                 Remove
//               </button>

//             </div>
//           </div>
//         ))}
//         <div className="invoice">
//           <h3>Invoice</h3>
//           <p>Total Items: {cart.length}</p>
//           <p>Total Price: ₹ {calculateTotal()}</p>
//         </div>

//         <button className="buy-now" onClick={handleProceedToCheckout}>
//           Proceed to Checkout
//         </button>
//         <button className="add-more" onClick={handleAddMoreItems}>
//           Add More Items
//         </button>
//       </>
//     )}
//   </div>
// );
// };  

// export default CartPage;
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Import useCart from context
import "./Cart.css";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart(); // Use updateQuantity from context
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price_1kg * item.quantity, 0);
  };

  const handleAddMoreItems = () => {
    navigate("/consumer-dashboard");
  };

  const handleProceedToCheckout = () => {
    navigate("/orderpage");
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
