

// import React, { useEffect, useState,useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js";
// import { useAuth } from '../context/AuthContext';
// import "../styles/OrderPageC.css";

// function OrderPage() {
//   const { communityId } = useParams();
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [communityDetails, setCommunityDetails] = useState(null);
//   const [members, setMembers] = useState([]);
//   // const [setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const { consumer } = useAuth();
//   // Add these states
// const [freezeStatus, setFreezeStatus] = useState({
//   isFrozen: false,
//   timeUntilFreeze: 0,
//   secondsUntilDelivery: 0
// });
// const [countdown, setCountdown] = useState('');
// const countdownIntervalRef = useRef(null); // Using useRef for the interval
// // Add this function inside the component
// const startCountdown = (seconds) => {
//   // Clear any existing interval
//   if (countdownIntervalRef.current) {
//     clearInterval(countdownIntervalRef.current);
//   }

//   // Update immediately
//   updateCountdownDisplay(seconds);

//   // Set up new interval
//   countdownIntervalRef.current = setInterval(() => {
//     seconds--;
//     updateCountdownDisplay(seconds);

//     if (seconds <= 0) {
//       clearInterval(countdownIntervalRef.current);
//       setFreezeStatus(prev => ({ ...prev, isFrozen: true }));
//     }
//   }, 1000);
// };

// const updateCountdownDisplay = (seconds) => {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
//   setCountdown(`${hours}h ${minutes}m ${secs}s`);
// };


// // Add this state
// const [adminDiscount, setAdminDiscount] = useState({
//   memberCount: 0,
//   itemCount: 0,
//   memberDiscount: 0,
//   itemDiscount: 0,
//   totalDiscount: 0
// });
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch community details
//         const communityResponse = await fetch(
//           `http://localhost:5000/api/community/${communityId}`,{
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             },
//           }
//         );
//         if (!communityResponse.ok) throw new Error("Failed to fetch community details");
//         const communityData = await communityResponse.json();
//         setCommunityDetails(communityData.data);

//         // Fetch community members
//         const membersResponse = await fetch(
//           `http://localhost:5000/api/community/${communityId}/members`,{
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             },
//           }
//         );
//         if (!membersResponse.ok) throw new Error("Failed to fetch members");
//         const membersData = await membersResponse.json();
//         setMembers(membersData);

//         // Fetch all products
//         const productsResponse = await fetch(
//           `http://localhost:5000/api/products`,{
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             },
//           }
//         );
//         if (!productsResponse.ok) throw new Error("Failed to fetch products");
//         const productsData = await productsResponse.json();
//         // setProducts(productsData);

//         // Fetch all orders
//         const ordersResponse = await fetch(
//           `http://localhost:5000/api/order/${communityId}/all-orders`,{
//             headers: {
//               'Authorization': `Bearer ${consumer.token}`
//             },
//           }
//         );
//         if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
//         const ordersData = await ordersResponse.json();
        
//         // Process orders data with product details
//         const processedOrders = ordersData.map(order => {
//           const product = productsData.find(p => p.product_id === order.product_id) || {};
//           // Try to get image from localStorage first
//           const storedCart = localStorage.getItem(`krishiCart_${order.consumer_id}`);
//           let productImage = '/images/default-produce.jpg';
          
//           if (storedCart) {
//             try {
//               const parsedCart = JSON.parse(storedCart);
//               const cartItem = parsedCart.find(item => item.product_id === order.product_id);
//               if (cartItem) {
//                 productImage = `/images/${cartItem.product_name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
//               }
//             } catch (error) {
//               console.error("Error parsing cart data:", error);
//             }
//           }
          
//           return {
//             ...order,
//             price: Number(order.price) || 0,
//             quantity: Number(order.quantity) || 0,
//             total: (Number(order.price) || 0) * (Number(order.quantity) || 0),
//             product_name: product.product_name || order.product_id,
//             product_image: productImage
//           };
//         });

//         setOrders(processedOrders);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [communityId]);

//   // Add this useEffect for admin discount
// useEffect(() => {
//   const fetchAdminDiscount = async () => {
//     try {
//       // Find admin's member ID
//       const adminMember = members.find(m => m.consumer_id === communityDetails.admin_id);
//       if (!adminMember) return;

//       const response = await fetch(
//         `http://localhost:5000/api/community/${communityId}/member/${adminMember.id}/discount`, {
//           headers: { 
//             'Authorization': `Bearer ${consumer.token}`
//           }
//         }
//       );
//       const data = await response.json();
//       if (response.ok) {
//         setAdminDiscount(data);
//       }
//     } catch (error) {
//       console.error("Error fetching admin discount:", error);
//     }
//   };

//   if (freezeStatus.isFrozen && communityDetails && members.length > 0) {
//     fetchAdminDiscount();
//   } else {
//     setAdminDiscount({
//       memberCount: 0,
//       itemCount: 0,
//       memberDiscount: 0,
//       itemDiscount: 0,
//       totalDiscount: 0
//     });
//   }
// }, [freezeStatus.isFrozen, communityDetails, members]);

  
// // Add this useEffect for freeze status and countdown
// // Update the useEffect cleanup
// useEffect(() => {
//   const fetchFreezeStatus = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/order/${communityId}/freeze-status`, {
//           headers: { 
//             'Authorization': `Bearer ${consumer.token}`
//           }
//         }
//       );
//       const data = await response.json();
//       if (response.ok) {
//         setFreezeStatus(data);
        
