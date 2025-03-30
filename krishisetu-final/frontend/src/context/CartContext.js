import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [consumer, setConsumer] = useState(null);

 // Load consumer from localStorage when the app starts
useEffect(() => {
  const storedConsumer = localStorage.getItem("consumer");
  if (storedConsumer) {
    try {
      const parsedConsumer = JSON.parse(storedConsumer);
      if (parsedConsumer?.consumer_id) {
        setConsumer(parsedConsumer);
      } else {
        console.warn("⚠ Consumer data is invalid:", parsedConsumer);
      }
    } catch (error) {
      console.error("❌ Error parsing consumer data:", error);
    }
  }
}, []);

// Load cart from localStorage when consumer is available
// Load cart when consumer is available
useEffect(() => {
  if (!consumer || !consumer.consumer_id) return;  // ✅ Ensure consumer is valid
  
  const storedCart = localStorage.getItem(`cart_${consumer.consumer_id}`);
  
  if (storedCart) {
    try {
      const parsedCart = JSON.parse(storedCart);
      console.log(`✅ Loaded Cart for ${consumer.consumer_id}:`, parsedCart);
      
      // Check if cart is actually empty or contains products
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        setCart(parsedCart);  // ✅ Set cart if data is found
        setCartCount(parsedCart.length);
      } else {
        console.warn("⚠ Cart is empty in localStorage!");
        setCart([]);  // ✅ Ensure empty cart is handled correctly
      }
    } catch (error) {
      console.error("❌ Error parsing cart data:", error);
    }
  } else {
    console.warn("⚠ No cart data found in localStorage!");
  }
}, [consumer]);  // ✅ Only run when consumer updates
  // ✅ Only run when consumer updates

 // ✅ Depend on the full consumer object, not just consumer_id

// Save cart to localStorage whenever it changes
useEffect(() => {
  if (!consumer || !consumer.consumer_id) return; // Ensure consumer is valid
  localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(cart));
}, [cart, consumer]); // ✅ Include consumer in dependencies


  // Update cart count
  const updateCartCount = (cartItems) => {
    setCartCount(cartItems.length); // ✅ Use cart length instead of summing quantities
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price_1kg * item.quantity, 0);
  };

  // Add to cart function
  const addToCart = (product, selectedQuantity) => {
    if (!consumer) {
      alert("Please log in first!");
      return;
    }
  
    if (!selectedQuantity || isNaN(selectedQuantity) || selectedQuantity <= 0) {
      alert("Please select a valid quantity!");
      return;
    }
  
    setCart((prevCart) => {
      const storedCart = JSON.parse(localStorage.getItem(`cart_${consumer.consumer_id}`)) || [];
      console.log("Before Adding:", storedCart);  // 🛠 Debugging Log
  
      const productIndex = storedCart.findIndex((item) => item.product_id === product.product_id);
      let updatedCart;
  
      if (productIndex === -1) {
        updatedCart = [...storedCart, { ...product, quantity: selectedQuantity }];
      } else {
        updatedCart = storedCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        );
      }
  
      console.log("After Adding:", updatedCart);  // 🛠 Debugging Log
      localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(updatedCart));
      
      // ✅ Ensure cartCount always reflects unique product count
      setCartCount(updatedCart.length);
  
      return updatedCart;
    });
  
    alert(`${selectedQuantity} Kg ${product.product_name} has been added to your cart!`);
  };  
  // Remove from cart function
  const removeFromCart = (id) => {
    if (!consumer) return;

    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.product_id !== id);
      localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(updatedCart));
      updateCartCount(updatedCart);
      return updatedCart;
    });
  };

  // Update quantity function
  const updateQuantity = (id, change) => {
    if (!consumer) return;

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.product_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );

      localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(updatedCart));
      updateCartCount(updatedCart);
      return updatedCart;
    });
  };

  const value = {
    cart,
    setCart,  // ✅ Ensure setCart is included
    cartCount,
    setCartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

