import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProductDetails.css";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FaShoppingCart, FaUsers, FaCalendarAlt, FaBolt, FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa";

const ProductDetails = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [showCommunitySelect, setShowCommunitySelect] = useState(false);
  const [addedToCommunityCart, setAddedToCommunityCart] = useState(false);
  const [showCommunityOptions, setShowCommunityOptions] = useState(false);
  const { consumer } = React.useContext(AuthContext);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${product_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError("Product not found");
        } else {
          setProduct(data);
          setSelectedQuantity(1);
        }
      })
      .catch(() => setError("Error fetching product"));
  }, [product_id]);

  const handleAddToCommunityCart = async () => {
    if (!consumer) {
      alert("Please login first");
      navigate("/consumer-login");
      return;
    }

    if (addedToCommunityCart) {
      navigate("/member-order-page");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/consumer-communities/${consumer.consumer_id}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.error === "Consumer not found") {
          alert("Your session might be expired. Please login again.");
          navigate("/consumer-login");
          return;
        }
        
        if (data.length === 0) {
          setShowCommunityOptions(true);
          return;
        }
        
        setCommunities(data);
        setShowCommunitySelect(true);
      } else {
        throw new Error(data.error || "Failed to fetch communities");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      
      if (error.message.includes("Consumer not found") || 
          error.message.includes("session")) {
        navigate("/consumer-login");
      }
    }
  };

  const handleConfirmAddToCommunityCart = async () => {
    if (!selectedCommunity) {
      alert("Please select a community first");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/community-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          community_id: selectedCommunity,
          product_id: product.product_id,
          consumer_id: consumer.consumer_id,
          quantity: selectedQuantity,
          price: selectedQuantity * product.price_1kg
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === "Consumer not found") {
          alert("Your account wasn't found. Please log in again.");
          navigate("/consumer-login");
          return;
        }
        if (data.error === "Membership not found") {
          alert("You need to join this community first");
          setShowCommunityOptions(true);
          setShowCommunitySelect(false);
          return;
        }
        throw new Error(data.error || "Failed to add to community cart");
      }
  
      setAddedToCommunityCart(true);
      alert(`Added to ${data.community_name || 'community'} cart!`);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      
      if (error.message.includes("not a member") || 
          error.message.includes("Membership not found")) {
        setShowCommunityOptions(true);
        setShowCommunitySelect(false);
      }
    }
  };

  const handleSubscribe = () => {
    navigate("/subscribe", { state: { product, quantity: selectedQuantity } });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedQuantity);
    navigate("/cart");
  };

  const handleBuyNow = () => {
    addToCart(product, selectedQuantity);
    navigate("/cart");
  };

  const getImagePath = (productName) => {
    return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  };

  const handleIncrease = () => {
    setSelectedQuantity((prev) => Math.max(1, prev + 1));
  };

  const handleDecrease = () => {
    setSelectedQuantity((prev) => Math.max(1, prev - 1));
  };

  if (error) return <div className="ks-error-container">Error: {error}</div>;
  if (!product) return <div className="ks-loading-container">Loading product details...</div>;

  const totalPrice = selectedQuantity * (product.price_1kg || 0);

  return (
    <div className="ks-product-page">
      <div className="ks-product-container">
        <div className="ks-breadcrumb">
          <Link to="/consumer-dashboard" className="ks-breadcrumb-link">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="ks-product-grid">
          <div className="ks-product-gallery">
            <div className="ks-main-image">
              <img
                src={getImagePath(product.product_name)}
                alt={product.product_name}
                className="ks-product-image"
                onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
              />
            </div>
          </div>

          <div className="ks-product-info">
            <h1 className="ks-product-title">{product.product_name}</h1>
            <div className="ks-product-meta">
              <span className="ks-product-category">{product.category}</span>
              <span className="ks-product-type">{product.buy_type}</span>
            </div>

            <div className="ks-product-description">
              <h3 className="ks-section-title">Product Details</h3>
              <p>{product.description || "Fresh from our organic farms"}</p>
            </div>

            <div className="ks-quantity-section">
              <h3 className="ks-section-title">Select Quantity (kg)</h3>
              <div className="ks-quantity-controls">
                <button onClick={handleDecrease} className="ks-quantity-btn">
                  <FaMinus />
                </button>
                <span className="ks-quantity-value">{selectedQuantity}</span>
                <button onClick={handleIncrease} className="ks-quantity-btn">
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="ks-price-section">
              <span className="ks-price-label">Total Price:</span>
              <span className="ks-price">₹{totalPrice.toFixed(2)}</span>
              <span className="ks-price-unit">(₹{product.price_1kg}/kg)</span>
            </div>

            <div className="ks-action-buttons">
              <button className="ks-btn ks-btn-cart" onClick={handleAddToCart}>
                <FaShoppingCart /> Add to Cart
              </button>
              <button className="ks-btn ks-btn-buy" onClick={handleBuyNow}>
                <FaBolt /> Buy Now
              </button>
              <button className="ks-btn ks-btn-community" onClick={handleAddToCommunityCart}>
                <FaUsers /> {addedToCommunityCart ? "Community Cart" : "Community Order"}
              </button>
              <button className="ks-btn ks-btn-subscribe" onClick={handleSubscribe}>
                <FaCalendarAlt /> Subscribe
              </button>
            </div>

            {showCommunitySelect && !addedToCommunityCart && (
              <div className="ks-community-section">
                <h3 className="ks-section-title">Select Your Community</h3>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="ks-community-select"
                >
                  <option value="">Select your community</option>
                  {communities.map(community => (
                    <option key={community.community_id} value={community.community_id}>
                      {community.community_name}
                    </option>
                  ))}
                </select>
                <button 
                  className="ks-btn ks-btn-confirm"
                  onClick={handleConfirmAddToCommunityCart}
                >
                  Confirm Community Selection
                </button>
              </div>
            )}

            {showCommunityOptions && !showCommunitySelect && (
              <div className="ks-community-prompt">
                <h3 className="ks-section-title">Join a Community</h3>
                <p>To use community ordering, you need to be part of a farming community</p>
                <div className="ks-community-actions">
                  <button 
                    className="ks-btn ks-btn-community-action"
                    onClick={() => navigate("/create-community")}
                  >
                    Create New Community
                  </button>
                  <button 
                    className="ks-btn ks-btn-community-action"
                    onClick={() => navigate("/join-community")}
                  >
                    Join Existing Community
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;