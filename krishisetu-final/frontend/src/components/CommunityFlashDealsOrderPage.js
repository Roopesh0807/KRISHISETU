import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from '../assets/logo.jpg';
import { FaTractor, FaShoppingBasket, FaRupeeSign, FaMapMarkerAlt, FaCreditCard, FaPhone, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";
import { BsCheckCircleFill } from "react-icons/bs";
import axios from 'axios';
import "./OrderPage.css";

const CommunityFlashDealsOrderPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { consumer, token } = useAuth();

    const [cart, setCart] = useState(location.state?.cart || []);
    const [paymentMethod, setPaymentMethod] = useState("credit-card");
    const [showAddressPopup, setShowAddressPopup] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [savedRecipientAddresses, setSavedRecipientAddresses] = useState([]);
    const [selectedRecipientAddress, setSelectedRecipientAddress] = useState(null);
    const [editingRecipientId, setEditingRecipientId] = useState(null);
    const [productImages, setProductImages] = useState({});
    const [loadingImages, setLoadingImages] = useState(true);
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
    const [consumerProfile, setConsumerProfile] = useState({});
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [razorpayOrderId, setRazorpayOrderId] = useState(null);
    const [razorpayPaymentId, setRazorpayPaymentId] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false); // New state to prevent duplicate orders

    const coupons = [
        { code: "COMMUNITY10", discount: 10 },
        { code: "FLASHDEALS20", discount: 20 },
        { code: "BULKBUY30", discount: 30 },
    ];

    const fetchConsumerProfile = async () => {
        if (!consumer?.consumer_id) return;
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/consumerprofile/${consumer.consumer_id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = response.data;
            setConsumerProfile(data);
            if (data.address) {
                const addressParts = data.address.split(', ');
                const lastPart = addressParts[addressParts.length - 1];
                const statePincodeMatch = lastPart.match(/(.*) - (\d+)/);
                setNewAddress({
                    street: addressParts[0],
                    landmark: addressParts.length > 2 ? addressParts[1] : "",
                    city: data.city || (addressParts.length > 2 ? addressParts[2] : addressParts[1]),
                    state: data.state || (statePincodeMatch ? statePincodeMatch[1] : ""),
                    pincode: data.pincode || (statePincodeMatch ? statePincodeMatch[2] : "")
                });
            } else if (data.pincode) {
                fetchAddressDetails(data.pincode);
            }
        } catch (error) {
            console.error("Error fetching consumer profile:", error);
            setConsumerProfile({ consumer_id: consumer.consumer_id, name: "", mobile_number: "", email: "" });
        }
    };

    const fetchAddressDetails = async (pincode, isRecipient = false) => {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();
            if (data[0].Status === "Success") {
                const postOffice = data[0].PostOffice[0];
                const updateState = { city: postOffice.District, state: postOffice.State };
                if (isRecipient) {
                    setRecipientDetails(prev => ({ ...prev, ...updateState }));
                } else {
                    setNewAddress(prev => ({ ...prev, ...updateState }));
                }
            } else {
                alert("Invalid Pincode");
            }
        } catch (error) {
            console.error("Error fetching address details:", error);
            alert("Failed to fetch address details. Please try again.");
        }
    };

    const fetchProductImages = async (products) => {
        setLoadingImages(true);
        const images = {};
        for (const product of products) {
            const productName = product.product_name || 'default';
            try {
                const response = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(productName)}&per_page=1`,
                    { headers: { Authorization: 'uONxxczjZM1uaDw2jsGQPV70vtBfQbuyHcKeJ0aaCwsK0xxbo5HDpamR' } }
                );
                if (!response.ok) throw new Error('Image fetch failed');
                const data = await response.json();
                images[product.order_id] = data.photos[0]?.src?.medium || '/images/default-produce.jpg';
            } catch (err) {
                images[product.order_id] = '/images/default-produce.jpg';
            }
        }
        setProductImages(images);
        setLoadingImages(false);
    };

    useEffect(() => {
        fetchConsumerProfile();
        const loadedAddresses = JSON.parse(localStorage.getItem('recipientAddresses') || '[]');
        setSavedRecipientAddresses(loadedAddresses);
        if (cart.length > 0) {
            fetchProductImages(cart);
        }
    }, [consumer?.consumer_id, token]);

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
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateDeliveryCharge = () => {
        const subtotal = calculateSubtotal();
        if (subtotal > 200) {
            return 0;
        }
        const totalKg = cart.reduce((total, product) => total + product.quantity, 0);
        return 20 + (2 * totalKg);
    };

    const calculateFinalPrice = () => {
        const subtotal = calculateSubtotal();
        const deliveryCharge = calculateDeliveryCharge();
        return subtotal - discountAmount + deliveryCharge;
    };

    const getOrderDetails = (isPaid = false) => {
        const communityId = cart.length > 0 ? cart[0].community_id : null;
    
        let orderAddress, orderPincode;
        if (deliveryOption === "self") {
            orderAddress = consumerProfile.address || `${newAddress.street}, ${newAddress.landmark ? newAddress.landmark + ', ' : ''}${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}`;
            orderPincode = consumerProfile.pincode || newAddress.pincode;
        } else {
            orderAddress = `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;
            orderPincode = recipientDetails.pincode;
        }
    
        return {
            consumer_id: consumerProfile.consumer_id,
            name: consumerProfile.name,
            mobile_number: consumerProfile.mobile_number,
            email: consumerProfile.email,
            produce_name: cart.map(p => p.product_name).join(", "),
            quantity: cart.reduce((total, p) => total + p.quantity, 0),
            amount: calculateFinalPrice(),
            is_self_delivery: deliveryOption === "self",
            payment_status: isPaid ? 'Paid' : 'Pending',
            payment_method: isPaid ? 'razorpay' : 'cash-on-delivery',
            address: orderAddress,
            pincode: orderPincode,
            recipient_name: deliveryOption === "other" ? (selectedRecipientAddress ? savedRecipientAddresses.find(a => a.id === selectedRecipientAddress)?.name : recipientDetails.name) : null,
            recipient_phone: deliveryOption === "other" ? (selectedRecipientAddress ? savedRecipientAddresses.find(a => a.id === selectedRecipientAddress)?.phone : recipientDetails.phone) : null,
            community_id: communityId,
            subtotal: calculateSubtotal(),
            discount_amount: discountAmount,
            total_amount: calculateFinalPrice(),
        };
    };

    const handlePlaceOrder = async () => {
        // Prevent duplicate submissions
        if (isPlacingOrder) return;
        setIsPlacingOrder(true);

        const orderData = getOrderDetails();

        if (deliveryOption === "self" && !consumerProfile.address && !newAddress.street) {
            alert("Please add an address before placing your order.");
            setIsPlacingOrder(false); // Reset the flag
            return;
        }
        if (deliveryOption === "other" && !selectedRecipientAddress && !recipientDetails.street) {
            alert("Please select or add a recipient address.");
            setIsPlacingOrder(false); // Reset the flag
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/place-community-flash-deals-order`, orderData, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.data.success) {
                setShowSuccessPopup(true);
                setTimeout(() => {
                    setCart([]); // Clear the cart on successful order
                    navigate("/consumer-dashboard");
                }, 3000);
            } else {
                throw new Error(response.data.message || "Order processing failed");
            }
        } catch (error) {
            console.error("Order placement error:", error);
            alert(`Error placing order: ${error.message}`);
        } finally {
            // Reset the flag regardless of success or failure
            setIsPlacingOrder(false);
        }
    };
    
    const handleRazorpayPayment = async () => {
        // Prevent duplicate submissions
        if (isPlacingOrder) return;
        setIsPlacingOrder(true);
        
        const finalAmount = calculateFinalPrice();
        if (finalAmount <= 0) {
            setIsPlacingOrder(false); // Reset the flag
            alert("Invalid order amount.");
            return;
        }
        
        const orderData = getOrderDetails(true);

        if (deliveryOption === "self" && !consumerProfile.address && !newAddress.street) {
            alert("Please add an address before proceeding with payment.");
            setIsPlacingOrder(false); // Reset the flag
            return;
        }
        if (deliveryOption === "other" && !selectedRecipientAddress && !recipientDetails.street) {
            alert("Please select or add a recipient address.");
            setIsPlacingOrder(false); // Reset the flag
            return;
        }

        try {
            // First, create the order in your backend database
            const orderResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/place-community-flash-deals-order`, orderData, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!orderResponse.data.success || !orderResponse.data.order_id) {
                throw new Error(orderResponse.data.error || "Failed to create order on server");
            }

            const internalOrderId = orderResponse.data.order_id; // Store the ID for later use

            // Next, create the Razorpay order
            const razorpayResponse = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/razorpay/create-order`, {
                amount: finalAmount,
                order_id: internalOrderId, // Pass your internal order ID
                notes: { internal_order_id: internalOrderId, consumer_id: consumerProfile.consumer_id }
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!razorpayResponse.data.order) {
                throw new Error(razorpayResponse.data.error || "Payment gateway order creation failed");
            }

            const options = {
                key: process.env.RAZORPAY_KEY_ID || 'rzp_test_VLCfnymiyd6HGf',
                amount: razorpayResponse.data.order.amount,
                currency: razorpayResponse.data.order.currency,
                order_id: razorpayResponse.data.order.id,
                name: 'KrishiSetu Community',
                description: 'Community Flash Deals',
                image: '',
                handler: async (response) => {
                    // This handler is executed ONCE after successful payment
                    try {
                        const verificationResponse = await axios.post(
                            `${process.env.REACT_APP_BACKEND_URL}/api/razorpay/verify-community-flash-deals-order`,
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: internalOrderId, // Use the stored internal order ID
                                amount: razorpayResponse.data.order.amount
                            }, { headers: { "Authorization": `Bearer ${token}` } });

                        if (!verificationResponse.data.success) {
                            throw new Error(verificationResponse.data.error || 'Payment verification failed');
                        }

                        setShowSuccessPopup(true);
                        setTimeout(() => {
                            setCart([]); // Clear the cart on successful order
                            navigate("/consumer-dashboard");
                        }, 3000);
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
                theme: { color: '#3399cc', hide_topbar: true }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                console.error('Payment failed:', response.error);
                alert(`Payment failed: ${response.error.description}`);
                setIsPlacingOrder(false); // Reset the flag on failure
            });
            rzp.open();

        } catch (error) {
            console.error('Payment error:', error);
            alert(`Payment failed: ${error.message}`);
            setIsPlacingOrder(false); // Reset the flag on error
        }
        // NOTE: The flag is not reset in a finally block here because the Razorpay handler is asynchronous.
        // It's handled by the rzp.on('payment.failed') or the successful handler's navigation.
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
                alert("Please fill all required address fields.");
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
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/update-address`, payload, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data.success) {
                const updatedProfile = { ...consumerProfile, address: fullAddress, pincode: newAddress.pincode, city: newAddress.city, state: newAddress.state };
                setConsumerProfile(updatedProfile);
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

    const handleSaveRecipientDetails = () => {
        if (!recipientDetails.name || !recipientDetails.phone || !recipientDetails.pincode || !recipientDetails.city || !recipientDetails.state || !recipientDetails.street) {
            alert("Please fill all recipient details.");
            return;
        }
        const fullAddress = `${recipientDetails.street}, ${recipientDetails.landmark ? recipientDetails.landmark + ', ' : ''}${recipientDetails.city}, ${recipientDetails.state} - ${recipientDetails.pincode}`;
        let newAddresses;
        if (editingRecipientId) {
            newAddresses = savedRecipientAddresses.map(addr => addr.id === editingRecipientId ? { ...addr, name: recipientDetails.name, phone: recipientDetails.phone, address: fullAddress, details: { ...recipientDetails } } : addr);
        } else {
            const recipientAddress = { id: Date.now(), name: recipientDetails.name, phone: recipientDetails.phone, address: fullAddress, details: { ...recipientDetails } };
            newAddresses = [...savedRecipientAddresses, recipientAddress];
            setSelectedRecipientAddress(recipientAddress.id);
        }
        setSavedRecipientAddresses(newAddresses);
        localStorage.setItem('recipientAddresses', JSON.stringify(newAddresses));
        setRecipientDetails({ name: "", phone: "", pincode: "", city: "", state: "", street: "", landmark: "" });
        setEditingRecipientId(null);
        alert(`Recipient details ${editingRecipientId ? 'updated' : 'saved'} successfully!`);
    };

    const handleEditRecipient = (id) => {
        const recipient = savedRecipientAddresses.find(addr => addr.id === id);
        if (recipient) {
            setRecipientDetails(recipient.details);
            setEditingRecipientId(id);
        }
    };

    const handleDeleteRecipient = (id) => {
        if (window.confirm("Are you sure you want to delete this recipient address?")) {
            const updatedAddresses = savedRecipientAddresses.filter(addr => addr.id !== id);
            setSavedRecipientAddresses(updatedAddresses);
            localStorage.setItem('recipientAddresses', JSON.stringify(updatedAddresses));
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
                <p>Community flash deals order placed successfully!</p>
                <p>You'll be notified when your items are ready for pickup or delivery.</p>
            </div>
        </div>
    );

    return (
        <div className="krishi-order-container">
            <div className="krishi-order-header">
                <h1>
                    <FaTractor className="krishi-header-icon" />
                    Community Flash Deals Order Summary
                </h1>
                <p className="krishi-order-subtitle">Review your community flash deals order before checkout</p>
            </div>
            <div className="krishi-order-grid">
                <div className="krishi-products-section">
                    <h2 className="krishi-section-title">
                        <FaShoppingBasket className="krishi-section-icon" />
                        Your Community Basket
                    </h2>
                    {cart.length === 0 ? (
                        <p className="krishi-empty-cart">Your community cart is empty.</p>
                    ) : (
                        cart.map((product) => (
                            <div key={product.order_id} className="krishi-order-item">
                                <img
                                    src={productImages[product.order_id] || '/images/default-produce.jpg'}
                                    alt={product.product_name}
                                    className="krishi-product-image"
                                    onError={(e) => { e.target.src = "/images/default-produce.jpg"; e.target.className = "krishi-product-image krishi-default-img"; }}
                                />
                                <div className="krishi-product-details">
                                    <h4>{product.product_name}</h4>
                                    <div className="krishi-product-meta">
                                        <span className="krishi-product-price">
                                            <FaRupeeSign /> {product.price}/kg
                                        </span>
                                        <span className="krishi-product-quantity">
                                            {product.quantity} kg
                                        </span>
                                        <span className="krishi-product-total">
                                            <FaRupeeSign /> {product.price * product.quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="krishi-summary-section">
                    <div className="krishi-coupon-card">
                        <h3 className="krishi-card-title">
                            <FaTractor className="krishi-card-icon" /> Apply Community Coupon
                        </h3>
                        <div className="krishi-coupon-input-group">
                            <input
                                type="text"
                                list="community-coupon-list"
                                placeholder="Enter coupon code"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                disabled={couponApplied}
                                className="krishi-coupon-input"
                            />
                            <datalist id="community-coupon-list">
                                {coupons.map((coupon) => (
                                    <option key={coupon.code} value={coupon.code}>{coupon.code} - {coupon.discount}% OFF</option>
                                ))}
                            </datalist>
                            <button onClick={applyCoupon} disabled={couponApplied} className="krishi-coupon-btn">{couponApplied ? 'Applied' : 'Apply'}</button>
                        </div>
                        {couponApplied && (<p className="krishi-coupon-success"><BsCheckCircleFill /> {selectedCoupon.discount}% discount applied!</p>)}
                        {couponError && <p className="krishi-coupon-error">{couponError}</p>}
                    </div>

                    <div className="krishi-address-card">
                        <h3 className="krishi-card-title"><FaMapMarkerAlt className="krishi-card-icon" /> Delivery Address</h3>
                        <div className="krishi-delivery-options">
                            <label className="krishi-delivery-option">
                                <input type="radio" name="delivery" value="self" checked={deliveryOption === "self"} onChange={() => setDeliveryOption("self")} />
                                <span>For Myself</span>
                            </label>
                            <label className="krishi-delivery-option">
                                <input type="radio" name="delivery" value="other" checked={deliveryOption === "other"} onChange={() => setDeliveryOption("other")} />
                                <span>For Someone Else</span>
                            </label>
                        </div>
                        {deliveryOption === "other" ? (
                            <div className="krishi-recipient-section">
                                {savedRecipientAddresses.length > 0 && (<div className="krishi-recipient-address-list"><h4>Saved Recipient Addresses:</h4>{savedRecipientAddresses.map(address => (<div key={address.id} className={`krishi-address-item ${selectedRecipientAddress === address.id ? 'krishi-selected' : ''}`} onClick={() => setSelectedRecipientAddress(address.id)}>
                                    <div className="krishi-address-details">
                                        <h4><FaUser /> {address.name}</h4><p><FaPhone /> {address.phone}</p><p>{address.address}</p>
                                    </div><div className="krishi-address-actions">
                                        <button className="krishi-edit-btn" onClick={(e) => { e.stopPropagation(); handleEditRecipient(address.id); }}><FaEdit /> Edit</button>
                                        <button className="krishi-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteRecipient(address.id); }}><FaTrash />Delete</button>
                                    </div>
                                </div>))}</div>)}
                                {editingRecipientId !== null || savedRecipientAddresses.length === 0 ? (
                                    <div className="krishi-recipient-form">
                                        <h4>{editingRecipientId ? "Edit Recipient" : "Add Recipient Details"}</h4>
                                        <div className="krishi-form-group"><label>Recipient Name </label><input type="text" placeholder="Enter recipient name" value={recipientDetails.name} onChange={(e) => setRecipientDetails({ ...recipientDetails, name: e.target.value })} /></div>
                                        <div className="krishi-form-group"><label>Recipient Phone </label><input type="text" placeholder="Enter recipient phone number" value={recipientDetails.phone} onChange={(e) => setRecipientDetails({ ...recipientDetails, phone: e.target.value })} /></div>
                                        <div className="krishi-form-group"><label>Pincode </label><input type="text" placeholder="Enter 6-digit pincode" value={recipientDetails.pincode} onChange={(e) => handlePincodeChange(e, true)} maxLength="6" /></div>
                                        <div className="krishi-form-group"><label>City </label><input type="text" placeholder="City" value={recipientDetails.city} readOnly /></div>
                                        <div className="krishi-form-group"><label>State </label><input type="text" placeholder="State" value={recipientDetails.state} readOnly /></div>
                                        <div className="krishi-form-group"><label>Street Address </label><input type="text" placeholder="House no, Building, Street" value={recipientDetails.street} onChange={(e) => setRecipientDetails({ ...recipientDetails, street: e.target.value })} /></div>
                                        <div className="krishi-form-group"><label>Landmark (Optional)</label><input type="text" placeholder="Nearby landmark" value={recipientDetails.landmark} onChange={(e) => setRecipientDetails({ ...recipientDetails, landmark: e.target.value })} /></div>
                                        <button className="krishi-save-recipient-btn" onClick={handleSaveRecipientDetails}>{editingRecipientId ? "Update Recipient" : "Save Recipient"}</button>
                                        {editingRecipientId && (<button className="krishi-cancel-btn" onClick={() => { setEditingRecipientId(null); setRecipientDetails({ name: "", phone: "", pincode: "", city: "", state: "", street: "", landmark: "" }); }}>Cancel</button>)}
                                    </div>
                                ) : (<button className="krishi-add-recipient-btn" onClick={() => { setRecipientDetails({ name: "", phone: "", pincode: "", city: "", state: "", street: "", landmark: "" }); setEditingRecipientId(null); }}></button>)}
                            </div>
                        ) : (
                            <>
                                {consumerProfile?.address ? (
                                    <div className="krishi-address-display">
                                        <div className="krishi-address-details">
                                            <h4><FaUser /> {consumerProfile?.name || "Loading..."}</h4>
                                            <p><FaPhone /> {consumerProfile?.mobile_number || "Loading..."}</p>
                                            <p>{consumerProfile.address}</p>
                                            <p><strong>Pincode:</strong> {consumerProfile.pincode || newAddress.pincode}</p>
                                            <p><strong>City:</strong> {consumerProfile.city || newAddress.city}</p>
                                            <p><strong>State:</strong> {consumerProfile.state || newAddress.state}</p>
                                        </div>
                                    </div>
                                ) : (<p className="krishi-no-address">No saved address found.</p>)}
                                <button className="krishi-add-address-btn" onClick={() => setShowAddressPopup(true)}>{consumerProfile?.address ? "Update Address" : "Add Address"}</button>
                            </>
                        )}
                    </div>

                    <div className="krishi-payment-card">
                        <h3 className="krishi-card-title"><FaCreditCard className="krishi-card-icon" /> Payment Method</h3>
                        <div className="krishi-payment-options">
                            <label className="krishi-payment-option">
                                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} /><span>Pay Now (Credit/Debit/UPI)</span>
                            </label>
                            <label className="krishi-payment-option">
                                <input type="radio" name="payment" value="cash-on-delivery" checked={paymentMethod === "cash-on-delivery"} onChange={() => setPaymentMethod("cash-on-delivery")} /><span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>

                    <div className="krishi-total-card">
                        <h3 className="krishi-card-title"><GiFarmer className="krishi-card-icon" /> Order Summary</h3>
                        <div className="krishi-total-row"><span>Subtotal:</span><span><FaRupeeSign /> {calculateSubtotal()}</span></div>
                        {discountAmount > 0 && (<div className="krishi-total-row"><span>Discount:</span><span className="krishi-discount">- <FaRupeeSign /> {discountAmount}</span></div>)}
                        <div className="krishi-total-row"><span>Delivery Charge:</span><span>{calculateDeliveryCharge() === 0 ? (<span className="krishi-free-delivery">FREE</span>) : (<span><FaRupeeSign /> {calculateDeliveryCharge()}</span>)}</span></div>
                        <div className="krishi-total-row krishi-grand-total"><span>Total:</span><span><FaRupeeSign /> {calculateFinalPrice()}</span></div>
                        <button 
                            className="krishi-place-order-btn" 
                            onClick={() => { 
                                if (paymentMethod === 'razorpay') { 
                                    handleRazorpayPayment(); 
                                } else { 
                                    handlePlaceOrder(); 
                                } 
                            }}
                            disabled={isPlacingOrder}
                        >
                            {isPlacingOrder ? 'Processing...' : (paymentMethod === 'razorpay' ? `Pay ₹${calculateFinalPrice()}` : 'Place Order (Cash on Delivery)')}
                        </button>
                    </div>
                </div>
            </div>
            {showAddressPopup && (
                <div className="krishi-address-popup">
                    <div className="krishi-popup-content">
                        <h3><FaMapMarkerAlt /> {consumerProfile?.address ? "Update Address" : "Add New Address"}</h3>
                        <div className="krishi-popup-field"><label>Consumer ID:</label><span>{consumerProfile?.consumer_id || "Loading..."}</span></div>
                        <div className="krishi-popup-field"><label>Name:</label><span>{consumerProfile?.name || "Loading..."}</span></div>
                        <div className="krishi-popup-field"><label>Phone:</label><span>{consumerProfile?.mobile_number || "Loading..."}</span></div>
                        <div className="krishi-popup-field"><label>Pincode *</label><input type="text" placeholder="Enter 6-digit pincode" value={newAddress.pincode} onChange={(e) => { const pincode = e.target.value; setNewAddress(prev => ({ ...prev, pincode })); if (pincode.length === 6) fetchAddressDetails(pincode); }} maxLength="6" /></div>
                        <div className="krishi-popup-field"><label>City *</label><input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))} /></div>
                        <div className="krishi-popup-field"><label>State *</label><input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))} /></div>
                        <div className="krishi-popup-field"><label>Street Address *</label><input type="text" placeholder="House no, Building, Street" value={newAddress.street} onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))} /></div>
                        <div className="krishi-popup-field"><label>Landmark (Optional)</label><input type="text" placeholder="Nearby landmark" value={newAddress.landmark} onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))} /></div>
                        <div className="krishi-popup-buttons">
                            <button className="krishi-popup-cancel" onClick={() => setShowAddressPopup(false)}>Cancel</button>
                            <button className="krishi-popup-save" onClick={handleAddAddress}>{consumerProfile?.address ? "Update Address" : "Save Address"}</button>
                        </div>
                    </div>
                </div>
            )}
            {showSuccessPopup && <SuccessPopup />}
        </div>
    );
};

export default CommunityFlashDealsOrderPage;