//         if (!data.isFrozen && data.timeUntilFreeze > 0) {
//           startCountdown(data.timeUntilFreeze);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching freeze status:", error);
//     }
//   };

//   fetchFreezeStatus();

//   return () => {
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }
//   };
// }, [communityId]);
// let countdownInterval;

// // const startCountdown = (seconds) => {
// //   clearInterval(countdownInterval);
  
// //   countdownInterval = setInterval(() => {
// //     const hours = Math.floor(seconds / 3600);
// //     const minutes = Math.floor((seconds % 3600) / 60);
// //     const secs = seconds % 60;
    
// //     setCountdown(`${hours}h ${minutes}m ${secs}s`);
    
// //     if (seconds <= 0) {
// //       clearInterval(countdownInterval);
// //       setFreezeStatus(prev => ({ ...prev, isFrozen: true }));
// //     } else {
// //       seconds--;
// //     }
// //   }, 1000);
// // };

// // Add this component to display freeze status
// const FreezeStatusBanner = () => {
//   if (freezeStatus.isFrozen) {
//     return (
//       <div className="freeze-banner frozen">
//         <strong>COMMUNITY FROZEN:</strong> No order modifications allowed. 
//         Delivery coming soon!
//       </div>
//     );
//   } else if (freezeStatus.timeUntilFreeze > 0) {
//     return (
//       <div className="freeze-banner warning">
//         <strong>Community will freeze in:</strong> {countdown}
//       </div>
//     );
//   }
//   return null;
// };


//   const handlePlaceOrder = () => {
//     navigate(`/orderpage`);
//   };

//   const handleOrder = (memberId) => {
//     navigate(`/consumer-dashboard`, { state: { memberId: memberId.toString(), communityId } });
//   };

//   const handleRemoveOrder = async (orderId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/order/${communityId}/${orderId}`,
//         { method: 'DELETE' ,
          
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`,
//               'Content-Type': 'application/json' // Recommended to include
            
//           }
//         }
//       );
//       if (!response.ok) throw new Error("Failed to delete order");
      
//       // Refresh orders after deletion
//   //     const ordersResponse = await fetch(
//   //       `http://localhost:5000/api/order/${communityId}/all-orders`
//   //     );
//   //     if (!ordersResponse.ok) throw new Error("Failed to fetch orders after deletion");
//   //     const ordersData = await ordersResponse.json();
//   //     setOrders(ordersData);
//   //   } catch (error) {
//   //     console.error("Error removing order:", error);
//   //     alert("Failed to remove order");
//   //   }
//   // };

//   setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
// } catch (error) {
//   console.error("Error removing order:", error);
//   alert("Failed to remove order");
// }
// };

//   const handleQuantityChange = async (orderId, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/order/${communityId}/${orderId}`,
//         {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//              'Authorization': `Bearer ${consumer.token}`
//           },
//           body: JSON.stringify({ quantity: newQuantity })
//         }
//       );
//       if (!response.ok) throw new Error("Failed to update quantity");
      
//       // Refresh orders after update
//   //     const ordersResponse = await fetch(
//   //       `http://localhost:5000/api/order/${communityId}/all-orders`
//   //     );
//   //     if (!ordersResponse.ok) throw new Error("Failed to fetch orders after update");
//   //     const ordersData = await ordersResponse.json();
//   //     setOrders(ordersData);
//   //   } catch (error) {
//   //     console.error("Error updating quantity:", error);
//   //     alert("Failed to update quantity");
//   //   }
//   // };

//   setOrders(prevOrders => 
//     prevOrders.map(order => 
//       order.order_id === orderId 
//         ? { ...order, quantity: newQuantity, total: order.price * newQuantity } 
//         : order
//     )
//   );
// } catch (error) {
//   console.error("Error updating quantity:", error);
//   alert("Failed to update quantity");
// }
// };

//   if (loading) return <div className="loading">Loading...</div>;
//   if (error) return <div className="error">Error: {error}</div>;
//   if (!communityDetails) return <div className="error">No community data found</div>;

//   // Group orders by member and get product details
//   const ordersByMember = orders.reduce((acc, order) => {
//     if (!acc[order.member_id]) {
//       const member = members.find(m => m.id === order.member_id) || {};
//       acc[order.member_id] = {
//         member_id: order.member_id,
//         member_name: member.name || 'Member',
//         phone_number: member.phone || '',
//         consumer_id: member.consumer_id,
//         isAdmin: member.consumer_id === communityDetails.admin_id,
//         orders: [],
//         total: 0,
//         payment_method: order.payment_method || 'Not specified',
//         order_count: 0
//       };
//     }
//     acc[order.member_id].orders.push(order);
//     acc[order.member_id].total += order.total;
//     acc[order.member_id].order_count = acc[order.member_id].orders.length;
//     return acc;
//   }, {});

//   // Add members who haven't placed orders yet
//   members.forEach(member => {
//     if (!ordersByMember[member.id]) {
//       ordersByMember[member.id] = {
//         member_id: member.id,
//         member_name: member.name,
//         phone_number: member.phone,
//         consumer_id: member.consumer_id,
//         isAdmin: member.consumer_id === communityDetails.admin_id,
//         orders: [],
//         total: 0,
//         payment_method: 'Not specified',
//         order_count: 0
//       };
//     }
//   });

//   const memberOrders = Object.values(ordersByMember);

//   // Calculate totals
//   const grandTotal = memberOrders.reduce((sum, member) => sum + member.total, 0);
//   const totalMembers = memberOrders.length;
//   const confirmedMembers = memberOrders.filter(member => member.orders.length > 0).length;

//   return (
//     <div className="order-page">
//       <Navbar3 />
//       <FreezeStatusBanner />
//       <div className="order-header">
//         <h1>Order Details - {communityDetails.name || 'Unnamed Community'}</h1>
//         <div className="member-counts">
//           <span>Total Members: {totalMembers}</span>
//           <span>Confirmed Orders: {confirmedMembers}</span>
//         </div>
//       </div>

//       <div className="summary-card">
//         <h3>Community Information</h3>
//         <div className="community-details">
//           <p><strong>Admin:</strong> {communityDetails.admin_name || 'Not specified'}</p>
//           <p><strong>Address:</strong> {communityDetails.address || 'Not specified'}</p>
//           <p><strong>Delivery Date:</strong> {communityDetails.delivery_date || 'Not specified'}</p>
//           <p><strong>Delivery Time:</strong> {communityDetails.delivery_time || 'Not specified'}</p>
//           <p><strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}</p>
//         </div>
//       </div>

//       <div className="search-section">
//         <input
//           type="text"
//           placeholder="Search members..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />


//         {/* <button 
//           className="place-order-btn"
//           onClick={handlePlaceOrder}
//         >
//           Proceed to Payment
//         </button> */}

// {!freezeStatus.isFrozen ? (
//     <button 
//     className="place-order-btn disabled"
//     disabled
//   >
//     Orders Locked - Delivery Pending
//     </button>
//   ) : (
//     <button 
//     className="place-order-btn"
//     onClick={handlePlaceOrder}
//   >
//     Proceed to Payment
//     </button>
//   )}
//       </div>

//       <div className="all-orders-section">
//         <h2>All Orders</h2>
//         {memberOrders.length > 0 ? (
//           <div className="orders-grid">
//             {memberOrders
//               .filter(member => 
//                 member.member_name && 
//                 member.member_name.toLowerCase().includes(searchQuery.toLowerCase())
//               )
//               .sort((a, b) => a.isAdmin ? -1 : b.isAdmin ? 1 : 0) // Sort admin first
//               .map(member => (
//                 <div key={member.member_id} className={`order-card ${member.isAdmin ? 'admin-card' : ''}`}>
//                   <div className="order-header">
//                     <h3>
//                       {member.member_name}
//                       {member.isAdmin && <span className="admin-badge">Admin</span>}
//                     </h3>
//                     <div className="member-meta">
//                       <span className="phone">
//                         {member.phone_number ? member.phone_number.slice(-4).padStart(10, '*') : 'Not provided'}
//                       </span>
//                       <span className={`status ${member.orders.length > 0 ? 'confirmed' : 'pending'}`}>
//                         {member.orders.length > 0 ? 'Confirmed' : 'Pending'}
//                       </span>
//                     </div>
//                   </div>
                  
//                   {member.orders.length > 0 ? (
//                     <div className="krishi-cart-items">
//                       {member.orders.map(order => (
//                         <div key={order.order_id} className="krishi-cart-item">
//                           <div className="krishi-cart-item-img-container">
//                             <img
//                               src={order.product_image}
//                               alt={order.product_name}
//                               className="krishi-cart-item-img"
//                               onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
//                             />
//                           </div>
//                           <div className="krishi-cart-item-details">
//                             <h3 className="krishi-cart-item-name">{order.product_name}</h3>
//                             <div className="krishi-cart-item-meta">
//                               <span className="krishi-cart-item-price">₹{order.price.toFixed(2)}</span>
//                             </div>
//                             <div className="krishi-cart-item-controls">
//                               <div className="krishi-quantity-selector">
//                                 <button 
//                                   className="krishi-quantity-btn" 
//                                   onClick={() => handleQuantityChange(order.order_id, order.quantity - 1)}
//                                   disabled={order.quantity <= 1}
//                                 >
//                                   −
//                                 </button>
//                                 <span className="krishi-quantity-value">{order.quantity}</span>
//                                 <button 
//                                   className="krishi-quantity-btn" 
//                                   onClick={() => handleQuantityChange(order.order_id, order.quantity + 1)}
//                                 >
//                                   +
//                                 </button>
//                               </div>
//                               <button 
//                                 className="krishi-remove-btn"
//                                 onClick={() => handleRemoveOrder(order.order_id)}
//                               >
//                                 Remove
//                               </button>
//                             </div>
//                             <div className="krishi-cart-item-total">
//                               Total: ₹{order.total.toFixed(2)}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                       <div className="order-summary">
//                         {/* <div className="summary-row">
//                           <span>Items:</span>
//                           <span>{member.order_count}</span>
//                         </div> */}
//                               <div className="summary-row">
//         <span>Items:</span>
//         <span>{member.order_count}</span>
//       </div>
      
