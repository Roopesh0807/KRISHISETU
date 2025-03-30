import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderPage.css"; // CSS for styling
import { useAuth } from "../context/AuthContext";
import logo from '../assets/logo.jpg';
// import axios from "axios"; // ✅ Import axios

const OrderPage = () => {
  const [cart, setCart] = useState([]);
  const [, setConsumer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  // const [consumer_id] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const { consumer } = useAuth(); // Make sure this hook is correctly providing the value

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
    { code: "AGRICULTURE5", discount: 5 },
    { code: "NATURE12", discount: 12 },
    { code: "ECO18", discount: 18 },
    { code: "SOIL22", discount: 22 },
  ];
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

  // Fetch consumer profile and addresses
  useEffect(() => {
    // Load consumer from localStorage
    const storedConsumer = localStorage.getItem("consumer");
    
    if (storedConsumer) {
      const parsedConsumer = JSON.parse(storedConsumer);
      console.log("✅ Loaded Consumer:", parsedConsumer);
      
      if (parsedConsumer?.consumer_id) {
        setConsumer(parsedConsumer);

        // Load cart based on consumer_id
        const storedCart = localStorage.getItem(`cart_${parsedConsumer.consumer_id}`);
        const parsedCart = storedCart ? JSON.parse(storedCart) : [];

        console.log("🛒 Loaded Cart from localStorage:", parsedCart);
        setCart(parsedCart);
      } else {
        console.warn("⚠ Consumer ID is missing in stored consumer data.");
      }
    } else {
      console.warn("⚠ No consumer data found in localStorage.");
    }
  }, []);
  useEffect(() => {
    // Ensure consumer exists and has a valid consumer_id before attempting to fetch data
    if (!consumer || !consumer.consumer_id) {
      console.log("❌ consumer_id is missing, cannot fetch data");
      return; // Return early if consumer_id is null or undefined
    }

    const fetchConsumerData = async () => {
      try {
        console.log(`Fetching consumer data for ID: ${consumer.consumer_id}`);
        const response = await fetch(`http://localhost:5000/api/addresses/${consumer.consumer_id}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        setConsumerProfile(data.consumerProfile || null);
        setAddresses(data.address ? [data.address] : []);
      } catch (error) {
        console.error("❌ Error fetching consumer data:", error);
      }
    };

    fetchConsumerData();
  }, [consumer]);  // Dependency array: This effect will run when 'consumer' changes

  useEffect(() => {
    if (showAddressPopup && consumerprofile.consumer_id) {
      console.log("✅ Using existing consumer profile:", consumerprofile);
    }
  }, [showAddressPopup, consumerprofile]);
  
  // Fetch cart from localStorage
  useEffect(() => {
    // Ensure consumer and consumer.consumer_id are available before attempting to fetch the cart
    if (consumer && consumer.consumer_id) {
      const storedCart = localStorage.getItem(`cart_${consumer.consumer_id}`);
      setCart(storedCart ? JSON.parse(storedCart) : []);
    }
  }, [consumer]);  // Re-run effect when consumer changes

  // Handle pincode input change
  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setNewAddress((prev) => ({ ...prev, pincode }));
    if (pincode.length === 6) {
      fetchAddressDetails(pincode);
    }
  };
  // const handleCouponSelect = (coupon) => {
  //   setSelectedCoupon(coupon);
  // };
  // Handle coupon input change
  const handleCouponInputChange = (e) => {
    setCouponInput(e.target.value);
    setCouponError("");
  };

  // Apply coupon
  const applyCoupon = () => {
    const coupon = coupons.find((c) => c.code === couponInput.toUpperCase());
    if (coupon) {
      setSelectedCoupon(coupon);
      setDiscountAmount(cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0) * coupon.discount / 100);
      setCouponApplied(true); // Set coupon applied status to true
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Please try again.");
    }
  };
  // Fetch address details using Pincode API
  const fetchAddressDetails = async (pincode) => {
    if (newAddress.pincode === pincode) return;
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
    }
  };
  console.log("Consumer Profile Data:", consumerprofile);
  // Handle add new address
  const handleAddAddress = async () => {
    if (!consumerprofile || !consumerprofile.consumer_id) {
      console.error("Consumer profile not found or incomplete.");
      alert("Consumer profile not found. Please try again.");
      return;
    }

    // Ensure all fields are properly filled
    const newAddressObj = {
      consumer_id: consumerprofile.consumer_id,  
      name: consumerprofile.name || "",          
      mobile_number: consumerprofile.mobile_number || "", 
      pincode: newAddress.pincode || "", 
      city: newAddress.city || "",
      state: newAddress.state || "",
      street: newAddress.street || "",
      landmark: newAddress.landmark || ""
    };

    // Validate address data before submitting
  if (!newAddressObj.pincode || !newAddressObj.city || !newAddressObj.state || !newAddressObj.street) {
    alert("Please fill in all address fields.");
    return;
  }
   
    console.log("Final Address Object:", newAddressObj);
    console.log("Sending data to:", `http://localhost:5000/api/addresses/${consumerprofile.consumer_id}`);
   

    try {
      const response = await fetch(`http://localhost:5000/api/addresses/${consumerprofile.consumer_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddressObj),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        alert("Failed to add address. Please check your details and try again.");
        return;
      }

      const savedAddress = await response.json();
      setAddresses((prevAddresses) => [...prevAddresses, savedAddress]); 

      // Reset form and close popup
      setNewAddress({ pincode: "", city: "", state: "", street: "", landmark: "" });
      setShowAddressPopup(false);

      alert("Address added successfully!");
      console.log("Address added successfully:", savedAddress);
    } catch (error) {
      console.error("Network or Server Error:", error);
      alert("Something went wrong. Please try again later.");
    }
};
 // Calculate final price
 const calculateFinalPrice = () => {
  const totalPrice = cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0);
  let discountAmount = 0;
  if (selectedCoupon) {
    discountAmount = (totalPrice * selectedCoupon.discount) / 100;
  }
  return totalPrice - discountAmount;
};

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address.");
      return;
    }
  
    // Ensure consumerprofile is populated
    if (!consumerprofile.consumer_id || !consumerprofile.name || !consumerprofile.mobile_number) {
      alert("Consumer profile data is incomplete. Please try again.");
      return;
    }
  
    try {
      const totalPrice = cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0);
      const selectedAddrObj = addresses.find((addr) => addr.id === selectedAddress);
  
      if (!selectedAddrObj) {
        alert("Invalid address selection. Please try again.");
        return;
      }
  
      const orderData = {
        consumer_id: consumerprofile.consumer_id,
        name: consumerprofile.name,
        mobile_number: consumerprofile.mobile_number,
        email: consumerprofile.email,
        address: `${selectedAddrObj.street}, ${selectedAddrObj.landmark}, ${selectedAddrObj.city}, ${selectedAddrObj.state}`,
        pincode: selectedAddrObj.pincode,
        produce_name: cart.map((product) => product.product_name).join(", "),
        quantity: cart.reduce((total, product) => total + product.quantity, 0),
        amount: totalPrice,
        status: "Pending",
        payment_status: "Pending",
      };
  
      console.log("Sending order data:", orderData);
  
      const response = await fetch("http://localhost:5000/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
  
      const data = await response.json();
      console.log("Order response:", data);
  
      if (data.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          localStorage.removeItem("cart");
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
    <div className="success-popup">
      <div className="popup-content">
        <div className="logo-text-container">
          <img src={logo} alt="KrishiSetu Logo" className="logo" />
          <h2>KrishiSetu</h2>
        </div>
        <p>Order placed successfully!<br />Thank you for your order. Have a good day!</p>
      </div>
    </div>
  );
 // Function to get the correct image path
 const getImagePath = (productName) => {
  return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
};

  return (
    <div className="order-page">
      <h2>Order Summary</h2>

                  {/* List of Products */}
          <div className="order-products">
            <h3>Products</h3>
            {cart.map((product) => (
              <div key={product.product_id} className="order-item">
                <img
            src={getImagePath(product.product_name)}
            alt={product.product_name}
            className="order-product-image"
            onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
          />

      <div className="order-product-details">
        <h4>{product.product_name}</h4>
        <p>₹ {product.price_1kg}/1 kg</p>
        <p>Quantity: {product.quantity} Kg</p>
        <p>Total: ₹ {product.price_1kg * product.quantity}</p>
      </div>
    </div>
  ))}
</div>
{/* Coupon Section */}
<div className="coupon-section">
        <h3>Apply Coupon</h3>
        <div className="coupon-options">
          {/* Combined Input and Datalist for Coupons */}
          <input
            type="text"
            list="coupon-list"
            placeholder="Enter or select a coupon"
            value={couponInput}
            onChange={handleCouponInputChange}
            disabled={couponApplied} // Disable input if coupon is applied
          />
          <datalist id="coupon-list">
            {coupons.map((coupon) => (
              <option key={coupon.code} value={coupon.code}>
                {coupon.code} - {coupon.discount}% OFF
              </option>
            ))}
          </datalist>
          <button onClick={applyCoupon} disabled={couponApplied}>
            Apply
          </button>
        </div>
        {couponApplied && <p className="coupon-success">Coupon applied successfully!</p>}
        {couponError && <p className="coupon-error">{couponError}</p>}
      </div>

      {/* Address Selection */}
      <div className="address-section">
  <h3>Select Delivery Address</h3>
  {
  addresses.length === 0 ? (
    <p>No addresses found. Please add a new address.</p>
  ) : (
    addresses.map((address, index) => (
      <div key={`${address.consumer_id}-${address.pincode}-${index}`} className="address-card">
        <label>
          <input
            type="radio"
            name="address"
            value={address.consumer_id}
            checked={selectedAddress === address.consumer_id}
            onChange={() => setSelectedAddress(address.consumer_id)}
          />
          <div className="address-details">
        <h4>Name: {consumerprofile?.name || "Loading..."}</h4>
        <p>Phone: {consumerprofile?.mobile_number || "Loading..."}</p>
        <p>Consumer ID: {consumerprofile?.consumer_id || "Loading..."}</p>
        <p>{address?.street || "N/A"}, {address?.landmark || "N/A"}</p>
        <p>{address?.city || "N/A"}, {address?.state || "N/A"} - {address?.pincode || "N/A"}</p>
      </div>
        </label>
      </div>
    ))
  )}
  <button className="add-address-btn" onClick={() => setShowAddressPopup(true)}>
    Add New Address
  </button>
</div>

{showAddressPopup && (
  <div className="address-popup">
    <div className="popup-content1">
      <h3>Add New Address</h3>
      <p><strong>Consumer ID:</strong> {consumerprofile?.consumer_id || "Fetching..."}</p>
      <p><strong>Name:</strong> {consumerprofile?.name || "Fetching..."}</p>
      <p><strong>Phone Number:</strong> {consumerprofile?.mobile_number || "Fetching..."}</p>

      <input
        type="text"
        placeholder="Pincode"
        value={newAddress.pincode}
        onChange={handlePincodeChange}
      />
      <input type="text" placeholder="City" value={newAddress.city} readOnly />
      <input type="text" placeholder="State" value={newAddress.state} readOnly />
      <input
        type="text"
        placeholder="Street"
        value={newAddress.street}
        onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
      />
      <input
        type="text"
        placeholder="Landmark (Optional)"
        value={newAddress.landmark}
        onChange={(e) => setNewAddress((prev) => ({ ...prev, landmark: e.target.value }))}
      />
      <button onClick={handleAddAddress}>Save Address</button>
      <button onClick={() => setShowAddressPopup(false)}>Cancel</button>
    </div>
  </div>
)}

     

      {/* Payment Method Selection */}
      <div className="payment-section">
        <h3>Select Payment Method</h3>
        <div className="payment-methods">
          <label>
            <input
              type="radio"
              name="payment"
              value="credit-card"
              checked={paymentMethod === "credit-card"}
              onChange={() => setPaymentMethod("credit-card")}
            />
            Credit Card
          </label>
          <label>
            <input
              type="radio"
              name="payment"
              value="upi"
              checked={paymentMethod === "upi"}
              onChange={() => setPaymentMethod("upi")}
            />
            UPI
          </label>
          <label>
            <input
              type="radio"
              name="payment"
              value="cash-on-delivery"
              checked={paymentMethod === "cash-on-delivery"}
              onChange={() => setPaymentMethod("cash-on-delivery")}
            />
            Cash on Delivery
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <p>Total Price: ₹ {cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0)}</p>
        <p>Discount: ₹ {discountAmount}</p>
        <p><strong>Final Price: ₹ {calculateFinalPrice()}</strong></p>
      </div>
      {/* Place Order Button */}
      <button className="place-order-btn" onClick={handlePlaceOrder}>
        Place Order
      </button>

      {/* Success Popup */}
      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default OrderPage;
