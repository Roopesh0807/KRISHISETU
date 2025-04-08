// import "../styles/MemberOrderPage.css";
import React, { useState, useEffect } from "react";
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

  const handleUpdateQuantity = async (orderId, productId, change) => {
    try {
      const order = orders.find(o => o.order_id === orderId);
      const newQuantity = Math.max(1, order.quantity + change);

      const response = await fetch(
        `http://localhost:5000/api/member/order/${orderId}/quantity`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
             'Authorization': `Bearer ${consumer.token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const updatedOrder = await response.json();

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_id === orderId 
            ? { ...order, quantity: updatedOrder.quantity }
            : order
        )
      );

      // Recalculate total
      const updatedTotal = orders.reduce((sum, o) => {
        return sum + (o.order_id === orderId 
          ? o.price * updatedOrder.quantity 
          : o.price * o.quantity);
      }, 0);
      setTotal(updatedTotal.toFixed(2));
    } catch (err) {
      console.error("Update quantity error:", err);
      setError(err.message);
    }
  };


const handleRemoveItem = async (orderId) => {
  console.log('Attempting to delete order:', orderId); // Add this
  try {
    const url = `http://localhost:5000/api/member/order/${orderId}`;
    console.log('Request URL:', url); // And this
    
    const response = await fetch(url, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${consumer.token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json(); // Try to get error details
      throw new Error(errorData.error || 'Failed to remove item');
    }

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

  const handleProceedToPayment = () => {
    navigate(`/orderpage`);
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
                    <div className="krishi-cart-item-img-container">
                      <img
                        src={getProductImage(order.product_id)}
                        alt={order.product_name || "Product"}
                        className="krishi-cart-item-img"
                        onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
                      />
                    </div>
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
                            onClick={() => handleUpdateQuantity(order.order_id, order.product_id, -1)}
                          >
                            −
                          </button>
                          <span className="krishi-quantity-value">{order.quantity}</span>
                          <button 
                            className="krishi-quantity-btn" 
                            onClick={() => handleUpdateQuantity(order.order_id, order.product_id, 1)}
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
                <div className="krishi-summary-card">
                  <h3 className="krishi-summary-title">Order Summary</h3>
                  <div className="krishi-summary-row">
                    <span>Items:</span>
                    <span>{orders.length}</span>
                  </div>
                  <div className="krishi-summary-row krishi-summary-total">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <div className="krishi-cart-actions">
                  <button 
                    className="krishi-btn-checkout" 
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </button>
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