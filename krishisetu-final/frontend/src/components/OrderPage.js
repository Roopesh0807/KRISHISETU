import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderPage.css";
import { useAuth } from "../context/AuthContext";
import logo from '../assets/logo.jpg';
import { FaLeaf, FaTractor, FaShoppingBasket, FaRupeeSign, FaMapMarkerAlt, FaCreditCard, FaPhone, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";
import { BsCheckCircleFill } from "react-icons/bs";

const KrishiOrderPage = () => {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const { consumer } = useAuth();
  const [savedRecipientAddresses, setSavedRecipientAddresses] = useState([]);
  const [selectedRecipientAddress, setSelectedRecipientAddress] = useState(null);
  const [editingRecipientId, setEditingRecipientId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    pincode: "",
    city: "",
    state: "",
    street: "",
    landmark: "",
  });
  const [recipientDetails, setRecipientDetails] = useState({
    name: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    street: "",
    landmark: "",
  });
  const [deliveryOption, setDeliveryOption] = useState("self");
  const [consumerprofile, setConsumerProfile] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();
  const calculateDeliveryCharge = () => {
    const subtotal = calculateSubtotal();
    if (subtotal > 200) {
      return 0; // Free delivery for orders above ₹200
    }
    
    // Fixed cost of ₹20 + ₹2 per kg
    const totalKg = cart.reduce((total, product) => total + product.quantity, 0);
    return 20 + (2 * totalKg);
  };
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
  const [razorpayOrderId, setRazorpayOrderId] = useState(null);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState(null);
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

  useEffect(() => {
    const loadedAddresses = loadRecipientAddressesFromStorage();
    if (loadedAddresses.length > 0) {
      setSavedRecipientAddresses(loadedAddresses);
    }
  }, []);

  useEffect(() => {
    if (!consumer || !consumer.consumer_id) return;

    const fetchConsumerProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/consumerprofile/${consumer.consumer_id}`,{
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setConsumerProfile(data);
        
        if (data.address) {
          const addressParts = data.address.split(', ');
          const lastPart = addressParts[addressParts.length - 1];
          const statePincodeMatch = lastPart.match(/(.*) - (\d+)/);
          
          const landmark = addressParts.length > 2 ? addressParts[1] : "";
          
          setNewAddress({
            street: addressParts[0],
            landmark: landmark,
            city: addressParts.length > 2 ? addressParts[2] : addressParts[1],
            state: statePincodeMatch ? statePincodeMatch[1] : "",
            pincode: statePincodeMatch ? statePincodeMatch[2] : ""
          });
        }
      } catch (error) {
        console.error("Error fetching consumer profile:", error);
        setConsumerProfile({
          consumer_id: consumer.consumer_id,
          name: "",
          mobile_number: "",
          email: ""
        });
      }
    };

    fetchConsumerProfile();
  }, [consumer]);

  const fetchAddressDetails = async (pincode, isRecipient = false) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        if (isRecipient) {
          setRecipientDetails(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        } else {
          setNewAddress(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } else {
        alert("Invalid Pincode");
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
      alert("Failed to fetch address details. Please try again.");
    }
  };

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

  const calculateSubtotal = () => {
    return cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0);
  };

  const calculateFinalPrice = () => {
    const subtotal = calculateSubtotal();
    const deliveryCharge = calculateDeliveryCharge();
    return subtotal - discountAmount + deliveryCharge;
  };

  const handlePlaceOrder = async (isPaid = false) => {
    if (deliveryOption === "self" && !consumerprofile.address) {
      alert("Please add an address.");
      return;
    }
  
    if (deliveryOption === "other" && !selectedRecipientAddress) {
      alert("Please select or add a recipient address.");
      return;
    }
  
    try {

      // Extract pincode from address for self delivery
      let pincode = '';
      if (deliveryOption === "self") {
        const addressParts = consumerprofile.address.split(', ');
        const lastPart = addressParts[addressParts.length - 1];
        const pincodeMatch = lastPart.match(/- (\d+)$/);
        pincode = pincodeMatch ? pincodeMatch[1] : '';
      }
      const orderData = {
        consumer_id: consumerprofile.consumer_id,
        name: consumerprofile.name,
        mobile_number: consumerprofile.mobile_number,
        email: consumerprofile.email,
        produce_name: cart.map(p => p.product_name).join(", "),
        quantity: cart.reduce((total, p) => total + p.quantity, 0),
        amount: calculateFinalPrice(),
        is_self_delivery: deliveryOption === "self",
        payment_status: isPaid ? 'Paid' : 'Pending',
        payment_method: isPaid ? 'razorpay' : 'cash-on-delivery',
      };
  
      if (deliveryOption === "other") {
        const selectedRecipient = savedRecipientAddresses.find(
          addr => addr.id === selectedRecipientAddress
        );
        
        orderData.recipient_name = selectedRecipient ? selectedRecipient.name : recipientDetails.name;
        orderData.recipient_phone = selectedRecipient ? selectedRecipient.phone : recipientDetails.phone;
        orderData.address = selectedRecipient ? 
          selectedRecipient.address : 
          `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;
          orderData.pincode = selectedRecipient ? 
          selectedRecipient.details.pincode : 
          recipientDetails.pincode;
      } else {
        orderData.address = consumerprofile.address;
        orderData.pincode = pincode;
      }
  
      const response = await fetch("http://localhost:5000/api/place-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Order failed. Try again.");
      }
  
      if (data.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          localStorage.removeItem(`cart_${consumerprofile.consumer_id}`);
          navigate("/consumer-dashboard");
        }, 3000);
      } else {
        throw new Error(data.message || "Order processing failed");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert(`Error placing order: ${error.message}`);
    }
  };
 
