import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [consumer, setConsumer] = useState(null); // 👤 Track logged-in consumer

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const storedConsumer = JSON.parse(localStorage.getItem("consumer")); // Get logged-in user
    setConsumer(storedConsumer);

    if (storedConsumer) {
      const storedCart = JSON.parse(localStorage.getItem(`cart_${storedConsumer.consumer_id}`)) || [];
      setCart(storedCart);
      setCartCount(storedCart.length);
    }
  }, []);

  // ✅ Function to update cart count
  const updateCartCount = (cartItems) => {
    setCartCount(cartItems.length);
  };

  // ✅ Add to cart function (Now stores cart per user)
  const addToCart = (product, selectedQuantity) => {
    if (!consumer) {
      alert("Please log in first!");
      return;
    }

    console.log("Adding to cart:", product, "Quantity:", selectedQuantity); // Debugging

    if (!selectedQuantity || isNaN(selectedQuantity)) {
      alert("Please select a valid quantity!");
      return;
    }

    setCart((prevCart) => {
      const storedCart = JSON.parse(localStorage.getItem(`cart_${consumer.consumer_id}`)) || [];
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

      localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      updateCartCount(updatedCart);
      return updatedCart;
    });

    alert(`${selectedQuantity} Kg ${product.product_name} has been added to your cart!`);
  };

  // ✅ Remove from cart function (Now removes from correct user)
  const removeFromCart = (id) => {
    if (!consumer) return;

    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.product_id !== id);
      localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      updateCartCount(updatedCart);
      return updatedCart;
    });
  };

  // ✅ Update quantity function
  const updateQuantity = (id, change) => {
    if (!consumer) return;

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.product_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );

      localStorage.setItem(`cart_${consumer.consumer_id}`, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      updateCartCount(updatedCart);
      return updatedCart;
    });
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);
