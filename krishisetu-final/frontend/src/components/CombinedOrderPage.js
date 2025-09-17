import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faShoppingCart, 
    faRupeeSign, 
    faMapMarkerAlt, 
    faCreditCard, 
    faTruck,
    faLeaf,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { BsCheckCircleFill } from "react-icons/bs";
import logo from '../assets/logo.jpg';
import "./CombinedOrderPage.css"; 

const CombinedOrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { consumer } = useAuth();
    const { krishiCart = [], bargainCart = [], communityCart = [] } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    const [consumerProfile, setConsumerProfile] = useState({});
    const [recipientAddress, setRecipientAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productImages, setProductImages] = useState({});
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [error, setError] = useState(null);
    const [allProducts, setAllProducts] = useState([]);

    // This useEffect will run only when the carts change, creating the single combined list.
    useEffect(() => {
        const combinedList = [
            ...krishiCart.map((item, index) => ({
                ...item,
                id: `krishi-${item.product_id}-${index}`,
                source: 'Krishisetu',
                price: item.price_1kg,
                total: item.price_1kg * item.quantity,
                quantity: item.quantity
            })),
            ...bargainCart.map((item, index) => ({
                ...item,
                id: `bargain-${item.cart_ids.join('-') || index}`,
                source: 'Bargaining',
                price: item.price_per_kg,
                total: item.total_price,
                quantity: item.quantity
            })),
            ...communityCart.map((item, index) => ({
                ...item,
                id: `community-${item.order_id}-${index}`,
                source: 'Community',
                price: item.price,
                total: item.price * item.quantity,
                quantity: item.quantity
            }))
        ];
        setAllProducts(combinedList);
    }, [krishiCart, bargainCart, communityCart]);

    const calculateSubtotal = useCallback(() => {
        return allProducts.reduce((sum, item) => sum + (item.total || 0), 0);
    }, [allProducts]);

    const calculateDeliveryCharge = () => {
        const totalKg = allProducts.reduce((total, p) => total + (p.quantity || 0), 0);
        return totalKg > 0 ? (totalKg > 200 ? 0 : 20 + (2 * totalKg)) : 0;
    };
    
    const calculateFinalPrice = () => {
        const subtotal = calculateSubtotal();
        const deliveryCharge = calculateDeliveryCharge();
        return subtotal + deliveryCharge;
    };

    useEffect(() => {
        if (!consumer || !consumer.consumer_id) {
            navigate('/consumer-login');
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch consumer profile
                const profileResponse = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/consumerprofile/${consumer.consumer_id}`,
                    { headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } }
                );
                
                if (!profileResponse.ok) {
                    throw new Error(`Failed to fetch profile: ${profileResponse.status} ${profileResponse.statusText}`);
                }
                
                const profileData = await profileResponse.json();
                setConsumerProfile(profileData);
                setRecipientAddress(profileData.address);

                // Fetch images for all products
                const images = {};
                for (const product of allProducts) {
                    try {
                        const response = await fetch(
                            `https://api.pexels.com/v1/search?query=${encodeURIComponent(product.product_name)}&per_page=1`,
                            { headers: { Authorization: 'uONxxczjZM1uaDw2jsGQPV70vtBfQbuyHcKeJ0aaCwsK0xxbo5HDpamR' } }
                        );
                        if (!response.ok) {
                            console.warn(`Image fetch failed for "${product.product_name}": ${response.status} ${response.statusText}`);
                        }
                        const data = await response.json();
                        images[product.id] = data.photos[0]?.src?.medium || '/images/default-produce.jpg';
                    } catch (err) {
                        console.error(`Error fetching/parsing image for "${product.product_name}":`, err);
                        images[product.id] = '/images/default-produce.jpg';
                    }
                }
                setProductImages(images);
            } catch (error) {
                console.error("Error in fetchAllData:", error);
                setError(`Failed to load essential data. Please try again. (${error.message})`);
            } finally {
                setLoading(false);
            }
        };

        if (allProducts.length > 0) {
            fetchAllData();
        } else if (krishiCart.length === 0 && bargainCart.length === 0 && communityCart.length === 0) {
             // Handle empty carts scenario
             setLoading(false);
        }

    }, [consumer, navigate, allProducts]);
const handlePlaceOrder = async (isPaid = false) => {
    if (!recipientAddress) {
        alert("Please provide a delivery address.");
        return;
    }

    // Create combined strings for produce_name and a single quantity
    const produce_name_combined = allProducts.map(p => p.produce_name || p.product_name).join(", ");
    const quantity_total = allProducts.reduce((total, p) => total + (p.quantity || 0), 0);

    try {
        const orderData = {
            consumer_id: consumer.consumer_id,
            name: consumerProfile.name,
            mobile_number: consumerProfile.mobile_number,
            email: consumerProfile.email,
            amount: calculateFinalPrice(),
            payment_status: isPaid ? 'Paid' : 'Pending',
            payment_method: isPaid ? 'razorpay' : 'cash-on-delivery',
            address: recipientAddress,
            pincode: consumerProfile.pincode,
            produce_name: produce_name_combined,
            quantity: quantity_total,
            // Send a single 'items' array. Note: The backend 'place-order' endpoint
            // might not be designed for this, so you might need to adjust it
            // on the server side to handle the 'items' array instead of single product details.
            items: allProducts.map(item => ({
                source: item.source,
                product_id: item.product_id,
                produce_name: item.product_name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        const response = await fetch(
            // Use the existing, correct endpoint
            `${process.env.REACT_APP_BACKEND_URL}/api/place-order`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData),
            }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Order failed. Try again.");

        // After successful order, clear the carts on the frontend
        localStorage.removeItem(`krishiCart_${consumer.consumer_id}`);
        // Consider making backend calls to clear the other carts here if needed
        // e.g., await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/clear-bargain-cart`, { method: 'DELETE' });

        setShowSuccessPopup(true);
        setTimeout(() => navigate("/consumer-dashboard"), 3000);
    } catch (error) {
        console.error("Order placement error:", error);
        alert(`Error placing combined order: ${error.message}`);
    }
};
    // src/pages/CombinedOrderPage.js

// ... (rest of the component code, imports, and state)

const handleRazorpayPayment = async () => {
    // 1. Validate prerequisites (using the consumer's primary address for a combined order)
    if (!recipientAddress) {
        alert("Please provide a delivery address.");
        return;
    }

    const finalAmount = calculateFinalPrice();
    if (finalAmount <= 0) {
        alert("Invalid order amount.");
        return;
    }

    try {
        // Consolidate produce_name and quantity for the backend's single-order structure
        const produce_name_combined = allProducts.map(p => p.produce_name || p.product_name).join(", ");
        const quantity_total = allProducts.reduce((total, p) => total + (p.quantity || 0), 0);

        // 2. Create the combined order in your database
        const orderResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/place-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                consumer_id: consumer.consumer_id,
                name: consumerProfile.name,
                mobile_number: consumerProfile.mobile_number,
                email: consumerProfile.email,
                // These are the consolidated values
                produce_name: produce_name_combined,
                quantity: quantity_total,
                amount: finalAmount,
                // Add the detailed list of items in the notes for backend processing
                notes: {
                    all_items: JSON.stringify(allProducts),
                    delivery_type: "self", // Assuming combined orders are self-delivery
                    consumer_id: consumer.consumer_id,
                },
                address: recipientAddress,
                pincode: consumerProfile.pincode,
                is_self_delivery: true,
                payment_method: 'razorpay',
                payment_status: 'Pending',
                recipient_name: null,
                recipient_phone: null,
            })
        });

        const orderResult = await orderResponse.json();

        if (!orderResult.success || !orderResult.order_id) {
            throw new Error(orderResult.error || "Failed to create order");
        }

        // 3. Create Razorpay order
        const razorpayResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/razorpay/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                amount: finalAmount,
                order_id: orderResult.order_id,
                notes: {
                    internal_order_id: orderResult.order_id,
                    consumer_id: consumer.consumer_id
                }
            })
        });

        const razorpayData = await razorpayResponse.json();

        if (!razorpayResponse.ok || !razorpayData.order) {
            throw new Error(razorpayData.error || "Payment gateway error");
        }

        // 4. Initialize Razorpay checkout
        const options = {
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_VLCfnymiyd6HGf',
            amount: razorpayData.order.amount,
            currency: razorpayData.order.currency,
            order_id: razorpayData.order.id,
            name: 'KrishiSetu Combined Order',
            description: 'Farm Fresh Products from All Carts',
            image: '', // Use your logo URL
            handler: async (response) => {
                try {
                    // 5. Verify payment
                    const verificationResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/razorpay/verify`, {
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

                    // Payment successful, clear all carts
                    localStorage.removeItem(`krishiCart_${consumer.consumer_id}`);
                    // Trigger backend calls to clear other carts if they exist
                    // await fetch('/api/clear-bargain-cart', { method: 'DELETE' });
                    // await fetch('/api/clear-community-cart', { method: 'DELETE' });

                    setShowSuccessPopup(true);
                    setTimeout(() => navigate("/consumer-dashboard"), 3000);
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

    const SuccessPopup = () => (
        <div className="krishi-success-popup">
            <div className="krishi-popup-content">
                <div className="krishi-logo-text-container">
                    <img src={logo} alt="KrishiSetu Logo" className="krishi-logo" />
                    <h2>KrishiSetu</h2>
                </div>
                <BsCheckCircleFill className="krishi-success-icon" />
                <p>Combined Order placed successfully!</p>
                <p>Thank you for supporting local farmers!</p>
            </div>
        </div>
    );

    if (allProducts.length === 0 && !loading) {
        return (
            <div className="combined-order-page-container">
                <div className="krishi-order-header">
                    <h1>Your Combined Basket is Empty</h1>
                </div>
                <div className="krishi-empty-cart">
                    <p>There are no items in any of your carts to checkout. Let's get shopping!</p>
                    <button onClick={() => navigate('/consumer-dashboard')} className="krishi-btn-primary">Go to Shopping</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="combined-order-page-container loading-state-container">
                <div className="loading-state">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                    <p>Preparing your unified order...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return <div className="combined-order-page-container error-message-container">{error}</div>;
    }

    return (
        <div className="combined-order-page-container">
            <div className="krishi-order-header">
                <h1>
                    <FontAwesomeIcon icon={faTruck} className="krishi-header-icon" />
                    Unified Order Checkout
                </h1>
                <p className="krishi-order-subtitle">Review all your products and confirm delivery</p>
            </div>
            
            <div className="combined-order-grid">
                <div className="products-list-container">
                    <h2><FontAwesomeIcon icon={faShoppingCart} /> Your Combined Basket</h2>
                    {allProducts.map((product) => (
                        <div key={product.id} className="product-item-combined">
                            <div className="product-source-tag">{product.source}</div>
                            <img
                                src={productImages[product.id]}
                                alt={product.product_name}
                                className="product-image-combined"
                                onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
                            />
                            <div className="product-details-combined">
                                <h4>{product.product_name}</h4>
                                <p>Price: ₹{product.price}/kg</p>
                                <p>Quantity: {product.quantity} kg</p>
                            </div>
                            <div className="product-total-combined">
                                <p>Total: ₹{product.total.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="summary-payment-container">
                    <div className="summary-card-combined">
                        <h3><FontAwesomeIcon icon={faMapMarkerAlt} /> Delivery Address</h3>
                        <div className="address-details-combined">
                            <p><strong>Name:</strong> {consumerProfile.name || 'N/A'}</p>
                            <p><strong>Phone:</strong> {consumerProfile.mobile_number || 'N/A'}</p>
                            <p><strong>Address:</strong> {recipientAddress || 'N/A'}</p>
                            <p><strong>Pincode:</strong> {consumerProfile.pincode || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="summary-card-combined">
                        <h3><FontAwesomeIcon icon={faCreditCard} /> Payment Method</h3>
                        <div className="payment-options-combined">
                            <label>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="razorpay"
                                    checked={paymentMethod === "razorpay"}
                                    onChange={() => setPaymentMethod("razorpay")}
                                />
                                Pay Now
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

                    <div className="summary-card-combined">
                        <h3>Order Summary</h3>
                        <div className="summary-row-combined">
                            <span>Subtotal:</span>
                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-row-combined">
                            <span>Delivery Charge:</span>
                            <span>{calculateDeliveryCharge() === 0 ? "FREE" : `₹${calculateDeliveryCharge().toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row-combined total">
                            <span>Total:</span>
                            <span>₹{calculateFinalPrice().toFixed(2)}</span>
                        </div>
                        <button
                            className="checkout-btn-combined"
                            onClick={() => paymentMethod === 'razorpay' ? handleRazorpayPayment() : handlePlaceOrder()}
                        >
                            {paymentMethod === 'razorpay' ? `Pay ₹${calculateFinalPrice().toFixed(2)}` : 'Place Combined Order (COD)'}
                        </button>
                    </div>
                </div>
            </div>
            {showSuccessPopup && <SuccessPopup />}
        </div>
    );
};

export default CombinedOrderPage;