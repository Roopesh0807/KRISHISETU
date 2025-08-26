import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaArrowLeft, FaClock, FaFilePdf, FaEdit, FaTrash, FaPlus, FaMinus,
    FaChevronDown, FaChevronUp, FaPlusCircle, FaExclamationTriangle, FaCheckCircle,
    FaUser, FaEllipsisV, FaInfoCircle // Added FaInfoCircle for the instruction button
} from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import moment from 'moment'; // <--- ADDED THIS IMPORT
import Calendar from 'react-calendar'; // <--- ADDED THIS IMPORT
import 'react-calendar/dist/Calendar.css'; // <--- ADDED THIS IMPORT

// Import the new components and utils with CORRECT file paths
import Wallet from './wallet'; // Using lowercase 'wallet.js'
import { downloadPlanPDF, generateCombinedBillPDF } from './pdfUtils';

// Import local CSS with CORRECT file paths
import './subscribe.css';

// Import carousel images
import slide1 from '../assets/free.jpg';
import slide2 from '../assets/5%discount.jpg';
import slide3 from '../assets/morning.jpg';
import slide4 from '../assets/lowsub.png';

const Subscribe = () => {
    const { consumer, token } = useAuth();
    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState('');
    const [showBill, setShowBill] = useState(null);
    const [modifyItem, setModifyItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [collapsedPlans, setCollapsedPlans] = useState({});
    // Initialize showInstructions based on localStorage, default to true if not seen
    const [showInstructions, setShowInstructions] = useState(() => !localStorage.getItem('hasSeenInstructions'));
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [subscriptions, setSubscriptions] = useState({
        Daily: [], 'Alternate Days': [], Weekly: [], Monthly: []
    });
    const [canModify, setCanModify] = useState(true);

    // State for date logic (added from ConsumerDashboard.js)
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date()); // Will be updated by getInitialSubscriptionDate
    const [dateSelectionError, setDateSelectionError] = useState("");


    const carouselImages = [
        { img: slide1, title: "No Delivery Charges", desc: "Enjoy free delivery on all your subscription orders" },
        { img: slide2, title: "5% Discount", desc: "Get 5% discount on every product in your subscription" },
        { img: slide3, title: "Low Subscription Fee", desc: "Subscription starts from just ₹5 per kg" },
        { img: slide4, title: "Early Morning Delivery", desc: "Fresh products delivered by 7 AM every day" }
    ];

    // Function to check if it's past the cutoff time (added from ConsumerDashboard.js)
    const isPastCutoffTime = () => {
        const now = new Date();
        const cutoffHour = 22; // 10 PM
        const cutoffMinute = 30; // 30 minutes
        return now.getHours() > cutoffHour ||
               (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute);
    };

    // Function to get the minimum selectable date for the calendar (added from ConsumerDashboard.js)
    const getMinDate = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        const dayAfterTomorrow = new Date(now);
        dayAfterTomorrow.setDate(now.getDate() + 2);
        dayAfterTomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        if (isPastCutoffTime()) {
            // If it's past 10:30 PM today, min date is day after tomorrow
            return dayAfterTomorrow;
        } else {
            // If it's before or at 10:30 PM today, min date is tomorrow
            return tomorrow;
        }
    };

    // Function to get the initial default date for new subscriptions (added from ConsumerDashboard.js)
    const getInitialSubscriptionDate = () => {
        const now = new Date();
        const cutoffHour = 22; // 10 PM
        const cutoffMinute = 30; // 30 minutes

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(now.getDate() + 2);
        dayAfterTomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        if (now.getHours() > cutoffHour || (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)) {
            // After 10:30 PM today, default to day after tomorrow
            return dayAfterTomorrow;
        } else {
            // Before or at 10:30 PM today, default to tomorrow
            return tomorrow;
        }
    };

    // Callback for date change in calendar (added from ConsumerDashboard.js)
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setDateSelectionError("");
    };

    // Callback to confirm selected date (added from ConsumerDashboard.js)
    const confirmSubscriptionDate = () => {
        // The getMinDate() function already handles the "today blocked" and "tomorrow blocked after cutoff" logic.
        // We just need to ensure the selected date is not before this minimum.
        if (selectedDate < getMinDate()) {
            setDateSelectionError("Please select a valid start date.");
            return;
        }
        setShowCalendar(false);
        // This part would typically lead to saving a new subscription,
        // but in this component, it's not directly linked to a UI for adding new items.
        // setSubscriptionConfirmed(true); // If you had a confirmation step
        setDateSelectionError("");
    };


    const checkModificationWindow = useCallback(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        // Freeze modifications from 10:30 PM to 6:59 AM (inclusive of 10:30 PM)
        const isFrozen = (currentHour === 23 && currentMinutes >= 30) || currentHour >= 23 || currentHour < 7;
        setCanModify(!isFrozen);

        const deadline = new Date();
        deadline.setHours(22, 30, 0, 0); // 10:30 PM
        if (now > deadline) {
            deadline.setDate(deadline.getDate() + 1); // If past 10:30 PM, set deadline for next day
        }
        const diff = deadline - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, []);

    useEffect(() => {
        // Initialize selectedDate on component mount with the correct initial date
        setSelectedDate(getInitialSubscriptionDate());

        const timer = setInterval(checkModificationWindow, 1000);
        return () => clearInterval(timer);
    }, [checkModificationWindow]);

    const fetchSubscriptions = useCallback(async () => {
        if (!consumer?.consumer_id || !token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/${consumer.consumer_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch subscriptions');
            const { subscriptions: subs } = await response.json();
            const organized = { Daily: [], 'Alternate Days': [], Weekly: [], Monthly: [] };
            subs.forEach(sub => {
                if (organized[sub.subscription_type]) {
                    organized[sub.subscription_type].push(sub);
                }
            });
            setSubscriptions(organized);
        } catch (error) {
            console.error('Subscription error:', error);
            showSuccess(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [consumer, token]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleModify = async (subscription_id, newQuantity) => {
        if (newQuantity < 1) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/${subscription_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ quantity: newQuantity })
            });
            if (!response.ok) throw new Error('Update failed');
            await fetchSubscriptions();
            setModifyItem(null);
            showSuccess('Quantity updated successfully');
        } catch (error) {
            showSuccess('Failed to update subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (subscription_id) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/${subscription_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Delete failed');
            await fetchSubscriptions();
            setDeleteItem(null);
            showSuccess('Subscription removed successfully');
        } catch (error) {
            showSuccess('Failed to remove subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const generateBill = async (plan) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bills/${consumer.consumer_id}/${plan}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate bill');
            }
            const { bill } = await response.json();
            setShowBill(bill);
        } catch (error) {
            showSuccess(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPlanPDF = async (plan) => {
        setIsLoading(true);
        // Ensure showBill data is available before attempting to download
        if (!showBill) {
            showSuccess("Please view the bill first before downloading.");
            setIsLoading(false);
            return;
        }
        const result = await downloadPlanPDF(plan, showBill, consumer);
        showSuccess(result.message);
        setIsLoading(false);
    };

    const handleGenerateCombinedBill = async () => {
        setIsLoading(true);
        try {
            // For combined bill, we typically generate for a period, e.g., last 30 days
            const endDate = moment();
            const startDate = moment().subtract(30, 'days');
            // Pass moment objects directly. pdfUtils will format them.
            const result = await generateCombinedBillPDF(consumer.consumer_id, token, startDate, endDate);
            showSuccess(result.message);
        } catch (error) {
            console.error("Error generating combined bill:", error);
            showSuccess(`Error generating combined bill: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlanCollapse = (plan) => setCollapsedPlans(prev => ({ ...prev, [plan]: !prev[plan] }));
    const redirectToProducts = (plan) => navigate('/consumer-dashboard', { state: { subscriptionType: plan } });
    const toggleActionMenu = (id) => setShowActionMenu(showActionMenu === id ? null : id);
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const carouselSettings = {
        dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 2500, arrows: false
    };

    if (!consumer) {
        return (
            <div className="subscribe-page">
                <div className="auth-required">
                    <h2>Please login to view your subscriptions</h2>
                    <Link to="/consumer-login" className="login-link">Login Now</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="subscribe-page">
            {isLoading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}
            {successMessage && <div className="success-message"><FaCheckCircle /> {successMessage}</div>}

            <div className="welcome-container">
                <div className="welcome-content">
                    <div className="welcome-icon"><FaUser /></div>
                    <div className="welcome-text">
                        <h2>Welcome back, {consumer.first_name}!</h2>
                        <p>Manage your subscriptions and enjoy fresh deliveries</p>
                    </div>
                </div>
            </div>

            {showInstructions && (
                <div className="popup-overlay">
                    <div className="instruction-popup popup-content">
                        <div className="popup-header">
                            <h3>Subscription Guidelines</h3>
                            <button className="close-popup" onClick={() => { setShowInstructions(false); localStorage.setItem('hasSeenInstructions', 'true'); }}>&times;</button>
                        </div>
                        <div className="instruction-content">
                            <div className="instruction-item">
                                <FaExclamationTriangle className="icon warning" />
                                <p>Maintain sufficient wallet balance for automatic payments</p>
                            </div>
                            <div className="instruction-item">
                                <FaClock className="icon info" />
                                <p>Modify your subscription before 10:30 PM daily</p>
                            </div>
                            <div className="instruction-item">
                                <FaCheckCircle className="icon success" />
                                <p>Fresh products delivered by 7 AM</p>
                            </div>
                        </div>
                        <div className="instruction-actions">
                            <button className="agree-btn" onClick={() => { setShowInstructions(false); localStorage.setItem('hasSeenInstructions', 'true'); }}>
                                I Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="subscribe-header">
                <button className="back-button" onClick={() => navigate(-1)}><FaArrowLeft /></button>
                <span className="modify-notice">
                    <FaClock /> {canModify ? `Modify before ${timeLeft}` : 'Modifications paused'}
                </span>
               
            </div>

            <div className="carousel-container">
                <Slider {...carouselSettings}>
                    {carouselImages.map((slide, index) => (
                        <div key={index} className="carousel-slide">
                            <img src={slide.img} alt={slide.title} />
                            <div className="slide-overlay"><h3>{slide.title}</h3><p>{slide.desc}</p></div>
                        </div>
                    ))}
                </Slider>
            </div>

            <Wallet />

            <div className="bill-buttons-container"> {/* New container for bill buttons */}
                <button className="combined-bill-btn" onClick={handleGenerateCombinedBill}>
                    <FaFilePdf /> Download Combined Bill (Last 30 Days)
                </button>
                {/* New Instructions Button */}
                <button className="instructions-btn" onClick={() => setShowInstructions(true)}>
                    <FaInfoCircle /> View Instructions
                </button>
            </div>


            <div className="subscription-plans">
                <h2 className="section-title"><span>Your Subscription Plans</span></h2>
                {Object.entries(subscriptions).map(([plan, items]) => (
                    <div key={plan} className={`plan-container ${collapsedPlans[plan] ? 'collapsed' : ''}`}>
                        <div className="plan-header" onClick={() => togglePlanCollapse(plan)}>
                            <div className="plan-title-container">
                                <h3 className="plan-title">{plan} Plan {items.length > 0 && <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>}</h3>
                                {collapsedPlans[plan] ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                            <div className="plan-controls" onClick={(e) => e.stopPropagation()}>
                                <div className="plan-timer"><FaClock /> {canModify ? timeLeft : 'Paused'}</div>
                                {items.length > 0 && <button className="bill-icon" onClick={() => generateBill(plan)}><FaFilePdf /> View Bill</button>}
                            </div>
                        </div>
                        {!collapsedPlans[plan] && (
                            <div className="plan-content">
                                {items.length > 0 ? (
                                    <table className="products-table">
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Total Price</th>
                                                <th>Start Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr key={item.subscription_id}>
                                                    <td>{item.product_name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.price}</td>
                                                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                                    <td>{formatDate(item.start_date)}</td>
                                                    <td className="product-actions">
                                                        <div className="action-menu-container">
                                                            <button className="action-menu-btn" onClick={() => toggleActionMenu(item.subscription_id)}><FaEllipsisV /></button>
                                                            {showActionMenu === item.subscription_id && (
                                                                <div className="action-menu">
                                                                    <button onClick={() => { setModifyItem(item); setShowActionMenu(null); }} disabled={!canModify}><FaEdit /> Modify</button>
                                                                    <button onClick={() => { setDeleteItem(item); setShowActionMenu(null); }} disabled={!canModify}><FaTrash /> Delete</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <div className="empty-plan"><p>No products in this plan.</p></div>}
                                <div className="add-product-section">
                                    <button className="add-product-btn" onClick={() => redirectToProducts(plan)} disabled={!canModify}>
                                        <FaPlusCircle /> Add Products to {plan} Plan
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showBill && (
                <div className="popup-overlay">
                    <div className="bill-popup popup-content">
                        <div className="popup-header">
                            <h3>{showBill.plan} Plan Bill</h3>
                            <button className="close-popup" onClick={() => setShowBill(null)}>&times;</button>
                        </div>
                        <div className="bill-details">
                            <table className="bill-table">
                                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                                <tbody>
                                    {showBill.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{Number(item.price).toFixed(2)}</td>
                                            <td>₹{Number(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr><td colSpan="3">Subtotal</td><td>₹{Number(showBill.subtotal).toFixed(2)}</td></tr>
                                    <tr><td colSpan="3">Subscription Fee</td><td>₹{Number(showBill.subscriptionFee).toFixed(2)}</td></tr>
                                    <tr className="total-row"><td colSpan="3">Total Amount</td><td>₹{Number(showBill.total).toFixed(2)}</td></tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="bill-actions">
                            <button className="download-pdf" onClick={() => handleDownloadPlanPDF(showBill.plan)}>
                                <FaFilePdf /> Download PDF
                            </button>
                            <button className="close-bill" onClick={() => setShowBill(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {modifyItem && (
                <div className="popup-overlay">
                    <div className="modify-popup popup-content">
                        <div className="popup-header">
                                <h3>Modify Quantity</h3>
                                <button className="close-popup" onClick={() => setModifyItem(null)}>&times;</button>
                        </div>
                        <div className="product-info">
                                <p className="product-name">{modifyItem.product_name}</p>
                                <p className="current-price">Price: ₹{modifyItem.price} per unit</p>
                        </div>
                        <div className="quantity-controls">
                                <button className="quantity-btn" onClick={() => setModifyItem({...modifyItem, quantity: Math.max(1, modifyItem.quantity - 1)})} disabled={modifyItem.quantity <= 1}><FaMinus/></button>
                                <span className="quantity-display">{modifyItem.quantity}</span>
                                <button className="quantity-btn" onClick={() => setModifyItem({...modifyItem, quantity: modifyItem.quantity + 1})}><FaPlus/></button>
                        </div>
                        <div className="new-price">
                            New Total: ₹{(modifyItem.price * modifyItem.quantity).toFixed(2)}
                        </div>
                        <div className="modify-actions">
                                <button className="confirm-btn" onClick={() => handleModify(modifyItem.subscription_id, modifyItem.quantity)}>Confirm Changes</button>
                                <button className="cancel-btn" onClick={() => setModifyItem(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteItem && (
                <div className="popup-overlay">
                    <div className="delete-popup popup-content">
                        <div className="popup-header">
                                <h3>Confirm Removal</h3>
                                <button className="close-popup" onClick={() => setDeleteItem(null)}>&times;</button>
                        </div>
                        <div className="delete-message">
                                <p>Are you sure you want to remove <strong>{deleteItem.product_name}</strong> from your subscription?</p>
                                <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="delete-actions">
                                <button className="confirm-delete" onClick={() => handleDelete(deleteItem.subscription_id)}>Yes, Remove Item</button>
                                <button className="cancel-delete" onClick={() => setDeleteItem(null)}>No, Keep Item</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscribe;
