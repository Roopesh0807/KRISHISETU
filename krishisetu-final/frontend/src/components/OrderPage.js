

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./OrderPage.css";
// import { useAuth } from "../context/AuthContext";
// import logo from '../assets/logo.jpg';
// import { FaLeaf, FaTractor, FaShoppingBasket, FaRupeeSign, FaMapMarkerAlt, FaCreditCard, FaPhone, FaUser, FaEdit, FaTrash } from "react-icons/fa";
// import { GiFarmer } from "react-icons/gi";
// import { BsCheckCircleFill } from "react-icons/bs";

// const KrishiOrderPage = () => {
//   const [cart, setCart] = useState([]);
//   // const [addresses, setAddresses] = useState([]);
//   // const [selectedAddress] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState("credit-card");
//   const [showAddressPopup, setShowAddressPopup] = useState(false);
//   const [selectedCoupon, setSelectedCoupon] = useState(null);
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [couponInput, setCouponInput] = useState("");
//   const [couponError, setCouponError] = useState("");
//   const [couponApplied, setCouponApplied] = useState(false);
//   const { consumer } = useAuth();
//   // Add this state to track saved recipient addresses
// const [savedRecipientAddresses, setSavedRecipientAddresses] = useState([]);
// const [selectedRecipientAddress, setSelectedRecipientAddress] = useState(null);
// const [editingRecipientId, setEditingRecipientId] = useState(null);
// // const [showRecipientForm, setShowRecipientForm] = useState(false);
//   const [newAddress, setNewAddress] = useState({
//     pincode: "",
//     city: "",
//     state: "",
//     street: "",
//     landmark: "",
//   });
//   const [recipientDetails, setRecipientDetails] = useState({
//     name: "",
//     phone: "",
//     pincode: "",
//     city: "",
//     state: "",
//     street: "",
//     landmark: "",
//   });
//   const [deliveryOption, setDeliveryOption] = useState("self");
//   const [consumerprofile, setConsumerProfile] = useState({});
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//   const navigate = useNavigate();

//   const coupons = [
//     { code: "KRISHI10", discount: 10 },
//     { code: "FARMFRESH15", discount: 15 },
//     { code: "HARVEST20", discount: 20 },
//     { code: "ORGANIC25", discount: 25 },
//     { code: "GREEN30", discount: 30 },
//     { code: "FRESH35", discount: 35 },
//     { code: "VEGGIE40", discount: 40 },
//     { code: "FARM50", discount: 50 },
//   ];

//   useEffect(() => {
//     const storedConsumer = localStorage.getItem("consumer");
//     if (storedConsumer) {
//       const parsedConsumer = JSON.parse(storedConsumer);
//       if (parsedConsumer?.consumer_id) {
//         const storedCart = localStorage.getItem(`cart_${parsedConsumer.consumer_id}`);
//         setCart(storedCart ? JSON.parse(storedCart) : []);
//       }
//     }
//   }, []);

//  // Load saved addresses on component mount
//  useEffect(() => {
//   const loadedAddresses = loadRecipientAddressesFromStorage();
//   if (loadedAddresses.length > 0) {
//     setSavedRecipientAddresses(loadedAddresses);
//   }
// }, []);



//   useEffect(() => {
//     if (!consumer || !consumer.consumer_id) return;