const handleRazorpayPayment = async () => {
  try {
    // Validate prerequisites
    if (deliveryOption === "self" && !consumerprofile.address) {
      alert("Please add an address.");
      return;
    }

    if (deliveryOption === "other" && !selectedRecipientAddress && !recipientDetails.street) {
      alert("Please select or add a recipient address.");
      return;
    }

    const finalAmount = calculateFinalPrice();
    if (finalAmount <= 0) {
      alert("Invalid order amount.");
      return;
    }

    // 1. First create the order in your database
    const orderResponse = await fetch("http://localhost:5000/api/place-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        consumer_id: consumerprofile.consumer_id,
        name: consumerprofile.name,
        mobile_number: consumerprofile.mobile_number,
        email: consumerprofile.email,
        produce_name: cart.map(p => p.product_name).join(", "),
        quantity: cart.reduce((total, p) => total + p.quantity, 0),
        amount: finalAmount,
        is_self_delivery: deliveryOption === "self",
        payment_method: 'razorpay',
        payment_status: 'Pending',
        notes: {
          cart_items: JSON.stringify(cart),
          delivery_type: deliveryOption,
          consumer_id: consumerprofile.consumer_id,
        },
        address: deliveryOption === "self" ? consumerprofile.address : 
          `${recipientDetails.street}, ${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`,
        pincode: deliveryOption === "self" ? newAddress.pincode : recipientDetails.pincode,
        recipient_name: deliveryOption === "other" ? 
          (selectedRecipientAddress 
            ? savedRecipientAddresses.find(a => a.id === selectedRecipientAddress)?.name 
            : recipientDetails.name) 
          : null,
        recipient_phone: deliveryOption === "other" ? 
          (selectedRecipientAddress 
            ? savedRecipientAddresses.find(a => a.id === selectedRecipientAddress)?.phone 
            : recipientDetails.phone) 
          : null
      })
    });

    const orderResult = await orderResponse.json();
    
    if (!orderResult.success || !orderResult.order_id) {
      throw new Error(orderResult.error || "Failed to create order");
    }

    // 2. Create Razorpay order
    const razorpayResponse = await fetch('http://localhost:5000/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        amount: finalAmount,
        order_id: orderResult.order_id,notes: {
          internal_order_id: orderResult.order_id,
          consumer_id: consumerprofile.consumer_id
        }
      })
    });

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok || !razorpayData.order) {
      throw new Error(razorpayData.error || "Payment gateway error");
    }

    // 3. Initialize Razorpay checkout
    const options = {
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_VLCfnymiyd6HGf',
      amount: razorpayData.order.amount,
      currency: razorpayData.order.currency,
      order_id: razorpayData.order.id,
      name: 'KrishiSetu',
      description: 'Farm Fresh Products',
      image: '', // Use absolute URL to your logo
      handler: async (response) => {
        try {
          // 4. Verify payment
          const verificationResponse = await fetch('http://localhost:5000/api/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderResult.order_id,
              amount: razorpayData.order.amount
            })
          });

          const verificationData = await verificationResponse.json();
          
          if (!verificationData.success) {
            throw new Error(verificationData.error || 'Payment verification failed');
          }

          // Payment successful
          setShowSuccessPopup(true);
          localStorage.removeItem(`cart_${consumerprofile.consumer_id}`);
          setTimeout(() => navigate("/consumer-dashboard"), 3000);

        } catch (error) {
          console.error('Payment verification failed:', error);
          alert(`Payment verification failed: ${error.message}`);
        }
      },
      prefill: {
        name: consumerprofile?.name || '',
        email: consumerprofile?.email || '',
        contact: consumerprofile?.mobile_number || ''
      },
      theme: {
        color: '#3399cc',
        hide_topbar:true
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
// Helper functions
const createRazorpayOrder = async (amount) => {
  try {
    const response = await fetch('http://localhost:5000/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        amount, 
        currency: 'INR' 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
};

const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch('http://localhost:5000/api/razorpay/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Verification failed:', data);
      throw new Error(data.error || 'Payment verification failed');
    }

    return data;
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
};

  const handlePincodeChange = (e, isRecipient = false) => {
    const pincode = e.target.value;
    if (isRecipient) {
      setRecipientDetails(prev => ({ ...prev, pincode }));
      if (pincode.length === 6) fetchAddressDetails(pincode, true);
    } else {
      setNewAddress(prev => ({ ...prev, pincode }));
      if (pincode.length === 6) fetchAddressDetails(pincode);
    }
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
        consumer_id: consumerprofile.consumer_id,
        street: newAddress.street,
        landmark: newAddress.landmark || "",
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        address: fullAddress
      };
  
      const response = await fetch("http://localhost:5000/api/update-address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update address");
      }
      
      setConsumerProfile(prev => ({
        ...prev,
        address: fullAddress
      }));
      
      setShowAddressPopup(false);
      alert("Address updated successfully!");
  
    } catch (error) {
      console.error("Update error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSaveRecipientDetails = async () => {
    try {
      if (!recipientDetails.name || 
          !recipientDetails.phone || 
          !recipientDetails.pincode || 
          !recipientDetails.city || 
          !recipientDetails.state || 
          !recipientDetails.street) {
        alert("Please fill all recipient details.");
        return;
      }

      const fullAddress = `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;

      if (editingRecipientId) {
        const updatedAddresses = savedRecipientAddresses.map(addr => 
          addr.id === editingRecipientId ? {
            ...addr,
            name: recipientDetails.name,
            phone: recipientDetails.phone,
            address: fullAddress,
            details: {...recipientDetails}
          } : addr
        );
        setSavedRecipientAddresses(updatedAddresses);
        saveRecipientAddressesToStorage(updatedAddresses);
      } else {
        const recipientAddress = {
          id: Date.now(),
          name: recipientDetails.name,
          phone: recipientDetails.phone,
          address: fullAddress,
          details: {...recipientDetails}
        };
        const newAddresses = [...savedRecipientAddresses, recipientAddress];
        setSavedRecipientAddresses(newAddresses);
        saveRecipientAddressesToStorage(newAddresses);
        setSelectedRecipientAddress(recipientAddress.id);
      }

      setRecipientDetails({
        name: "",
        phone: "",
        pincode: "",
        city: "",
        state: "",
        street: "",
        landmark: "",
      });
      setEditingRecipientId(null);
      alert(`Recipient details ${editingRecipientId ? 'updated' : 'saved'} successfully!`);

    } catch (error) {
      console.error("Error saving recipient details:", error);
      alert("Failed to save recipient details. Please try again.");
    }
  };

  const saveRecipientAddressesToStorage = (addresses) => {
    localStorage.setItem('recipientAddresses', JSON.stringify(addresses));
  };

  const loadRecipientAddressesFromStorage = () => {
    const saved = localStorage.getItem('recipientAddresses');
    return saved ? JSON.parse(saved) : [];
  };

  useEffect(() => {
    if (savedRecipientAddresses.length > 0) {
      saveRecipientAddressesToStorage(savedRecipientAddresses);
    }
  }, [savedRecipientAddresses]);

  const handleEditRecipient = (id) => {
    const recipient = savedRecipientAddresses.find(addr => addr.id === id);
    if (recipient) {
      setRecipientDetails({
        name: recipient.name,
        phone: recipient.phone,
        pincode: recipient.details.pincode,
        city: recipient.details.city,
        state: recipient.details.state,
        street: recipient.details.street,
        landmark: recipient.details.landmark || "",
      });
      setEditingRecipientId(id);
    }
  };

  const handleDeleteRecipient = (id) => {
    if (window.confirm("Are you sure you want to delete this recipient address?")) {
      const updatedAddresses = savedRecipientAddresses.filter(addr => addr.id !== id);
      setSavedRecipientAddresses(updatedAddresses);
      saveRecipientAddressesToStorage(updatedAddresses);
      
      if (selectedRecipientAddress === id) {
        setSelectedRecipientAddress(null);
      }
    }
  };

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
  
        <div className="krishi-summary-section">
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
  
          <div className="krishi-address-card">
            <h3 className="krishi-card-title">
              <FaMapMarkerAlt className="krishi-card-icon" />
              Delivery Address
            </h3>
            
            <div className="krishi-delivery-options">
              <label className="krishi-delivery-option">
                <input
                  type="radio"
                  name="delivery"
                  value="self"
                  checked={deliveryOption === "self"}
                  onChange={() => setDeliveryOption("self")}
                />
                <span>For Myself</span>
              </label>
              <label className="krishi-delivery-option">
                <input
                  type="radio"
                  name="delivery"
                  value="other"
                  checked={deliveryOption === "other"}
                  onChange={() => setDeliveryOption("other")}
                />
                <span>For Someone Else</span>
              </label>
            </div>
  
            {deliveryOption === "other" ? (
              <div className="krishi-recipient-section">
                {savedRecipientAddresses.length > 0 && (
                  <div className="krishi-recipient-address-list">
                    <h4>Saved Recipient Addresses:</h4>
                    {savedRecipientAddresses.map(address => (
                      <div 
                        key={address.id}
                        className={`krishi-address-item ${selectedRecipientAddress === address.id ? 'krishi-selected' : ''}`}
                        onClick={() => setSelectedRecipientAddress(address.id)}
                      >
                        <div className="krishi-address-details">
                          <h4><FaUser /> {address.name}</h4>
                          <p><FaPhone /> {address.phone}</p>
                          <p>{address.address}</p>
                        </div>
                        <div className="krishi-address-actions">
                          <button 
                            className="krishi-edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRecipient(address.id);
                            }}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="krishi-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecipient(address.id);
                            }}
                          >
                            <FaTrash />Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {editingRecipientId !== null || savedRecipientAddresses.length === 0 ? (
                  <div className="krishi-recipient-form">
                    <h4>{editingRecipientId ? "Edit Recipient" : "Add Recipient Details"}</h4>
                    <div className="krishi-form-group">
                      <label>Recipient Name </label>
                      <input
                        type="text"
                        placeholder="Enter recipient name"
                        value={recipientDetails.name}
                        onChange={(e) => setRecipientDetails({...recipientDetails, name: e.target.value})}
                      />
                    </div>
                    <div className="krishi-form-group">
                      <label>Recipient Phone </label>
                      <input
                        type="text"
                        placeholder="Enter recipient phone number"
                        value={recipientDetails.phone}
                        onChange={(e) => setRecipientDetails({...recipientDetails, phone: e.target.value})}
                      />
                    </div>
                    <div className="krishi-form-group">
                      <label>Pincode </label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit pincode"
                        value={recipientDetails.pincode}
                        onChange={(e) => handlePincodeChange(e, true)}
                        maxLength="6"
                      />
                    </div>
                    <div className="krishi-form-group">
                      <label>City </label>
                      <input 
                        type="text" 
                        placeholder="City" 
                        value={recipientDetails.city} 
                        readOnly 
                      />
                    </div>
                    <div className="krishi-form-group">
                      <label>State </label>
                      <input 
                        type="text" 
                        placeholder="State" 
                        value={recipientDetails.state} 
                        readOnly 
                      />
                    </div>
                    <div className="krishi-form-group">
                      <label>Street Address </label>
                      <input
                        type="text"
                        placeholder="House no, Building, Street"
                        value={recipientDetails.street}
                        onChange={(e) => setRecipientDetails({...recipientDetails, street: e.target.value})}
                      />
                    </div>
                    <div className="krishi-form-group">
                      <label>Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="Nearby landmark"
                        value={recipientDetails.landmark}
                        onChange={(e) => setRecipientDetails({...recipientDetails, landmark: e.target.value})}
                      />
                    </div>
                    <button 
                      className="krishi-save-recipient-btn"
                      onClick={handleSaveRecipientDetails}
                    >
                      {editingRecipientId ? "Update Recipient" : "Save Recipient"}
                    </button>
                    {editingRecipientId && (
                      <button 
                        className="krishi-cancel-btn"
                        onClick={() => {
                          setEditingRecipientId(null);
                          setRecipientDetails({
                            name: "",
                            phone: "",
                            pincode: "",
                            city: "",
                            state: "",
                            street: "",
                            landmark: "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    className="krishi-add-recipient-btn"
                    onClick={() => {
                      setRecipientDetails({
                        name: "",
                        phone: "",
                        pincode: "",
                        city: "",
                        state: "",
                        street: "",
                        landmark: "",
                      });
                      setEditingRecipientId(null);
                    }}
                  >
                  </button>
                )}
              </div>
            ) : (
              <>
                {consumerprofile?.address ? (
                  <div className="krishi-address-display">
                    <div className="krishi-address-details">
                      <h4><FaUser /> {consumerprofile?.name || "Loading..."}</h4>
                      <p><FaPhone /> {consumerprofile?.mobile_number || "Loading..."}</p>
                      <p>{consumerprofile.address}</p>
                    </div>
                  </div>
                ) : (
                  <p className="krishi-no-address">No saved address found.</p>
                )}
                <button 
                  className="krishi-add-address-btn"
                  onClick={() => setShowAddressPopup(true)}
                >
                  {consumerprofile?.address ? "Update Address" : "Add Address"}
                </button>
              </>
            )}
          </div>

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
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                <span>Pay Now (Credit/Debit/UPI)</span>
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
            {/* {paymentMethod === "razorpay" && (
              <div className="razorpay-embed-btn" 
                   data-url="https://pages.razorpay.com/pl_QGSNwHvRphGTJO/view" 
                   data-text="Pay Now" 
                   data-color="#528FF0" 
                   data-size="large">
                <script>
                  {`
                    (function(){
                      var d=document; var x=!d.getElementById('razorpay-embed-btn-js')
                      if(x){ var s=d.createElement('script'); s.defer=!0;s.id='razorpay-embed-btn-js';
                      s.src='https://cdn.razorpay.com/static/embed_btn/bundle.js';d.body.appendChild(s);} else{var rzp=window['_rzp_'];
                      rzp && rzp.init && rzp.init()}})();
                  `}
                </script>
              </div>
            )} */}
          </div>

          <div className="krishi-total-card">
  <h3 className="krishi-card-title">
    <GiFarmer className="krishi-card-icon" />
    Order Summary
  </h3>
  <div className="krishi-total-row">
    <span>Subtotal:</span>
    <span><FaRupeeSign /> {calculateSubtotal()}</span>
  </div>
  {discountAmount > 0 && (
    <div className="krishi-total-row">
      <span>Discount:</span>
      <span className="krishi-discount">- <FaRupeeSign /> {discountAmount}</span>
    </div>
  )}
  <div className="krishi-total-row">
    <span>Delivery Charge:</span>
    <span>
      {calculateDeliveryCharge() === 0 ? (
        <span className="krishi-free-delivery">FREE</span>
      ) : (
        <span><FaRupeeSign /> {calculateDeliveryCharge()}</span>
      )}
    </span>
  </div>
  <div className="krishi-total-row krishi-grand-total">
    <span>Total:</span>
    <span><FaRupeeSign /> {calculateFinalPrice()}</span>
  </div>
  <button 
    className="krishi-place-order-btn"
    onClick={() => {
      if (paymentMethod === 'razorpay') {
        handleRazorpayPayment();
      } else {
        handlePlaceOrder();
      }
    }}
  >
    {paymentMethod === 'razorpay' ? `Pay ₹${calculateFinalPrice()}` : 'Place Order (Cash on Delivery)'}
  </button>
</div>
        </div>
      </div>
  
      {showAddressPopup && (
        <div className="krishi-address-popup">
          <div className="krishi-popup-content">
            <h3>
              <FaMapMarkerAlt /> {consumerprofile?.address ? "Update Address" : "Add New Address"}
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
                onChange={(e) => handlePincodeChange(e)}
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
                onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
              />
            </div>
            <div className="krishi-popup-field">
              <label>Landmark (Optional)</label>
              <input
                type="text"
                placeholder="Nearby landmark"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
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
                {consumerprofile?.address ? "Update Address" : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
  
      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default KrishiOrderPage;