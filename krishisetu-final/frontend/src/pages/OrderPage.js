// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js"; // Import the Navbar3 component
// import "../styles/OrderPageC.css";

// function OrderPage() {
//   const { communityId } = useParams();
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/order/${communityId}`);
//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(errorText || "Failed to fetch orders");
//         }
//         const data = await response.json();
//         setOrderDetails(data);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [communityId]);

//   const filteredMembers = orderDetails?.members?.filter((member) =>
//     member.memberName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (loading) {
//     return <p className="text-center">Loading...</p>;
//   }

//   if (error) {
//     return <p className="error-text">Error: {error}</p>;
//   }

//   if (!orderDetails) {
//     return <p className="text-center">No order details found.</p>;
//   }

//   return (
//     <div className="order-page">
//       {/* Add Navbar3 Component */}
//       <Navbar3 />

//       <h1 className="page-title">Order Details</h1>

//       <div className="summary-card">
//         <h3>Community Information</h3>
//         <p><strong>Community Name:</strong> {orderDetails.communityName}</p>
//         <p><strong>Admin Name:</strong> {orderDetails.adminName}</p>
//         <p><strong>Address:</strong> {orderDetails.address}</p>
//         <p><strong>Delivery Date:</strong> {orderDetails.deliveryDate}</p>
//         <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime}</p>
//       </div>

//       <div className="summary-card">
//         <h3>Payment Summary</h3>
//         <p><strong>Grand Total:</strong> ${orderDetails.grandTotal}</p>
//         <p><strong>Payment Status:</strong> {orderDetails.overallPaymentStatus}</p>
//       </div>

//       <div className="search-section">
//         <input
//           type="text"
//           placeholder="Search member..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       <div className="member-sections">
//         {filteredMembers.map((member) => (
//           <div key={member.memberId} className="member-card">
//             <h3>{member.memberName}</h3>
//             <p><strong>Phone:</strong> {member.phone}</p>
//             <table className="member-table">
//               <thead>
//                 <tr>
//                   <th>Product</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {member.orders.map((order) => (
//                   <tr key={order.id}>
//                     <td>{order.product}</td>
//                     <td>{order.quantity}</td>
//                     <td>${order.price}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <div className="payment-details">
//               <p><strong>Total:</strong> ${member.total}</p>
//               <p><strong>Discount:</strong> ${member.discount}</p>
//               <p><strong>Payment Amount:</strong> ${member.paymentAmount}</p>
//               <p><strong>Payment Status:</strong> {member.paymentStatus}</p>
//               <button
//                 className={`payment-btn ${member.paymentStatus === "paid" ? "success" : "primary"}`}
//                 onClick={() => alert(`Pay ${member.paymentAmount} for ${member.memberName}`)}
//                 disabled={member.paymentStatus === "paid"}
//               >
//                 {member.paymentStatus === "paid" ? "Paid" : "Pay Now"}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default OrderPage;
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js";
// import "../styles/OrderPageC.css";

// function OrderPage() {
//   const { communityId } = useParams();
//   const navigate = useNavigate();
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/order/${communityId}`);
//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(errorText || "Failed to fetch orders");
//         }
//         const data = await response.json();
//         setOrderDetails(data);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [communityId]);

//   // Find admin member by comparing names
//   const adminMember = orderDetails?.members?.find(
//     member => member.memberName === orderDetails?.adminName
//   );

//   // Filter other members (excluding admin)
//   const otherMembers = orderDetails?.members?.filter(
//     member => member.memberName !== orderDetails?.adminName
//   )?.filter(member =>
//     member.memberName?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (loading) return <p className="text-center">Loading...</p>;
//   if (error) return <p className="error-text">Error: {error}</p>;
//   if (!orderDetails) return <p className="text-center">No order details found.</p>;

//   return (
//     <div className="order-page">
//       <Navbar3 />
//       <h1 className="page-title">Order Details</h1>

//       {/* 1. Community Information Section */}
//       <div className="summary-card">
//         <h3>Community Information</h3>
//         <p><strong>Community Name:</strong> {orderDetails.communityName}</p>
//         <p><strong>Admin Name:</strong> {orderDetails.adminName}</p>
//         <p><strong>Address:</strong> {orderDetails.address}</p>
//         <p><strong>Delivery Date:</strong> {new Date(orderDetails.deliveryDate).toLocaleDateString()}</p>
//         <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime}</p>
//         <p><strong>Grand Total:</strong> ₹{orderDetails.grandTotal}</p>
//         <p><strong>Overall Payment Status:</strong> {orderDetails.overallPaymentStatus}</p>
//       </div>