//     const fetchConsumerProfile = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/consumerprofile/${consumer.consumer_id}`,{
//           headers: {
         
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${consumer?.token}`,
//           }
//         });
//         if (!response.ok) throw new Error("Failed to fetch profile");
//         const data = await response.json();
//         setConsumerProfile(data);
        
//         // If address exists, parse it to pre-fill the form
//         if (data.address) {
//           const addressParts = data.address.split(', ');
//           const lastPart = addressParts[addressParts.length - 1];
//           const statePincodeMatch = lastPart.match(/(.*) - (\d+)/);
          
//           // Extract landmark if it exists (addressParts[1] if length > 2)
//           const landmark = addressParts.length > 2 ? addressParts[1] : "";
          
//           setNewAddress({
//             street: addressParts[0],
//             landmark: landmark,
//             city: addressParts.length > 2 ? addressParts[2] : addressParts[1],
//             state: statePincodeMatch ? statePincodeMatch[1] : "",
//             pincode: statePincodeMatch ? statePincodeMatch[2] : ""
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching consumer profile:", error);
//         setConsumerProfile({
//           consumer_id: consumer.consumer_id,
//           name: "",
//           mobile_number: "",
//           email: ""
//         });
//       }
//     };

//     fetchConsumerProfile();
//   }, [consumer]);

//   const fetchAddressDetails = async (pincode, isRecipient = false) => {
//     try {
//       const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
//       const data = await response.json();
//       if (data[0].Status === "Success") {
//         const postOffice = data[0].PostOffice[0];
//         if (isRecipient) {
//           setRecipientDetails(prev => ({
//             ...prev,
//             city: postOffice.District,
//             state: postOffice.State
//           }));
//         } else {
//           setNewAddress(prev => ({
//             ...prev,
//             city: postOffice.District,
//             state: postOffice.State
//           }));
//         }
//       } else {
//         alert("Invalid Pincode");
//       }
//     } catch (error) {
//       console.error("Error fetching address details:", error);
//       alert("Failed to fetch address details. Please try again.");
//     }
//   };

//   const applyCoupon = () => {
//     const coupon = coupons.find((c) => c.code === couponInput.toUpperCase());
//     if (coupon) {
//       setSelectedCoupon(coupon);
//       setDiscountAmount(calculateSubtotal() * coupon.discount / 100);
//       setCouponApplied(true);
//       setCouponError("");
//     } else {
//       setCouponError("Invalid coupon code. Please try again.");
//     }
//   };

//   const calculateSubtotal = () => {
//     return cart.reduce((total, product) => total + product.price_1kg * product.quantity, 0);
//   };

//   const calculateFinalPrice = () => {
//     return calculateSubtotal() - discountAmount;
//   };

//   // const handlePlaceOrder = async () => {
//   //   if (deliveryOption === "self" && !consumerprofile.address) {
//   //     alert("Please add an address.");
//   //     return;
//   //   }

//   //   if (deliveryOption === "other" && (
//   //     !recipientDetails.name || 
//   //     !recipientDetails.phone || 
//   //     !recipientDetails.pincode || 
//   //     !recipientDetails.city || 
//   //     !recipientDetails.state || 
//   //     !recipientDetails.street
//   //   )) {
//   //     alert("Please fill all recipient details.");
//   //     return;
//   //   }

//   //   try {
//   //      // Prepare the order data
//   //   const orderData = {
//   //     consumer_id: consumerprofile.consumer_id,
//   //     name: consumerprofile.name,
//   //     mobile_number: consumerprofile.mobile_number,
//   //     email: consumerprofile.email,
//   //     produce_name: cart.map(p => p.product_name).join(", "),
//   //     quantity: cart.reduce((total, p) => total + p.quantity, 0),
//   //     amount: calculateFinalPrice(),
//   //     is_self_delivery: deliveryOption === "self",
//   //   };

//   //     if (deliveryOption === "self") {
//   //       orderData.address = consumerprofile.address;
//   //       orderData.pincode = newAddress.pincode;
//   //     } else {
//   //       orderData.recipient_name = recipientDetails.name;
//   //       orderData.recipient_phone = recipientDetails.phone;
//   //       orderData.address = `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;
//   //       orderData.pincode = recipientDetails.pincode;
//   //     }

//   //     const response = await fetch("http://localhost:5000/api/place-order", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify(orderData),
//   //     });

//   //     const data = await response.json();
//   //     if (data.success) {
//   //       setShowSuccessPopup(true);
//   //       setTimeout(() => {
//   //         localStorage.removeItem(`cart_${consumerprofile.consumer_id}`);
//   //         navigate("/consumer-dashboard");
//   //       }, 3000);
//   //     } else {
//   //       alert("Order failed. Try again.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error placing order:", error);
//   //     alert("Error placing order. Try again.");
//   //   }
//   // };
//   const handlePlaceOrder = async () => {
//     console.log("Current payment method:", paymentMethod); // Debug log
//     if (deliveryOption === "self" && !consumerprofile.address) {
//       alert("Please add an address.");
//       return;
//     }
  
//     if (deliveryOption === "other") {
//       // Check if using saved recipient or new one
//       if (selectedRecipientAddress) {
//         const recipientExists = savedRecipientAddresses.some(
//           addr => addr.id === selectedRecipientAddress
//         );
//         if (!recipientExists) {
//           alert("Selected recipient not found. Please select again.");
//           return;
//         }
//       } else {
//         // Creating new recipient - validate all fields
//         if (!recipientDetails.name || 
//             !recipientDetails.phone || 
//             !recipientDetails.pincode || 
//             !recipientDetails.city || 
//             !recipientDetails.state || 
//             !recipientDetails.street) {
//           alert("Please fill all recipient details or select a saved recipient.");
//           return;
//         }
//       }
//     }
//     try {
//       // Prepare the order data
//       const orderData = {
//         consumer_id: consumerprofile.consumer_id,
//         name: consumerprofile.name,
//         mobile_number: consumerprofile.mobile_number,
//         email: consumerprofile.email,
//         produce_name: cart.map(p => p.product_name).join(", "),
//         quantity: cart.reduce((total, p) => total + p.quantity, 0),
//         amount: calculateFinalPrice(),
//         is_self_delivery: deliveryOption === "self",
//         payment_method: paymentMethod // This is now properly included
//       };
  
//       // Add recipient details if delivery is for someone else
//       if (deliveryOption === "other") {
//         const selectedRecipient = savedRecipientAddresses.find(
//           addr => addr.id === selectedRecipientAddress
//         );
        
//         orderData.recipient_name = selectedRecipient ? selectedRecipient.name : recipientDetails.name;
//         orderData.recipient_phone = selectedRecipient ? selectedRecipient.phone : recipientDetails.phone;
//         orderData.address = selectedRecipient ? 
//           selectedRecipient.address : 
//           `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;
//       } else {
//         // Use consumer's own address
//         orderData.address = consumerprofile.address;
//       }
  
//       // Send the order to the backend
//       const response = await fetch("http://localhost:5000/api/place-order", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({
//           ...orderData,
//           payment_method: paymentMethod // Explicitly include it again
//         }),
//       });
  
