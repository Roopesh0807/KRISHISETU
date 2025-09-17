import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import "./ProductDetails.css";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FaShoppingCart, FaUsers, FaCalendarAlt, FaBolt, FaMinus, FaPlus, FaArrowLeft, FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
// The Wallet component is no longer imported here as it's been moved to the Subscribe page.

const ProductDetails = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [productImage, setProductImage] = useState(
    location.state?.productImage || '/images/default-image.jpg'
  );
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

  const [walletBalance, setWalletBalance] = useState(0);
  const [showWalletRequiredPopup, setShowWalletRequiredPopup] = useState(false);

  const getInitialSubscriptionDate = () => {
      const now = new Date();
      const cutoffHour = 22;
      const cutoffMinute = 30;

      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(now.getDate() + 2);
      dayAfterTomorrow.setHours(0, 0, 0, 0);

      if (now.getHours() > cutoffHour || (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)) {
          return dayAfterTomorrow;
      } else {
          return tomorrow;
      }
  };
  
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedDate, setSelectedDate] = useState(getInitialSubscriptionDate());
  const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [dateSelectionError, setDateSelectionError] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/${product_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${consumer?.token}`,
      },
    })
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
  }, [product_id, consumer?.token]);

  const calculateDiscountedPrice = (price) => {
    return price * 0.95;
  };

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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/consumer-communities/${consumer.consumer_id}`,{
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
      });
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${consumer?.token}`,
        },
        body: JSON.stringify({
          community_id: selectedCommunity,
          product_id: product.product_id,
          consumer_id: consumer.consumer_id,
          quantity: selectedQuantity,
          price: selectedQuantity * product.price_1kg,
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

        if (data.error === "Community is frozen") {
          alert(`This community is currently frozen for orders. ${data.message}`);
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

  const handleSubscribe = async () => {
    if (!consumer) {
      alert("Please login first");
      navigate("/consumer-login");
      return;
    }

    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/wallet/balance/${consumer.consumer_id}`, {
            headers: { "Authorization": `Bearer ${consumer.token}` }
        });
        const data = await response.json();
        setWalletBalance(data.balance);
        
        if (data.balance < 5) {
            setShowWalletRequiredPopup(true);
            return;
        }
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        alert("Could not fetch wallet balance. Please ensure your wallet is funded.");
    }
    
    setShowSubscriptionPopup(true);
    setDateSelectionError("");
    setSelectedDate(getInitialSubscriptionDate());
  };

  const handleFrequencySelect = (frequency) => {
    setSelectedFrequency(frequency);
    setShowCalendar(true);
    setDateSelectionError("");
  };

  const handleDateChange = (date) => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(normalizedDate);
    setDateSelectionError("");
  };

  const isPastCutoffTime = () => {
    const now = new Date();
    const cutoffHour = 22;
    const cutoffMinute = 30;
    return now.getHours() > cutoffHour ||
           (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute);
  };

  const confirmSubscriptionDate = () => {
    if (selectedDate < getMinDate()) {
        setDateSelectionError("Please select a valid start date.");
        return;
    }
    
    setShowCalendar(false);
    setSubscriptionConfirmed(true);
    setDateSelectionError("");
  };

  const saveSubscription = async () => {
    try {
      const consumer = JSON.parse(localStorage.getItem('consumer'));
      if (!consumer) {
        alert("Please login first");
        navigate("/consumer-login");
        return;
      }
  
      const getBackendSubscriptionType = (frequency) => {
        switch(frequency) {
          case 'daily': return 'Daily';
          case 'alternate-days': return 'Alternate Days';
          case 'weekly': return 'Weekly';
          case 'monthly': return 'Monthly';
          default: return frequency;
        }
      };
  
      const subscriptionType = getBackendSubscriptionType(selectedFrequency);
      const discountedPrice = calculateDiscountedPrice(product.price_1kg * selectedQuantity);
      
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedStartDate = `${year}-${month}-${day}`;

      const subscriptionData = {
        consumer_id: consumer.consumer_id,
        subscription_type: subscriptionType,
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: selectedQuantity,
        original_price: product.price_1kg * selectedQuantity,
        price: discountedPrice,
        start_date: formattedStartDate,
        discount_applied: 5
      };
  
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${consumer?.token}`,
        },
        body: JSON.stringify(subscriptionData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save subscription");
      }
  
      const data = await response.json();
      console.log("Subscription created:", data);
  
      setShowSuccessMessage(true);
      setShowSubscriptionPopup(false);
      setSubscriptionConfirmed(false);
      setSelectedFrequency("");
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1500);
    } catch (error) {
      console.error("Subscription error:", error);
      alert(`Subscription failed: ${error.message}`);
    }
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
  const discountedPrice = calculateDiscountedPrice(totalPrice);

  const getMinDate = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(now.getDate() + 2);
      dayAfterTomorrow.setHours(0, 0, 0, 0);

      if (isPastCutoffTime()) {
          return dayAfterTomorrow;
      } else {
          return tomorrow;
      }
  };

  return (
    <div className="ks-product-page">
      {showWalletRequiredPopup && (
        <div className="popup-overlay">
          <div className="wallet-required-popup popup-content">
              <div className="popup-header">
                  <h3>Wallet Balance Low</h3>
                  <button className="close-popup" onClick={() => setShowWalletRequiredPopup(false)}>&times;</button>
              </div>
              <div className="popup-body">
                  <p>You need to have a minimum balance to subscribe to a product.</p>
                  <p>Your current balance is ₹{walletBalance.toFixed(2)}.</p>
                  <button className="add-money-btn" onClick={() => navigate('/subscribe', { state: { scrollToWallet: true } })}>
                      Add Money to Wallet
                  </button>
              </div>
          </div>
        </div>
      )}
      {showSuccessMessage && (
        <div className="ks-success-overlay">
          <div className="ks-success-message">
            <FaCheckCircle className="ks-success-icon" />
            <p>Subscription plan has been saved successfully!</p>
          </div>
        </div>
      )}

      <div className="ks-product-container">
        <div className="ks-product-grid">
          <div className="ks-product-gallery">
          <div className="ks-main-image">
  <img
    src={productImage}
    alt={product?.product_name}
    className="ks-product-image"
    onError={(e) => { 
      e.target.src = "/images/default-image.jpg";
      setProductImage("/images/default-image.jpg");
    }} 
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
              <p>{product.description || "Fresh from the farms"}</p>
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
                <FaCalendarAlt /> Subscribe (5% off - ₹{discountedPrice.toFixed(2)})
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

      {showSubscriptionPopup && (
        <div className="ks-subscription-popup">
          <div className="ks-subscription-container">
            <button 
              className="ks-close-btn" 
              onClick={() => {
                setShowSubscriptionPopup(false);
                setShowCalendar(false);
                setSubscriptionConfirmed(false);
                setSelectedFrequency("");
                setDateSelectionError("");
              }}
            >
              <FaTimes />
            </button>
            
            <h2>Choose Subscription Plan</h2>
            
            {!showCalendar && !subscriptionConfirmed ? (
              <div className="ks-frequency-options">
                <div 
                  className={`ks-frequency-option ${selectedFrequency === 'daily' ? 'active' : ''}`}
                  onClick={() => handleFrequencySelect('daily')}
                >
                  Daily
                </div>
                <div 
                  className={`ks-frequency-option ${selectedFrequency === 'alternate-days' ? 'active' : ''}`}
                  onClick={() => handleFrequencySelect('alternate-days')}
                >
                  Alternate Days
                </div>
                <div 
                  className={`ks-frequency-option ${selectedFrequency === 'weekly' ? 'active' : ''}`}
                  onClick={() => handleFrequencySelect('weekly')}
                >
                  Weekly
                </div>
                <div 
                  className={`ks-frequency-option ${selectedFrequency === 'monthly' ? 'active' : ''}`}
                  onClick={() => handleFrequencySelect('monthly')}
                >
                  Monthly
                </div>
              </div>
            ) : showCalendar && !subscriptionConfirmed ? (
              <div className="ks-calendar-section">
                <h3>Select Start Date</h3>
                {isPastCutoffTime() ? (
                  <p className="ks-cutoff-message">
                    Orders for today are closed (after 10:30 PM). Please select tomorrow's date or later.
                  </p>
                ) : (
                  <p>Please choose today's date (before 10:30 PM) or a future date</p>
                )}
                <Calendar 
                  onChange={handleDateChange}
                  value={selectedDate}
                  minDate={getMinDate()}
                />
                {dateSelectionError && (
                  <div className="ks-date-error">{dateSelectionError}</div>
                )}
                <button 
                  className="ks-confirm-date-btn"
                  onClick={confirmSubscriptionDate}
                >
                  Confirm Date
                </button>
              </div>
            ) : (
              <div className="ks-subscription-confirmation">
                <p>Subscribe to {product.product_name} ({selectedQuantity}kg) {selectedFrequency} starting from {selectedDate.toDateString()}</p>
                <div className="ks-subscription-price">
                  <span className="ks-original-price">Original Price: ₹{totalPrice.toFixed(2)}</span>
                  <span className="ks-discounted-price">Discounted Price: ₹{discountedPrice.toFixed(2)} (5% off)</span>
                </div>
                <button 
                  className="ks-save-subscription-btn"
                  onClick={saveSubscription}
                >
                  Save Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
