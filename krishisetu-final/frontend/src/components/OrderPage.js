import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderPage.css";
import { useAuth } from "../context/AuthContext";
import logo from '../assets/logo.jpg';
import { FaLeaf, FaTractor, FaShoppingBasket, FaRupeeSign, FaMapMarkerAlt, FaCreditCard, FaPhone, FaUser } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";
import { BsCheckCircleFill, } from "react-icons/bs";

const KrishiOrderPage = () => {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const { consumer } = useAuth();
  const [newAddress, setNewAddress] = useState({
    pincode: "",
    city: "",
    state: "",
    street: "",
    landmark: "",
  });
  const [consumerprofile, setConsumerProfile] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  // List of available coupons
  const coupons = [
    { code: "KRISHI10", discount: 10 },
    { code: "FARMFRESH15", discount: 15 },
    { code: "HARVEST20", discount: 20 },
    { code: "ORGANIC25", discount: 25 },
    { code: "GREEN30", discount: 30 },
    { code: "FRESH35", discount: 35 },
    { code: "VEGGIE40", discount: 40 },
    { code: "FARM50", discount: 50 },
  ];

  // Fetch consumer data and cart
  useEffect(() => {
    const storedConsumer = localStorage.getItem("consumer");
    if (storedConsumer) {
      const parsedConsumer = JSON.parse(storedConsumer);
      if (parsedConsumer?.consumer_id) {
        const storedCart = localStorage.getItem(`cart_${parsedConsumer.consumer_id}`);
        setCart(storedCart ? JSON.parse(storedCart) : []);
      }
    }
  }, []);
// Add this function to handle fetching address details from pincode
const fetchAddressDetails = async (pincode) => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    if (data[0].Status === "Success") {
      const postOffice = data[0].PostOffice[0];
      setNewAddress((prev) => ({
        ...prev,
        city: postOffice.District,
        state: postOffice.State,
      }));
    } else {
      alert("Invalid Pincode");
    }
  } catch (error) {
    console.error("Error fetching address details:", error);
    alert("Failed to fetch address details. Please try again.");
  }
};