//       const data = await response.json();
//       if (data.success) {
//         setShowSuccessPopup(true);
//         setTimeout(() => {
//           localStorage.removeItem(`cart_${consumerprofile.consumer_id}`);
//           navigate("/consumer-dashboard");
//         }, 3000);
//       } else {
//         alert(data.error || "Order failed. Try again.");
//       }
//     } catch (error) {
//       console.error("Error placing order:", error);
//       alert("Error placing order. Try again.");
//     }
//   };





//   const handlePincodeChange = (e, isRecipient = false) => {
//     const pincode = e.target.value;
//     if (isRecipient) {
//       setRecipientDetails(prev => ({ ...prev, pincode }));
//       if (pincode.length === 6) fetchAddressDetails(pincode, true);
//     } else {
//       setNewAddress(prev => ({ ...prev, pincode }));
//       if (pincode.length === 6) fetchAddressDetails(pincode);
//     }
//   };

//   const handleAddAddress = async () => {
//     try {
//       // Validate inputs
//       if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
//         alert("Please fill all required address fields (Street, City, State, and Pincode)");
//         return;
//       }
  
//       // Construct the full address string
//       const fullAddress = [
//         newAddress.street,
//         newAddress.landmark,
//         newAddress.city,
//         `${newAddress.state} - ${newAddress.pincode}`
//       ].filter(Boolean).join(', ');
  
//       const payload = {
//         consumer_id: consumerprofile.consumer_id,
//         street: newAddress.street,
//         landmark: newAddress.landmark || "", // Send empty string if no landmark
//         city: newAddress.city,
//         state: newAddress.state,
//         pincode: newAddress.pincode,
//         address: fullAddress
//       };
  
//       const response = await fetch("http://localhost:5000/api/update-address", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify(payload)
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to update address");
//       }
  
//       // const data = await response.json();
      
//       // Update UI immediately without waiting for refresh
//       setConsumerProfile(prev => ({
//         ...prev,
//         address: fullAddress
//       }));
      
//       setShowAddressPopup(false);
//       alert("Address updated successfully!");
  
//     } catch (error) {
//       console.error("Update error:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   const handleSaveRecipientDetails = async () => {
//     try {
//       if (!recipientDetails.name || 
//           !recipientDetails.phone || 
//           !recipientDetails.pincode || 
//           !recipientDetails.city || 
//           !recipientDetails.state || 
//           !recipientDetails.street) {
//         alert("Please fill all recipient details.");
//         return;
//       }

//       const fullAddress = `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;

//       if (editingRecipientId) {
//         // Update existing recipient
//         const updatedAddresses = savedRecipientAddresses.map(addr => 
//           addr.id === editingRecipientId ? {
//             ...addr,
//             name: recipientDetails.name,
//             phone: recipientDetails.phone,
//             address: fullAddress,
//             details: {...recipientDetails}
//           } : addr
//         );
//         setSavedRecipientAddresses(updatedAddresses);
//         saveRecipientAddressesToStorage(updatedAddresses);
//         // setEditingRecipientId(null);
//       } else {
//         // Add new recipient
//         const recipientAddress = {
//           id: Date.now(),
//           name: recipientDetails.name,
//           phone: recipientDetails.phone,
//           address: fullAddress,
//           details: {...recipientDetails}
//         };
//         const newAddresses = [...savedRecipientAddresses, recipientAddress];
//         setSavedRecipientAddresses(newAddresses);
//         saveRecipientAddressesToStorage(newAddresses);
//         setSelectedRecipientAddress(recipientAddress.id);
//       }

//       // Clear the form
//       setRecipientDetails({
//         name: "",
//         phone: "",
//         pincode: "",
//         city: "",
//         state: "",
//         street: "",
//         landmark: "",
//       });
//       setEditingRecipientId(null);
//       // setShowRecipientForm(false);
//       alert(`Recipient details ${editingRecipientId ? 'updated' : 'saved'} successfully!`);

//     } catch (error) {
//       console.error("Error saving recipient details:", error);
//       alert("Failed to save recipient details. Please try again.");
//     }
//   };
// // Helper functions for localStorage
// const saveRecipientAddressesToStorage = (addresses) => {
//   localStorage.setItem('recipientAddresses', JSON.stringify(addresses));
// };

// const loadRecipientAddressesFromStorage = () => {
//   const saved = localStorage.getItem('recipientAddresses');
//   return saved ? JSON.parse(saved) : [];
// };
// useEffect(() => {
//   if (savedRecipientAddresses.length > 0) {
//     saveRecipientAddressesToStorage(savedRecipientAddresses);
//   }
// }, [savedRecipientAddresses]);

//   // Function to edit a recipient address
//   const handleEditRecipient = (id) => {
//     const recipient = savedRecipientAddresses.find(addr => addr.id === id);
//     if (recipient) {
//       setRecipientDetails({
//         name: recipient.name,
//         phone: recipient.phone,
//         pincode: recipient.details.pincode,
//         city: recipient.details.city,
//         state: recipient.details.state,
//         street: recipient.details.street,
//         landmark: recipient.details.landmark || "",
//       });
//       setEditingRecipientId(id);
//       // setShowRecipientForm(true);
//       // setSelectedRecipientAddress(id);
//     }
//   };
//   // const handleAddNewRecipient = () => {
//   //   setRecipientDetails({
//   //     name: "",
//   //     phone: "",
//   //     pincode: "",
//   //     city: "",
//   //     state: "",
//   //     street: "",
//   //     landmark: "",
//   //   });
//   //   setEditingRecipientId(null);
//   //   setShowRecipientForm(true);
//   // };

//   // Function to delete a recipient address
//   const handleDeleteRecipient = (id) => {
//     if (window.confirm("Are you sure you want to delete this recipient address?")) {
//       const updatedAddresses = savedRecipientAddresses.filter(addr => addr.id !== id);
//       setSavedRecipientAddresses(updatedAddresses);
//       saveRecipientAddressesToStorage(updatedAddresses);
      
//       if (selectedRecipientAddress === id) {
//         setSelectedRecipientAddress(null);
//       }
//     }
//   };
//   const SuccessPopup = () => (
//     <div className="krishi-success-popup">
//       <div className="krishi-popup-content">
//         <div className="krishi-logo-text-container">
//           <img src={logo} alt="KrishiSetu Logo" className="krishi-logo" />
//           <h2>KrishiSetu</h2>
//         </div>
//         <BsCheckCircleFill className="krishi-success-icon" />
//         <p>Order placed successfully!</p>
//         <p>Thank you for supporting local farmers!</p>
//       </div>
//     </div>
//   );

//   const getImagePath = (productName) => {
//     return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
//   };

//   return (
//     <div className="krishi-order-container">
//       <div className="krishi-order-header">
//         <h1>
//           <FaTractor className="krishi-header-icon" />
//           Farm Fresh Order Summary
//         </h1>
//         <p className="krishi-order-subtitle">Review your order before checkout</p>
//       </div>
  
//       <div className="krishi-order-grid">
//         <div className="krishi-products-section">
//           <h2 className="krishi-section-title">
//             <FaShoppingBasket className="krishi-section-icon" />
//             Your Farm Basket
//           </h2>
          
//           {cart.map((product) => (
//             <div key={product.product_id} className="krishi-order-item">
//               <img
//                 src={getImagePath(product.product_name)}
//                 alt={product.product_name}
//                 className="krishi-product-image"
//                 onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
//               />
//               <div className="krishi-product-details">
//                 <h4>{product.product_name}</h4>
//                 <div className="krishi-product-meta">
//                   <span className="krishi-product-price">
//                     <FaRupeeSign /> {product.price_1kg}/kg
//                   </span>
//                   <span className="krishi-product-quantity">
//                     {product.quantity} kg
//                   </span>
//                   <span className="krishi-product-total">
//                     <FaRupeeSign /> {product.price_1kg * product.quantity}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
  
//         <div className="krishi-summary-section">
//           <div className="krishi-coupon-card">
//             <h3 className="krishi-card-title">
//               <FaLeaf className="krishi-card-icon" />
//               Apply Farm Coupon
//             </h3>
//             <div className="krishi-coupon-input-group">
//               <input
//                 type="text"
//                 list="krishi-coupon-list"
//                 placeholder="Enter coupon code"
//                 value={couponInput}
//                 onChange={(e) => setCouponInput(e.target.value)}
//                 disabled={couponApplied}
//                 className="krishi-coupon-input"
//               />
//               <datalist id="krishi-coupon-list">
//                 {coupons.map((coupon) => (
//                   <option key={coupon.code} value={coupon.code}>
//                     {coupon.code} - {coupon.discount}% OFF
//                   </option>
//                 ))}
//               </datalist>
//               <button 
//                 onClick={applyCoupon} 
//                 disabled={couponApplied}
//                 className="krishi-coupon-btn"
//               >
//                 {couponApplied ? 'Applied' : 'Apply'}
//               </button>
//             </div>
//             {couponApplied && (
//               <p className="krishi-coupon-success">
//                 <BsCheckCircleFill /> {selectedCoupon.discount}% discount applied!
//               </p>
//             )}
//             {couponError && <p className="krishi-coupon-error">{couponError}</p>}
//           </div>
  
//           <div className="krishi-address-card">
//             <h3 className="krishi-card-title">
//               <FaMapMarkerAlt className="krishi-card-icon" />
//               Delivery Address
//             </h3>
            
//             <div className="krishi-delivery-options">
//               <label className="krishi-delivery-option">
//                 <input
//                   type="radio"
//                   name="delivery"
//                   value="self"
//                   checked={deliveryOption === "self"}
//                   onChange={() => setDeliveryOption("self")}
//                 />
//                 <span>For Myself</span>
//               </label>
//               <label className="krishi-delivery-option">
//                 <input
//                   type="radio"
//                   name="delivery"
//                   value="other"
//                   checked={deliveryOption === "other"}
//                   onChange={() => setDeliveryOption("other")}
//                 />
//                 <span>For Someone Else</span>
//               </label>
//             </div>
  