//       {/* 2. Admin Orders Section */}
//       {adminMember && (
//         <div className="admin-orders-section">
//           <h3>Your Orders (Admin)</h3>
//           <table className="admin-orders-table">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Quantity</th>
//                 <th>Price</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {adminMember.orders?.map((order, index) => (
//                 <tr key={`admin-order-${order.orderId || index}`}>
//                   <td>{order.product}</td>
//                   <td>{order.quantity}</td>
//                   <td>₹{order.price}</td>
//                   <td>₹{order.price * order.quantity}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="admin-payment-summary">
//             <p><strong>Your Total:</strong> ₹{adminMember.total}</p>
//             <p><strong>Your Payment Status:</strong> {adminMember.paymentStatus}</p>
//             <button
//               className="payment-btn primary"
//               onClick={() => navigate(`/order/${communityId}/payment`)}
//             >
//               Proceed to Payment
//             </button>
//           </div>
//         </div>
//       )}

//       {/* 3. Search Section */}
//       <div className="search-section">
//         <input
//           type="text"
//           placeholder="Search member by name..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="search-input"
//         />
//       </div>

//       {/* 4. Other Members Section */}
//       <div className="other-members-section">
//         <h3>Community Members</h3>
//         <div className="members-grid">
//           {otherMembers?.length > 0 ? (
//             otherMembers.map(member => (
//               <div key={`member-${member.memberId}`} className="member-card">
//                 <h4>{member.memberName}</h4>
//                 <p><strong>Phone:</strong> {member.phone}</p>
//                 <p><strong>Payment Method:</strong> {member.paymentMethod || 'Not specified'}</p>
//                 <p><strong>Payment Status:</strong> {member.paymentStatus}</p>
//                 <p><strong>Total Orders:</strong> {member.orders?.length || 0}</p>
//                 <p><strong>Amount Due:</strong> ₹{member.total}</p>
//               </div>
//             ))
//           ) : (
//             <p className="no-members">No members found</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default OrderPage;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import "../styles/OrderPageC.css";

function OrderPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/order/${communityId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch orders");
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [communityId]);

  // Function to display last 2 digits of phone number
  const getLastTwoDigits = (phone) => {
    if (!phone) return '--';
    return phone.slice(-2);
  };

  // Find admin member by comparing names
  const adminMember = orderDetails?.members?.find(
    member => member.memberName === orderDetails?.adminName
  );

  // Filter other members (excluding admin)
  const otherMembers = orderDetails?.members?.filter(
    member => member.memberName !== orderDetails?.adminName
  )?.filter(member =>
    member.memberName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProceedToPayment = () => {
    navigate(`/orderpage`);
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;
  if (!orderDetails) return <p className="text-center">No order details found.</p>;

  return (
    <div className="order-page">
      <Navbar3 />
      <h1 className="page-title">Order Details</h1>

      {/* 1. Community Information Section */}
      <div className="summary-card">
        <h3>Community Information</h3>
        <p><strong>Community Name:</strong> {orderDetails.communityName}</p>
        <p><strong>Admin Name:</strong> {orderDetails.adminName}</p>
        <p><strong>Address:</strong> {orderDetails.address}</p>
        <p><strong>Delivery Date:</strong> {new Date(orderDetails.deliveryDate).toLocaleDateString()}</p>
        <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime}</p>
        <p><strong>Grand Total:</strong> ₹{orderDetails.grandTotal}</p>
        <p><strong>Overall Payment Status:</strong> {orderDetails.overallPaymentStatus}</p>
        <button 
          className="proceed-payment-btn"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </button>
      </div>

      {/* 2. Admin Orders Section */}
      {adminMember && (
        <div className="admin-orders-section">
          <h3>Your Orders (Admin)</h3>
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {adminMember.orders?.map((order, index) => (
                <tr key={`admin-order-${order.orderId || index}`}>
                  <td>{order.product}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.price}</td>
                  <td>₹{order.price * order.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-payment-summary">
            <p><strong>Your Total:</strong> ₹{adminMember.total}</p>
            <p><strong>Your Payment Status:</strong> {adminMember.paymentStatus}</p>
          </div>
        </div>
      )}

      {/* 3. Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search member by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 4. Other Members Section */}
      <div className="other-members-section">
        <h3>Community Members</h3>
        <div className="members-grid">
          {otherMembers?.length > 0 ? (
            otherMembers.map(member => (
              <div key={`member-${member.memberId}`} className="member-card">
                <h4>{member.memberName}</h4>
                <p><strong>Phone:</strong> **{getLastTwoDigits(member.phone)}</p>
                <p><strong>Payment Method:</strong> {member.paymentMethod || 'Not specified'}</p>
                <p><strong>Payment Status:</strong> {member.paymentStatus}</p>
                <p><strong>Total Orders:</strong> {member.orders?.length || 0}</p>
                <p><strong>Amount Due:</strong> ₹{member.total}</p>
              </div>
            ))
          ) : (
            <p className="no-members">No members found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderPage;