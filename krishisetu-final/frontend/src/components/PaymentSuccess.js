import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BsCheckCircleFill } from 'react-icons/bs';
import { FaShoppingBag } from 'react-icons/fa';
//import './PaymentSuccess.css';
import './OrderPage.css'
const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const paymentRequestId = searchParams.get('payment_request_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verify-instamojo-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            payment_request_id: paymentRequestId,
            payment_id: paymentId
          })
        });

        const data = await response.json();
        if (!data.success) {
          navigate('/payment-failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        navigate('/payment-failed');
      }
    };

    if (paymentRequestId && paymentId) {
      verifyPayment();
    } else {
      navigate('/');
    }
  }, [paymentRequestId, paymentId, navigate]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <BsCheckCircleFill className="success-icon" />
        <h2>Payment Successful!</h2>
        <p>Thank you for your order. Your payment has been processed successfully.</p>
        <div className="order-details">
          <p><strong>Payment ID:</strong> {paymentId}</p>
          <p><strong>Request ID:</strong> {paymentRequestId}</p>
        </div>
        <button 
          className="continue-shopping-btn"
          onClick={() => navigate('/consumer-dashboard')}
        >
          <FaShoppingBag /> Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;