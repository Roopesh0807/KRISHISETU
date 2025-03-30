// // import React, { useState, useEffect } from "react";
// // import { useParams } from "react-router-dom";
// // import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
// // // import "../styles/MemberOrder.css";

// // function MemberOrderPage() {
// //   const { communityId, memberId } = useParams();
// //   const [orders, setOrders] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");

// //   useEffect(() => {
// //     if (!memberId) {
// //       setError("Member ID is undefined");
// //       setLoading(false);
// //       return;
// //     }

// //     fetch(`http://localhost:5000/api/order/${communityId}/member/${memberId}`)
// //       .then((response) => {
// //         if (!response.ok) {
// //           throw new Error("Failed to fetch member details");
// //         }
// //         return response.json();
// //       })
// //       .then((data) => {
// //         console.log("Fetched member details:", data); // Debugging: Log fetched member details
// //         setOrders(data.orders || []); // Assuming the API returns an "orders" field
// //         setLoading(false);
// //       })
// //       .catch((error) => {
// //         console.error("Error fetching member details:", error);
// //         setError("Error fetching member details. Please check your network connection and try again.");
// //         setLoading(false);
// //       });
// //   }, [communityId, memberId]);

// //   if (loading) {
// //     return <div>Loading...</div>;
// //   }

// //   if (error) {
// //     return <div>{error}</div>;
// //   }

// //   return (
// //     <div className="krishi-member-order-page">
// //       {/* Navbar3 Integrated */}
// //       <Navbar3 />

// //       <div className="krishi-order-details">
// //         <h1>Order Details</h1>
// //         <p><strong>Community ID:</strong> {communityId}</p>
// //         <p><strong>Member ID:</strong> {memberId}</p>

// //         {/* Display Orders */}
// //         {orders.length > 0 ? (
// //           <div className="krishi-orders-list">
// //             {orders.map((order) => (
// //               <div key={order.order_id} className="krishi-order-card">
// //                 <p><strong>Order ID:</strong> {order.order_id}</p>
// //                 <p><strong>Product ID:</strong> {order.product_id}</p>
// //                 <p><strong>Quantity:</strong> {order.quantity}</p>
// //                 <p><strong>Price:</strong> {order.price}</p>
// //               </div>
// //             ))}
// //           </div>
// //         ) : (
// //           <p>No orders found for this member.</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // export default MemberOrderPage;



// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js";

// function MemberOrderPage() {
//   const { communityId, memberId } = useParams();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [community, setCommunity] = useState(null);

//   useEffect(() => {
//     if (!memberId) {
//       setError("Member ID is undefined");
//       setLoading(false);
//       return;
//     }

//     fetch(`http://localhost:5000/api/community/${communityId}`)
//       .then((response) => response.json())
//       .then((data) => setCommunity(data))
//       .catch((error) => console.error("Error fetching community details:", error));

//     fetch(`http://localhost:5000/api/order/${communityId}/member/${memberId}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Failed to fetch member details");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         setOrders(data.orders || []);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching member details:", error);
//         setError("Error fetching member details. Please check your network connection and try again.");
//         setLoading(false);
//       });
//   }, [communityId, memberId]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div className="krishi-member-order-page">
//       <Navbar3 />

//       <div className="krishi-order-details">
//         <h1>Order Details</h1>
//         <p><strong>Community Name:</strong> {community?.name}</p>
//         <p><strong>Admin:</strong> {community?.admin_name}</p>
//         <p><strong>Address:</strong> {community?.address}</p>
//         <p><strong>Delivery Date:</strong> {community?.delivery_date}</p>
//         <p><strong>Delivery Time:</strong> {community?.delivery_time}</p>

//         {orders.length > 0 ? (
//           <div className="krishi-orders-list">
//             {orders.map((order) => (
//               <div key={order.order_id} className="krishi-order-card">
//                 <p><strong>Order ID:</strong> {order.order_id}</p>
//                 <p><strong>Product ID:</strong> {order.product_id}</p>
//                 <p><strong>Quantity:</strong> {order.quantity}</p>
//                 <p><strong>Price:</strong> {order.price}</p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No orders found for this member.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MemberOrderPage;
// import "../styles/MemberOrderPage.css";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";

function MemberOrderPage() {
  const { communityId, memberId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [community, setCommunity] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch community details
        const communityRes = await fetch(
          `http://localhost:5000/api/community/${communityId}`
        );
        if (!communityRes.ok) {
          throw new Error(`Failed to fetch community: ${communityRes.status}`);
        }
        const communityData = await communityRes.json();
        setCommunity(communityData.data || communityData);

        // Fetch member details
        const memberRes = await fetch(
          `http://localhost:5000/api/member/member/${memberId}`
        );
        if (!memberRes.ok) {
          throw new Error(`Failed to fetch member: ${memberRes.status}`);
        }
        const memberData = await memberRes.json();
        setMember(memberData.data || memberData);

        // Fetch orders
        const ordersRes = await fetch(
          `http://localhost:5000/api/order/${communityId}/member/${memberId}`
        );
        if (!ordersRes.ok) {
          throw new Error(`Failed to fetch orders: ${ordersRes.status}`);
        }
        const ordersData = await ordersRes.json();
        
        // Handle both response formats:
        // 1. Direct array of orders
        // 2. Object with orders array property
        const ordersArray = Array.isArray(ordersData) 
          ? ordersData 
          : ordersData.orders || [];
        
        setOrders(ordersArray);

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId, memberId]);

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="member-order-container">
      <Navbar3 />
      
      <div className="header">
        <h1>Your Order Details</h1>
        <button onClick={() => navigate(-1)} className="back-btn">
          Back to Community
        </button>
      </div>

      {community && (
        <div className="community-info">
          <h2>{community.community_name}</h2>
          <p>Admin: {community.admin_name}</p>
          <p>Address: {community.address || "Not specified"}</p>
          <p>
            Delivery: {community.delivery_date || "Not scheduled"} at{" "}
            {community.delivery_time || "N/A"}
          </p>
        </div>
      )}

      {member && (
        <div className="member-info">
          <h3>Your Information</h3>
          <p>Name: {member.member_name}</p>
          <p>Phone: {member.phone_number}</p>
        </div>
      )}

      <div className="orders-section">
        <h2>Your Orders</h2>
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.product_id || order.product}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.price}</td>
                  <td>₹{(order.price * order.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-orders">No orders found for this member</p>
        )}
      </div>
    </div>
  );
}

export default MemberOrderPage;