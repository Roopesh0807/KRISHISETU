import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Transactions.css';

const Transactions = () => {
  const { consumer } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!consumer?.consumer_id || !consumer?.token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await fetch(
          `http://localhost:5000/api/wallet/transactions/${consumer.consumer_id}`,
          {
            headers: {
              'Authorization': `Bearer ${consumer.token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
          }
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [consumer]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading-container">Loading your transactions...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        {error.includes('Session expired') && (
          <button 
            onClick={() => navigate('/login')} 
            className="login-btn"
          >
            Login Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <h1>Transaction History</h1>
      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.transaction_id} className={txn.transaction_type.toLowerCase()}>
                  <td>{formatDate(txn.transaction_date)}</td>
                  <td>{txn.description}</td>
                  <td>
                    <span className={`txn-type ${txn.transaction_type.toLowerCase()}`}>
                      {txn.transaction_type}
                    </span>
                  </td>
                  <td className={`amount ${txn.transaction_type.toLowerCase()}`}>
                    {txn.transaction_type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                  </td>
                  <td>₹{txn.balance}</td>
                  <td>{txn.payment_method || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;