import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProductDetails.css";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1); // ✅ Default is number

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${product_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError("Product not found");
        } else {
          setProduct(data);
          setSelectedQuantity(1); // ✅ Ensuring default selection is 1
        }
      })
      .catch(() => setError("Error fetching product"));
  }, [product_id]);

  if (error) return <p className="error-message">{error}</p>;
  if (!product) return <p className="loading-text">Loading product details...</p>;

  const handleSubscribe = () => {
    navigate("/subscribe", { state: { product, quantity: selectedQuantity } });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedQuantity);
    navigate("/cart");
  };

  const handleAddToCommunityCart = () => {
    console.log("Added to community cart:", product.product_name, selectedQuantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedQuantity);
    navigate("/cart");
  };

  const getImagePath = (productName) => {
    return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  };

  const handleIncrease = () => {
    setSelectedQuantity((prev) => Math.max(1, prev + 1)); // ✅ Always valid
  };

  const handleDecrease = () => {
    setSelectedQuantity((prev) => Math.max(1, prev - 1)); // ✅ Prevent negative
  };

  const totalPrice = selectedQuantity * (product?.price_1kg || 0); // ✅ Fixing NaN issue

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
          <label className="quantityLabel"><strong>Select Quantity:</strong></label>
          <div className="quantityControls">
            <button onClick={handleDecrease} className="quantityButton">-</button>
            <span className="quantityValue">{selectedQuantity} kg</span>
            <button onClick={handleIncrease} className="quantityButton">+</button>
          </div>
        </div>

        <p className="totalPrice"><strong>Total Price: ₹ {totalPrice}</strong></p>

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
