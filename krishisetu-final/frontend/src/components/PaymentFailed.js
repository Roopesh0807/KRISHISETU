import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
//import './PaymentFailed.css';
import './OrderPage.css';
const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-failed-container">
      <div className="payment-failed-card">
        <FaExclamationTriangle className="failed-icon" />
        <h2>Payment Failed</h2>
        <p>We couldn't process your payment. Please try again or contact support.</p>
        <button 
          className="try-again-btn"
          onClick={() => navigate('/checkout')}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;