//             {deliveryOption === "other" ? (
//     <div className="krishi-recipient-section">
//       {savedRecipientAddresses.length > 0 && (
//         <div className="krishi-recipient-address-list">
//           <h4>Saved Recipient Addresses:</h4>
//           {savedRecipientAddresses.map(address => (
//             <div 
//               key={address.id}
//               className={`krishi-address-item ${selectedRecipientAddress === address.id ? 'krishi-selected' : ''}`}
//               onClick={() => setSelectedRecipientAddress(address.id)}
//             >
//               <div className="krishi-address-details">
//                 <h4><FaUser /> {address.name}</h4>
//                 <p><FaPhone /> {address.phone}</p>
//                 <p>{address.address}</p>
//               </div>
//               <div className="krishi-address-actions">
//               <button 
//               className="krishi-edit-btn"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleEditRecipient(address.id);
//               }}
//             >
//               <FaEdit /> Edit
//             </button>
//                 <button 
//                   className="krishi-delete-btn"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDeleteRecipient(address.id);
//                   }}
//                 >
//                   <FaTrash />Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//                  {editingRecipientId !== null || savedRecipientAddresses.length === 0 ? (
//       <div className="krishi-recipient-form">
//         <h4>{editingRecipientId ? "Edit Recipient" : "Add Recipient Details"}</h4>
//         <div className="krishi-form-group">
//           <label>Recipient Name </label>
//           <input
//             type="text"
//             placeholder="Enter recipient name"
//             value={recipientDetails.name}
//             onChange={(e) => setRecipientDetails({...recipientDetails, name: e.target.value})}
//           />
//         </div>
//                   <div className="krishi-form-group">
//                     <label>Recipient Phone </label>
//                     <input
//                       type="text"
//                       placeholder="Enter recipient phone number"
//                       value={recipientDetails.phone}
//                       onChange={(e) => setRecipientDetails({...recipientDetails, phone: e.target.value})}
//                     />
//                   </div>
//                   <div className="krishi-form-group">
//                     <label>Pincode </label>
//                     <input
//                       type="text"
//                       placeholder="Enter 6-digit pincode"
//                       value={recipientDetails.pincode}
//                       onChange={(e) => handlePincodeChange(e, true)}
//                       maxLength="6"
//                     />
//                   </div>
//                   <div className="krishi-form-group">
//                     <label>City </label>
//                     <input 
//                       type="text" 
//                       placeholder="City" 
//                       value={recipientDetails.city} 
//                       readOnly 
//                     />
//                   </div>
//                   <div className="krishi-form-group">
//                     <label>State </label>
//                     <input 
//                       type="text" 
//                       placeholder="State" 
//                       value={recipientDetails.state} 
//                       readOnly 
//                     />
//                   </div>
//                   <div className="krishi-form-group">
//                     <label>Street Address </label>
//                     <input
//                       type="text"
//                       placeholder="House no, Building, Street"
//                       value={recipientDetails.street}
//                       onChange={(e) => setRecipientDetails({...recipientDetails, street: e.target.value})}
//                     />
//                   </div>
//                   <div className="krishi-form-group">
//                     <label>Landmark (Optional)</label>
//                     <input
//                       type="text"
//                       placeholder="Nearby landmark"
//                       value={recipientDetails.landmark}
//                       onChange={(e) => setRecipientDetails({...recipientDetails, landmark: e.target.value})}
//                     />
//                   </div>
//                   <button 
//                     className="krishi-save-recipient-btn"
//                     onClick={handleSaveRecipientDetails}
//                   >
//                     {editingRecipientId ? "Update Recipient" : "Save Recipient"}
//                   </button>
//                   {editingRecipientId && (
//           <button 
//             className="krishi-cancel-btn"
//             onClick={() => {
//               setEditingRecipientId(null);
//               setRecipientDetails({
//                 name: "",
//                 phone: "",
//                 pincode: "",
//                 city: "",
//                 state: "",
//                 street: "",
//                 landmark: "",
//               });
//             }}
//           >
//             Cancel
//           </button>
//         )}
//       </div>
//     ) : (
//       <button 
//         className="krishi-add-recipient-btn"
//         onClick={() => {
//           setRecipientDetails({
//             name: "",
//             phone: "",
//             pincode: "",
//             city: "",
//             state: "",
//             street: "",
//             landmark: "",
//           });
//           setEditingRecipientId(null);
//         }}
//       >
//         {/* <FaPlus /> Add New Recipient */}
//       </button>
//     )}
//   </div>
// ) : (
//               <>
//                 {consumerprofile?.address ? (
//                   <div className="krishi-address-display">
//                     <div className="krishi-address-details">
//                       <h4><FaUser /> {consumerprofile?.name || "Loading..."}</h4>
//                       <p><FaPhone /> {consumerprofile?.mobile_number || "Loading..."}</p>
//                       <p>{consumerprofile.address}</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="krishi-no-address">No saved address found.</p>
//                 )}
//                 <button 
//                   className="krishi-add-address-btn"
//                   onClick={() => setShowAddressPopup(true)}
//                 >
//                   {consumerprofile?.address ? "Update Address" : "Add Address"}
//                 </button>
//               </>
//             )}
//           </div>
  
//           <div className="krishi-payment-card">
//             <h3 className="krishi-card-title">
//               <FaCreditCard className="krishi-card-icon" />
//               Payment Method
//             </h3>
//             <div className="krishi-payment-options">
//               <label className="krishi-payment-option">
//                 <input
//                   type="radio"
//                   name="payment"
//                   value="credit-card"
//                   checked={paymentMethod === "credit-card"}
//                   onChange={() => {
//                     console.log("Selected credit-card"); // Debug log
//                     setPaymentMethod("credit-card");
//                   }}
//                 />
//                 <span>Credit/Debit Card</span>
//               </label>

//               <label className="krishi-payment-option">
//                 <input
//                   type="radio"
//                   name="payment"
//                   value="upi"
//                   checked={paymentMethod === "upi"}
//                   onChange={() => {
//                     console.log("Selected upi"); // Debug log
//                     setPaymentMethod("upi");
//                   }}
//                 />
//                 <span>UPI Payment</span>
//               </label>
//               <label className="krishi-payment-option">
//                 <input
//                   type="radio"
//                   name="payment"
//                   value="cash-on-delivery"
//                   checked={paymentMethod === "cash-on-delivery"}
//                   onChange={() => {
//                     console.log("Selected cash-on-delivery"); // Debug log
//                     setPaymentMethod("cash-on-delivery");
//                   }}
//                 />
//                 <span>Cash on Delivery</span>
//               </label>
//             </div>
//           </div>
  
//           <div className="krishi-total-card">
//             <h3 className="krishi-card-title">
//               <GiFarmer className="krishi-card-icon" />
//               Order Summary
//             </h3>
//             <div className="krishi-total-row">
//               <span>Subtotal:</span>
//               <span><FaRupeeSign /> {calculateSubtotal()}</span>
//             </div>
//             <div className="krishi-total-row">
//               <span>Discount:</span>
//               <span className="krishi-discount">- <FaRupeeSign /> {discountAmount}</span>
//             </div>
//             <div className="krishi-total-row krishi-grand-total">
//               <span>Total:</span>
//               <span><FaRupeeSign /> {calculateFinalPrice()}</span>
//             </div>
//             <button 
//               className="krishi-place-order-btn"
//               onClick={handlePlaceOrder}
//             >
//               Place Order
//             </button>
//           </div>
//         </div>
//       </div>
  
//       {showAddressPopup && (
//         <div className="krishi-address-popup">
//           <div className="krishi-popup-content">
//             <h3>
//               <FaMapMarkerAlt /> {consumerprofile?.address ? "Update Address" : "Add New Address"}
//             </h3>
//             <div className="krishi-popup-field">
//               <label>Consumer ID:</label>
//               <span>{consumerprofile?.consumer_id || "Loading..."}</span>
//             </div>
//             <div className="krishi-popup-field">
//               <label>Name:</label>
//               <span>{consumerprofile?.name || "Loading..."}</span>
//             </div>
//             <div className="krishi-popup-field">
//               <label>Phone:</label>
//               <span>{consumerprofile?.mobile_number || "Loading..."}</span>
//             </div>
//             <div className="krishi-popup-field">
//               <label>Pincode *</label>
//               <input
//                 type="text"
//                 placeholder="Enter 6-digit pincode"
//                 value={newAddress.pincode}
//                 onChange={(e) => handlePincodeChange(e)}
//                 maxLength="6"
//               />
//             </div>
//             <div className="krishi-popup-field">
//               <label>City *</label>
//               <input 
//                 type="text" 
//                 placeholder="City" 
//                 value={newAddress.city} 
//                 readOnly 
//               />
//             </div>
//             <div className="krishi-popup-field">
//               <label>State *</label>
//               <input 
//                 type="text" 
//                 placeholder="State" 
//                 value={newAddress.state} 
//                 readOnly 
//               />
//             </div>
//             <div className="krishi-popup-field">
//               <label>Street Address *</label>
//               <input
//                 type="text"
//                 placeholder="House no, Building, Street"
//                 value={newAddress.street}
//                 onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
//               />
//             </div>
//             <div className="krishi-popup-field">
//               <label>Landmark (Optional)</label>
//               <input
//                 type="text"
//                 placeholder="Nearby landmark"
//                 value={newAddress.landmark}
//                 onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
//               />
//             </div>
//             <div className="krishi-popup-buttons">
//               <button 
//                 className="krishi-popup-cancel"
//                 onClick={() => setShowAddressPopup(false)}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="krishi-popup-save"
//                 onClick={handleAddAddress}
//               >
//                 {consumerprofile?.address ? "Update Address" : "Save Address"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
  
//       {showSuccessPopup && <SuccessPopup />}
//     </div>
//   );
// };

// export default KrishiOrderPage;



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
  // const [addresses, setAddresses] = useState([]);
  // const [selectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const { consumer } = useAuth();
  // Add this state to track saved recipient addresses
const [savedRecipientAddresses, setSavedRecipientAddresses] = useState([]);
const [selectedRecipientAddress, setSelectedRecipientAddress] = useState(null);
const [editingRecipientId, setEditingRecipientId] = useState(null);
  const [error, setError] = useState(null);