//       {freezeStatus.isFrozen && adminDiscount.totalDiscount > 0 && (
//         <>
//           <div className="summary-row">
//             <span>Community Discount:</span>
//             <span>{adminDiscount.memberDiscount}%</span>
//           </div>
//           <div className="summary-row">
//             <span>Volume Discount:</span>
//             <span>{adminDiscount.itemDiscount}%</span>
//           </div>
//           <div className="summary-row discount-total">
//             <span>Total Discount:</span>
//             <span>{adminDiscount.totalDiscount}%</span>
//           </div>
//         </>
//       )}
//                         {/* <div className="summary-row">
//                           <span>Payment Method:</span>
//                           <span>{member.payment_method}</span>
//                         </div>
//                         <div className="summary-row total">
//                           <span>Member Total:</span>
//                           <span>₹{member.total.toFixed(2)}</span>
//                         </div> */}

// <div className="summary-row">
//         <span>Payment Method:</span>
//         <span>{member.payment_method}</span>
//       </div>
//       <div className="summary-row total">
//         <span>Subtotal:</span>
//         <span>₹{member.total.toFixed(2)}</span>
//       </div>
      
//       {freezeStatus.isFrozen && adminDiscount.totalDiscount > 0 && (
//         <div className="summary-row final-total">
//           <span>Final Total:</span>
//           <span>₹{(member.total * (1 - adminDiscount.totalDiscount/100)).toFixed(2)}</span>
//         </div>
//       )}

//                       </div>
//                     </div>
//                   ) : (
//                     <div className="no-orders">
//                       <p>No orders placed yet</p>
//                       <button 
//                         className="small-order-btn"
//                         onClick={() => handleOrder(member.member_id)}
//                       >
//                         Place Order
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//           </div>
//         ) : (
//           <div className="no-orders-message">
//             <p>No orders found for this community</p>
//             <button 
//               className="place-order-btn"
//               onClick={() => handleOrder('')}
//             >
//               + Place Your First Order
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default OrderPage;


// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js";
// import { useAuth } from '../context/AuthContext';
// import "../styles/OrderPageC.css";

// function OrderPage() {
//   const { communityId } = useParams();
//   const navigate = useNavigate();
//   const { consumer } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [communityDetails, setCommunityDetails] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [allMembers, setAllMembers] = useState([]); // For all members summary
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
  
//   // Freeze status states
//   const [freezeStatus, setFreezeStatus] = useState({
//     isFrozen: false,
//     timeUntilFreeze: 0,
//     secondsUntilDelivery: 0
//   });
//   const [countdown, setCountdown] = useState('');
//   const countdownIntervalRef = useRef(null);
  
//   // Discount states
//   const [discount, setDiscount] = useState({
//     memberCount: 0,
//     itemCount: 0,
//     memberDiscount: 0,
//     itemDiscount: 0,
//     totalDiscount: 0
//   });

//   // Countdown functions
//   const startCountdown = (seconds) => {
//     if (countdownIntervalRef.current) {
//       clearInterval(countdownIntervalRef.current);
//     }
//     updateCountdownDisplay(seconds);
//     countdownIntervalRef.current = setInterval(() => {
//       seconds--;
//       updateCountdownDisplay(seconds);
//       if (seconds <= 0) {
//         clearInterval(countdownIntervalRef.current);
//         setFreezeStatus(prev => ({ ...prev, isFrozen: true }));
//       }
//     }, 1000);
//   };

//   const updateCountdownDisplay = (seconds) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     setCountdown(`${hours}h ${minutes}m ${secs}s`);
//   };

//   // Freeze status banner component
//   const FreezeStatusBanner = () => {
//     if (freezeStatus.isFrozen) {
//       return (
//         <div className="freeze-banner frozen">
//           <strong>COMMUNITY FROZEN:</strong> No order modifications allowed. 
//           Delivery coming soon!
//         </div>
//       );
//     } else if (freezeStatus.timeUntilFreeze > 0) {
//       return (
//         <div className="freeze-banner warning">
//           <strong>Community will freeze in:</strong> {countdown}
//         </div>
//       );
//     }
//     return null;
//   };

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch community details
//         const communityResponse = await fetch(
//           `http://localhost:5000/api/community/${communityId}`, {
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             },
//           }
//         );
//         if (!communityResponse.ok) throw new Error("Failed to fetch community details");
//         const communityData = await communityResponse.json();
//         setCommunityDetails(communityData.data);

//         // Fetch all members summary
//         const membersSummaryResponse = await fetch(
//           `http://localhost:5000/api/community/${communityId}/members-summary`, {
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             },
//           }
//         );
//         if (!membersSummaryResponse.ok) throw new Error("Failed to fetch members summary");
//         const membersSummaryData = await membersSummaryResponse.json();
//         setAllMembers(membersSummaryData);

//         // Fetch current member's orders
//         const ordersResponse = await fetch(
//           `http://localhost:5000/api/community/${communityId}/members/${consumer.consumer_id}/orders`, {
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             },
//           }
//         );
//         if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
//         const ordersData = await ordersResponse.json();
//         setOrders(ordersData.orders || []);

