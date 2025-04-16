import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faTractor,
  faBasketShopping,
  faLeaf,
  faMapMarkerAlt,
  faCreditCard,
  faMoneyBillWave,
  faExclamationTriangle,
  faTruck,
  faUser,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import "./bargainOrderPage.css";

const OrderPage = () => {
  const { consumer, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [consumerProfile, setConsumerProfile] = useState({});
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newAddress, setNewAddress] = useState({
    pincode: "",
    city: "",
    state: "",
    street: "",
    landmark: "",
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Fetch address details from pincode API
  const fetchAddressDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setNewAddress(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State
        }));
      } else {
        setError("Invalid Pincode");
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
      setError("Failed to fetch address details. Please try again.");
    }
  };

  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setNewAddress(prev => ({ ...prev, pincode }));
    if (pincode.length === 6) fetchAddressDetails(pincode);
  };

  // Calculate delivery charges
  const calculateDeliveryCharge = (totalKg) => {
    const baseCharge = 100;
    const additionalCharge = totalKg > 10 ? (totalKg - 10) * 5 : 0;
    return baseCharge + additionalCharge;
  };

  const processCartItems = (items) => {
    if (!Array.isArray(items)) {
      throw new Error('Invalid cart data: expected array');
    }

    const itemMap = new Map();
    let itemCount = 0;
    let runningTotal = 0;

    items.forEach(item => {
      const productName = item.product_name?.trim() || 'Unknown Product';
      const price = Number(item.price_per_kg) || 0;
      const quantity = Number(item.quantity) || 0;
      const total = Number(item.total_price) || price * quantity;
      const key = `${productName}-${price}-${item.farmer_id}`;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        const newQuantity = existing.quantity + quantity;
        const newTotal = existing.total_price + total;
        
        itemMap.set(key, {
          ...existing,
          quantity: newQuantity,
          total_price: newTotal,
          bargain_ids: [...existing.bargain_ids, item.bargain_id || ''],
          cart_ids: [...existing.cart_ids, item.cart_id || '']
        });
      } else {
        itemMap.set(key, {
          farmer_id: item.farmer_id || '',
          product_name: productName,
          product_category: item.product_category?.trim() || 'Uncategorized',
          price_per_kg: price,
          quantity: quantity,
          total_price: total,
          bargain_ids: [item.bargain_id || ''],
          cart_ids: [item.cart_id || '']
        });
      }

      itemCount += quantity;
      runningTotal += total;
    });

    setTotalItems(itemCount);
    setGrandTotal(runningTotal);
    setDeliveryCharge(calculateDeliveryCharge(itemCount));
    return Array.from(itemMap.values());
  };

  const fetchConsumerProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/consumerprofile/${consumer.consumer_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const data = response.data;
      setConsumerProfile(data);
      
      if (data.address) {
        parseAddress(data.address);
      }
    } catch (error) {
      console.error("Error fetching consumer profile:", error);
      setConsumerProfile({
        consumer_id: consumer.consumer_id,
        name: "",
        mobile_number: "",
        email: "",
        address: ""
      });
    }
  };

  const parseAddress = (address) => {
    try {
      if (!address) {
        throw new Error("Address is empty");
      }
  
      // Initialize with default values
      const parsedAddress = {
        street: "",
        landmark: "",
        city: "",
        state: "",
        pincode: ""
      };
  
      // Split by commas and clean up whitespace
      const parts = address.split(',').map(part => part.trim()).filter(part => part);
  
      // Try to extract pincode (last part)
      const lastPart = parts[parts.length - 1];
      const pincodeMatch = lastPart.match(/\b\d{6}\b/); // Look for 6-digit pincode
      if (pincodeMatch) {
        parsedAddress.pincode = pincodeMatch[0];
        parts[parts.length - 1] = lastPart.replace(pincodeMatch[0], '').trim();
      }
  
      // Try to extract state (before pincode)
      const stateMatch = lastPart.match(/[a-zA-Z\s]+/);
      if (stateMatch) {
        parsedAddress.state = stateMatch[0].trim();
      }
  
      // Assign remaining parts
      if (parts.length >= 1) parsedAddress.street = parts[0];
      if (parts.length >= 2) parsedAddress.landmark = parts[1];
      if (parts.length >= 3) parsedAddress.city = parts[2];
  
      // Fallback if we couldn't parse properly
      if (!parsedAddress.city && parsedAddress.state) {
        parsedAddress.city = parsedAddress.state;
      }
  
      setNewAddress(parsedAddress);
      return parsedAddress;
    } catch (error) {
      console.error("Error parsing address:", error);
      setNewAddress({
        pincode: "",
        city: "",
        state: "",
        street: "",
        landmark: "",
      });
      return null;
    }
  };

  const handleModifyAddress = () => {
    if (consumerProfile?.address) {
      const parsed = parseAddress(consumerProfile.address);
      if (!parsed) {
        setNewAddress({
          pincode: "",
          city: "",
          state: "",
          street: "",
          landmark: "",
        });
      }
    } else {
      setNewAddress({
        pincode: "",
        city: "",
        state: "",
        street: "",
        landmark: "",
      });
    }
    setShowAddressPopup(true);
  };

  const handleAddAddress = async () => {
    try {
      if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        alert("Please fill all required address fields (Street, City, State, and Pincode)");
        return;
      }
  
      const fullAddress = [
        newAddress.street,
        newAddress.landmark,
        newAddress.city,
        `${newAddress.state} - ${newAddress.pincode}`
      ].filter(Boolean).join(', ');
  
      const payload = {
        consumer_id: consumerProfile.consumer_id,
        street: newAddress.street,
        landmark: newAddress.landmark || "",
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        address: fullAddress
      };
  
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/update-address`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        setConsumerProfile(prev => ({
          ...prev,
          address: fullAddress
        }));
        
        setShowAddressPopup(false);
        alert("Address updated successfully!");
      } else {
        throw new Error(response.data.error || "Failed to update address");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const fetchCart = async () => {
    if (!consumer?.consumer_id || !token) {
      setError('Please login to view your cart');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const cartResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const receivedData = Array.isArray(cartResponse.data) 
        ? cartResponse.data 
        : cartResponse.data?.data || [];

      const processedItems = processCartItems(receivedData);
      setCartItems(processedItems);
      
      await fetchConsumerProfile();
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load data');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!consumerProfile?.address) {
      setError('Please add a delivery address');
      return;
    }

    try {
      const finalAmount = grandTotal + deliveryCharge;
      if (finalAmount <= 0) {
        alert("Invalid order amount.");
        return;
      }

      // Prepare product names and quantities using backend field names
    const produce_name = cartItems.map(item => item.product_name).join(", ");
    const quantity = cartItems.reduce((total, item) => total + item.quantity, 0);

      // First create the order in your database
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/place-order`,
        {
          consumer_id: consumer.consumer_id,
        name: consumerProfile.name,
        mobile_number: consumerProfile.mobile_number,
        email: consumerProfile.email,
        produce_name, // Using backend field name
        quantity,    // Using backend field name
        amount: finalAmount,
        address: consumerProfile.address,
        pincode: newAddress.pincode,
        payment_method: 'razorpay',
        payment_status: 'Pending',
        items: cartItems.map(item => ({
          produce_name: item.product_name, // Alias here
          product_category: item.product_category,
          price_per_kg: item.price_per_kg,
          quantity: item.quantity,
          farmer_id: item.farmer_id,
          bargain_ids: item.bargain_ids
        })),
        delivery_charge: deliveryCharge,
        notes: {
          cart_items: JSON.stringify(cartItems),
          consumer_id: consumer.consumer_id,
        }
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

      const orderResult = orderResponse.data;
      
      if (!orderResult.success || !orderResult.order_id) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      // Create Razorpay order
      const razorpayResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/razorpay/create-order`,
        { 
          amount: finalAmount , // Convert to paise
          order_id: orderResult.order_id,
          notes: {
            internal_order_id: orderResult.order_id,
            consumer_id: consumer.consumer_id
          }
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const razorpayData = razorpayResponse.data;

      if (!razorpayData.order) {
        throw new Error(razorpayData.error || "Payment gateway error");
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_VLCfnymiyd6HGf',
        amount: razorpayData.order.amount,
        currency: razorpayData.order.currency,
        order_id: razorpayData.order.id,
        name: 'KrishiSetu',
        description: 'Farm Fresh Products',
        image: '', // Add your logo URL here
        handler: async (response) => {
          try {
            // Verify payment
            const verificationResponse = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/razorpay/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderResult.order_id,
                amount: razorpayData.order.amount
              },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const verificationData = verificationResponse.data;
            
            if (!verificationData.success) {
              throw new Error(verificationData.error || 'Payment verification failed');
            }

            // Payment successful
            setShowSuccessPopup(true);
            localStorage.removeItem(`cart_${consumer.consumer_id}`);
            setTimeout(() => window.location.href = "/consumer-dashboard", 3000);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert(`Payment verification failed: ${error.message}`);
          }
        },
        prefill: {
          name: consumerProfile?.name || '',
          email: consumerProfile?.email || '',
          contact: consumerProfile?.mobile_number || ''
        },
        theme: {
          color: '#3399cc',
          hide_topbar: true
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  const placeOrder = async () => {
    if (!consumerProfile?.address) {
      setError('Please add a delivery address');
      return;
    }
  
    try {
      // Extract pincode from address (optional improvement)
      let pincode = newAddress?.pincode || '';
      if (!pincode && consumerProfile.address) {
        const match = consumerProfile.address.match(/- (\d{6})$/);
        pincode = match ? match[1] : '';
      }
  
      const orderData = {
        consumer_id: consumer.consumer_id,
        name: consumerProfile.name,
        mobile_number: consumerProfile.mobile_number,
        email: consumerProfile.email,
        address: consumerProfile.address,
        pincode: pincode,
        payment_method: paymentMethod === 'online' ? 'razorpay' : 'cash-on-delivery',
        payment_status: paymentMethod === 'online' ? 'Paid' : 'Pending',
        produce_name: cartItems.map(item => item.product_name).join(", "), // for backend
        quantity: cartItems.reduce((total, item) => total + item.quantity, 0),
        amount: grandTotal + deliveryCharge, // total_amount in simplified form
        delivery_charge: deliveryCharge, // if needed by backend
        items: cartItems.map(item => ({
          product_name: item.product_name,
          product_category: item.product_category,
          price_per_kg: item.price_per_kg,
          quantity: item.quantity,
          farmer_id: item.farmer_id,
          bargain_ids: item.bargain_ids
        }))
      };
  
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/place-order`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.data.success) {
        setShowSuccessPopup(true);
        localStorage.removeItem(`cart_${consumer.consumer_id}`);
        setTimeout(() => window.location.href = "/consumer-dashboard", 3000);
      } else {
        throw new Error(response.data.error || "Failed to place order");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    }
  };
  

  const handlePlaceOrder = () => {
    if (paymentMethod === 'online') {
      handleRazorpayPayment();
    } else {
      placeOrder();
    }
  };

  useEffect(() => {
    fetchCart();
  }, [consumer?.consumer_id, token]);

  if (loading) {
    return (
      <div className="order-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="loading-icon" />
        <p className="loading-text">Loading your farm fresh order...</p>
      </div>
    );
  }

  if (error && !showAddressPopup) {
    return (
      <div className="order-error-container">
        <div className="order-error-alert">
          <div className="error-icon-container">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            <h3 className="error-message">{error}</h3>
          </div>
          <button 
            onClick={fetchCart}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const SuccessPopup = () => (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>
        <h3 className="success-title">Order Placed Successfully!</h3>
        <p className="success-message">Thank you for supporting local farmers. {paymentMethod === 'online' ? 'Your payment has been processed successfully.' : 'Your fresh produce will be delivered soon.'}</p>
        <div className="success-farmer-icon">
          <FontAwesomeIcon icon={faTractor} />
        </div>
        <p className="success-redirect">You will be redirected shortly...</p>
      </div>
    </div>
  );

  return (
    <div className="order-page-container">
      <div className="order-header">
        <div className="header-icon">
          <FontAwesomeIcon icon={faBasketShopping} />
        </div>
        <h1 className="order-title">Farm Fresh Order Summary</h1>
        <div className="header-decoration">
          <FontAwesomeIcon icon={faLeaf} />
        </div>
      </div>
      
      <div className="order-content-grid">
        {/* Left Column - Delivery and Payment */}
        <div className="order-details-section">
          {/* Delivery Address Section */}
          <div className="order-card address-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="card-icon address-icon" />
              <h2 className="card-title">Delivery Address</h2>
            </div>
            
            {consumerProfile?.address ? (
              <div className="address-content">
                <div className="address-display">
                  <div className="user-icon-container">
                    <FontAwesomeIcon icon={faUser} className="user-icon" />
                  </div>
                  <div className="address-details">
                    <h3 className="user-name">{consumerProfile?.name || "Loading..."}</h3>
                    <p className="user-contact">{consumerProfile?.mobile_number || "Loading..."}</p>
                    <p className="user-address">{consumerProfile.address}</p>
                  </div>
                </div>
                <button 
                  className="edit-address-button"
                  onClick={handleModifyAddress}
                >
                  <FontAwesomeIcon icon={faEdit} className="button-icon" />
                  {consumerProfile?.address ? "Update Address" : "Add Address"}
                </button>
              </div>
            ) : (
              <div className="no-address">
                <p className="no-address-message">No farm delivery address found</p>
                <button 
                  className="add-address-button"
                  onClick={() => setShowAddressPopup(true)}
                >
                  Add Delivery Address
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="order-card payment-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faCreditCard} className="card-icon payment-icon" />
              <h2 className="card-title">Payment Method</h2>
            </div>
            
            <div className="payment-options">
              <label className="payment-option">
                <div className={`payment-option-content ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="payment-radio"
                  />
                  <FontAwesomeIcon icon={faMoneyBillWave} className="payment-method-icon cash-icon" />
                  <div className="payment-method-details">
                    <h3 className="payment-method-name">Cash on Delivery</h3>
                    <p className="payment-method-description">Pay when you receive your fresh produce</p>
                  </div>
                </div>
              </label>
              
              <label className="payment-option">
                <div className={`payment-option-content ${paymentMethod === 'online' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="payment-radio"
                  />
                  <FontAwesomeIcon icon={faCreditCard} className="payment-method-icon online-icon" />
                  <div className="payment-method-details">
                    <h3 className="payment-method-name">Online Payment</h3>
                    <p className="payment-method-description">Pay securely with UPI, Card, or Net Banking</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="order-card delivery-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faTruck} className="card-icon delivery-icon" />
              <h2 className="card-title">Delivery Information</h2>
            </div>
            
            <div className="delivery-details">
              <div className="delivery-row">
                <span className="delivery-label">Total Weight:</span>
                <span className="delivery-value">{totalItems} kg</span>
              </div>
              <div className="delivery-row">
                <span className="delivery-label">Delivery Charges:</span>
                <span className="delivery-value">₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="delivery-note">
                {totalItems > 10 ? (
                  <span>₹100 for first 10kg + ₹5/kg for additional {totalItems - 10}kg</span>
                ) : (
                  <span>Flat ₹100 for up to 10kg</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <div className="summary-header">
              <FontAwesomeIcon icon={faLeaf} className="summary-icon" />
              <h2 className="summary-title">Your Farm Order</h2>
            </div>
            
            <div className="order-items-list">
              {cartItems.map((item) => (
                <div key={`${item.product_name}-${item.price_per_kg}-${item.farmer_id}`} className="order-item">
                  <div className="item-details">
                    <h3 className="item-name">{item.product_name}</h3>
                    <p className="item-quantity">{item.quantity} kg × ₹{item.price_per_kg.toFixed(2)}</p>
                  </div>
                  <span className="item-price">₹{item.total_price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span className="total-label">Subtotal:</span>
                <span className="total-value">₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Delivery:</span>
                <span className="total-value">₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="grand-total-row">
                <span className="grand-total-label">Total:</span>
                <span className="grand-total-value">₹{(grandTotal + deliveryCharge).toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="place-order-button"
              onClick={handlePlaceOrder}
              disabled={!consumerProfile?.address}
            >
              {paymentMethod === 'online' ? `Pay ₹${(grandTotal + deliveryCharge).toFixed(2)}` : 'Place Order (Cash on Delivery)'}
            </button>
          </div>
        </div>
      </div>

      {/* Address Popup */}
      {showAddressPopup && (
        <div className="address-popup-overlay">
          <div className="address-popup">
            <h3 className="popup-title">
              {consumerProfile?.address ? "Update Farm Delivery Address" : "Add New Farm Delivery Address"}
            </h3>
            
            {error && (
              <div className="popup-error">
                {error}
              </div>
            )}

            <div className="address-form">
              {/* Pincode Field */}
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={newAddress.pincode}
                  onChange={handlePincodeChange}
                  maxLength="6"
                  className="form-input"
                />
              </div>
              
              {/* City Field */}
              <div className="form-group">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  placeholder="City" 
                  value={newAddress.city} 
                  readOnly 
                  className="form-input readonly"
                />
              </div>
              
              {/* State Field */}
              <div className="form-group">
                <label className="form-label">State *</label>
                <input 
                  type="text" 
                  placeholder="State" 
                  value={newAddress.state} 
                  readOnly 
                  className="form-input readonly"
                />
              </div>
              
              {/* Street Address Field */}
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  placeholder="Farm name, Building, Street"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              {/* Landmark Field */}
              <div className="form-group">
                <label className="form-label">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Nearby landmark (market, temple, etc.)"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="popup-buttons">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowAddressPopup(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={handleAddAddress}
              >
                {consumerProfile?.address ? "Update Address" : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default OrderPage;