// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from '../context/AuthContext';
// import Navbar3 from "../components/Navbar3.js";
// import "../styles/CommunityOrderPage.css";

// function CommunityOrderPage() {
//   const { communityId, orderId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { consumer } = useAuth();
//   const [order, setOrder] = useState(null);
//   const [community, setCommunity] = useState(null);
//   const [member, setMember] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery");
//   const [discount, setDiscount] = useState({
//     totalDiscount: 0,
//     memberDiscountAmount: 0,
//     itemDiscountAmount: 0,
//     memberCount: 0,
//     itemCount: 0
//   });

//   const getProductImage = (productId) => {
//     if (location.state?.productImages?.[productId]) {
//       return location.state.productImages[productId];
//     }
    
//     try {
//       const cart = JSON.parse(localStorage.getItem('krishiCart')) || [];
//       const productInCart = cart.find(item => item.product_id === productId);
//       return productInCart?.image || `/images/default-produce.jpg`;
//     } catch (err) {
//       console.error("Error getting product image:", err);
//       return `/images/default-produce.jpg`;
//     }
//   };

//   useEffect(() => {
//     if (location.state?.discountData) {
//       setDiscount(location.state.discountData);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     const fetchOrderData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `http://localhost:5000/api/community/${communityId}/order/${orderId}`,
//           {
//             headers: {
//               'Authorization': `Bearer ${consumer.token}`
//             }
//           }
//         );

//         if (!response.ok) {
//           throw new Error('Failed to fetch order data');
//         }

//         const data = await response.json();
        
//         if (data.member.consumer_id !== consumer.consumer_id) {
//           throw new Error('You are not authorized to view this order');
//         }

//         setOrder(data.order);
//         setCommunity(data.community);
//         setMember(data.member);

//         if (data.order.discount_data) {
//           const discountData = JSON.parse(data.order.discount_data);
//           setDiscount(prev => ({
//             ...prev,
//             ...discountData
//           }));
//         }

//       } catch (err) {
//         console.error("Fetch error:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrderData();
//   }, [communityId, orderId, consumer]);

//   const handleConfirmOrder = async () => {
//     try {
//       const parsedOrders = JSON.parse(order.order_data || '[]');
      
//       const totalAmount = parsedOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//       const produceNames = parsedOrders.map(item => item.product_name).join(", ");
//       const totalQuantity = parsedOrders.reduce((sum, item) => sum + item.quantity, 0);

//       const orderData = {
//         consumer_id: consumer.consumer_id,
//         name: member.member_name,
//         mobile_number: member.phone_number || '0000000000',
//         email: consumer.email,
//         address: community.address,
//         pincode: community.pincode || '000000',
//         produce_name: produceNames,
//         quantity: totalQuantity,
//         amount: totalAmount - (discount.totalDiscountAmount || 0),
//         payment_method: paymentMethod,
//         is_community: true,
//         discount_data: discount
//       };

//       const response = await fetch(
//         `http://localhost:5000/api/order/${communityId}/place-community-order`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${consumer.token}`
//           },
//           body: JSON.stringify(orderData)
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to place order');
//       }

   
//     // Clear data after successful confirmation
//     // 1. Clear local storage
//     localStorage.removeItem(`krishiCart_${consumer.consumer_id}`);
    
//     // 2. Get member ID if not already available
//     if (!member.id) {
//       const memberIdResponse = await fetch(
//         `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
//           headers: { 
//             'Authorization': `Bearer ${consumer.token}`
//           },
//         }
//       );
      
//       if (memberIdResponse.ok) {
//         const memberIdData = await memberIdResponse.json();
//         member.id = memberIdData.memberId;
//       }
//     }

//     // 3. Make API call to clear backend orders for this member if we have the ID
//     if (member.id) {
//       const clearResponse = await fetch(
//         `http://localhost:5000/api/community/${communityId}/clear-orders/${member.id}`,
//         {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${consumer.token}`
//           }
//         }
//       );

