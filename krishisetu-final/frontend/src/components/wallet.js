import React, { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaHistory, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './wallet.css';


const safeParseNumber = (value) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const Wallet = () => {
  const { consumer, token } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const fetchWalletData = useCallback(async () => {
    if (!consumer?.consumer_id || !token) return;

    setIsLoading(true);
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/wallet/balance/${consumer.consumer_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/wallet/transactions/${consumer.consumer_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
      showSuccess(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [consumer, token]);


  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      showSuccess('Please enter a valid amount');
      return;
    }
    setIsLoading(true);

    try {
      // Step 1: Create a Razorpay Order from your server
      const orderResponse = await fetch('http://localhost:5000/api/wallet/razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amount })
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create Razorpay order");
      }
      
      const { order } = orderData;

      // Step 2: Configure and open Razorpay Checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_VLCfnymiyd6HGf', // Replace with your actual Key ID
        amount: order.amount,
        currency: order.currency,
        name: 'KrishiSetu Wallet',
        description: `Add ₹${amount} to your wallet`,
        order_id: order.id,
        handler: async (response) => {
          // Step 3: Verify the payment on your server
          const verificationResponse = await fetch('http://localhost:5000/api/wallet/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount // Send the original amount for verification
            })
          });

          const verificationData = await verificationResponse.json();

          if (verificationData.success) {
            showSuccess(`₹${amount} added successfully!`);
            await fetchWalletData(); // Refresh wallet data
            setShowWalletPopup(false);
            setAddAmount(''); // Clear the input field
          } else {
            throw new Error(verificationData.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: `${consumer.first_name} ${consumer.last_name}`,
          email: consumer.email,
          contact: consumer.phone_number
        },
        theme: {
          color: '#5a7247'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Add money with Razorpay error:', error);
      showSuccess(error.message || 'Failed to complete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTransactionDate = (dateString) => {
    const options = {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

return (
  <div className="wallet-section">
   
      {successMessage && (
        <div className="success-message">
          <FaCheckCircle /> {successMessage}
        </div>
      )}
      <div className="wallet-balance-card">
        <div className="wallet-info">
          <FaWallet className="wallet-icon" />
          <div>
            <p className="wallet-label">Wallet Balance</p>
            <p className="wallet-amount">₹{walletBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="wallet-actions">
          <button className="wallet-action" onClick={() => setShowWalletPopup(true)}>
            Add Money
          </button>
          <button className="wallet-action history" onClick={() => setShowHistoryPopup(true)}>
            <FaHistory /> History
          </button>
        </div>
      </div>

      {showWalletPopup && (
        <div className="popup-overlay">
          <div className="wallet-popup popup-content">
            <div className="popup-header">
              <h3>Wallet Management</h3>
              <button className="close-popup" onClick={() => setShowWalletPopup(false)}>&times;</button>
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
              <p className="balance-amount">₹{walletBalance.toLocaleString('en-IN')}</p>
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
                <button className="add-money-btn" onClick={handleAddMoney} disabled={!addAmount || Number(addAmount) <= 0}>
                  Add Funds via Razorpay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showHistoryPopup && (
        <div className="popup-overlay">
          <div className="history-popup popup-content">
            <div className="popup-header">
              <h3>Wallet History</h3>
              <button className="close-popup" onClick={() => setShowHistoryPopup(false)}>&times;</button>
            </div>
            <div className="wallet-user-details">
                <div className="wallet-user-info"><h4>Account Holder</h4><p>{consumer.first_name} {consumer.last_name}</p></div>
                <div className="wallet-user-info"><h4>Consumer ID</h4><p>{consumer.consumer_id}</p></div>
                <div className="wallet-user-info"><h4>Current Balance</h4><p>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
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
                          <td className={`txn-type ${txn.transaction_type.toLowerCase()}`}>{txn.transaction_type}</td>
                          <td className={`txn-amount ${txn.transaction_type.toLowerCase()}`}>
                            {txn.transaction_type === 'Credit' ? '+' : '-'}₹{safeParseNumber(txn.amount).toFixed(2)}
                          </td>
                          <td>₹{safeParseNumber(txn.balance).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-transactions"><p>No transactions found</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;