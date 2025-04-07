

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
//           throw new Error("Failed to fetch orders");
//         }
//         const data = await response.json();
        
//         // Convert all numeric fields to numbers
//         const processedData = {
//           ...data,
//           adminOrders: (data.adminOrders || []).map(order => ({
//             ...order,
//             price: Number(order.price) || 0,
//             quantity: Number(order.quantity) || 0
//           })),
//           // Filter out admin from members list
//           members: (data.members || []).filter(member => 
//             member.consumer_id !== data.admin_id
//           ).map(member => ({
//             ...member,
//             total: Number(member.total) || 0,
//             orders: (member.orders || []).map(order => ({
//               ...order,
//               price: Number(order.price) || 0,
//               quantity: Number(order.quantity) || 0
//             }))
//           })),
//           grandTotal: Number(data.grandTotal) || 0,
//           adminTotal: Number(data.adminTotal) || 0,
//           totalMembers: Number(data.totalMembers) || 0,
//           confirmedMembers: Number(data.confirmedMembers) || 0,
//           admin_id: data.admin_id // Keep admin_id for reference
//         };

//         setOrderDetails(processedData);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [communityId]);

//   const handlePlaceOrder = () => {
//     navigate(`/orderpage`);
//   };
//   const handleorder= () => {
//     navigate(`/consumer-dashboard`);
//   };

//   if (loading) return <div className="loading">Loading...</div>;
//   if (error) return <div className="error">Error: {error}</div>;
//   if (!orderDetails) return <div className="error">No order data found</div>;

//   return (
//     <div className="order-page">
//       <Navbar3 />
      
//       <div className="order-header">
//         <h1>Order Details - {orderDetails.communityName || 'Unnamed Community'}</h1>
//         <div className="member-counts">
//           <span>Total Members: {orderDetails.totalMembers}</span>
//           <span>Confirmed Orders: {orderDetails.confirmedMembers}</span>
//         </div>
//       </div>

//       <div className="summary-card">
//         <h3>Community Information</h3>
//         <div className="community-details">
//           <p><strong>Admin:</strong> {orderDetails.adminName || 'Not specified'}</p>
//           <p><strong>Address:</strong> {orderDetails.address || 'Not specified'}</p>
//           <p><strong>Delivery Date:</strong> {orderDetails.deliveryDate || 'Not specified'}</p>
//           <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime || 'Not specified'}</p>
//           <p><strong>Grand Total:</strong> ₹{orderDetails.grandTotal.toFixed(2)}</p>
//           <p><strong>Overall Status:</strong> {orderDetails.overallPaymentStatus || 'Not specified'}</p>
//         </div>
//       </div>

//       <div className="your-orders-section">
//         <div className="section-header">
//           <h2>Your Orders</h2>
//           <button 
//             className="place-order-btn"
//             onClick={handlePlaceOrder}
//           >
//             Proceed to payment
//           </button>
//         </div>
//         {orderDetails.adminOrders && orderDetails.adminOrders.length > 0 ? (
//           <>
//             <table className="orders-table">
//               <thead>
//                 <tr>
//                   <th>Product</th>
//                   <th>Quantity</th>
//                   <th>Price</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orderDetails.adminOrders.map((order) => (
//                   <tr key={order.order_id || Math.random()}>
//                     <td>{order.product_id || 'N/A'}</td>
//                     <td>{order.quantity}</td>
//                     <td>₹{order.price.toFixed(2)}</td>
//                     <td>₹{(order.price * order.quantity).toFixed(2)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             <div className="order-summary">
//               <p><strong>Your Total:</strong> ₹{orderDetails.adminTotal.toFixed(2)}</p>
//             </div>
//           </>
//         ) : (
//           <div className="no-orders-section">
//             <p className="no-orders">You haven't placed any orders yet.</p>
//             <button 
//               className="place-order-btn"
//               onClick={handleorder}
//             >
//               + Place Your First Order
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="search-section">
//         <input
//           type="text"
//           placeholder="Search members..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       <div className="members-orders-section">
//         <h2>Members Orders</h2>
//         {orderDetails.members && orderDetails.members.length > 0 ? (
//           <div className="members-grid">
//             {orderDetails.members
//               .filter(member => 
//                 member.memberName && 
//                 member.memberName.toLowerCase().includes(searchQuery.toLowerCase())
//               )
//               .map(member => (
//                 <div key={member.memberId || Math.random()} className="member-card">
//                   <h3>{member.memberName || 'Unnamed Member'}</h3>
//                   <p><strong>Phone:</strong> {member.phone ? member.phone.slice(-4).padStart(10, '*') : 'Not provided'}</p>
//                   <p><strong>Total:</strong> ₹{member.total.toFixed(2)}</p>
                  
