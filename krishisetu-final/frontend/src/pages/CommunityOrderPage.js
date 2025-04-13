// CommunityOrderPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Navbar3 from "../components/Navbar3.js";
import "../styles/CommunityOrderPage.css";

function CommunityOrderPage() {
  const { communityId, orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { consumer } = useAuth();
  const [order, setOrder] = useState(null);
  const [community, setCommunity] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // In your component (likely at the top with other state declarations)
const [orderItems, setOrderItems] = useState([]); // Array of order items
const [memberId, setMemberId] = useState(null); // Member ID
  const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery");
  const [discount, setDiscount] = useState({
    totalDiscount: 0,
    memberDiscountAmount: 0,
    itemDiscountAmount: 0,
    memberCount: 0,
    itemCount: 0
  });
  const getProductImage = (productId) => {
    if (location.state?.productImages?.[productId]) {
      return location.state.productImages[productId];
    }
    
    try {
      const cart = JSON.parse(localStorage.getItem('krishiCart')) || [];
      const productInCart = cart.find(item => item.product_id === productId);
      return productInCart?.image || `/images/default-produce.jpg`;
    } catch (err) {
      console.error("Error getting product image:", err);
      return `/images/default-produce.jpg`;
    }
  };
  useEffect(() => {
    // Check for discount data in location state
    if (location.state?.discountData) {
      setDiscount(location.state.discountData);
    }
  }, [location.state]);

  useEffect(() => {
    
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/community/${communityId}/order/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${consumer.token}`
            }
          }
        );
        

        if (!response.ok) {
          throw new Error('Failed to fetch order data');
        }

        const data = await response.json();
        
        // Verify the order belongs to the current user
        if (data.member.consumer_id !== consumer.consumer_id) {
          throw new Error('You are not authorized to view this order');
        }

        setOrder(data.order);
        setCommunity(data.community);
        setMember(data.member);

        if (data.order.discount_data) {
          const discountData = JSON.parse(data.order.discount_data);
          setDiscount(prev => ({
            ...prev,
            ...discountData
          }));
        }

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [communityId, orderId, consumer]);

  // const handlePlaceOrder = async () => {
  //   try {
  //     // 1. First complete the frozen order
  //     const completeResponse = await fetch(
  //       `http://localhost:5000/api/community/${communityId}/orders/${orderId}/complete`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${consumer.token}`
  //         },
  //         body: JSON.stringify({ paymentMethod })
  //       }
  //     );
  
  //     if (!completeResponse.ok) {
  //       throw new Error('Failed to complete order');
  //     }
  
  //     const completedOrder = await completeResponse.json();
  
  //     // 2. Then place the order in the placeorder table
  //     const parsedOrders = JSON.parse(completedOrder.orderData.order.order_data || '[]');
  //     const orderData = {
  //       consumer_id: consumer.consumer_id,
  //       name: completedOrder.orderData.member.member_name,
  //       mobile_number: completedOrder.orderData.member.phone_number,
  //       email: completedOrder.orderData.member.member_email,
  //       address: completedOrder.orderData.community.address,
  //       pincode: "000000", // Default pincode, can be updated if needed
  //       produce_name: parsedOrders.map(item => item.product_name).join(", "),
  //       quantity: parsedOrders.reduce((sum, item) => sum + item.quantity, 0),
  //       amount: completedOrder.orderData.order.total_amount,
  //       payment_method: paymentMethod,
  //       is_community: 'yes',
  //       community_id: communityId
  //     };
  
  //     const placeOrderResponse = await fetch(
  //       `http://localhost:5000/api/order/place-order`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${consumer.token}`
  //         },
  //         body: JSON.stringify(orderData)
  //       }
  //     );
  
  //     if (!placeOrderResponse.ok) {
  //       const errorData = await placeOrderResponse.json();
  //       throw new Error(errorData.error || 'Failed to save order details');
  //     }
  
  //     navigate(`/community/${communityId}/order/${orderId}/confirmation`);
  //   } catch (err) {
  //     console.error("Place order error:", err);
  //     setError(err.message);
  //   }
  // };

  const handleConfirmOrder = async () => {
    try {
      // Prepare order data from your component state
      const orderData = {
        communityId: communityId,
        memberId: memberId,
        consumer_id: consumer.consumer_id,
        name: member.member_name,
        mobile_number: member.phone_number,
        email: member.member_email,
        address: community.address,
        pincode: "000000", // Or get from user input
        produce_name: orderItems.map(item => item.product_name).join(", "),
        quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        amount: totalAmount,
        payment_method: paymentMethod,
        order_items: orderItems // Include all order items
      };
  
      const response = await fetch('http://localhost:5000/api/order/place-community-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify(orderData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }
  
      const result = await response.json();
      navigate(`/community/${communityId}/order/${result.orderId}/confirmation`);
      
    } catch (err) {
      console.error("Order confirmation error:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!order || !community || !member) {
    return <div className="no-data">No data available</div>;
  }

  // Add this helper function at the top of your component
const safeToFixed = (value, decimals = 2) => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};


// const formatCurrency = (value) => {
//   const num = Number(value);
//   return isNaN(num) ? '0.00' : num.toFixed(2);
// };
const discountSection = (
  <div className="discount-summary">
    <h3>Discounts Applied</h3>
    <div className="discount-row">
      <span>Community Discount ({discount.memberCount || 0} members):</span>
      <span>₹{safeToFixed(discount.memberDiscountAmount)}</span>
    </div>
    <div className="discount-row">
      <span>Volume Discount ({discount.itemCount || 0} items):</span>
      <span>₹{safeToFixed(discount.itemDiscountAmount)}</span>
    </div>
    <div className="discount-total">
      <span>Total Discount:</span>
      <span>₹{safeToFixed(discount.totalDiscountAmount)}</span>
    </div>
  </div>
);

// Update the order total section:
const orderTotalSection = (
  <div className="order-total">
    <div className="total-row">
      <span>Subtotal:</span>
      <span>₹{safeToFixed(discount.subtotal || order.total_amount)}</span>
    </div>
    <div className="total-row">
      <span>Total Discount:</span>
      <span>- ₹{safeToFixed(discount.totalDiscountAmount)}</span>
    </div>
    <div className="final-total">
      <span>Amount to Pay:</span>
      <span>₹{safeToFixed((discount.subtotal || order.total_amount) - (discount.totalDiscountAmount || 0))}</span>
    </div>
  </div>
);
const parsedOrders = JSON.parse(order.order_data || '[]');
const parsedDiscount = order.discount_data ? JSON.parse(order.discount_data) : {
  totalDiscount: 0,
  memberDiscountAmount: 0,
  itemDiscountAmount: 0,
  memberCount: 0,
  itemCount: 0
};

const totalAmount = Number(order.total_amount) || 0;
const discountAmount = totalAmount * ((parsedDiscount.totalDiscount || 0) / 100);
const finalAmount = totalAmount - discountAmount;

  return (
    <div className="community-order-page">
      <Navbar3 />
      
      <div className="header">
        <button 
          onClick={() => navigate(`/community/${communityId}`)}
          className="back-btn"
        >
          Back to Community
        </button>
        <h1>Community Order Confirmation</h1>
      </div>

      <div className="order-summary">
        <div className="community-info">
          <h2>{community.name}</h2>
          <div className="address-section">
            <label>Delivery Address:</label>
            <input
              type="text"
              value={community.address || "Not specified"}
              readOnly
              className="read-only"
            />
          </div>
          <p>
            Delivery Date: {community.delivery_date} at {community.delivery_time || "N/A"}
          </p>
        </div>

        <div className="member-info">
          <h3>Your Information</h3>
          <p>Name: {member.member_name}</p>
          <p>Phone: {member.phone_number}</p>
        </div>

        <div className="order-items">
          <h3>Your Order</h3>
          <div className="order-items-container">
            {parsedOrders.map((item, index) => (
              <div key={index} className="order-item-card">
                <div className="product-image">
                  <img 
                    src={getProductImage(item.product_id)} 
                    alt={item.product_name}
                    onError={(e) => e.target.src = "/images/default-produce.jpg"}
                  />
                </div>
                <div className="product-details">
                  <h4>{item.product_name}</h4>
                  <p>Price: ₹{safeToFixed(item.price)}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: ₹{safeToFixed(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="discount-summary">
          <h3>Discounts Applied</h3>
          <div className="discount-row">
          <span>Community Discount ({parsedDiscount.memberCount || 0} members):</span>
          <span>{parsedDiscount.memberDiscount || 0}% (₹{safeToFixed(parsedDiscount.memberDiscountAmount)})</span>
          </div>
          <div className="discount-row">
          <span>Volume Discount ({parsedDiscount.itemCount || 0} items):</span>
          <span>{parsedDiscount.itemDiscount || 0}% (₹{safeToFixed(parsedDiscount.itemDiscountAmount)})</span>
          </div>
          <div className="discount-total">
            <span>Total Discount:</span>
            <span>{parsedDiscount.totalDiscount || 0}% (₹{safeToFixed(discountAmount)})</span>
          </div>
        </div> */}

        {/* <div className="order-total">
  <div className="total-row">
    <span>Subtotal:</span>
    <span>₹{safeToFixed(totalAmount)}</span>
  </div>
  <div className="total-row">
    <span>Total Discount:</span>
    <span>- ₹{safeToFixed(discountAmount)}</span>
  </div>
  <div className="final-total">
    <span>Amount to Pay:</span>
    <span>₹{safeToFixed(finalAmount)}</span>
  </div>
</div> */}
        {discountSection}
        {orderTotalSection}


        <div className="payment-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
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
            <label>
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              Online Payment
            </label>
          </div>
        </div>

        {/* <div className="order-total">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Total Discount:</span>
            <span>- ₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="final-total">
            <span>Amount to Pay:</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>
        </div> */}

        <button 
          className="place-order-btn"
          onClick={handleConfirmOrder}
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
}

export default CommunityOrderPage;