import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    
    // Ensure cart count reflects the number of UNIQUE products, not total quantity
    setCartCount(storedCart.length); // Count unique products
  }, []);
  
  // Function to update cart count
  const updateCartCount = (cartItems) => {
    setCartCount(cartItems.length); // Count unique products
  };
  
  
  // Add to cart function
  const addToCart = (product, selectedQuantity) => {
    console.log("Adding to cart:", product, "Quantity:", selectedQuantity); // 🔍 Debugging
  
    if (!selectedQuantity || isNaN(selectedQuantity)) {
      alert("Please select a valid quantity!");
      return;
    }
  
    setCart((prevCart) => {
      let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      const productIndex = currentCart.findIndex((item) => item.product_id === product.product_id);
  
      let updatedCart;
  
      if (productIndex === -1) {
        updatedCart = [...currentCart, { ...product, quantity: selectedQuantity }];
      } else {
        updatedCart = currentCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        );
      }
  
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      updateCartCount(updatedCart);
      return updatedCart;
    });
  
    alert(`${selectedQuantity} Kg ${product.product_name} has been added to your cart!`);
  };
  
  // Remove from cart function
  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.product_id !== id);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      updateCartCount(updatedCart);  // Update cart count
      return updatedCart;
    });
  };

  // Update quantity function
  const updateQuantity = (id, change) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.product_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      updateCartCount(updatedCart);  // Update cart count
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