// const [showRecipientForm, setShowRecipientForm] = useState(false);
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

  // const loadInstamojo = () => {
  //   return new Promise((resolve) => {
  //     const script = document.createElement('script');
  //     script.src = 'https://js.instamojo.com/v1/checkout.js';
  //     script.onload = () => {
  //       resolve(true);
  //     };
  //     script.onerror = () => {
  //       resolve(false);
  //     };
  //     document.body.appendChild(script);
  //   });
  // };

  // const initializeInstamojo = async () => {
  //   return await loadInstamojo();
  // };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };




  const processPayment = async (orderData) => {
    // const isInstamojoLoaded = await initializeInstamojo();
    // if (!isInstamojoLoaded) {
    //   alert('Instamojo SDK failed to load. Are you online?');
    //   return;
    // }

    try {
      // First create a payment request on your server
      const response = await fetch('http://localhost:5000/api/create-instamojo-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: orderData.amount,
          purpose: `Order for ${orderData.produce_name}`,
          buyer_name: orderData.name,
          email: orderData.email,
          phone: orderData.mobile_number,
          redirect_url: window.location.origin + 'http://localhost:3000/payment-success',
          webhook_url: 'http://localhost:5000/api/instamojo-webhook',
          allow_repeated_payments: false,
          send_email: false,
          send_sms: false,
          metadata: {
            order_id: `order_${Date.now()}`,
            consumer_id: orderData.consumer_id
          }
        })
      });

      // First check if response is OK
    if (!response.ok) {
      let errorMsg = `Payment request failed (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData.message || JSON.stringify(errorData)}`;
      } catch (e) {
        const text = await response.text();
        errorMsg += ` - ${text}`;
      }
      throw new Error(errorMsg);
    }


      const paymentData = await response.json();
      
      // if (!paymentData.payment_request) {
      //   alert('Failed to create payment request');
      //   return;
      // }
      // await loadInstamojo();
      // Open Instamojo payment widget
      const options = {
        data: {
          id: paymentData.payment_request.id,
          amount: paymentData.payment_request.amount,
          purpose: paymentData.payment_request.purpose,
          buyer_name: paymentData.payment_request.buyer_name,
          email: paymentData.payment_request.email,
          phone: paymentData.payment_request.phone,
          redirect_url: paymentData.payment_request.redirect_url
        },
        handler: async function(response) {
          // This will be called after successful payment
          await verifyPayment(response, orderData);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
          }
        }
      };

      const paymentObject = new window.Instamojo(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed');
    }
  };


  const placeOrderDirectly = async (orderData) => {
    const response = await fetch("http://localhost:5000/api/place-order", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData),
    })
  }



  const verifyPayment = async (paymentResponse, orderData) => {
    try {
      const verificationResponse = await fetch('http://localhost:5000/api/verify-instamojo-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          payment_id: paymentResponse.payment_id,
          payment_request_id: paymentResponse.payment_request_id,
          orderData: orderData
        })
      });

      const result = await verificationResponse.json();
      
      if (result.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          localStorage.removeItem(`cart_${orderData.consumer_id}`);
          navigate("/consumer-dashboard");
        }, 3000);
      } else {
        alert('Payment verification failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Payment verification failed');
    }
  };

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

 // Load saved addresses on component mount
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
        const response = await fetch(`http://localhost:5000/api/consumerprofile/${consumer.consumer_id}`,
          {
            method: 'GET',
           headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
          }
        );
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setConsumerProfile(data);
        
        // If address exists, parse it to pre-fill the form
        if (data.address) {
          const addressParts = data.address.split(', ');
          const lastPart = addressParts[addressParts.length - 1];
          const statePincodeMatch = lastPart.match(/(.*) - (\d+)/);
          
          // Extract landmark if it exists (addressParts[1] if length > 2)
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
    return calculateSubtotal() - discountAmount;
  };

  // const handlePlaceOrder = async () => {
  //   if (deliveryOption === "self" && !consumerprofile.address) {
  //     alert("Please add an address.");
  //     return;
  //   }

  //   if (deliveryOption === "other" && (
  //     !recipientDetails.name || 
  //     !recipientDetails.phone || 
  //     !recipientDetails.pincode || 
  //     !recipientDetails.city || 
  //     !recipientDetails.state || 
  //     !recipientDetails.street
  //   )) {
  //     alert("Please fill all recipient details.");
  //     return;
  //   }

  //   try {
  //      // Prepare the order data
  //   const orderData = {
  //     consumer_id: consumerprofile.consumer_id,
  //     name: consumerprofile.name,
  //     mobile_number: consumerprofile.mobile_number,
  //     email: consumerprofile.email,
  //     produce_name: cart.map(p => p.product_name).join(", "),
  //     quantity: cart.reduce((total, p) => total + p.quantity, 0),
  //     amount: calculateFinalPrice(),
  //     is_self_delivery: deliveryOption === "self",
  //   };

  //     if (deliveryOption === "self") {
  //       orderData.address = consumerprofile.address;
  //       orderData.pincode = newAddress.pincode;
  //     } else {
  //       orderData.recipient_name = recipientDetails.name;
  //       orderData.recipient_phone = recipientDetails.phone;
  //       orderData.address = `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;
  //       orderData.pincode = recipientDetails.pincode;
  //     }

  //     const response = await fetch("http://localhost:5000/api/place-order", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(orderData),
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       setShowSuccessPopup(true);
  //       setTimeout(() => {
  //         localStorage.removeItem(`cart_${consumerprofile.consumer_id}`);
  //         navigate("/consumer-dashboard");
  //       }, 3000);
  //     } else {
  //       alert("Order failed. Try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error placing order:", error);
  //     alert("Error placing order. Try again.");
  //   }
  // };
  // 
  

// In OrderPage.js, update the handlePlaceOrder function:

