import "../styles/MemberOrderPage.css";
import React, { useState, useEffect ,useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Navbar3 from "../components/Navbar3.js";

function MemberOrderPage() {
  const { communityId, memberId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [member, setMember] = useState(null);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { consumer } = useAuth();
  const [yourOrders, setYourOrders] = useState([]);
// Add similar states and effects as OrderPage.js
const [freezeStatus, setFreezeStatus] = useState({
  isFrozen: false,
  timeUntilFreeze: 0
});
const [countdown, setCountdown] = useState('');
const countdownIntervalRef = useRef(null);

// Add these functions inside the component
const startCountdown = (seconds) => {
  if (countdownIntervalRef.current) {
    clearInterval(countdownIntervalRef.current);
  }

  updateCountdownDisplay(seconds);

  countdownIntervalRef.current = setInterval(() => {
    seconds--;
    updateCountdownDisplay(seconds);

    if (seconds <= 0) {
      clearInterval(countdownIntervalRef.current);
      setFreezeStatus(prev => ({ ...prev, isFrozen: true }));
    }
  }, 1000);
};

const updateCountdownDisplay = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  setCountdown(`${hours}h ${minutes}m ${secs}s`);
};

  // Add this state
const [discount, setDiscount] = useState({
  memberCount: 0,
  itemCount: 0,
  memberDiscount: 0,
  itemDiscount: 0,
  totalDiscount: 0
});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(
          `http://localhost:5000/api/community/${communityId}/member/${memberId}/orders`,{
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        setCommunity(data.community);
        setMember(data.member);
        setOrders(data.orders);
        setTotal(data.total);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId, memberId]);
  useEffect(() => {
    const fetchFreezeStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/order/${communityId}/freeze-status`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            }
          }
        );
        const data = await response.json();
        if (response.ok) {
          setFreezeStatus(data);
          if (!data.isFrozen && data.timeUntilFreeze > 0) {
            startCountdown(data.timeUntilFreeze);
          }
        }
      } catch (error) {
        console.error("Error fetching freeze status:", error);
      }
    };
  
    fetchFreezeStatus();
  
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [communityId]);

  // Add this component to display freeze status
const FreezeStatusBanner = () => {
  if (freezeStatus.isFrozen) {
    return (
      <div className="freeze-banner frozen">
        <strong>COMMUNITY FROZEN:</strong> No order modifications allowed. 
        Delivery coming soon!
      </div>
    );
  } else if (freezeStatus.timeUntilFreeze > 0) {
    return (
      <div className="freeze-banner warning">
        <strong>Community will freeze in:</strong> {countdown}
      </div>
    );
  }
  return null;
};

  // Add this useEffect to calculate discount

// Update the discount calculation in the useEffect
useEffect(() => {
  const fetchDiscount = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/member/${memberId}/discount`, {
          headers: { 
            'Authorization': `Bearer ${consumer.token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDiscount({
          ...data,
          // Ensure these values are set properly
          memberDiscountAmount: data.memberDiscountAmount || 0,
          itemDiscountAmount: data.itemDiscountAmount || 0,
          totalDiscountAmount: data.totalDiscountAmount || 0,
          subtotal: data.subtotal || total
        });
      }
    } catch (error) {
      console.error("Error fetching discount:", error);
    }
  };

  // Only fetch discount if community is frozen
  if (freezeStatus.isFrozen) {
    fetchDiscount();
  } else {
    // Reset discount if not frozen
    setDiscount({
      memberCount: 0,
      itemCount: 0,
      memberDiscount: 0,
      itemDiscount: 0,
      totalDiscount: 0,
      memberDiscountAmount: 0,
      itemDiscountAmount: 0,
      totalDiscountAmount: 0,
      subtotal: total
    });
  }
}, [orders, communityId, memberId, freezeStatus.isFrozen, total]);

// Update the handleQuantityChange function
const handleQuantityChange = async (orderId, delta) => {
  try {
    // Find the current order to get current quantity
    const currentOrder = orders.find(order => order.order_id === orderId);
    if (!currentOrder) return;

    const newQuantity = currentOrder.quantity + delta;
    if (newQuantity < 1) return;

    const response = await fetch(
      `http://localhost:5000/api/order/${communityId}/${orderId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      }
    );
    
    if (!response.ok) throw new Error("Failed to update quantity");

    // Update local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.order_id === orderId 
          ? { ...order, quantity: newQuantity } 
          : order
      )
    );

    // Recalculate total
    const updatedTotal = orders.reduce((sum, order) => {
      return sum + (order.price * 
        (order.order_id === orderId ? newQuantity : order.quantity));
    }, 0);
    setTotal(updatedTotal.toFixed(2));
  } catch (error) {
    console.error("Error updating quantity:", error);
    setError("Failed to update quantity");
  }
};



// Update the handleRemoveItem function
const handleRemoveItem = async (orderId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/order/${communityId}/${orderId}`,
      { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        }
      }
    );
    
    if (!response.ok) throw new Error("Failed to remove item");

    // Update local state
    setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
    
    // Recalculate total
    const updatedTotal = orders
      .filter(order => order.order_id !== orderId)
      .reduce((sum, order) => sum + (order.price * order.quantity), 0);
    setTotal(updatedTotal.toFixed(2));
  } catch (err) {
    console.error("Remove item error:", err);
    setError(err.message);
  }
};


  // const handleProceedToPayment = () => {
  //   navigate(`/orderpage`);
  // };
// MemberOrderPage.js
// Add this function to handle proceeding to payment
const handleProceedToPayment = async () => {
  try {
    // Prepare order data for submission
    const orderData = orders.map(order => ({
      product_id: order.product_id,
      product_name: order.product_name,
      price: order.price,
      quantity: order.quantity,
      category: order.category
    }));

    const response = await fetch(
      `http://localhost:5000/api/community/${communityId}/member/${memberId}/submit-frozen-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({
          orders: orderData,
          discount: discount // Include the discount data in the request
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit frozen order');
    }

    const data = await response.json();
    navigate(`/community/${communityId}/order/${data.orderId}`, {
      state: {
        discountData: discount // Pass discount data via navigation state
      }
    });
  } catch (err) {
    console.error("Error submitting frozen order:", err);
    setError(err.message);
  }
};
  


  const getProductImage = (productId) => {
    try {
      const cart = JSON.parse(localStorage.getItem('krishiCart')) || [];
      const productInCart = cart.find(item => item.product_id === productId);
      return productInCart?.image || `/images/default-produce.jpg`;
    } catch (err) {
      console.error("Error getting product image:", err);
      return `/images/default-produce.jpg`;
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

  if (!community || !member) {
    return <div className="no-data">No data available</div>;
  }

  return (
    <div className="member-order-page">
      <Navbar3 />
      
      <div className="header">
        <button 
          onClick={() => navigate(`/community/${communityId}`)}
          className="back-btn"
        >
          Back to Community
        </button>
        <h1>Your Order Details</h1>
      </div>

      <div className="community-info">
        <h2>{community.name}</h2>
        <p>Admin: {community.admin_name}</p>
        <p>Address: {community.address || "Not specified"}</p>
        <p>
          Delivery: {community.delivery_date || "Not scheduled"} at{" "}
          {community.delivery_time || "N/A"}
        </p>
      </div>

      <div className="member-info">
        <h3>Your Information</h3>
        <p>Name: {member.member_name}</p>
        <p>Phone: {member.phone_number}</p>
      </div>

      <div className="krishi-cart-container">
        <div className="krishi-cart-card">
          <h2 className="krishi-cart-title">
            <span className="krishi-cart-icon">🛒</span> Your Community Order
          </h2>

          {orders.length === 0 ? (
            <div className="krishi-cart-empty">
              <div className="krishi-cart-empty-icon">🌾</div>
              <p className="krishi-cart-empty-text">No orders found</p>
            </div>
          ) : (
            <>
              <div className="krishi-cart-items">
                {orders.map((order) => (
                  <div key={order.order_id} className="krishi-cart-item">
                    {/* <div className="krishi-cart-item-img-container">
                      <img
                        src={getProductImage(order.product_id)}
                        alt={order.product_name || "Product"}
                        className="krishi-cart-item-img"
                        onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
                      />
                    </div> */}
                    <div className="krishi-cart-item-details">
                      <h3 className="krishi-cart-item-name">{order.product_name || "Product"}</h3>
                      <div className="krishi-cart-item-meta">
                        <span className="krishi-cart-item-price">₹{order.price}/kg</span>
                        {order.category && (
                          <span className="krishi-cart-item-category">{order.category}</span>
                        )}
                      </div>
                      <div className="krishi-cart-item-controls">
                        <div className="krishi-quantity-selector">
                          <button 
                            className="krishi-quantity-btn" 
                            onClick={() => handleQuantityChange(order.order_id, -1)}
                          >
                            −
                          </button>
                          <span className="krishi-quantity-value">{order.quantity}</span>
                          <button 
                            className="krishi-quantity-btn" 
                            onClick={() => handleQuantityChange(order.order_id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="krishi-remove-btn"
                          onClick={() => handleRemoveItem(order.order_id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="krishi-cart-item-total">
                        Total: ₹{(order.price * order.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="krishi-cart-summary">
                {/* <div className="krishi-summary-card">
                  <h3 className="krishi-summary-title">Order Summary</h3>
                  <div className="krishi-summary-row">
                    <span>Items:</span>
                    <span>{orders.length}</span>
                  </div>
                  <div className="krishi-summary-row krishi-summary-total">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div> */}

{/* <div className="krishi-summary-card">
  <h3 className="krishi-summary-title">Order Summary</h3>
  <div className="krishi-summary-row">
    <span>Items:</span>
    <span>{orders.length}</span>
  </div>
  {discount.totalDiscount > 0 && (
    <>
      <div className="krishi-summary-row">
        <span>Member Discount ({discount.memberCount} members):</span>
        <span>{discount.memberDiscount}%</span>
      </div>
      <div className="krishi-summary-row">
        <span>Volume Discount ({discount.itemCount} items):</span>
        <span>{discount.itemDiscount}%</span>
      </div>
      <div className="krishi-summary-row discount-total">
        <span>Total Discount:</span>
        <span>{discount.totalDiscount}%</span>
      </div>
    </>
  )}
  <div className="krishi-summary-row krishi-summary-total">
    <span>Subtotal:</span>
    <span>₹{total}</span>
  </div>
  <div className="krishi-summary-row krishi-summary-final">
    <span>Final Total:</span>
    <span>₹{(total * (1 - discount.totalDiscount/100)).toFixed(2)}</span>
  </div>
</div> */}


<div className="krishi-summary-card">
  <h3 className="krishi-summary-title">Order Summary</h3>
  <div className="krishi-summary-row">
    <span>Items:</span>
    <span>{orders.length}</span>
  </div>
  
  {freezeStatus.isFrozen && discount.totalDiscountAmount > 0 && (
    <>
      <div className="krishi-summary-row">
        <span>Community Discount ({discount?.memberCount || 0} members):</span>
        <span>₹{Number(discount?.memberDiscountAmount || 0).toFixed(2)}</span>
      </div>
      <div className="krishi-summary-row">
        <span>Volume Discount ({discount?.itemCount || 0} items):</span>
        <span>₹{Number(discount?.itemDiscountAmount || 0).toFixed(2)}</span>
      </div>
      <div className="krishi-summary-row discount-total">
        <span>Total Discount:</span>
        <span>₹{Number(discount?.totalDiscountAmount || 0).toFixed(2)}</span>
      </div>
    </>
  )}
  
  <div className="krishi-summary-row krishi-summary-total">
    <span>Subtotal:</span>
    <span>₹{Number(discount?.subtotal || total || 0).toFixed(2)}</span>
  </div>
  
  {freezeStatus.isFrozen && (discount?.totalDiscount || 0) > 0 && (
    <div className="krishi-summary-row krishi-summary-final">
      <span>Final Amount:</span>
      <span>
        ₹{(
          Number(discount?.subtotal || total || 0) - 
          Number(discount?.totalDiscountAmount || 0)
        ).toFixed(2)}
      </span>
    </div>
  )}
</div>
                <div className="krishi-cart-actions">
                  {/* <button 
                    className="krishi-btn-checkout" 
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </button> */}
                  {!freezeStatus.isFrozen ? (
  <button 
  className="krishi-btn-checkout disabled" 
  disabled
>
  Orders Locked - Delivery Pending
  </button>
) : (
  <button
  className="krishi-btn-checkout" 
  onClick={handleProceedToPayment}
  >
    Proceed to Payment
  </button>
)}

                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberOrderPage;
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js";

// function MemberOrderPage() {
//   const { communityId, memberId } = useParams();
//   const navigate = useNavigate();
//   const [community, setCommunity] = useState(null);
//   const [member, setMember] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchOrderData();
//   }, [communityId, memberId]);

//   const fetchOrderData = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       const response = await fetch(
//         `http://localhost:5000/api/community/${communityId}/member/${memberId}/orders`
//       );
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (data.data) {
//         setCommunity(data.data.community);
//         setMember(data.data.member);
//         setOrders(data.data.orders);
//         setTotal(data.data.total);
//       } else {
//         setCommunity(data.community);
//         setMember(data.member);
//         setOrders(data.orders);
//         setTotal(data.total);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveOrder = async (orderId) => {
//     try {
//       console.log(`Initiating delete for order: ${orderId}`);
      
//       const response = await fetch(
//         `http://localhost:5000/api/order/delete/${orderId}`, // Updated endpoint
//         {
//           method: 'DELETE',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         }
//       );
  
//       console.log('Response status:', response.status);
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to delete order');
//       }
  
//       // Optimistic UI update
//       setOrders(prev => prev.filter(o => o.order_id !== orderId));
//       setTotal(prev => (
//         parseFloat(prev) - 
//         (orders.find(o => o.order_id === orderId)?.price || 0
//       ).toFixed(2)));
  
//       console.log('Order removed successfully');
      
//     } catch (error) {
//       console.error('Delete operation failed:', error);
//       alert(`Error: ${error.message}`);
//       fetchOrderData(); // Refresh data
//     }
//   };
//   const handleProceedToPayment = () => {
//     navigate(`/orderpage`);
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

//   if (!community || !member) {
//     return <div className="no-data">No data available</div>;
//   }

//   return (
//     <div className="member-order-page">
//       <Navbar3 />
      
//       <div className="header">
//         <button 
//           onClick={() => navigate(`/community/${communityId}`)}
//           className="back-btn"
//         >
//           Back to Community
//         </button>
//         <h1>Your Order Details</h1>
//       </div>

//       <div className="community-info">
//         <h2>{community.community_name || community.name}</h2>
//         <p>Admin: {community.admin_name}</p>
//         <p>Address: {community.address || "Not specified"}</p>
//         <p>
//           Delivery: {community.delivery_date || "Not scheduled"} at{" "}
//           {community.delivery_time || "N/A"}
//         </p>
//       </div>

//       <div className="member-info">
//         <h3>Your Information</h3>
//         <p>Name: {member.member_name}</p>
//         <p>Phone: {member.phone_number}</p>
//       </div>

//       <div className="orders-section">
//         <h2>Your Orders</h2>
//         {orders.length > 0 ? (
//           <>
//             <table className="orders-table">
//               <thead>
//                 <tr>
//                   <th>Product</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                   <th>Total</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order, index) => {
//                   const price = Number(order.price);
//                   const itemTotal = price * order.quantity;
//                   return (
//                     <tr key={index}>
//                       <td>{order.product_id}</td>
//                       <td>{order.quantity}</td>
//                       <td>₹{price.toFixed(2)}</td>
//                       <td>₹{itemTotal.toFixed(2)}</td>
//                       <td>
//                         <button 
//                           onClick={() => handleRemoveOrder(order.order_id)}
//                           className="remove-btn"
//                         >
//                           Remove
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//               <tfoot>
//                 <tr>
//                   <td colSpan="3" className="total-label">Grand Total:</td>
//                   <td className="total-amount">₹{total}</td>
//                   <td></td>
//                 </tr>
//               </tfoot>
//             </table>
            
//             <button 
//               onClick={handleProceedToPayment}
//               className="payment-btn"
//             >
//               Proceed to Payment
//             </button>
//           </>
//         ) : (
//           <p className="no-orders">No orders found</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MemberOrderPage;