//       if (!clearResponse.ok) {
//         console.error("Failed to clear orders, but order was placed successfully");
//       }
//     }

//     setShowConfirmation(true);
      
//     } catch (err) {
//       console.error("Order confirmation error:", err);
//       setError(err.message);
//       alert(`Order confirmation error: ${err.message}`);
//     }
//   };

//   const safeToFixed = (value, decimals = 2) => {
//     const num = Number(value);
//     return isNaN(num) ? '0.00' : num.toFixed(decimals);
//   };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   if (error) {
//     return (
//       <div className="error">
//         <p>Error: {error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   if (!order || !community || !member) {
//     return <div className="no-data">No data available</div>;
//   }

//   const parsedOrders = JSON.parse(order.order_data || '[]');
//   const parsedDiscount = order.discount_data ? JSON.parse(order.discount_data) : {
//     totalDiscount: 0,
//     memberDiscountAmount: 0,
//     itemDiscountAmount: 0,
//     memberCount: 0,
//     itemCount: 0
//   };

//   const discountSection = (
//     <div className="discount-summary">
//       <h3>Discounts Applied</h3>
//       <div className="discount-row">
//         <span>Community Discount ({discount.memberCount || 0} members):</span>
//         <span>₹{safeToFixed(discount.memberDiscountAmount)}</span>
//       </div>
//       <div className="discount-row">
//         <span>Volume Discount ({discount.itemCount || 0} items):</span>
//         <span>₹{safeToFixed(discount.itemDiscountAmount)}</span>
//       </div>
//       <div className="discount-total">
//         <span>Total Discount:</span>
//         <span>₹{safeToFixed(discount.totalDiscountAmount)}</span>
//       </div>
//     </div>
//   );

//   const orderTotalSection = (
//     <div className="order-total">
//       <div className="total-row">
//         <span>Subtotal:</span>
//         <span>₹{safeToFixed(discount.subtotal || order.total_amount)}</span>
//       </div>
//       <div className="total-row">
//         <span>Total Discount:</span>
//         <span>- ₹{safeToFixed(discount.totalDiscountAmount)}</span>
//       </div>
//       <div className="final-total">
//         <span>Amount to Pay:</span>
//         <span>₹{safeToFixed((discount.subtotal || order.total_amount) - (discount.totalDiscountAmount || 0))}</span>
//       </div>
//     </div>
//   );

//   return (
//     <div className="community-order-page">
//       <Navbar3 />
      
//       {showConfirmation && (
//         <div className="confirmation-overlay">
//           <div className="confirmation-popup">
//             <div className="confirmation-icon">✓</div>
//             <h3>Order Confirmed!</h3>
//             <p>Your order has been placed successfully with Krishisetu.</p>
//             <button 
//               className="confirmation-button"
//               onClick={() => setShowConfirmation(false)}
//             >
//               Continue
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="header">
//         <button 
//           onClick={() => navigate(`/community/${communityId}`)}
//           className="back-btn"
//         >
//           Back to Community
//         </button>
//         <h1>Community Order Confirmation</h1>
//       </div>

//       <div className="order-summary">
//         <div className="community-info">
//           <h2>{community.name}</h2>
//           <div className="address-section">
//             <label>Delivery Address:</label>
//             <input
//               type="text"
//               value={community.address || "Not specified"}
//               readOnly
//               className="read-only"
//             />
//           </div>
//           <p>
//             Delivery Date: {community.delivery_date} at {community.delivery_time || "N/A"}
//           </p>
//         </div>

//         <div className="member-info">
//           <h3>Your Information</h3>
//           <p>Name: {member.member_name}</p>
//           <p>Phone: {member.phone_number}</p>
//         </div>