const handlePlaceOrder = async () => {
  try {
    // 1. Load Razorpay script
    const isRazorpayLoaded = await loadRazorpayScript();
    if (!isRazorpayLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    // 2. Prepare order data (your existing code)
    const orderData = {
          consumer_id: consumerprofile.consumer_id,
          name: consumerprofile.name,
          mobile_number: consumerprofile.mobile_number,
          email: consumerprofile.email,
          produce_name: cart.map(p => p.product_name).join(", "),
          quantity: cart.reduce((total, p) => total + p.quantity, 0),
          amount: calculateFinalPrice(),
          is_self_delivery: deliveryOption === "self",
        };
    
          if (deliveryOption === "self") {
            orderData.address = consumerprofile.address;
            orderData.pincode = newAddress.pincode;
          } else {
            orderData.recipient_name = recipientDetails.name;
            orderData.recipient_phone = recipientDetails.phone;
            orderData.address = `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;
            orderData.pincode = recipientDetails.pincode;
          }

    // 3. Create Razorpay order
    const orderResponse = await fetch('http://localhost:5000/api/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        amount: orderData.amount,
        currency: 'INR',
        receipt: `order_${Date.now()}_${orderData.consumer_id}`
      })
    });

    const orderResult = await orderResponse.json();
    if (!orderResult.success) {
      throw new Error('Failed to create payment order');
    }

    // 4. Open Razorpay checkout
    const options = {
      key: process.env.RAZORPAY_KEY_ID,
      amount: orderResult.order.amount,
      currency: orderResult.order.currency,
      name: "KrishiSetu",
      description: "Farm Fresh Order",
      image: "/logo.png",
      order_id: orderResult.order.id,
      handler: async function(response) {
        // Verify payment on your server
        const verificationResponse = await fetch('http://localhost:5000/api/verify-razorpay-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            orderData: orderData
          })
        });

        const verificationResult = await verificationResponse.json();
        if (verificationResult.success) {
          // Payment successful
          setShowSuccessPopup(true);
          localStorage.removeItem(`cart_${orderData.consumer_id}`);
          setTimeout(() => navigate("/consumer-dashboard"), 3000);
        } else {
          alert('Payment verification failed. Please contact support.');
        }
      },
      prefill: {
        name: orderData.name,
        email: orderData.email,
        contact: orderData.mobile_number
      },
      notes: {
        order: JSON.stringify(orderData)
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Order error:', error);
    alert('Error processing payment. Please try again.');
  }
};

      // // Send the order to the backend
      // const response = await fetch("http://localhost:5000/api/place-order", {
      //   method: "POST",
      //   headers: { 
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     ...orderData,
      //     payment_method: paymentMethod // Explicitly include it again
      //   }),
      // });
      
  
  //     const data = await response.json();
  //     if (data.success) {
  //       setShowSuccessPopup(true);
  //       setTimeout(() => {
  //         localStorage.removeItem(`cart_${consumerprofile.consumer_id}`);
  //         navigate("/consumer-dashboard");
  //       }, 3000);
  //     } else {
  //       alert(data.error || "Order failed. Try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error placing order:", error);
  //     alert("Error placing order. Try again.");
  //   }
  // };
     // For cash on delivery, skip payment gateway
//      if (paymentMethod === 'cash-on-delivery') {
//       await placeOrderDirectly(orderData);
//     } else {
//       // For other payment methods, use Instamojo
//       await processPayment(orderData);
//     }
//   } catch (error) {
//     console.error("Error placing order:", error);
//     alert("Error placing order. Try again.");
//   }
// };




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
      // Validate inputs
      if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        alert("Please fill all required address fields (Street, City, State, and Pincode)");
        return;
      }
  
      // Construct the full address string
      const fullAddress = [
        newAddress.street,
        newAddress.landmark,
        newAddress.city,
        `${newAddress.state} - ${newAddress.pincode}`
      ].filter(Boolean).join(', ');
  
      const payload = {
        consumer_id: consumerprofile.consumer_id,
        street: newAddress.street,
        landmark: newAddress.landmark || "", // Send empty string if no landmark
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
  
      // const data = await response.json();
      
      // Update UI immediately without waiting for refresh
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
        // Update existing recipient
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
        // setEditingRecipientId(null);
      } else {
        // Add new recipient
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

      // Clear the form
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
      // setShowRecipientForm(false);
      alert(`Recipient details ${editingRecipientId ? 'updated' : 'saved'} successfully!`);

    } catch (error) {
      console.error("Error saving recipient details:", error);
      alert("Failed to save recipient details. Please try again.");
    }
  };
// Helper functions for localStorage
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

  // Function to edit a recipient address
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
      // setShowRecipientForm(true);
      // setSelectedRecipientAddress(id);
    }
  };
  // const handleAddNewRecipient = () => {
  //   setRecipientDetails({
  //     name: "",
  //     phone: "",
  //     pincode: "",
  //     city: "",
  //     state: "",
  //     street: "",
  //     landmark: "",
  //   });
  //   setEditingRecipientId(null);
  //   setShowRecipientForm(true);
  // };

  // Function to delete a recipient address
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
        {/* <FaPlus /> Add New Recipient */}
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
                  value="credit-card"
                  checked={paymentMethod === "credit-card"}
                  onChange={() => {
                    console.log("Selected credit-card"); // Debug log
                    setPaymentMethod("credit-card");
                  }}
                />
                <span>Credit/Debit Card</span>
              </label>

              <label className="krishi-payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => {
                    console.log("Selected upi"); // Debug log
                    setPaymentMethod("upi");
                  }}
                />
                <span>UPI Payment</span>
              </label>
              <label className="krishi-payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cash-on-delivery"
                  checked={paymentMethod === "cash-on-delivery"}
                  onChange={() => {
                    console.log("Selected cash-on-delivery"); // Debug log
                    setPaymentMethod("cash-on-delivery");
                  }}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
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