//         // Fetch freeze status
//         const freezeStatusResponse = await fetch(
//           `http://localhost:5000/api/order/${communityId}/freeze-status`, {
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             }
//           }
//         );
//         const freezeStatusData = await freezeStatusResponse.json();
//         if (freezeStatusResponse.ok) {
//           setFreezeStatus(freezeStatusData);
//           if (!freezeStatusData.isFrozen && freezeStatusData.timeUntilFreeze > 0) {
//             startCountdown(freezeStatusData.timeUntilFreeze);
//           }
//         }

//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();

//     return () => {
//       if (countdownIntervalRef.current) {
//         clearInterval(countdownIntervalRef.current);
//       }
//     };
//   }, [communityId, consumer]);

//   // Fetch discount when frozen
//   useEffect(() => {
//     const fetchDiscount = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:5000/api/community/${communityId}/member/${consumer.consumer_id}/discount`, {
//             headers: { 
//               'Authorization': `Bearer ${consumer.token}`
//             }
//           }
//         );
//         const data = await response.json();
//         if (response.ok) {
//           setDiscount(data);
//         }
//       } catch (error) {
//         console.error("Error fetching discount:", error);
//       }
//     };

//     if (freezeStatus.isFrozen) {
//       fetchDiscount();
//     } else {
//       setDiscount({
//         memberCount: 0,
//         itemCount: 0,
//         memberDiscount: 0,
//         itemDiscount: 0,
//         totalDiscount: 0
//       });
//     }
//   }, [freezeStatus.isFrozen, communityId, consumer]);

//   // Order management functions
//   const handlePlaceOrder = () => {
//     navigate(`/orderpage`);
//   };

//   const handleRemoveOrder = async (orderId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/order/${communityId}/${orderId}`,
//         { 
//           method: 'DELETE',
//           headers: { 
//             'Authorization': `Bearer ${consumer.token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       if (!response.ok) throw new Error("Failed to delete order");
      
//       setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
//     } catch (error) {
//       console.error("Error removing order:", error);
//       alert("Failed to remove order");
//     }
//   };

//   const handleQuantityChange = async (orderId, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/order/${communityId}/${orderId}`,
//         {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${consumer.token}`
//           },
//           body: JSON.stringify({ quantity: newQuantity })
//         }
//       );
//       if (!response.ok) throw new Error("Failed to update quantity");

//       setOrders(prevOrders => 
//         prevOrders.map(order => 
//           order.order_id === orderId 
//             ? { ...order, quantity: newQuantity, total: order.price * newQuantity } 
//             : order
//         )
//       );
//     } catch (error) {
//       console.error("Error updating quantity:", error);
//       alert("Failed to update quantity");
//     }
//   };

//   if (loading) return <div className="loading">Loading...</div>;
//   if (error) return <div className="error">Error: {error}</div>;
//   if (!communityDetails) return <div className="error">No community data found</div>;

//   // Calculate totals
//   const currentMemberTotal = orders.reduce((sum, order) => sum + order.total, 0);
//   const totalMembers = allMembers.length;
//   const confirmedMembers = allMembers.filter(member => member.order_count > 0).length;

//   return (
//     <div className="order-page">
//       <Navbar3 />
//       <FreezeStatusBanner />
      
//       <div className="order-header">
//         <h1>Order Details - {communityDetails.name || 'Unnamed Community'}</h1>
//         <div className="member-counts">
//           <span>Total Members: {totalMembers}</span>
//           <span>Confirmed Orders: {confirmedMembers}</span>
//         </div>
//       </div>

//       <div className="summary-card">
//         <h3>Community Information</h3>
//         <div className="community-details">
//           <p><strong>Admin:</strong> {communityDetails.admin_name || 'Not specified'}</p>
//           <p><strong>Address:</strong> {communityDetails.address || 'Not specified'}</p>
//           <p><strong>Delivery Date:</strong> {communityDetails.delivery_date || 'Not specified'}</p>
//           <p><strong>Delivery Time:</strong> {communityDetails.delivery_time || 'Not specified'}</p>
//         </div>
//       </div>

//       <div className="search-section">
//         <input
//           type="text"
//           placeholder="Search members..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />

//         {!freezeStatus.isFrozen ? (
//           <button className="place-order-btn disabled" disabled>
//             Orders Locked - Delivery Pending
//           </button>
//         ) : (
//           <button className="place-order-btn" onClick={handlePlaceOrder}>
//             Proceed to Payment
//           </button>
//         )}
//       </div>

//       {/* Current Member's Orders */}
//       <div className="current-member-orders">
//         <h2>Your Orders</h2>
//         {orders.length > 0 ? (
//           <div className="orders-container">
//             {orders.map(order => (
//               <div key={order.order_id} className="order-item">
//                 <div className="order-item-img">
//                   <img 
//                     src={order.product_image || '/images/default-produce.jpg'} 
//                     alt={order.product_name}
//                     onError={(e) => e.target.src = '/images/default-produce.jpg'}
//                   />
//                 </div>
//                 <div className="order-item-details">
//                   <h3>{order.product_name}</h3>
//                   <div className="order-item-meta">
//                     <span>Price: ₹{order.price.toFixed(2)}</span>
//                     <div className="quantity-controls">
//                       <button 
//                         onClick={() => handleQuantityChange(order.order_id, order.quantity - 1)}
//                         disabled={order.quantity <= 1}
//                       >
//                         −
//                       </button>
//                       <span>{order.quantity}</span>
//                       <button 
//                         onClick={() => handleQuantityChange(order.order_id, order.quantity + 1)}
//                       >
//                         +
//                       </button>
//                     </div>
//                     <button 
//                       className="remove-btn"
//                       onClick={() => handleRemoveOrder(order.order_id)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                   <div className="order-item-total">
//                     Total: ₹{order.total.toFixed(2)}
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             <div className="order-summary">
//               <div className="summary-row">
//                 <span>Items:</span>
//                 <span>{orders.length}</span>
//               </div>
              