// Add this function to handle adding a new address
const handleAddAddress = async () => {
  if (!consumerprofile || !consumerprofile.consumer_id) {
    console.error("Consumer profile not found or incomplete.");
    alert("Consumer profile not found. Please try again.");
    return;
  }

  // Validate required fields
  if (!newAddress.pincode || !newAddress.city || !newAddress.state || !newAddress.street) {
    alert("Please fill in all required address fields (pincode, city, state, street).");
    return;
  }

  const newAddressObj = {
    consumer_id: consumerprofile.consumer_id,
    name: consumerprofile.name || "",
    mobile_number: consumerprofile.mobile_number || "",
    pincode: newAddress.pincode,
    city: newAddress.city,
    state: newAddress.state,
    street: newAddress.street,
    landmark: newAddress.landmark || ""
  };

  try {
    const response = await fetch(`http://localhost:5000/api/addresses/${consumerprofile.consumer_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddressObj),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add address");
    }

    const savedAddress = await response.json();
    setAddresses((prevAddresses) => [...prevAddresses, savedAddress]);
    setNewAddress({ pincode: "", city: "", state: "", street: "", landmark: "" });
    setShowAddressPopup(false);
    alert("Address added successfully!");
  } catch (error) {
    console.error("Error adding address:", error);
    alert(error.message || "Failed to add address. Please try again.");
  }
};
  useEffect(() => {
    if (!consumer || !consumer.consumer_id) return;

    const fetchConsumerData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/addresses/${consumer.consumer_id}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setConsumerProfile(data.consumerProfile || {});
        setAddresses(data.address ? [data.address] : []);
      } catch (error) {
        console.error("Error fetching consumer data:", error);
      }
    };

    fetchConsumerData();
  }, [consumer]);

  // Handle pincode change
  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setNewAddress((prev) => ({ ...prev, pincode }));
    if (pincode.length === 6) fetchAddressDetails(pincode);
  };

  // Apply coupon
  const applyCoupon = () => {
    const coupon = coupons.find((c) => c.code === couponInput.toUpperCase());
    if (coupon) {
      setSelectedCoupon(coupon);
      setDiscountAmount(calculateSubtotal() * coupon.discount / 100);
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Please try again.");
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0);
  };

  // Calculate final price
  const calculateFinalPrice = () => {
    return calculateSubtotal() - discountAmount;
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address.");
      return;
    }

    try {
      const selectedAddrObj = addresses.find((addr) => addr.id === selectedAddress);
      const orderData = {
        consumer_id: consumerprofile.consumer_id,
        name: consumerprofile.name,
        mobile_number: consumerprofile.mobile_number,
        email: consumerprofile.email,
        address: `${selectedAddrObj.street}, ${selectedAddrObj.landmark}, ${selectedAddrObj.city}, ${selectedAddrObj.state}`,
        pincode: selectedAddrObj.pincode,
        produce_name: cart.map((product) => product.product_name).join(", "),
        quantity: cart.reduce((total, product) => total + product.quantity, 0),
        amount: calculateFinalPrice(),
        status: "Pending",
        payment_status: "Pending",
      };

      const response = await fetch("http://localhost:5000/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          localStorage.removeItem(`cart_${consumerprofile.consumer_id}`);
          navigate("/consumer-dashboard");
        }, 3000);
      } else {
        alert("Order failed. Try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Try again.");
    }
  };

  // Success Popup Component
  const SuccessPopup = () => (
    <div className="krishi-success-popup">
      <div className="krishi-popup-content">
        <div className="krishi-logo-text-container">
          <img src={logo} alt="KrishiSetu Logo" className="krishi-logo" />
          <h2>KrishiSetu</h2>
        </div>
        <BsCheckCircleFill className="krishi-success-icon" />
        <p>Order placed successfully!</p>
        <p>Thank you for supporting local farmers!</p>
      </div>
    </div>
  );

  // Get image path for products
  const getImagePath = (productName) => {
    return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  };

  return (
    <div className="krishi-order-container">
      <div className="krishi-order-header">
        <h1>
          <FaTractor className="krishi-header-icon" />
          Farm Fresh Order Summary
        </h1>
        <p className="krishi-order-subtitle">Review your order before checkout</p>
      </div>

      <div className="krishi-order-grid">
        {/* Products Section */}
        <div className="krishi-products-section">
          <h2 className="krishi-section-title">
            <FaShoppingBasket className="krishi-section-icon" />
            Your Farm Basket
          </h2>
          
          {cart.map((product) => (
            <div key={product.product_id} className="krishi-order-item">
              <img
                src={getImagePath(product.product_name)}
                alt={product.product_name}
                className="krishi-product-image"
                onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
              />
              <div className="krishi-product-details">
                <h4>{product.product_name}</h4>
                <div className="krishi-product-meta">
                  <span className="krishi-product-price">
                    <FaRupeeSign /> {product.price_1kg}/kg
                  </span>
                  <span className="krishi-product-quantity">
                    {product.quantity} kg
                  </span>
                  <span className="krishi-product-total">
                    <FaRupeeSign /> {product.price_1kg * product.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Section */}
        <div className="krishi-summary-section">
          {/* Coupon Section */}
          <div className="krishi-coupon-card">
            <h3 className="krishi-card-title">
              <FaLeaf className="krishi-card-icon" />
              Apply Farm Coupon
            </h3>
            <div className="krishi-coupon-input-group">
              <input
                type="text"
                list="krishi-coupon-list"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={couponApplied}
                className="krishi-coupon-input"
              />
              <datalist id="krishi-coupon-list">
                {coupons.map((coupon) => (
                  <option key={coupon.code} value={coupon.code}>
                    {coupon.code} - {coupon.discount}% OFF
                  </option>
                ))}
              </datalist>
              <button 
                onClick={applyCoupon} 
                disabled={couponApplied}
                className="krishi-coupon-btn"
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            {couponApplied && (
              <p className="krishi-coupon-success">
                <BsCheckCircleFill /> {selectedCoupon.discount}% discount applied!
              </p>
            )}
            {couponError && <p className="krishi-coupon-error">{couponError}</p>}
          </div>

          {/* Address Section */}
          <div className="krishi-address-card">
            <h3 className="krishi-card-title">
              <FaMapMarkerAlt className="krishi-card-icon" />
              Delivery Address
            </h3>
            {addresses.length === 0 ? (
              <p className="krishi-no-address">No addresses found. Please add a delivery address.</p>
            ) : (
              <div className="krishi-address-list">
                {addresses.map((address, index) => (
                  <div 
                    key={`${address.consumer_id}-${index}`} 
                    className={`krishi-address-item ${selectedAddress === address.consumer_id ? 'krishi-selected' : ''}`}
                    onClick={() => setSelectedAddress(address.consumer_id)}
                  >
                    <div className="krishi-address-details">
                      <h4>
                        <FaUser /> {consumerprofile?.name || "Loading..."}
                      </h4>
                      <p>
                        <FaPhone /> {consumerprofile?.mobile_number || "Loading..."}
                      </p>
                      <p>{address?.street}, {address?.landmark}</p>
                      <p>{address?.city}, {address?.state} - {address?.pincode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button 
              className="krishi-add-address-btn"
              onClick={() => setShowAddressPopup(true)}
            >
              + Add New Address
            </button>
          </div>

          {/* Payment Section */}
          <div className="krishi-payment-card">
            <h3 className="krishi-card-title">
              <FaCreditCard className="krishi-card-icon" />
              Payment Method
            </h3>
            <div className="krishi-payment-options">
              <label className="krishi-payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="credit-card"
                  checked={paymentMethod === "credit-card"}
                  onChange={() => setPaymentMethod("credit-card")}
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="krishi-payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <span>UPI Payment</span>
              </label>
              <label className="krishi-payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cash-on-delivery"
                  checked={paymentMethod === "cash-on-delivery"}
                  onChange={() => setPaymentMethod("cash-on-delivery")}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Order Total Section */}
          <div className="krishi-total-card">
            <h3 className="krishi-card-title">
              <GiFarmer className="krishi-card-icon" />
              Order Summary
            </h3>
            <div className="krishi-total-row">
              <span>Subtotal:</span>
              <span><FaRupeeSign /> {calculateSubtotal()}</span>
            </div>
            <div className="krishi-total-row">
              <span>Discount:</span>
              <span className="krishi-discount">- <FaRupeeSign /> {discountAmount}</span>
            </div>
            <div className="krishi-total-row krishi-grand-total">
              <span>Total:</span>
              <span><FaRupeeSign /> {calculateFinalPrice()}</span>
            </div>
            <button 
              className="krishi-place-order-btn"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Address Popup */}
      {showAddressPopup && (
        <div className="krishi-address-popup">
          <div className="krishi-popup-content">
            <h3>
              <FaMapMarkerAlt /> Add New Address
            </h3>
            <div className="krishi-popup-field">
              <label>Consumer ID:</label>
              <span>{consumerprofile?.consumer_id || "Loading..."}</span>
            </div>
            <div className="krishi-popup-field">
              <label>Name:</label>
              <span>{consumerprofile?.name || "Loading..."}</span>
            </div>
            <div className="krishi-popup-field">
              <label>Phone:</label>
              <span>{consumerprofile?.mobile_number || "Loading..."}</span>
            </div>
            <div className="krishi-popup-field">
              <label>Pincode *</label>
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                value={newAddress.pincode}
                onChange={handlePincodeChange}
                maxLength="6"
              />
            </div>
            <div className="krishi-popup-field">
              <label>City *</label>
              <input 
                type="text" 
                placeholder="City" 
                value={newAddress.city} 
                readOnly 
              />
            </div>
            <div className="krishi-popup-field">
              <label>State *</label>
              <input 
                type="text" 
                placeholder="State" 
                value={newAddress.state} 
                readOnly 
              />
            </div>
            <div className="krishi-popup-field">
              <label>Street Address *</label>
              <input
                type="text"
                placeholder="House no, Building, Street"
                value={newAddress.street}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
              />
            </div>
            <div className="krishi-popup-field">
              <label>Landmark (Optional)</label>
              <input
                type="text"
                placeholder="Nearby landmark"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, landmark: e.target.value }))}
              />
            </div>
            <div className="krishi-popup-buttons">
              <button 
                className="krishi-popup-cancel"
                onClick={() => setShowAddressPopup(false)}
              >
                Cancel
              </button>
              <button 
                className="krishi-popup-save"
                onClick={handleAddAddress}
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default KrishiOrderPage;