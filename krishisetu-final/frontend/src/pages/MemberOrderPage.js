
// import "../styles/MemberOrderPage.css";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(
          `http://localhost:5000/api/community/${communityId}/member/${memberId}/orders`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle both response structures (with and without data wrapper)
        if (data.data) {
          // If using success/error wrapper
          setCommunity(data.data.community);
          setMember(data.data.member);
          setOrders(data.data.orders);
          setTotal(data.data.total);
        } else {
          // If returning direct objects
          setCommunity(data.community);
          setMember(data.member);
          setOrders(data.orders);
          setTotal(data.total);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId, memberId]);

  const handleProceedToPayment = () => {
    navigate(`/orderpage`);
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
        <h2>{community.community_name || community.name}</h2>
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

      <div className="orders-section">
        <h2>Your Orders</h2>
        {orders.length > 0 ? (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
  {orders.map((order, index) => {
    const price = Number(order.price);
    const itemTotal = price * order.quantity;
    return (
      <tr key={index}>
        <td>{order.product_id}</td>
        <td>{order.quantity}</td>
        <td>₹{price.toFixed(2)}</td>
        <td>₹{itemTotal.toFixed(2)}</td>
      </tr>
    );
  })}
</tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">Grand Total:</td>
                  <td className="total-amount">₹{total}</td>
                </tr>
              </tfoot>
            </table>
            
            <button 
              onClick={handleProceedToPayment}
              className="payment-btn"
            >
              Proceed to Payment
            </button>
          </>
        ) : (
          <p className="no-orders">No orders found</p>
        )}
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