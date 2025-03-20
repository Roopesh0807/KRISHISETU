import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProductDetails.css";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${product_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError("Product not found");
        } else {
          setProduct(data);
          setSelectedQuantity("1kg"); // Default selection
        }
      })
      .catch(() => setError("Error fetching product"));
  }, [product_id]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!product) {
    return <p className="loading-text">Loading product details...</p>;
  }

  const handleSubscribe = () => {
    navigate("/subscribe", { state: { product, quantity: selectedQuantity } });
  };

  const handleAddToCart = () => {
  const quantity = parseInt(selectedQuantity.replace("kg", ""), 10); // Convert "5kg" to 5
  addToCart(product, quantity); // Add item with correct quantity
  navigate("/cart"); // Navigate to cart page after alert
};

  const handleAddToCommunityCart = () => {
    console.log("Added to community cart:", product.product_name, selectedQuantity);
  };

  const handleBuyNow = () => {
    const quantity = parseInt(selectedQuantity.replace("kg", ""), 10);
    addToCart(product, quantity);
    navigate("/cart");
  };
  
  const getImagePath = (productName) => {
    return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  };

  return (
    <div className="container">
      <div className="productDetailContainer">
        <h2 className="productName">{product.product_name}</h2>
        <img
          src={getImagePath(product.product_name)}
          alt={product.product_name}
          className="productImage"
          onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
        />

        <p className="productDescription">{product.description || "Fresh organic product available now!"}</p>

        <div className="productDetails">
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Buy Type:</strong> {product.buy_type}</p>
        </div>

        <div className="quantitySelector">
          <label className="quantityLabel">Select Quantity: </label>
          <select 
            value={selectedQuantity} 
            onChange={(e) => setSelectedQuantity(e.target.value)} 
            className="quantitySelect"
          >
            <option value="1kg">1kg - ₹{product.price_1kg}</option>
            <option value="2kg">2kg - ₹{product.price_2kg}</option>
            <option value="5kg">5kg - ₹{product.price_5kg}</option>
          </select>
        </div>

        <div className="buttonsContainer">
          <button className="cardButton" onClick={handleAddToCart}>Add to Cart</button>
          <button className="cardButton" onClick={handleAddToCommunityCart}>Add to Community Cart</button>
          <button className="cardButton" onClick={handleSubscribe}>Subscribe</button>
          <button className="cardButton" onClick={handleBuyNow}>Buy Now</button>
        </div>

        <Link to="/consumer-dashboard" className="backButton">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default ProductDetail;