//         <div className="order-items">
//           <h3>Your Order</h3>
//           <div className="order-items-container">
//             {parsedOrders.map((item, index) => (
//               <div key={index} className="order-item-card">
//                 <div className="product-image">
//                   <img 
//                     src={getProductImage(item.product_id)} 
//                     alt={item.product_name}
//                     onError={(e) => e.target.src = "/images/default-produce.jpg"}
//                   />
//                 </div>
//                 <div className="product-details">
//                   <h4>{item.product_name}</h4>
//                   <p>Price: ₹{safeToFixed(item.price)}</p>
//                   <p>Quantity: {item.quantity}</p>
//                   <p>Total: ₹{safeToFixed(item.price * item.quantity)}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {discountSection}
//         {orderTotalSection}

//         <div className="payment-section">
//           <h3>Payment Method</h3>
//           <div className="payment-options">
//             <label>
//               <input
//                 type="radio"
//                 name="payment"
//                 value="cash-on-delivery"
//                 checked={paymentMethod === "cash-on-delivery"}
//                 onChange={() => setPaymentMethod("cash-on-delivery")}
//               />
//               Cash on Delivery
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 name="payment"
//                 value="online"
//                 checked={paymentMethod === "online"}
//                 onChange={() => setPaymentMethod("online")}
//               />
//               Online Payment
//             </label>
//           </div>
//         </div>

//         <button 
//           className="place-order-btn"
//           onClick={handleConfirmOrder}
//         >
//           Confirm Order
//         </button>
//       </div>
//     </div>
//   );
// }

// export default CommunityOrderPage;


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
  const [showConfirmation, setShowConfirmation] = useState(false);
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

  const handleRazorpayPayment = async () => {
    try {
      const parsedOrders = JSON.parse(order.order_data || '[]');
      const totalAmount = parsedOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const finalAmount = totalAmount - (discount.totalDiscountAmount || 0);
      
      if (finalAmount <= 0) {
        throw new Error("Invalid order amount");
      }

      // 1. First create the order in your database
      const orderResponse = await fetch(
        `http://localhost:5000/api/place-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${consumer.token}`
          },
          body: JSON.stringify({
            consumer_id: consumer.consumer_id,
            name: member.member_name,
            mobile_number: member.phone_number || '0000000000',
            email: consumer.email,
            address: community.address,
            pincode: community.pincode || '000000',
            produce_name: parsedOrders.map(item => item.product_name).join(", "),
            quantity: parsedOrders.reduce((sum, item) => sum + item.quantity, 0),
            amount: finalAmount,
            payment_method: 'razorpay',
            payment_status: 'Pending',
            is_community: true,
            community_id: communityId,
            member_id: member.id,
            discount_data: discount
          })
        }
      );

      const orderResult = await orderResponse.json();
      
      if (!orderResponse.ok || !orderResult.order_id) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      // 2. Create Razorpay order
      const razorpayResponse = await fetch('http://localhost:5000/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({ 
          amount: finalAmount , // Razorpay expects amount in paise
          order_id: orderResult.order_id,
          notes: {
            internal_order_id: orderResult.order_id,
            consumer_id: consumer.consumer_id,
            community_id: communityId
          }
        })
      });

      const razorpayData = await razorpayResponse.json();

      if (!razorpayResponse.ok || !razorpayData.order) {
        throw new Error(razorpayData.error || "Payment gateway error");
      }

      // 3. Initialize Razorpay checkout
      const options = {
        key: 'rzp_test_VLCfnymiyd6HGf', // Your Razorpay key
        amount: razorpayData.order.amount,
        currency: 'INR',
        order_id: razorpayData.order.id,
        name: 'KrishiSetu',
        description: 'Community Order Payment',
        handler: async (response) => {
          try {
            // 4. Verify payment
            const verificationResponse = await fetch('http://localhost:5000/api/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${consumer.token}`
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

            // Payment successful - update order status
            await fetch(`http://localhost:5000/api/community/${communityId}/orders/${orderResult.order_id}/update-payment`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${consumer.token}`
              },
              body: JSON.stringify({
                payment_status: 'Paid',
                razorpay_payment_id: response.razorpay_payment_id
              })
            });

            // Clear local storage and show success
            localStorage.removeItem(`krishiCart_${consumer.consumer_id}`);
            setShowConfirmation(true);

            // Clear backend orders for this member if we have the ID
            if (member.id) {
              await fetch(
                `http://localhost:5000/api/community/${communityId}/clear-orders/${member.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${consumer.token}`
                  }
                }
              );
            }

          } catch (error) {
            console.error('Payment verification failed:', error);
            alert(`Payment verification failed: ${error.message}`);
          }
        },
        prefill: {
          name: member.member_name || '',
          email: consumer.email || '',
          contact: member.phone_number || ''
        },
        theme: {
          color: '#3399cc'
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

  const handleConfirmOrder = async () => {
    try {
      const parsedOrders = JSON.parse(order.order_data || '[]');
      
      const totalAmount = parsedOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const produceNames = parsedOrders.map(item => item.product_name).join(", ") || "Mixed Produce"; // Fallback name
      const totalQuantity = parsedOrders.reduce((sum, item) => sum + item.quantity, 0);
  
      // Validate we have products
      if (parsedOrders.length === 0) {
        throw new Error("Your order is empty");
      }
  
      const orderData = {
        consumer_id: consumer.consumer_id,
        name: member.member_name,
        mobile_number: member.phone_number || '0000000000',
        email: consumer.email,
        address: community.address,
        pincode: community.pincode || '000000',
        produce_name: produceNames, // Ensure this is never empty
        quantity: totalQuantity,
        amount: totalAmount - (discount.totalDiscountAmount || 0),
        payment_method: paymentMethod,
        is_community: true,
        discount_data: discount
      };
  
      // Debug log
      console.log("Final order data:", orderData);


    
      const response = await fetch(
        `http://localhost:5000/api/order/${communityId}/place-community-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${consumer.token}`
          },
          body: JSON.stringify(orderData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      // Clear data after successful confirmation
      localStorage.removeItem(`krishiCart_${consumer.consumer_id}`);
      
      // Get member ID if not already available
      if (!member.id) {
        const memberIdResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        
        if (memberIdResponse.ok) {
          const memberIdData = await memberIdResponse.json();
          member.id = memberIdData.memberId;
        }
      }

      // Make API call to clear backend orders for this member if we have the ID
      if (member.id) {
        await fetch(
          `http://localhost:5000/api/community/${communityId}/clear-orders/${member.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${consumer.token}`
            }
          }
        );
      }

      setShowConfirmation(true);
      
    } catch (err) {
      console.error("Order confirmation error:", err);
      setError(err.message);
      alert(`Order confirmation error: ${err.message}`);
    }
  };

  const safeToFixed = (value, decimals = 2) => {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
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

  const parsedOrders = JSON.parse(order.order_data || '[]');

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

  return (
    <div className="community-order-page">
      <Navbar3 />
      
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-popup">
            <div className="confirmation-icon">✓</div>
            <h3>Order Confirmed!</h3>
            <p>Your order has been placed successfully with Krishisetu.</p>
            <button 
              className="confirmation-button"
              onClick={() => setShowConfirmation(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

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
                {/* <div className="product-image">
                  <img 
                    src={getProductImage(item.product_id)} 
                    alt={item.product_name}
                    onError={(e) => e.target.src = "/images/default-produce.jpg"}
                  />
                </div> */}
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

        <button 
          className="place-order-btn"
          onClick={paymentMethod === "online" ? handleRazorpayPayment : handleConfirmOrder}
        >
          {paymentMethod === "online" ? `Pay ₹${safeToFixed((discount.subtotal || order.total_amount) - (discount.totalDiscountAmount || 0))}` : "Confirm Order"}
        </button>
      </div>
    </div>
  );
}

export default CommunityOrderPage;