//               {freezeStatus.isFrozen && discount.totalDiscount > 0 && (
//                 <>
//                   <div className="summary-row">
//                     <span>Community Discount:</span>
//                     <span>{discount.memberDiscount}%</span>
//                   </div>
//                   <div className="summary-row">
//                     <span>Volume Discount:</span>
//                     <span>{discount.itemDiscount}%</span>
//                   </div>
//                   <div className="summary-row discount-total">
//                     <span>Total Discount:</span>
//                     <span>{discount.totalDiscount}%</span>
//                   </div>
//                 </>
//               )}
              
//               <div className="summary-row total">
//                 <span>Subtotal:</span>
//                 <span>₹{currentMemberTotal.toFixed(2)}</span>
//               </div>
              
//               {freezeStatus.isFrozen && discount.totalDiscount > 0 && (
//                 <div className="summary-row final-total">
//                   <span>Final Total:</span>
//                   <span>₹{(currentMemberTotal * (1 - discount.totalDiscount/100)).toFixed(2)}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="no-orders">
//             <p>You haven't placed any orders yet</p>
//             <button 
//               className="place-order-btn"
//               onClick={() => navigate('/consumer-dashboard')}
//             >
//               + Place Your First Order
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Other Members Summary */}
//       <div className="members-summary">
//         <h2>Community Members</h2>
//         <div className="members-grid">
//           {allMembers
//             .filter(member => 
//               member.member_name && 
//               member.member_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
//               member.consumer_id !== consumer.consumer_id // Exclude current member
//             )
//             .map(member => (
//               <div key={member.member_id} className="member-card">
//                 <h3>{member.member_name}</h3>
//                 <div className="member-meta">
//                   <span className="status">
//                     Status: <span className={member.status === 'Confirmed' ? 'confirmed' : 'pending'}>
//                       {member.status}
//                     </span>
//                   </span>
//                   <span className="orders-count">
//                     Orders: {member.order_count}
//                   </span>
//                   {member.payment_method && (
//                     <span className="payment-method">
//                       Payment: {member.payment_method}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default OrderPage;

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import { useAuth } from '../context/AuthContext';
import "../styles/OrderPageC.css";

function OrderPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { consumer } = useAuth();
  const [yourOrders, setYourOrders] = useState([]);
  const [membersOrders, setMembersOrders] = useState([]);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Freeze status states
  const [freezeStatus, setFreezeStatus] = useState({
    isFrozen: false,
    timeUntilFreeze: 0,
    secondsUntilDelivery: 0
  });
  const [countdown, setCountdown] = useState('');
  const countdownIntervalRef = useRef(null);
  
  // Discount states
  const [discount, setDiscount] = useState({
    memberCount: 0,
    itemCount: 0,
    memberDiscount: 0,
    itemDiscount: 0,
    totalDiscount: 0,
    memberDiscountAmount: 0,
    itemDiscountAmount: 0,
    totalDiscountAmount: 0,
    subtotal: 0
  });

  // Countdown functions
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

  // Freeze status banner component
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch community details
        const communityResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!communityResponse.ok) throw new Error("Failed to fetch community details");
        const communityData = await communityResponse.json();
        setCommunityDetails(communityData.data);

        // 2. First get the member_id for the logged-in consumer
        const memberIdResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        
        if (!memberIdResponse.ok) throw new Error("Failed to fetch member ID");
        const memberIdData = await memberIdResponse.json();

        if (!memberIdData.success || !memberIdData.memberId) {
          throw new Error("User is not a member of this community");
        }
        const memberId = memberIdData.memberId;

        // 3. Fetch logged-in user's orders
        const yourOrdersResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/member/${memberId}/orders`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!yourOrdersResponse.ok) throw new Error("Failed to fetch your orders");
        const yourOrdersData = await yourOrdersResponse.json();
        const processedOrders = (yourOrdersData.orders || []).map(order => ({
          ...order,
          price: Number(order.price) || 0,
          quantity: Number(order.quantity) || 0,
          total: (Number(order.price) || 0) * (Number(order.quantity) || 0)
        }));
        setYourOrders(processedOrders);

        // 4. Fetch all members' summary (excluding current user)
        const membersSummaryResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/members-summary`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!membersSummaryResponse.ok) throw new Error("Failed to fetch members summary");
        const membersSummaryData = await membersSummaryResponse.json();
        
        // Filter out current user from members list
        const otherMembers = membersSummaryData.filter(member => 
          member.consumer_id !== consumer.consumer_id
        );
        setMembersOrders(otherMembers);

        // 5. Fetch freeze status
        const freezeStatusResponse = await fetch(
          `http://localhost:5000/api/order/${communityId}/freeze-status`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            }
          }
        );
        const freezeStatusData = await freezeStatusResponse.json();
        if (freezeStatusResponse.ok) {
          setFreezeStatus(freezeStatusData);
          if (!freezeStatusData.isFrozen && freezeStatusData.timeUntilFreeze > 0) {
            startCountdown(freezeStatusData.timeUntilFreeze);
          }
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [communityId, consumer]);



  // Add this useEffect to listen for order confirmation
useEffect(() => {
  const checkForConfirmedOrder = async () => {
    try {
      const memberIdResponse = await fetch(
        `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
          headers: { 
            'Authorization': `Bearer ${consumer.token}`
          },
        }
      );
      
      if (!memberIdResponse.ok) return;
      const memberIdData = await memberIdResponse.json();
      const memberId = memberIdData.memberId;

      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/member/${memberId}/has-confirmed-order`,
        {
          headers: {
            'Authorization': `Bearer ${consumer.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.hasConfirmedOrder) {
          setYourOrders([]);
        }
      }
    } catch (error) {
      console.error("Error checking confirmed order:", error);
    }
  };

  // Check periodically (every 30 seconds) if order was confirmed
  const interval = setInterval(checkForConfirmedOrder, 30000);
  return () => clearInterval(interval);
}, [communityId, consumer]);
  // Fetch discount when frozen
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const memberIdResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        
        if (!memberIdResponse.ok) throw new Error("Failed to fetch member ID");
        const memberIdData = await memberIdResponse.json();
        const memberId = memberIdData.memberId;

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
            memberDiscountAmount: data.memberDiscountAmount || 0,
            itemDiscountAmount: data.itemDiscountAmount || 0,
            totalDiscountAmount: data.totalDiscountAmount || 0,
            subtotal: data.subtotal || 0
          });
        }
      } catch (error) {
        console.error("Error fetching discount:", error);
      }
    };

    if (freezeStatus.isFrozen) {
      fetchDiscount();
    } else {
      setDiscount({
        memberCount: 0,
        itemCount: 0,
        memberDiscount: 0,
        itemDiscount: 0,
        totalDiscount: 0,
        memberDiscountAmount: 0,
        itemDiscountAmount: 0,
        totalDiscountAmount: 0,
        subtotal: 0
      });
    }
  }, [freezeStatus.isFrozen, communityId, consumer]);

  // Calculate totals
  const yourTotal = yourOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalMembers = membersOrders.length + 1; // +1 for current user
  const confirmedMembers = membersOrders.filter(member => member.status === 'Confirmed').length + 
                         (yourOrders.length > 0 ? 1 : 0);

  // Order management functions
  // const handlePlaceOrder = () => {
  //   navigate(`/orderpage`);
  // };

     // Order management functions
  const handleProceedToPayment = async () => {
    try {
      // Prepare order data for submission
      const orderData = yourOrders.map(order => ({
        product_id: order.product_id,
        product_name: order.product_name,
        price: order.price,
        quantity: order.quantity,
        category: order.category
      }));

      const memberIdResponse = await fetch(
        `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
          headers: { 
            'Authorization': `Bearer ${consumer.token}`
          },
        }
      );
      
      if (!memberIdResponse.ok) throw new Error("Failed to fetch member ID");
      const memberIdData = await memberIdResponse.json();
      const memberId = memberIdData.memberId;

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
            discount: discount
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
          discountData: discount
        }
      });
    } catch (err) {
      console.error("Error submitting frozen order:", err);
      setError(err.message);
    }
  };

  const handleRemoveOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${communityId}/${orderId}`,
        { 
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${consumer.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error("Failed to delete order");
      
      setYourOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
    } catch (error) {
      console.error("Error removing order:", error);
      alert("Failed to remove order");
    }
  };

  const handleQuantityChange = async (orderId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
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

      setYourOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_id === orderId 
            ? { ...order, quantity: newQuantity, total: order.price * newQuantity } 
            : order
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!communityDetails) return <div className="error">No community data found</div>;

  return (
    <div className="order-page">
      <Navbar3 />
      <FreezeStatusBanner />
      
      <div className="order-header">
        <h1>Order Details - {communityDetails.name || 'Unnamed Community'}</h1>
        <div className="member-counts">
          <span>Total Members: {totalMembers}</span>
          <span>Confirmed Orders: {confirmedMembers}</span>
        </div>
      </div>

      <div className="summary-card">
        <h3>Community Information</h3>
        <div className="community-details">
          <p><strong>Admin:</strong> {communityDetails.admin_name || 'Not specified'}</p>
          <p><strong>Address:</strong> {communityDetails.address || 'Not specified'}</p>
          <p><strong>Delivery Date:</strong> {communityDetails.delivery_date || 'Not specified'}</p>
          <p><strong>Delivery Time:</strong> {communityDetails.delivery_time || 'Not specified'}</p>
        </div>
      </div>

      {/* Your Orders Section */}
      <div className="your-orders-section">
        <h2>Your Orders</h2>
        {yourOrders.length > 0 ? (
          <div className="orders-container">
            {yourOrders.map(order => (
              // <div key={order.order_id} className="order-item">
              //   <div className="order-item-img">
              //   <img 
              //     src={`/images/${(order.product_name || order.name || '').toLowerCase().replace(/\s+/g, '-')}.jpg`
              //     }
              //     alt={order.product_name || order.name || 'Product'}
              //     onError={(e) =>{ e.target.src = "/images/default-produce.jpg";
              //       e.target.onerror = null;
              //     }}
              //   />
              // </div>
              //   <div className="order-item-details">
              //     <h3>{order.product_name}</h3>
              //     <div className="order-item-meta">
              //       <span>Price: ₹{order.price.toFixed(2)}</span>
              //       <div className="quantity-controls">
              //         <button 
              //           onClick={() => handleQuantityChange(order.order_id, order.quantity - 1)}
              //           disabled={order.quantity <= 1 || freezeStatus.isFrozen}
              //         >
              //           −
              //         </button>
              //         <span>{order.quantity}</span>
              //         <button 
              //           onClick={() => handleQuantityChange(order.order_id, order.quantity + 1)}
              //           disabled={freezeStatus.isFrozen}
              //         >
              //           +
              //         </button>
              //       </div>
              //       <button 
              //         className="remove-btn"
              //         onClick={() => handleRemoveOrder(order.order_id)}
              //         disabled={freezeStatus.isFrozen}
              //       >
              //         Remove
              //       </button>
              //     </div>
              //     <div className="order-item-total">
              //       Total: ₹{order.total.toFixed(2)}
              //     </div>
              //   </div>
              // </div>
              // In OrderPage.js - update the order item display
<div key={order.order_id} className="order-item">
  <div className="order-item-img">
    <img 
      src={`/images/${(order.product_name || order.name || '').toLowerCase().replace(/\s+/g, '-')}.jpg`}
      alt={order.product_name || order.name || 'Product'}
      onError={(e) => {
        e.target.src = "/images/default-produce.jpg";
        e.target.onerror = null;
      }}
    />
  </div>
  <div className="order-item-details">
    <h3>{order.product_name}</h3>
    <div className="product-meta">
      <span className="product-type">
        {order.category} • {order.buy_type === 'organic' ? 'Organic' : 'Standard'}
      </span>
    </div>
    <div className="order-item-meta">
      <span>Price: ₹{order.price.toFixed(2)}</span>
      <div className="quantity-controls">
        <button 
          onClick={() => handleQuantityChange(order.order_id, order.quantity - 1)}
          disabled={order.quantity <= 1 || freezeStatus.isFrozen}
        >
          −
        </button>
        <span>{order.quantity}</span>
        <button 
          onClick={() => handleQuantityChange(order.order_id, order.quantity + 1)}
          disabled={freezeStatus.isFrozen}
        >
          +
        </button>
      </div>
      <button 
        className="remove-btn"
        onClick={() => handleRemoveOrder(order.order_id)}
        disabled={freezeStatus.isFrozen}
      >
        Remove
      </button>
    </div>
    <div className="order-item-total">
      Total: ₹{order.total.toFixed(2)}
    </div>
  </div>
</div>
            ))}
            <div className="order-summary">
              {freezeStatus.isFrozen && discount.totalDiscount > 0 && (
                <>
                  <div className="summary-row">
                    <span>Community Discount ({discount.memberCount} members):</span>
                    <span>₹{discount.memberDiscountAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Volume Discount ({discount.itemCount} items):</span>
                    <span>₹{discount.itemDiscountAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row discount-total">
                    <span>Total Discount:</span>
                    <span>₹{discount.totalDiscountAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="summary-row total">
                <span>Subtotal:</span>
                <span>₹{yourTotal.toFixed(2)}</span>
              </div>
              {freezeStatus.isFrozen && discount.totalDiscount > 0 && (
                <div className="summary-row final-total">
                  <span>Final Total:</span>
                  <span>₹{(yourTotal - discount.totalDiscountAmount).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <button 
              className="place-order-btn"
              onClick={() => navigate('/consumer-dashboard')}
              disabled={freezeStatus.isFrozen}
            >
              + Place Your First Order
            </button>
          </div>
        )}
      </div>

      {/* Members Orders Section */}
      <div className="members-orders-section">
        <h2>Members Orders</h2>
        <div className="search-section">
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {membersOrders.length > 0 ? (
          <div className="members-grid">
            {membersOrders
              .filter(member => 
                member.member_name && 
                member.member_name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(member => (
                <div key={member.member_id} className="member-card">
                  <h3>{member.member_name}</h3>
                  <div className="member-meta">
                    <span className="status">
                      Status: <span className={member.status === 'Confirmed' ? 'confirmed' : 'pending'}>
                        {member.status}
                      </span>
                    </span>
                    <span className="orders-count">
                      Orders: {member.order_count}
                    </span>
                    {member.payment_method && (
                      <span className="payment-method">
                        Payment: {member.payment_method}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="no-members">No other members have placed orders yet</p>
        )}
      </div>

      <div className="payment-section">
        {!freezeStatus.isFrozen ? (
          <button className="payment-btn disabled" disabled>
            Orders Locked - Delivery Pending
          </button>
        ) : (
          <button className="payment-btn" onClick={handleProceedToPayment}>
            Proceed to Payment
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderPage;