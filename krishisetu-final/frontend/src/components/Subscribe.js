import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaArrowLeft, 
  FaClock, 
  FaWallet, 
  FaFilePdf, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaMinus,
  FaChevronDown,
  FaChevronUp,
  FaPlusCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUser,
  FaEllipsisV,
  FaHistory
} from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './subscribe.css';

// Import carousel images
import slide1 from '../assets/free.jpg';
import slide2 from '../assets/5%discount.jpg';
import slide3 from '../assets/morning.jpg';
import slide4 from '../assets/lowsub.png';

const safeParseNumber = (value) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const Subscribe = () => {
  const { consumer, token } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [showWallet, setShowWallet] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBill, setShowBill] = useState(null);
  const [modifyItem, setModifyItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [collapsedPlans, setCollapsedPlans] = useState({});
  const [showInstructions, setShowInstructions] = useState(() => {
    const hasSeenInstructions = localStorage.getItem('hasSeenInstructions');
    return hasSeenInstructions !== 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState({
    Daily: [],
    'Alternate Days': [],
    Weekly: [],
    Monthly: []
  });
  const [canModify, setCanModify] = useState(true);

  // Carousel images data
  const carouselImages = [
    { img: slide1, title: "No Delivery Charges", desc: "Enjoy free delivery on all your subscription orders" },
    { img: slide2, title: "5% Discount", desc: "Get 5% discount on every product in your subscription" },
    { img: slide3, title: "Low Subscription Fee", desc: "Subscription starts from just ₹3 per kg" },
    { img: slide4, title: "Early Morning Delivery", desc: "Fresh products delivered by 7 AM every day" }
  ];

  // Check modification window
  const checkModificationWindow = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Freeze modifications between 10:30pm and 7am
    if ((currentHour === 22 && currentMinutes >= 30) || 
        (currentHour >= 23) || 
        (currentHour < 7)) {
      setCanModify(false);
      return;
    }
    
    setCanModify(true);
    
    // Calculate time left until 10:30pm
    const deadline = new Date();
    deadline.setHours(22, 30, 0, 0);
    
    if (now > deadline) {
      deadline.setDate(deadline.getDate() + 1);
    }

    const diff = deadline - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      checkModificationWindow();
    }, 1000);
    return () => clearInterval(timer);
  }, [checkModificationWindow]);

  const fetchWalletData = useCallback(async () => {
    if (!consumer?.consumer_id || !token) return;

    try {
      setIsLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/wallet/balance/${consumer.consumer_id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/wallet/transactions/${consumer.consumer_id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!balanceRes.ok) throw new Error('Failed to fetch wallet balance');
      if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      setWalletBalance(safeParseNumber(balanceData.balance));
      setTransactions(transactionsData.transactions.map(txn => ({
        ...txn,
        amount: safeParseNumber(txn.amount),
        balance: safeParseNumber(txn.balance)
      })));
    } catch (error) {
      console.error('Wallet data error:', error);
      setSuccessMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [consumer, token]);

  const fetchSubscriptions = useCallback(async () => {
    if (!consumer?.consumer_id || !token) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/subscriptions/${consumer.consumer_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      
      const { subscriptions: subs } = await response.json();

      const organizedSubscriptions = {
        Daily: subs.filter(sub => sub.subscription_type === 'Daily'),
        'Alternate Days': subs.filter(sub => sub.subscription_type === 'Alternate Days'),
        Weekly: subs.filter(sub => sub.subscription_type === 'Weekly'),
        Monthly: subs.filter(sub => sub.subscription_type === 'Monthly')
      };

      setSubscriptions(organizedSubscriptions);
    } catch (error) {
      console.error('Subscription error:', error);
      setSuccessMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [consumer, token]);

  useEffect(() => {
    fetchSubscriptions();
    fetchWalletData();
    checkModificationWindow();
  }, [fetchSubscriptions, fetchWalletData, checkModificationWindow]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const togglePlanCollapse = (plan) => {
    setCollapsedPlans(prev => ({
      ...prev,
      [plan]: !prev[plan]
    }));
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    
    if (isNaN(amount)) {
      showSuccess('Please enter a valid number');
      return;
    }
    
    if (amount <= 0) {
      showSuccess('Amount must be greater than 0');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/wallet/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          consumer_id: consumer.consumer_id,
          amount: amount.toFixed(2),
          payment_method: 'Online Payment',
          consumer_name: `${consumer.first_name} ${consumer.last_name}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add money');
      }

      const result = await response.json();
      setWalletBalance(result.newBalance);
      setAddAmount('');
      setShowWallet(false);
      await fetchWalletData();
      showSuccess(`₹${amount} added successfully`);
    } catch (error) {
      console.error('Wallet add error:', error);
      showSuccess(error.message || 'Failed to complete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = async (subscription_id, newQuantity) => {
    if (!canModify) {
      showSuccess('Modifications are paused until 7 AM');
      return;
    }
    
    if (newQuantity < 1) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/subscriptions/${subscription_id}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        }
      );

      if (!response.ok) throw new Error('Update failed');
      await fetchSubscriptions();
      setModifyItem(null);
      showSuccess('Quantity updated successfully');
    } catch (error) {
      console.error('Modify error:', error);
      showSuccess('Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (subscription_id) => {
    if (!canModify) {
      showSuccess('Modifications are paused until 7 AM');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/subscriptions/${subscription_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Delete failed');
      await fetchSubscriptions();
      setDeleteItem(null);
      showSuccess('Subscription removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      showSuccess('Failed to remove subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBill = async (plan) => {
    try {
      setIsLoading(true);
      
      // First get the bill details
      const billResponse = await fetch(
        `http://localhost:5000/api/bills/${consumer.consumer_id}/${plan}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!billResponse.ok) {
        const errorData = await billResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate bill');
      }
      
      const { bill } = await billResponse.json();
      
      // Then process payment
      const paymentResponse = await fetch(
        `http://localhost:5000/api/bills/pay/${consumer.consumer_id}/${plan}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Payment failed');
      }
      
      const paymentResult = await paymentResponse.json();
      
      // Update wallet balance
      setWalletBalance(paymentResult.newBalance);
      
      // Set the bill with payment information
      setShowBill({
        ...bill,
        transactionId: paymentResult.transactionId,
        paymentStatus: 'Completed'
      });
      
      // Refresh wallet data
      await fetchWalletData();
      
      showSuccess(`Bill generated and payment processed for ${plan} plan`);
    } catch (error) {
      console.error('Bill generation error:', error);
      showSuccess(error.message || 'Failed to generate bill');
      
      // If payment failed but we have bill data, show it
      if (error.message.includes('Failed to generate bill')) {
        const localBill = {
          plan,
          items: subscriptions[plan],
          subtotal: subscriptions[plan].reduce((sum, item) => sum + (item.price * item.quantity), 0),
          subscriptionFee: subscriptions[plan].reduce((sum, item) => sum + (5 * item.quantity), 0),
          total: 0,
          message: "Could not generate bill. Please try again later."
        };
        localBill.total = localBill.subtotal + localBill.subscriptionFee;
        setShowBill(localBill);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async (plan) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/bills/pdf/${consumer.consumer_id}/${plan}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription_bill_${plan}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSuccess('PDF bill downloaded successfully');
    } catch (error) {
      console.error('PDF download error:', error);
      showSuccess(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToProducts = (plan) => {
    if (walletBalance < 100) {
      showSuccess('Please add sufficient funds to your wallet before subscribing');
      setShowWallet(true);
      return;
    }
    navigate('/consumer-dashboard', { state: { subscriptionType: plan } });
  };

  const toggleActionMenu = (planId, itemId) => {
    if (!canModify) {
      showSuccess('Modifications are paused until 7 AM');
      return;
    }
    const menuId = `${planId}-${itemId}`;
    setShowActionMenu(showActionMenu === menuId ? null : menuId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTransactionDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: true
  };

  if (!consumer) {
    return (
      <div className="subscribe-page">
        <div className="auth-required">
          <h2>Please login to view your subscriptions</h2>
          <Link to="/consumer-login" className="login-link">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="subscribe-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      <div className="welcome-container">
        <div className="welcome-content">
          <div className="welcome-icon">
            <FaUser />
          </div>
          <div className="welcome-text">
            <h2>Welcome back, {consumer.first_name} {consumer.last_name}!</h2>
            <p>Manage your subscriptions and enjoy fresh deliveries</p>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="popup-overlay">
          <div className="instruction-popup popup-content">
            <div className="popup-header">
              <h3>Subscription Guidelines</h3>
              <button 
                className="close-popup"
                onClick={() => {
                  setShowInstructions(false);
                  localStorage.setItem('hasSeenInstructions', 'true');
                }}
              >
                &times;
              </button>
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
              <div className="instruction-item">
                <FaExclamationTriangle className="icon warning" />
                <p>Payment deducted after successful delivery</p>
              </div>
            </div>
            
            <div className="instruction-actions">
              <button 
                className="agree-btn"
                onClick={() => {
                  setShowInstructions(false);
                  localStorage.setItem('hasSeenInstructions', 'true');
                  if (walletBalance < 100) {
                    setShowWallet(true);
                  }
                }}
              >
                I Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="subscribe-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <span className="modify-notice">
          <FaClock /> {canModify ? `Modify before ${timeLeft}` : 'Modifications paused until 7 AM'}
        </span>
        <Link to="/consumer-dashboard" className="market-link">
          Back to Dashboard
        </Link>
      </div>

      <div className="carousel-container">
        <Slider {...carouselSettings}>
          {carouselImages.map((slide, index) => (
            <div key={index} className="carousel-slide">
              <img 
                src={slide.img} 
                alt={slide.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-slide.jpg";
                }}
              />
              <div className="slide-overlay">
                <h3>{slide.title}</h3>
                <p>{slide.desc}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className="wallet-section">
        <div className="wallet-balance-card">
          <div className="wallet-info">
            <FaWallet className="wallet-icon" />
            <div>
              <p className="wallet-label">Wallet Balance</p>
              <p className="wallet-amount">₹{walletBalance.toLocaleString()}</p>
            </div>
          </div>
          <div className="wallet-actions">
            <button 
              className="wallet-action" 
              onClick={() => setShowWallet(true)}
            >
              Add Money
            </button>
            <button 
              className="wallet-action history" 
              onClick={() => setShowHistory(true)}
            >
              <FaHistory /> History
            </button>
          </div>
        </div>
      </div>

      <div className="subscription-plans">
        <h2 className="section-title">
          <span>Your Subscription Plans</span>
        </h2>
        
        {Object.entries(subscriptions).map(([plan, items]) => (
          <div key={plan} className={`plan-container ${collapsedPlans[plan] ? 'collapsed' : ''}`}>
            <div 
              className="plan-header"
              onClick={() => togglePlanCollapse(plan)}
            >
              <div className="plan-title-container">
                <h3 className="plan-title">
                  {plan} Plan
                  {items.length > 0 && (
                    <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  )}
                </h3>
                {collapsedPlans[plan] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <div 
                className="plan-controls"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="plan-timer-container">
                  <div className="modify-before-text">{canModify ? 'modify before' : 'modifications paused'}</div>
                  <div className="plan-timer">
                    <FaClock /> {canModify ? timeLeft : 'until 7 AM'}
                  </div>
                </div>
                {items.length > 0 && (
                  <button 
                    className="bill-icon"
                    onClick={() => generateBill(plan)}
                  >
                    <FaFilePdf /> View Bill
                  </button>
                )}
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
                              <button
                                className="action-menu-btn"
                                onClick={() => toggleActionMenu(plan, item.subscription_id)}
                              >
                                <FaEllipsisV />
                              </button>
                              {showActionMenu === `${plan}-${item.subscription_id}` && (
                                <div className="action-menu">
                                  <button
                                    onClick={() => {
                                      setModifyItem({ 
                                        plan, 
                                        id: item.subscription_id, 
                                        quantity: item.quantity,
                                        name: item.product_name,
                                        price: item.price
                                      });
                                      setShowActionMenu(null);
                                    }}
                                    disabled={!canModify}
                                  >
                                    <FaEdit /> Modify
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteItem({ 
                                        plan, 
                                        id: item.subscription_id, 
                                        name: item.product_name 
                                      });
                                      setShowActionMenu(null);
                                    }}
                                    disabled={!canModify}
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-plan">
                    <p>No products in this subscription plan</p>
                  </div>
                )}
                <div className="add-product-section">
                  <button 
                    className="add-product-btn"
                    onClick={() => redirectToProducts(plan)}
                    disabled={!canModify}
                  >
                    <FaPlusCircle /> Add Products to {plan} Plan
                  </button>
                  {!canModify && (
                    <div className="modify-disabled-message">
                      <FaExclamationTriangle /> Modifications paused until 7 AM
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showWallet && (
        <div className="popup-overlay">
          <div className="wallet-popup popup-content">
            <div className="popup-header">
              <h3>Wallet Management</h3>
              <button 
                className="close-popup"
                onClick={() => setShowWallet(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="wallet-user-details">
              <div className="wallet-user-info">
                <h4>Account Holder</h4>
                <p>{consumer.first_name} {consumer.last_name}</p>
              </div>
              <div className="wallet-user-info">
                <h4>Consumer ID</h4>
                <p>{consumer.consumer_id}</p>
              </div>
            </div>
            
            <div className="current-balance">
              <h4>Current Balance</h4>
              <p className="balance-amount">₹{walletBalance.toLocaleString()}</p>
            </div>
            
            <div className="add-money-section">
              <h4>Add Money to Wallet</h4>
              <div className="add-money-controls">
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="100"
                />
                <button 
                  className="add-money-btn"
                  onClick={handleAddMoney}
                  disabled={!addAmount || Number(addAmount) <= 0}
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="popup-overlay">
          <div className="history-popup popup-content">
            <div className="popup-header">
              <h3>Wallet History</h3>
              <button 
                className="close-popup"
                onClick={() => setShowHistory(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="wallet-user-details">
              <div className="wallet-user-info">
                <h4>Account Holder</h4>
                <p>{consumer.first_name} {consumer.last_name}</p>
              </div>
              <div className="wallet-user-info">
                <h4>Consumer ID</h4>
                <p>{consumer.consumer_id}</p>
              </div>
              <div className="wallet-user-info">
                <h4>Current Balance</h4>
                <p>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            <div className="transactions-list">
              <h4>Recent Transactions</h4>
              {transactions.length > 0 ? (
                <div className="transactions-table-container">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr key={txn.transaction_id}>
                          <td>{formatTransactionDate(txn.transaction_date)}</td>
                          <td>{txn.description}</td>
                          <td className={`txn-type ${txn.transaction_type.toLowerCase()}`}>
                            {txn.transaction_type}
                          </td>
                          <td className={`txn-amount ${txn.transaction_type.toLowerCase()}`}>
                            {txn.transaction_type === 'Credit' ? '+' : '-'}₹
                            {safeParseNumber(txn.amount).toFixed(2)}
                          </td>
                          <td>₹{safeParseNumber(txn.balance).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-transactions">
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBill && (
        <div className="popup-overlay">
          <div className="bill-popup popup-content">
            <div className="popup-header">
              <h3>{showBill.plan} Plan Bill</h3>
              <button 
                className="close-popup"
                onClick={() => setShowBill(null)}
              >
                &times;
              </button>
            </div>
            
            {showBill.billingPeriod && (
              <div className="bill-period">
                <p>
                  <strong>Billing Period:</strong> {showBill.billingPeriod.start} to {showBill.billingPeriod.end}
                </p>
                {showBill.billingPeriod.nextBillingDate && (
                  <p><strong>Next Billing Date:</strong> {showBill.billingPeriod.nextBillingDate}</p>
                )}
              </div>
            )}
            
            {showBill.message ? (
              <div className="bill-message">
                <p>{showBill.message}</p>
              </div>
            ) : (
              <>
                <div className="bill-details">
                  <table className="bill-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showBill.items && showBill.items.length > 0 ? (
                        showBill.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price?.toFixed(2)}</td>
                            <td>₹{item.total?.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="no-items">No subscription items found</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="subtotal-row">
                        <td colSpan="3">Subtotal</td>
                        <td>₹{showBill.subtotal?.toFixed(2) || '0.00'}</td>
                      </tr>
                      <tr className="fee-row">
                        <td colSpan="3">Subscription Fee</td>
                        <td>₹{showBill.subscriptionFee?.toFixed(2) || '0.00'}</td>
                      </tr>
                      <tr className="total-row">
                        <td colSpan="3">Total Amount</td>
                        <td>₹{showBill.total?.toFixed(2) || '0.00'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="bill-actions">
                  <button 
                    className="download-pdf"
                    onClick={() => downloadPDF(showBill.plan)}
                    disabled={!showBill.items || showBill.items.length === 0}
                  >
                    <FaFilePdf /> Download PDF Bill
                  </button>
                  <button 
                    className="close-bill"
                    onClick={() => setShowBill(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {modifyItem && (
        <div className="popup-overlay">
          <div className="modify-popup popup-content">
            <div className="popup-header">
              <h3>Modify Quantity</h3>
              <button 
                className="close-popup"
                onClick={() => setModifyItem(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="product-info">
              <p className="product-name">{modifyItem.name}</p>
              <p className="current-price">
                Price: ₹{modifyItem.price} per unit
              </p>
            </div>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn decrease"
                onClick={() => {
                  if (modifyItem.quantity > 1) {
                    setModifyItem(prev => ({ ...prev, quantity: prev.quantity - 1 }));
                  }
                }}
                disabled={modifyItem.quantity <= 1}
              >
                <FaMinus />
              </button>
              <span className="quantity-display">{modifyItem.quantity}</span>
              <button 
                className="quantity-btn increase"
                onClick={() => setModifyItem(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
              >
                <FaPlus />
              </button>
            </div>
            
            <div className="new-price">
              New Total: ₹{(modifyItem.price * modifyItem.quantity).toFixed(2)}
            </div>
            
            <div className="modify-actions">
              <button 
                className="confirm-btn"
                onClick={() => handleModify(modifyItem.id, modifyItem.quantity)}
              >
                Confirm Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setModifyItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="popup-overlay">
          <div className="delete-popup popup-content">
            <div className="popup-header">
              <h3>Confirm Removal</h3>
              <button 
                className="close-popup"
                onClick={() => setDeleteItem(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="delete-message">
              <p>Are you sure you want to remove <strong>{deleteItem.name}</strong> from your subscription?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            
            <div className="delete-actions">
              <button 
                className="confirm-delete"
                onClick={() => handleDelete(deleteItem.id)}
              >
                Yes, Remove Item
              </button>
              <button 
                className="cancel-delete"
                onClick={() => setDeleteItem(null)}
              >
                No, Keep Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribe;