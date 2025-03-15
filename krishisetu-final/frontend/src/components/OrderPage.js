import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderPage.css"; // CSS for styling
import logo from '../assets/logo.jpg';
import axios from "axios"; // ✅ Import axios

const OrderPage = () => {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [consumer_id, setConsumerId] = useState(null);
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
    const storedId = localStorage.getItem("consumer_id");
    if (storedId) {
      setConsumerId(storedId); // Set the consumer_id state
    }
  }, []);
 
    useEffect(() => {
      if (!consumer_id) {
        console.warn("⚠ Consumer ID is missing. Cannot fetch data.");
        return;
      }
  
      const fetchConsumerData = async () => {
        try {
          // Fetch Consumer Profile
          const profileResponse = await fetch(`http://localhost:5000/api/consumerdetails/${consumer_id}`);
          if (!profileResponse.ok) throw new Error("Failed to fetch consumer profile");
          const profileData = await profileResponse.json();
          console.log("✅ Fetched Consumer Profile:", profileData);
  
          // Fetch Consumer Address
          const addressResponse = await fetch(`http://localhost:5000/api/consumeraddress/${consumer_id}`);
          if (!addressResponse.ok) throw new Error("Failed to fetch addresses");
          const addressData = await addressResponse.json();
          console.log("✅ Fetched Addresses:", addressData);
  
          // Update State
          setConsumerProfile(profileData);
          setAddresses(addressData);
  
        } catch (error) {
          console.error("❌ Error fetching consumer data:", error);
        }
      };
  
      fetchConsumerData();
  }, [consumer_id]);
  useEffect(() => {
    if (showAddressPopup) {
      axios
        .get("http://localhost:5000/api/consumerdetails/KRST01CS011")
        .then((response) => {
          setConsumerProfile(response.data); // Assuming response.data contains consumer details
        })
        .catch((error) => {
          console.error("Error fetching consumer profile:", error);
        });
    }
  }, [showAddressPopup]); 
  // Fetch cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Handle pincode input change
  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setNewAddress((prev) => ({ ...prev, pincode }));
    if (pincode.length === 6) {
      fetchAddressDetails(pincode);
    }
  };

  // Fetch address details using Pincode API
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
      phone_number: consumerprofile.phone_number || "", 
      pincode: newAddress.pincode || "", 
      city: newAddress.city || "",
      state: newAddress.state || "",
      street: newAddress.street || "",
      landmark: newAddress.landmark || ""
    };

    console.log("Consumer Profile:", consumerprofile);
    console.log("Final Address Object:", newAddressObj);
    console.log("Sending data to:", "http://localhost:5000/api/addresses");

    try {
      const response = await fetch("http://localhost:5000/api/addresses", {
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

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select an address.");
      return;
    }
  
    // Ensure consumerprofile is populated
    if (!consumerprofile.consumer_id || !consumerprofile.name || !consumerprofile.mobile_number || !consumerprofile.email) {
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
        consumer_id: consumerprofile.consumer_id, // Use consumerprofile
        name: consumerprofile.name, // Use consumerprofile
        mobile_number: consumerprofile.mobile_number, // Use consumerprofile
        email: consumerprofile.email, // Use consumerprofile
        address: `${selectedAddrObj.street}, ${selectedAddrObj.landmark}, ${selectedAddrObj.city}, ${selectedAddrObj.state}`,
        pincode: selectedAddrObj.pincode,
        produce_name: cart.map((product) => product.product_name).join(", "),
        quantity: cart.reduce((total, product) => total + product.quantity, 0),
        amount: totalPrice,
        status: "Pending",
        payment_status: "Pending",
      };
  
      console.log("Sending order data:", orderData); // Log the order data
  
      const response = await fetch("http://localhost:5000/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
  
      const data = await response.json();
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

  return (
    <div className="order-page">
      <h2>Order Summary</h2>

      {/* List of Products */}
      <div className="order-products">
        <h3>Products</h3>
        {cart.map((product) => (
          <div key={product.product_id} className="order-item">
            <img
              src={product.image || "/default-image.jpg"}
              alt={product.product_name}
              className="order-product-image"
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

      {/* Address Selection */}
      <div className="address-section">
  <h3>Select Delivery Address</h3>
  {addresses.length === 0 ? (
    <p>No addresses found. Please add a new address.</p>
  ) : (
    addresses.map((address) => (
      <div key={address.id} className="address-card">
        <label>
          <input
            type="radio"
            name="address"
            value={address.id}
            checked={selectedAddress === address.id}
            onChange={() => setSelectedAddress(address.id)}
          />
         <div className="address-details">
                  <h4>Name: {consumerprofile.name}</h4>
                  <p>Phone: {consumerprofile.phone_number}</p>
                  <p>Consumer ID: {consumerprofile.consumer_id}</p>
                  <p>{address.street}, {address.landmark}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
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
      <p><strong>Consumer ID:</strong> {consumerprofile?.consumer_id || "N/A"}</p>
      <p><strong>Name:</strong> {consumerprofile?.name || "N/A"}</p>
      <p><strong>Phone Number:</strong> {consumerprofile?.phone_number || "N/A"}</p>

      <input
        type="text"
        placeholder="Pincode"
        value={newAddress.pincode}
        onChange={handlePincodeChange}
      />
      <input
        type="text"
        placeholder="City"
        value={newAddress.city}
        readOnly
      />
      <input
        type="text"
        placeholder="State"
        value={newAddress.state}
        readOnly
      />
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
        <p>Total Items: {cart.length}</p>
        <p>Total Price: ₹ {cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0)}</p>
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