//                   {member.orders && member.orders.length > 0 ? (
//                     <table className="member-orders">
//                       <thead>
//                         <tr>
//                           <th>Product</th>
//                           <th>Qty</th>
//                           <th>Price</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {member.orders.map(order => (
//                           <tr key={order.id || Math.random()}>
//                             <td>{order.product || 'N/A'}</td>
//                             <td>{order.quantity}</td>
//                             <td>₹{order.price.toFixed(2)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <p className="no-orders">No orders placed</p>
//                   )}
//                 </div>
//               ))}
//           </div>
//         ) : (
//           <p className="no-members">No member orders found</p>
//         )}
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
//   const [orders, setOrders] = useState([]);
//   const [communityDetails, setCommunityDetails] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch community details
//         const communityResponse = await fetch(
//           `http://localhost:5000/api/community/${communityId}`
//         );
//         if (!communityResponse.ok) throw new Error("Failed to fetch community details");
//         const communityData = await communityResponse.json();
//         setCommunityDetails(communityData.data);

//         // Fetch community members
//         const membersResponse = await fetch(
//           `http://localhost:5000/api/community/${communityId}/members`
//         );
//         if (!membersResponse.ok) throw new Error("Failed to fetch members");
//         const membersData = await membersResponse.json();
//         setMembers(membersData);

//         // Fetch all orders
//         const ordersResponse = await fetch(
//           `http://localhost:5000/api/order/${communityId}/all-orders`
//         );
//         if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
//         const ordersData = await ordersResponse.json();
        
//         // Process orders data
//         const processedOrders = ordersData.map(order => ({
//           ...order,
//           price: Number(order.price) || 0,
//           quantity: Number(order.quantity) || 0,
//           total: (Number(order.price) || 0) * (Number(order.quantity) || 0)
//         }));

//         setOrders(processedOrders);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [communityId]);

//   const handlePlaceOrder = () => {
//     navigate(`/orderpage`);
//   };

//   const handleOrder = (memberId) => {
//     navigate(`/consumer-dashboard`, { state: { memberId: memberId.toString()} });
//   };

//   if (loading) return <div className="loading">Loading...</div>;
//   if (error) return <div className="error">Error: {error}</div>;
//   if (!communityDetails) return <div className="error">No community data found</div>;

//   // Group orders by member
//   const ordersByMember = orders.reduce((acc, order) => {
//     if (!acc[order.member_id]) {
//       const member = members.find(m => m.id === order.member_id) || {};
//       acc[order.member_id] = {
//         member_id: order.member_id,
//         member_name: member.name || 'Unknown Member',
//         phone_number: member.phone || '',
//         consumer_id: member.consumer_id,
//         isAdmin: member.consumer_id === communityDetails.admin_id,
//         orders: [],
//         total: 0,
//         payment_method: order.payment_method
//       };
//     }
//     acc[order.member_id].orders.push(order);
//     acc[order.member_id].total += order.total;
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
//         payment_method: ''
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
//         <button 
//           className="place-order-btn"
//           onClick={handlePlaceOrder}
//         >
//           + Place New Order
//         </button>
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
//                       {member.member_name || 'Unnamed Member'}
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
//                     <>
//                       <table className="order-items">
//                         <thead>
//                           <tr>
//                             <th>Product</th>
//                             <th>Qty</th>
//                             <th>Price</th>
//                             <th>Total</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {member.orders.map(order => (
//                             <tr key={order.order_id}>
//                               <td>{order.product_id || 'N/A'}</td>
//                               <td>{order.quantity}</td>
//                               <td>₹{order.price.toFixed(2)}</td>
//                               <td>₹{order.total.toFixed(2)}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                       <div className="order-footer">
//                         <span className="total">Member Total: ₹{member.total.toFixed(2)}</span>
//                         <span className="payment-method">
//                           Payment: {member.payment_method || 'Not specified'}
//                         </span>
//                       </div>
//                     </>
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
//               onClick={handleOrder}
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



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import "../styles/OrderPageC.css";

function OrderPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [members, setMembers] = useState([]);
  // const [setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch community details
        const communityResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}`
        );
        if (!communityResponse.ok) throw new Error("Failed to fetch community details");
        const communityData = await communityResponse.json();
        setCommunityDetails(communityData.data);

        // Fetch community members
        const membersResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/members`
        );
        if (!membersResponse.ok) throw new Error("Failed to fetch members");
        const membersData = await membersResponse.json();
        setMembers(membersData);

        // Fetch all products
        const productsResponse = await fetch(
          `http://localhost:5000/api/products`
        );
        if (!productsResponse.ok) throw new Error("Failed to fetch products");
        const productsData = await productsResponse.json();
        // setProducts(productsData);

        // Fetch all orders
        const ordersResponse = await fetch(
          `http://localhost:5000/api/order/${communityId}/all-orders`
        );
        if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
        const ordersData = await ordersResponse.json();
        
        // Process orders data with product details
        const processedOrders = ordersData.map(order => {
          const product = productsData.find(p => p.product_id === order.product_id) || {};
          // Try to get image from localStorage first
          const storedCart = localStorage.getItem(`krishiCart_${order.consumer_id}`);
          let productImage = '/images/default-produce.jpg';
          
          if (storedCart) {
            try {
              const parsedCart = JSON.parse(storedCart);
              const cartItem = parsedCart.find(item => item.product_id === order.product_id);
              if (cartItem) {
                productImage = `/images/${cartItem.product_name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
              }
            } catch (error) {
              console.error("Error parsing cart data:", error);
            }
          }
          
          return {
            ...order,
            price: Number(order.price) || 0,
            quantity: Number(order.quantity) || 0,
            total: (Number(order.price) || 0) * (Number(order.quantity) || 0),
            product_name: product.product_name || order.product_id,
            product_image: productImage
          };
        });

        setOrders(processedOrders);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

  const handlePlaceOrder = () => {
    navigate(`/orderpage`);
  };

  const handleOrder = (memberId) => {
    navigate(`/consumer-dashboard`, { state: { memberId: memberId.toString(), communityId } });
  };

  const handleRemoveOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${orderId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error("Failed to delete order");
      
      // Refresh orders after deletion
  //     const ordersResponse = await fetch(
  //       `http://localhost:5000/api/order/${communityId}/all-orders`
  //     );
  //     if (!ordersResponse.ok) throw new Error("Failed to fetch orders after deletion");
  //     const ordersData = await ordersResponse.json();
  //     setOrders(ordersData);
  //   } catch (error) {
  //     console.error("Error removing order:", error);
  //     alert("Failed to remove order");
  //   }
  // };

  setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
} catch (error) {
  console.error("Error removing order:", error);
  alert("Failed to remove order");
}
};

  const handleQuantityChange = async (orderId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity })
        }
      );
      if (!response.ok) throw new Error("Failed to update quantity");
      
      // Refresh orders after update
  //     const ordersResponse = await fetch(
  //       `http://localhost:5000/api/order/${communityId}/all-orders`
  //     );
  //     if (!ordersResponse.ok) throw new Error("Failed to fetch orders after update");
  //     const ordersData = await ordersResponse.json();
  //     setOrders(ordersData);
  //   } catch (error) {
  //     console.error("Error updating quantity:", error);
  //     alert("Failed to update quantity");
  //   }
  // };

  setOrders(prevOrders => 
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

  // Group orders by member and get product details
  const ordersByMember = orders.reduce((acc, order) => {
    if (!acc[order.member_id]) {
      const member = members.find(m => m.id === order.member_id) || {};
      acc[order.member_id] = {
        member_id: order.member_id,
        member_name: member.name || 'Member',
        phone_number: member.phone || '',
        consumer_id: member.consumer_id,
        isAdmin: member.consumer_id === communityDetails.admin_id,
        orders: [],
        total: 0,
        payment_method: order.payment_method || 'Not specified',
        order_count: 0
      };
    }
    acc[order.member_id].orders.push(order);
    acc[order.member_id].total += order.total;
    acc[order.member_id].order_count = acc[order.member_id].orders.length;
    return acc;
  }, {});

  // Add members who haven't placed orders yet
  members.forEach(member => {
    if (!ordersByMember[member.id]) {
      ordersByMember[member.id] = {
        member_id: member.id,
        member_name: member.name,
        phone_number: member.phone,
        consumer_id: member.consumer_id,
        isAdmin: member.consumer_id === communityDetails.admin_id,
        orders: [],
        total: 0,
        payment_method: 'Not specified',
        order_count: 0
      };
    }
  });

  const memberOrders = Object.values(ordersByMember);

  // Calculate totals
  const grandTotal = memberOrders.reduce((sum, member) => sum + member.total, 0);
  const totalMembers = memberOrders.length;
  const confirmedMembers = memberOrders.filter(member => member.orders.length > 0).length;

  return (
    <div className="order-page">
      <Navbar3 />
      
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
          <p><strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          className="place-order-btn"
          onClick={handlePlaceOrder}
        >
          + Place New Order
        </button>
      </div>

      <div className="all-orders-section">
        <h2>All Orders</h2>
        {memberOrders.length > 0 ? (
          <div className="orders-grid">
            {memberOrders
              .filter(member => 
                member.member_name && 
                member.member_name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => a.isAdmin ? -1 : b.isAdmin ? 1 : 0) // Sort admin first
              .map(member => (
                <div key={member.member_id} className={`order-card ${member.isAdmin ? 'admin-card' : ''}`}>
                  <div className="order-header">
                    <h3>
                      {member.member_name}
                      {member.isAdmin && <span className="admin-badge">Admin</span>}
                    </h3>
                    <div className="member-meta">
                      <span className="phone">
                        {member.phone_number ? member.phone_number.slice(-4).padStart(10, '*') : 'Not provided'}
                      </span>
                      <span className={`status ${member.orders.length > 0 ? 'confirmed' : 'pending'}`}>
                        {member.orders.length > 0 ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {member.orders.length > 0 ? (
                    <div className="krishi-cart-items">
                      {member.orders.map(order => (
                        <div key={order.order_id} className="krishi-cart-item">
                          <div className="krishi-cart-item-img-container">
                            <img
                              src={order.product_image}
                              alt={order.product_name}
                              className="krishi-cart-item-img"
                              onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
                            />
                          </div>
                          <div className="krishi-cart-item-details">
                            <h3 className="krishi-cart-item-name">{order.product_name}</h3>
                            <div className="krishi-cart-item-meta">
                              <span className="krishi-cart-item-price">₹{order.price.toFixed(2)}</span>
                            </div>
                            <div className="krishi-cart-item-controls">
                              <div className="krishi-quantity-selector">
                                <button 
                                  className="krishi-quantity-btn" 
                                  onClick={() => handleQuantityChange(order.order_id, order.quantity - 1)}
                                  disabled={order.quantity <= 1}
                                >
                                  −
                                </button>
                                <span className="krishi-quantity-value">{order.quantity}</span>
                                <button 
                                  className="krishi-quantity-btn" 
                                  onClick={() => handleQuantityChange(order.order_id, order.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                              <button 
                                className="krishi-remove-btn"
                                onClick={() => handleRemoveOrder(order.order_id)}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="krishi-cart-item-total">
                              Total: ₹{order.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="order-summary">
                        <div className="summary-row">
                          <span>Items:</span>
                          <span>{member.order_count}</span>
                        </div>
                        <div className="summary-row">
                          <span>Payment Method:</span>
                          <span>{member.payment_method}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Member Total:</span>
                          <span>₹{member.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-orders">
                      <p>No orders placed yet</p>
                      <button 
                        className="small-order-btn"
                        onClick={() => handleOrder(member.member_id)}
                      >
                        Place Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="no-orders-message">
            <p>No orders found for this community</p>
            <button 
              className="place-order-btn"
              onClick={() => handleOrder('')}
            >
              + Place Your First Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderPage;