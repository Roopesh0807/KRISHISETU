// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import { 
//   FaArrowLeft, 
//   FaClock, 
//   FaWallet, 
//   FaFilePdf, 
//   FaEdit, 
//   FaTrash, 
//   FaPlus, 
//   FaMinus,
//   FaChevronDown,
//   FaChevronUp,
//   FaPlusCircle,
//   FaExclamationTriangle,
//   FaCheckCircle,
//   FaUser,
//   FaEllipsisV
// } from 'react-icons/fa';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
// import './subscribe.css';

// const Subscribe = () => {
//   const navigate = useNavigate();
//   const [walletBalance, setWalletBalance] = useState(1500);
//   const [timeLeft, setTimeLeft] = useState('');
//   const [showWallet, setShowWallet] = useState(false);
//   const [showBill, setShowBill] = useState(null);
//   const [modifyItem, setModifyItem] = useState(null);
//   const [deleteItem, setDeleteItem] = useState(null);
//   const [addAmount, setAddAmount] = useState('');
//   const [collapsedPlans, setCollapsedPlans] = useState({});
//   const [showInstructions, setShowInstructions] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [consumerName] = useState('John Doe');
//   const [showActionMenu, setShowActionMenu] = useState(null);

//   const [subscriptions, setSubscriptions] = useState({
//     daily: [
//       { id: 1, name: 'Organic Tomatoes', quantity: 2, price: 30, startDate: '2023-06-15' },
//       { id: 2, name: 'Fresh Potatoes', quantity: 1, price: 25, startDate: '2023-06-10' }
//     ],
//     alternate: [
//       { id: 3, name: 'Premium Rice', quantity: 1, price: 60, startDate: '2023-06-01' }
//     ],
//     weekly: [
//       { id: 4, name: 'Organic Milk', quantity: 3, price: 40, startDate: '2023-06-05' }
//     ],
//     monthly: []
//   });

//   // Timer countdown to 10:30 PM
//   useEffect(() => {
//     const calculateTimeLeft = () => {
//       const now = new Date();
//       const deadline = new Date();
//       deadline.setHours(22, 30, 0, 0);

//       if (now > deadline) {
//         deadline.setDate(deadline.getDate() + 1);
//       }

//       const diff = deadline - now;
//       const hours = Math.floor(diff / (1000 * 60 * 60));
//       const minutes = Math.floor((diff / (1000 * 60)) % 60);
//       const seconds = Math.floor((diff / 1000) % 60);

//       setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
//     };

//     calculateTimeLeft();
//     const timer = setInterval(calculateTimeLeft, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const showSuccess = (message) => {
//     setSuccessMessage(message);
//     setTimeout(() => setSuccessMessage(null), 3000);
//   };

//   const togglePlanCollapse = (plan) => {
//     setCollapsedPlans(prev => ({
//       ...prev,
//       [plan]: !prev[plan]
//     }));
//   };

//   const handleModify = (plan, id, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     setIsLoading(true);
//     setTimeout(() => {
//       setSubscriptions(prev => ({
//         ...prev,
//         [plan]: prev[plan].map(item => 
//           item.id === id ? { ...item, quantity: newQuantity } : item
//         )
//       }));
//       setModifyItem(null);
//       setIsLoading(false);
//       showSuccess('Quantity updated successfully');
//     }, 500);
//   };

//   const handleDelete = (plan, id) => {
//     setIsLoading(true);
//     setTimeout(() => {
//       setSubscriptions(prev => ({
//         ...prev,
//         [plan]: prev[plan].filter(item => item.id !== id)
//       }));
//       setDeleteItem(null);
//       setIsLoading(false);
//       showSuccess('Item removed successfully');
//     }, 500);
//   };

//   const calculatePlanBill = (plan) => {
//     const items = subscriptions[plan];
//     const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const subscriptionFee = items.reduce((sum, item) => sum + (5 * item.quantity), 0);
//     return {
//       items,
//       subtotal,
//       subscriptionFee,
//       total: subtotal + subscriptionFee
//     };
//   };

//   const handleAddMoney = () => {
//     const amount = Number(addAmount);
//     if (amount > 0) {
//       setIsLoading(true);
//       setTimeout(() => {
//         setWalletBalance(prev => prev + amount);
//         setAddAmount('');
//         setIsLoading(false);
//         showSuccess(`₹${amount} added to wallet`);
//         setShowWallet(false);
//       }, 500);
//     }
//   };

//   const generatePDF = (plan) => {
//     calculatePlanBill(plan);
//     showSuccess(`PDF bill for ${plan === 'alternate' ? 'Alternate Days' : plan} plan generated!`);
//     setShowBill(null);
//   };

//   const redirectToProducts = (plan) => {
//     if (walletBalance < 100) {
//       showSuccess('Please add sufficient funds to your wallet before subscribing');
//       setShowWallet(true);
//       return;
//     }
//     navigate('/products', { state: { subscriptionType: plan } });
//   };

//   const toggleActionMenu = (planId, itemId) => {
//     const menuId = `${planId}-${itemId}`;
//     setShowActionMenu(showActionMenu === menuId ? null : menuId);
//   };

//   const carouselSettings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 1500,
//     arrows: true
//   };

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
//   };

//   return (
//     <div className="subscribe-page">
//       {isLoading && (
//         <div className="loading-overlay">
//           <div className="loading-spinner"></div>
//         </div>
//       )}

//       {successMessage && (
//         <div className="success-message">
//           <FaCheckCircle /> {successMessage}
//         </div>
//       )}

//       <div className="welcome-container">
//         <div className="welcome-content">
//           <div className="welcome-icon">
//             <FaUser />
//           </div>
//           <div className="welcome-text">
//             <h2>Welcome back, {consumerName}!</h2>
//             <p>Manage your subscriptions and enjoy fresh deliveries</p>
//           </div>
//         </div>
//       </div>

//       {showInstructions && (
//         <div className="popup-overlay">
//           <div className="instruction-popup popup-content">
//             <div className="popup-header">
//               <h3>Subscription Guidelines</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setShowInstructions(false)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="instruction-content">
//               <div className="instruction-item">
//                 <FaExclamationTriangle className="icon warning" />
//                 <p>Maintain sufficient wallet balance for automatic payments</p>
//               </div>
//               <div className="instruction-item">
//                 <FaClock className="icon info" />
//                 <p>Modify your subscription before 10:30 PM daily</p>
//               </div>
//               <div className="instruction-item">
//                 <FaCheckCircle className="icon success" />
//                 <p>Fresh products delivered by 7 AM</p>
//               </div>
//               <div className="instruction-item">
//                 <FaExclamationTriangle className="icon warning" />
//                 <p>Payment deducted after successful delivery</p>
//               </div>
//             </div>
            
//             <div className="instruction-actions">
//               <button 
//                 className="agree-btn"
//                 onClick={() => {
//                   setShowInstructions(false);
//                   if (walletBalance < 100) {
//                     setShowWallet(true);
//                   }
//                 }}
//               >
//                 I Understood
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="subscribe-header">
//         <button className="back-button" onClick={() => navigate(-1)}>
//           <FaArrowLeft />
//         </button>
//         <span className="modify-notice">
//           <FaClock /> Modify your orders before 10:30 PM
//         </span>
//         <Link to="/consumer-dashboard" className="market-link">
//           Back to Dashboard
//         </Link>
//       </div>

//       <div className="carousel-container">
//         <Slider {...carouselSettings}>
//           {[
//             {
//               img: "https://via.placeholder.com/800x400?text=No+Delivery+Charges",
//               title: "No Delivery Charges",
//               desc: "Enjoy free delivery on all your subscription orders"
//             },
//             {
//               img: "https://via.placeholder.com/800x400?text=5%+Discount",
//               title: "5% Discount",
//               desc: "Get 5% discount on every product in your subscription"
//             },
//             {
//               img: "https://via.placeholder.com/800x400?text=Low+Subscription+Fee",
//               title: "Low Subscription Fee",
//               desc: "Subscription starts from just ₹3 per kg"
//             },
//             {
//               img: "https://via.placeholder.com/800x400?text=Early+Morning+Delivery",
//               title: "Early Morning Delivery",
//               desc: "Fresh products delivered by 7 AM every day"
//             }
//           ].map((slide, index) => (
//             <div key={index} className="carousel-slide">
//               <img src={slide.img} alt={slide.title} />
//               <div className="slide-overlay">
//                 <h3>{slide.title}</h3>
//                 <p>{slide.desc}</p>
//               </div>
//             </div>
//           ))}
//         </Slider>
//       </div>

//       <div className="wallet-section">
//         <div className="wallet-balance-card">
//           <div className="wallet-info">
//             <FaWallet className="wallet-icon" />
//             <div>
//               <p className="wallet-label">Wallet Balance</p>
//               <p className="wallet-amount">₹{walletBalance.toLocaleString()}</p>
//             </div>
//           </div>
//           <button 
//             className="wallet-action" 
//             onClick={() => setShowWallet(true)}
//           >
//             Manage Wallet
//           </button>
//         </div>
//       </div>

//       <div className="subscription-plans">
//         <h2 className="section-title">
//           <span>Your Subscription Plans</span>
//         </h2>
        
//         {Object.entries(subscriptions).map(([plan, items]) => (
//           <div key={plan} className={`plan-container ${collapsedPlans[plan] ? 'collapsed' : ''}`}>
//             <div 
//               className="plan-header"
//               onClick={() => togglePlanCollapse(plan)}
//             >
//               <div className="plan-title-container">
//                 <h3 className="plan-title">
//                   {plan === 'alternate' ? 'Alternate Days' : 
//                    plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
//                   {items.length > 0 && (
//                     <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
//                   )}
//                 </h3>
//                 {collapsedPlans[plan] ? <FaChevronUp /> : <FaChevronDown />}
//               </div>
//               <div 
//                 className="plan-controls"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="plan-timer-container">
//                   <div className="modify-before-text">modify before</div>
//                   <div className="plan-timer">
//                     <FaClock /> {timeLeft}
//                   </div>
//                 </div>
//                 {items.length > 0 && (
//                   <button 
//                     className="bill-icon"
//                     onClick={() => setShowBill(plan)}
//                   >
//                     <FaFilePdf /> View Bill
//                   </button>
//                 )}
//               </div>
//             </div>

//             {!collapsedPlans[plan] && (
//               <div className="plan-content">
//                 {items.length > 0 ? (
//                   <table className="products-table">
//                     <thead>
//                       <tr>
//                         <th>Product Name</th>
//                         <th>Quantity</th>
//                         <th>Unit Price</th>
//                         <th>Total Price</th>
//                         <th>Start Date</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {items.map(item => (
//                         <tr key={item.id}>
//                           <td>{item.name}</td>
//                           <td>{item.quantity}</td>
//                           <td>₹{item.price}</td>
//                           <td>₹{item.price * item.quantity}</td>
//                           <td>{formatDate(item.startDate)}</td>
//                           <td className="product-actions">
//                             <div className="action-menu-container">
//                               <button
//                                 className="action-menu-btn"
//                                 onClick={() => toggleActionMenu(plan, item.id)}
//                               >
//                                 <FaEllipsisV />
//                               </button>
//                               {showActionMenu === `${plan}-${item.id}` && (
//                                 <div className="action-menu">
//                                   <button
//                                     onClick={() => {
//                                       setModifyItem({ 
//                                         plan, 
//                                         id: item.id, 
//                                         quantity: item.quantity,
//                                         name: item.name,
//                                         price: item.price
//                                       });
//                                       setShowActionMenu(null);
//                                     }}
//                                   >
//                                     <FaEdit /> Modify
//                                   </button>
//                                   <button
//                                     onClick={() => {
//                                       setDeleteItem({ 
//                                         plan, 
//                                         id: item.id, 
//                                         name: item.name 
//                                       });
//                                       setShowActionMenu(null);
//                                     }}
//                                   >
//                                     <FaTrash /> Delete
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 ) : (
//                   <div className="empty-plan">
//                     <p>No products in this subscription plan</p>
//                   </div>
//                 )}
//                 <div className="add-product-section">
//                   <button 
//                     className="add-product-btn"
//                     onClick={() => redirectToProducts(plan)}
//                   >
//                     <FaPlusCircle /> Add Products to {plan === 'alternate' ? 'Alternate Days' : plan} Plan
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {showWallet && (
//         <div className="popup-overlay">
//           <div className="wallet-popup popup-content">
//             <div className="popup-header">
//               <h3>Wallet Management</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setShowWallet(false)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="current-balance">
//               <h4>Current Balance</h4>
//               <p className="balance-amount">₹{walletBalance.toLocaleString()}</p>
//             </div>
            
//             <div className="add-money-section">
//               <h4>Add Money to Wallet</h4>
//               <div className="add-money-controls">
//                 <input
//                   type="number"
//                   value={addAmount}
//                   onChange={(e) => setAddAmount(e.target.value)}
//                   placeholder="Enter amount"
//                   min="1"
//                 />
//                 <button 
//                   className="add-money-btn"
//                   onClick={handleAddMoney}
//                   disabled={!addAmount || Number(addAmount) <= 0}
//                 >
//                   Add Funds
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showBill && (
//         <div className="popup-overlay">
//           <div className="bill-popup popup-content">
//             <div className="popup-header">
//               <h3>
//                 {showBill === 'alternate' ? 'Alternate Days' : 
//                  showBill.charAt(0).toUpperCase() + showBill.slice(1)} Plan Bill
//               </h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setShowBill(null)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="bill-details">
//               <table className="bill-table">
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Qty</th>
//                     <th>Unit Price</th>
//                     <th>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {calculatePlanBill(showBill).items.map(item => (
//                     <tr key={item.id}>
//                       <td>{item.name}</td>
//                       <td>{item.quantity}</td>
//                       <td>₹{item.price}</td>
//                       <td>₹{item.price * item.quantity}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot>
//                   <tr className="subtotal-row">
//                     <td colSpan="3">Subtotal</td>
//                     <td>₹{calculatePlanBill(showBill).subtotal}</td>
//                   </tr>
//                   <tr className="fee-row">
//                     <td colSpan="3">Subscription Fee</td>
//                     <td>₹{calculatePlanBill(showBill).subscriptionFee}</td>
//                   </tr>
//                   <tr className="total-row">
//                     <td colSpan="3">Total Amount</td>
//                     <td>₹{calculatePlanBill(showBill).total}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
            
//             <div className="bill-actions">
//               <button 
//                 className="download-pdf"
//                 onClick={() => generatePDF(showBill)}
//               >
//                 <FaFilePdf /> Download PDF Bill
//               </button>
//               <button 
//                 className="close-bill"
//                 onClick={() => setShowBill(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {modifyItem && (
//         <div className="popup-overlay">
//           <div className="modify-popup popup-content">
//             <div className="popup-header">
//               <h3>Modify Quantity</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setModifyItem(null)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="product-info">
//               <p className="product-name">{modifyItem.name}</p>
//               <p className="current-price">
//                 Price: ₹{modifyItem.price} per unit
//               </p>
//             </div>
            
//             <div className="quantity-controls">
//               <button 
//                 className="quantity-btn decrease"
//                 onClick={() => {
//                   if (modifyItem.quantity > 1) {
//                     setModifyItem(prev => ({ ...prev, quantity: prev.quantity - 1 }));
//                   }
//                 }}
//                 disabled={modifyItem.quantity <= 1}
//               >
//                 <FaMinus />
//               </button>
//               <span className="quantity-display">{modifyItem.quantity}</span>
//               <button 
//                 className="quantity-btn increase"
//                 onClick={() => setModifyItem(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
//               >
//                 <FaPlus />
//               </button>
//             </div>
            
//             <div className="new-price">
//               New Total: ₹{(modifyItem.price * modifyItem.quantity).toFixed(2)}
//             </div>
            
//             <div className="modify-actions">
//               <button 
//                 className="confirm-btn"
//                 onClick={() => handleModify(modifyItem.plan, modifyItem.id, modifyItem.quantity)}
//               >
//                 Confirm Changes
//               </button>
//               <button 
//                 className="cancel-btn"
//                 onClick={() => setModifyItem(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {deleteItem && (
//         <div className="popup-overlay">
//           <div className="delete-popup popup-content">
//             <div className="popup-header">
//               <h3>Confirm Removal</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setDeleteItem(null)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="delete-message">
//               <p>Are you sure you want to remove <strong>{deleteItem.name}</strong> from your subscription?</p>
//               <p className="warning-text">This action cannot be undone.</p>
//             </div>
            
//             <div className="delete-actions">
//               <button 
//                 className="confirm-delete"
//                 onClick={() => handleDelete(deleteItem.plan, deleteItem.id)}
//               >
//                 Yes, Remove Item
//               </button>
//               <button 
//                 className="cancel-delete"
//                 onClick={() => setDeleteItem(null)}
//               >
//                 No, Keep Item
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Subscribe;

// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { 
//   FaArrowLeft, 
//   FaClock, 
//   FaWallet, 
//   FaFilePdf, 
//   FaEdit, 
//   FaTrash, 
//   FaPlus, 
//   FaMinus,
//   FaChevronDown,
//   FaChevronUp,
//   FaPlusCircle,
//   FaExclamationTriangle,
//   FaCheckCircle,
//   FaUser,
//   FaEllipsisV
// } from 'react-icons/fa';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
// import './subscribe.css';

// const Subscribe = () => {
//   const { consumer } = useAuth();
//   const navigate = useNavigate();
//   const [walletBalance, setWalletBalance] = useState(1500);
//   const [timeLeft, setTimeLeft] = useState('');
//   const [showWallet, setShowWallet] = useState(false);
//   const [showBill, setShowBill] = useState(null);
//   const [modifyItem, setModifyItem] = useState(null);
//   const [deleteItem, setDeleteItem] = useState(null);
//   const [addAmount, setAddAmount] = useState('');
//   const [collapsedPlans, setCollapsedPlans] = useState({});
//   const [showInstructions, setShowInstructions] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [showActionMenu, setShowActionMenu] = useState(null);
//   const [subscriptions, setSubscriptions] = useState({
//     Daily: [],
//     AlternateDays: [],
//     Weekly: [],
//     Monthly: []
//   });

  
//   // Timer countdown
//   useEffect(() => {
//     const calculateTimeLeft = () => {
//       const now = new Date();
//       const deadline = new Date();
//       deadline.setHours(22, 30, 0, 0);

//       if (now > deadline) {
//         deadline.setDate(deadline.getDate() + 1);
//       }

//       const diff = deadline - now;
//       const hours = Math.floor(diff / (1000 * 60 * 60));
//       const minutes = Math.floor((diff / (1000 * 60)) % 60);
//       const seconds = Math.floor((diff / 1000) % 60);

//       setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
//     };

//     calculateTimeLeft();
//     const timer = setInterval(calculateTimeLeft, 1000);
//     return () => clearInterval(timer);
//   }, []);


//   // Wrap fetchSubscriptions in useCallback
//   const fetchSubscriptions = useCallback(async () => {
//     if (!consumer?.consumer_id) return;

//     try {
//       setIsLoading(true);
//       const response = await fetch(`http://localhost:5000/api/subscriptions/${consumer.consumer_id}`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch subscriptions');
//       }
      
//       const data = await response.json();
      
//       // Ensure data is an array
//       if (!Array.isArray(data)) {
//         throw new Error('Server returned invalid data format');
//       }

//       const organizedSubscriptions = {
//         Daily: data.filter(sub => sub.subscription_type === 'Daily'),
//         'Alternate Days': data.filter(sub => sub.subscription_type === 'Alternate Days'),
//         Weekly: data.filter(sub => sub.subscription_type === 'Weekly'),
//         Monthly: data.filter(sub => sub.subscription_type === 'Monthly')
//       };

//       setSubscriptions(organizedSubscriptions);
//     } catch (error) {
//       console.error('Error:', error);
//       setSuccessMessage(`Error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [consumer]); // All dependencies used in the function

//   // Now useEffect can safely include fetchSubscriptions in dependencies
//   useEffect(() => {
//     fetchSubscriptions();
//   }, [fetchSubscriptions]); // Correct dependencies

//   // useEffect(() => {
//   //   fetchSubscriptions();
//   // }, [consumer]);

//   // Helper functions
//   const showSuccess = (message) => {
//     setSuccessMessage(message);
//     setTimeout(() => setSuccessMessage(null), 3000);
//   };

//   const togglePlanCollapse = (plan) => {
//     setCollapsedPlans(prev => ({
//       ...prev,
//       [plan]: !prev[plan]
//     }));
//   };

//   const handleModify = async (plan, id, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     try {
//       setIsLoading(true);
//       const response = await fetch(`http://localhost:5000/api/subscriptions/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ quantity: newQuantity })
//       });

//       if (!response.ok) throw new Error('Update failed');
      
//       await fetchSubscriptions(); // Refresh data
//       setModifyItem(null);
//       showSuccess('Quantity updated successfully');
//     } catch (error) {
//       console.error('Error:', error);
//       showSuccess('Failed to update subscription');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDelete = async (plan, id) => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`http://localhost:5000/api/subscriptions/${id}`, {
//         method: 'DELETE'
//       });

//       if (!response.ok) throw new Error('Delete failed');
      
//       await fetchSubscriptions(); // Refresh data
//       setDeleteItem(null);
//       showSuccess('Subscription removed successfully');
//     } catch (error) {
//       console.error('Error:', error);
//       showSuccess('Failed to remove subscription');
//     } finally {
//       setIsLoading(false);
//     }
//   };



//   const calculatePlanBill = (plan) => {
//     const items = subscriptions[plan];
//     const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const subscriptionFee = items.reduce((sum, item) => sum + (5 * item.quantity), 0);
//     return {
//       items,
//       subtotal,
//       subscriptionFee,
//       total: subtotal + subscriptionFee
//     };
//   };

//   const handleAddMoney = () => {
//     const amount = Number(addAmount);
//     if (amount > 0) {
//       setIsLoading(true);
//       setTimeout(() => {
//         setWalletBalance(prev => prev + amount);
//         setAddAmount('');
//         setIsLoading(false);
//         showSuccess(`₹${amount} added to wallet`);
//         setShowWallet(false);
//       }, 500);
//     }
//   };

//   const generatePDF = (plan) => {
//     calculatePlanBill(plan);
//     showSuccess(`PDF bill for ${plan} plan generated!`);
//     setShowBill(null);
//   };

//   const redirectToProducts = (plan) => {
//     if (walletBalance < 100) {
//       showSuccess('Please add sufficient funds to your wallet before subscribing');
//       setShowWallet(true);
//       return;
//     }
//     navigate('/products', { state: { subscriptionType: plan } });
//   };

//   const toggleActionMenu = (planId, itemId) => {
//     const menuId = `${planId}-${itemId}`;
//     setShowActionMenu(showActionMenu === menuId ? null : menuId);
//   };

//   const carouselSettings = {
//     dots: true,
//   infinite: true,
//   speed: 500,
//   slidesToShow: 1,
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 1500,
//   arrows: true,
//   accessibility: true,
//   focusOnSelect: false,
//   adaptiveHeight: true,
//   // Add these new settings:
//   useCSS: true,
//   useTransform: true,
//   cssEase: 'ease-out',
//   draggable: true,
//   swipe: true,
//   touchMove: true,
//   waitForAnimate: true
//   };

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
//   };

//   if (!consumer) {
//     return (
//       <div className="subscribe-page">
//         <div className="auth-required">
//           <h2>Please login to view your subscriptions</h2>
//           <Link to="/consumer-login" className="login-link">
//             Login Now
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="subscribe-page">
//       {isLoading && (
//         <div className="loading-overlay">
//           <div className="loading-spinner"></div>
//         </div>
//       )}

//       {successMessage && (
//         <div className="success-message">
//           <FaCheckCircle /> {successMessage}
//         </div>
//       )}

//       <div className="welcome-container">
//         <div className="welcome-content">
//           <div className="welcome-icon">
//             <FaUser />
//           </div>
//           <div className="welcome-text">
//             <h2>Welcome back, {consumer.first_name} {consumer.last_name}!</h2>
//             <p>Manage your subscriptions and enjoy fresh deliveries</p>
//           </div>
//         </div>
//       </div>

  

//       {showInstructions && (
//         <div className="popup-overlay">
//           <div className="instruction-popup popup-content">
//             <div className="popup-header">
//               <h3>Subscription Guidelines</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setShowInstructions(false)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="instruction-content">
//               <div className="instruction-item">
//                 <FaExclamationTriangle className="icon warning" />
//                 <p>Maintain sufficient wallet balance for automatic payments</p>
//               </div>
//               <div className="instruction-item">
//                 <FaClock className="icon info" />
//                 <p>Modify your subscription before 10:30 PM daily</p>
//               </div>
//               <div className="instruction-item">
//                 <FaCheckCircle className="icon success" />
//                 <p>Fresh products delivered by 7 AM</p>
//               </div>
//               <div className="instruction-item">
//                 <FaExclamationTriangle className="icon warning" />
//                 <p>Payment deducted after successful delivery</p>
//               </div>
//             </div>
            
//             <div className="instruction-actions">
//               <button 
//                 className="agree-btn"
//                 onClick={() => {
//                   setShowInstructions(false);
//                   if (walletBalance < 100) {
//                     setShowWallet(true);
//                   }
//                 }}
//               >
//                 I Understood
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="subscribe-header">
//         <button className="back-button" onClick={() => navigate(-1)}>
//           <FaArrowLeft />
//         </button>
//         <span className="modify-notice">
//           <FaClock /> Modify your orders before 10:30 PM
//         </span>
//         <Link to="/consumer-dashboard" className="market-link">
//           Back to Dashboard
//         </Link>
//       </div>

//       <div className="carousel-container">
//         <Slider {...carouselSettings}>
//           {[
//             {
//               img: "https://via.placeholder.com/800x400?text=No+Delivery+Charges",
//               title: "No Delivery Charges",
//               desc: "Enjoy free delivery on all your subscription orders"
//             },
//             {
//               img: "https://via.placeholder.com/800x400?text=5%+Discount",
//               title: "5% Discount",
//               desc: "Get 5% discount on every product in your subscription"
//             },
//             {
//               img: "https://via.placeholder.com/800x400?text=Low+Subscription+Fee",
//               title: "Low Subscription Fee",
//               desc: "Subscription starts from just ₹3 per kg"
//             },
//             {
//               img: "https://via.placeholder.com/800x400?text=Early+Morning+Delivery",
//               title: "Early Morning Delivery",
//               desc: "Fresh products delivered by 7 AM every day"
//             }
//           ].map((slide, index) => (
//             <div key={index} className="carousel-slide">
//               <img src={slide.img} alt={slide.title} />
//               <div className="slide-overlay">
//                 <h3>{slide.title}</h3>
//                 <p>{slide.desc}</p>
//               </div>
//             </div>
//           ))}
//         </Slider>
//       </div>

//       <div className="wallet-section">
//         <div className="wallet-balance-card">
//           <div className="wallet-info">
//             <FaWallet className="wallet-icon" />
//             <div>
//               <p className="wallet-label">Wallet Balance</p>
//               <p className="wallet-amount">₹{walletBalance.toLocaleString()}</p>
//             </div>
//           </div>
//           <button 
//             className="wallet-action" 
//             onClick={() => setShowWallet(true)}
//           >
//             Manage Wallet
//           </button>
//         </div>
//       </div>

//       <div className="subscription-plans">
//         <h2 className="section-title">
//           <span>Your Subscription Plans</span>
//         </h2>
        
//         {Object.entries(subscriptions).map(([plan, items]) => (
//           <div key={plan} className={`plan-container ${collapsedPlans[plan] ? 'collapsed' : ''}`}>
//             <div 
//               className="plan-header"
//               onClick={() => togglePlanCollapse(plan)}
//             >
//               <div className="plan-title-container">
//                 <h3 className="plan-title">
//                   {plan} Plan
//                   {items.length > 0 && (
//                     <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
//                   )}
//                 </h3>
//                 {collapsedPlans[plan] ? <FaChevronUp /> : <FaChevronDown />}
//               </div>
//               <div 
//                 className="plan-controls"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="plan-timer-container">
//                   <div className="modify-before-text">modify before</div>
//                   <div className="plan-timer">
//                     <FaClock /> {timeLeft}
//                   </div>
//                 </div>
//                 {items.length > 0 && (
//                   <button 
//                     className="bill-icon"
//                     onClick={() => setShowBill(plan)}
//                   >
//                     <FaFilePdf /> View Bill
//                   </button>
//                 )}
//               </div>
//             </div>

//             {!collapsedPlans[plan] && (
//               <div className="plan-content">
//                 {items.length > 0 ? (
//                   <table className="products-table">
//                     <thead>
//                       <tr>
//                         <th>Product Name</th>
//                         <th>Quantity</th>
//                         <th>Unit Price</th>
//                         <th>Total Price</th>
//                         <th>Start Date</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {items.map(item => (
//                         <tr key={item.id}>
//                           <td>{item.name}</td>
//                           <td>{item.quantity}</td>
//                           <td>₹{item.price}</td>
//                           <td>₹{item.price * item.quantity}</td>
//                           <td>{formatDate(item.startDate)}</td>
//                           <td className="product-actions">
//                             <div className="action-menu-container">
//                               <button
//                                 className="action-menu-btn"
//                                 onClick={() => toggleActionMenu(plan, item.id)}
//                               >
//                                 <FaEllipsisV />
//                               </button>
//                               {showActionMenu === `${plan}-${item.id}` && (
//                                 <div className="action-menu">
//                                   <button
//                                     onClick={() => {
//                                       setModifyItem({ 
//                                         plan, 
//                                         id: item.id, 
//                                         quantity: item.quantity,
//                                         name: item.name,
//                                         price: item.price
//                                       });
//                                       setShowActionMenu(null);
//                                     }}
//                                   >
//                                     <FaEdit /> Modify
//                                   </button>
//                                   <button
//                                     onClick={() => {
//                                       setDeleteItem({ 
//                                         plan, 
//                                         id: item.id, 
//                                         name: item.name 
//                                       });
//                                       setShowActionMenu(null);
//                                     }}
//                                   >
//                                     <FaTrash /> Delete
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 ) : (
//                   <div className="empty-plan">
//                     <p>No products in this subscription plan</p>
//                   </div>
//                 )}
//                 <div className="add-product-section">
//                   <button 
//                     className="add-product-btn"
//                     onClick={() => redirectToProducts(plan)}
//                   >
//                     <FaPlusCircle /> Add Products to {plan} Plan
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {showWallet && (
//         <div className="popup-overlay">
//           <div className="wallet-popup popup-content">
//             <div className="popup-header">
//               <h3>Wallet Management</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setShowWallet(false)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="current-balance">
//               <h4>Current Balance</h4>
//               <p className="balance-amount">₹{walletBalance.toLocaleString()}</p>
//             </div>
            
//             <div className="add-money-section">
//               <h4>Add Money to Wallet</h4>
//               <div className="add-money-controls">
//                 <input
//                   type="number"
//                   value={addAmount}
//                   onChange={(e) => setAddAmount(e.target.value)}
//                   placeholder="Enter amount"
//                   min="1"
//                 />
//                 <button 
//                   className="add-money-btn"
//                   onClick={handleAddMoney}
//                   disabled={!addAmount || Number(addAmount) <= 0}
//                 >
//                   Add Funds
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showBill && (
//         <div className="popup-overlay">
//           <div className="bill-popup popup-content">
//             <div className="popup-header">
//               <h3>
//                 {showBill} Plan Bill
//               </h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setShowBill(null)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="bill-details">
//               <table className="bill-table">
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Qty</th>
//                     <th>Unit Price</th>
//                     <th>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {calculatePlanBill(showBill).items.map(item => (
//                     <tr key={item.id}>
//                       <td>{item.name}</td>
//                       <td>{item.quantity}</td>
//                       <td>₹{item.price}</td>
//                       <td>₹{item.price * item.quantity}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot>
//                   <tr className="subtotal-row">
//                     <td colSpan="3">Subtotal</td>
//                     <td>₹{calculatePlanBill(showBill).subtotal}</td>
//                   </tr>
//                   <tr className="fee-row">
//                     <td colSpan="3">Subscription Fee</td>
//                     <td>₹{calculatePlanBill(showBill).subscriptionFee}</td>
//                   </tr>
//                   <tr className="total-row">
//                     <td colSpan="3">Total Amount</td>
//                     <td>₹{calculatePlanBill(showBill).total}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
            
//             <div className="bill-actions">
//               <button 
//                 className="download-pdf"
//                 onClick={() => generatePDF(showBill)}
//               >
//                 <FaFilePdf /> Download PDF Bill
//               </button>
//               <button 
//                 className="close-bill"
//                 onClick={() => setShowBill(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {modifyItem && (
//         <div className="popup-overlay">
//           <div className="modify-popup popup-content">
//             <div className="popup-header">
//               <h3>Modify Quantity</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setModifyItem(null)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="product-info">
//               <p className="product-name">{modifyItem.name}</p>
//               <p className="current-price">
//                 Price: ₹{modifyItem.price} per unit
//               </p>
//             </div>
            
//             <div className="quantity-controls">
//               <button 
//                 className="quantity-btn decrease"
//                 onClick={() => {
//                   if (modifyItem.quantity > 1) {
//                     setModifyItem(prev => ({ ...prev, quantity: prev.quantity - 1 }));
//                   }
//                 }}
//                 disabled={modifyItem.quantity <= 1}
//               >
//                 <FaMinus />
//               </button>
//               <span className="quantity-display">{modifyItem.quantity}</span>
//               <button 
//                 className="quantity-btn increase"
//                 onClick={() => setModifyItem(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
//               >
//                 <FaPlus />
//               </button>
//             </div>
            
//             <div className="new-price">
//               New Total: ₹{(modifyItem.price * modifyItem.quantity).toFixed(2)}
//             </div>
            
//             <div className="modify-actions">
//               <button 
//                 className="confirm-btn"
//                 onClick={() => handleModify(modifyItem.plan, modifyItem.id, modifyItem.quantity)}
//               >
//                 Confirm Changes
//               </button>
//               <button 
//                 className="cancel-btn"
//                 onClick={() => setModifyItem(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {deleteItem && (
//         <div className="popup-overlay">
//           <div className="delete-popup popup-content">
//             <div className="popup-header">
//               <h3>Confirm Removal</h3>
//               <button 
//                 className="close-popup"
//                 onClick={() => setDeleteItem(null)}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="delete-message">
//               <p>Are you sure you want to remove <strong>{deleteItem.name}</strong> from your subscription?</p>
//               <p className="warning-text">This action cannot be undone.</p>
//             </div>
            
//             <div className="delete-actions">
//               <button 
//                 className="confirm-delete"
//                 onClick={() => handleDelete(deleteItem.plan, deleteItem.id)}
//               >
//                 Yes, Remove Item
//               </button>
//               <button 
//                 className="cancel-delete"
//                 onClick={() => setDeleteItem(null)}
//               >
//                 No, Keep Item
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Subscribe;



import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaArrowLeft, 
  FaClock, 
  FaWallet, 
  FaFilePdf, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaMinus,
  FaChevronDown,
  FaChevronUp,
  FaPlusCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUser,
  FaEllipsisV
} from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './subscribe.css';

const Subscribe = () => {
  const { consumer, token } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(1500);
  const [timeLeft, setTimeLeft] = useState('');
  const [showWallet, setShowWallet] = useState(false);
  const [showBill, setShowBill] = useState(null);
  const [modifyItem, setModifyItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [collapsedPlans, setCollapsedPlans] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [subscriptions, setSubscriptions] = useState({
    Daily: [],
    'Alternate Days': [],
    Weekly: [],
    Monthly: []
  });

  // Timer countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadline = new Date();
      deadline.setHours(22, 30, 0, 0);

      if (now > deadline) {
        deadline.setDate(deadline.getDate() + 1);
      }

      const diff = deadline - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!consumer?.consumer_id || !token) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/subscriptions/${consumer.consumer_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      
      const { subscriptions } = await response.json();

const organizedSubscriptions = {
  Daily: subscriptions.filter(sub => sub.subscription_type === 'Daily'),
  'Alternate Days': subscriptions.filter(sub => sub.subscription_type === 'Alternate Days'),
  Weekly: subscriptions.filter(sub => sub.subscription_type === 'Weekly'),
  Monthly: subscriptions.filter(sub => sub.subscription_type === 'Monthly')
};

      setSubscriptions(organizedSubscriptions);
    } catch (error) {
      console.error('Error:', error);
      setSuccessMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [consumer, token]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const togglePlanCollapse = (plan) => {
    setCollapsedPlans(prev => ({
      ...prev,
      [plan]: !prev[plan]
    }));
  };

  const handleModify = async (subscription_id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/subscriptions/${subscription_id}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        }
      );

      if (!response.ok) throw new Error('Update failed');
      
      await fetchSubscriptions();
      setModifyItem(null);
      showSuccess('Quantity updated successfully');
    } catch (error) {
      console.error('Error:', error);
      showSuccess('Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (subscription_id) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/subscriptions/${subscription_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Delete failed');
      
      await fetchSubscriptions();
      setDeleteItem(null);
      showSuccess('Subscription removed successfully');
    } catch (error) {
      console.error('Error:', error);
      showSuccess('Failed to remove subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePlanBill = (plan) => {
    const items = subscriptions[plan];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subscriptionFee = items.reduce((sum, item) => sum + (5 * item.quantity), 0);
    return {
      items,
      subtotal,
      subscriptionFee,
      total: subtotal + subscriptionFee
    };
  };

  const handleAddMoney = () => {
    const amount = Number(addAmount);
    if (amount > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setWalletBalance(prev => prev + amount);
        setAddAmount('');
        setIsLoading(false);
        showSuccess(`₹${amount} added to wallet`);
        setShowWallet(false);
      }, 500);
    }
  };

  const generatePDF = (plan) => {
    calculatePlanBill(plan);
    showSuccess(`PDF bill for ${plan} plan generated!`);
    setShowBill(null);
  };

  const redirectToProducts = (plan) => {
    if (walletBalance < 100) {
      showSuccess('Please add sufficient funds to your wallet before subscribing');
      setShowWallet(true);
      return;
    }
    navigate('/products', { state: { subscriptionType: plan } });
  };

  const toggleActionMenu = (planId, itemId) => {
    const menuId = `${planId}-${itemId}`;
    setShowActionMenu(showActionMenu === menuId ? null : menuId);
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: true,
    accessibility: true,
    focusOnSelect: false,
    adaptiveHeight: true,
    useCSS: true,
    useTransform: true,
    cssEase: 'ease-out',
    draggable: true,
    swipe: true,
    touchMove: true,
    waitForAnimate: true
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Replace placeholder images with local images
  const carouselImages = [
    {
      img: "/images/no-delivery-charges.jpg",
      title: "No Delivery Charges",
      desc: "Enjoy free delivery on all your subscription orders"
    },
    {
      img: "/images/discount.jpg",
      title: "5% Discount",
      desc: "Get 5% discount on every product in your subscription"
    },
    {
      img: "/images/low-fee.jpg",
      title: "Low Subscription Fee",
      desc: "Subscription starts from just ₹3 per kg"
    },
    {
      img: "/images/early-delivery.jpg",
      title: "Early Morning Delivery",
      desc: "Fresh products delivered by 7 AM every day"
    }
  ];

  if (!consumer) {
    return (
      <div className="subscribe-page">
        <div className="auth-required">
          <h2>Please login to view your subscriptions</h2>
          <Link to="/consumer-login" className="login-link">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="subscribe-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      <div className="welcome-container">
        <div className="welcome-content">
          <div className="welcome-icon">
            <FaUser />
          </div>
          <div className="welcome-text">
            <h2>Welcome back, {consumer.first_name} {consumer.last_name}!</h2>
            <p>Manage your subscriptions and enjoy fresh deliveries</p>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="popup-overlay">
          <div className="instruction-popup popup-content">
            <div className="popup-header">
              <h3>Subscription Guidelines</h3>
              <button 
                className="close-popup"
                onClick={() => setShowInstructions(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="instruction-content">
              <div className="instruction-item">
                <FaExclamationTriangle className="icon warning" />
                <p>Maintain sufficient wallet balance for automatic payments</p>
              </div>
              <div className="instruction-item">
                <FaClock className="icon info" />
                <p>Modify your subscription before 10:30 PM daily</p>
              </div>
              <div className="instruction-item">
                <FaCheckCircle className="icon success" />
                <p>Fresh products delivered by 7 AM</p>
              </div>
              <div className="instruction-item">
                <FaExclamationTriangle className="icon warning" />
                <p>Payment deducted after successful delivery</p>
              </div>
            </div>
            
            <div className="instruction-actions">
              <button 
                className="agree-btn"
                onClick={() => {
                  setShowInstructions(false);
                  if (walletBalance < 100) {
                    setShowWallet(true);
                  }
                }}
              >
                I Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="subscribe-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <span className="modify-notice">
          <FaClock /> Modify your orders before 10:30 PM
        </span>
        <Link to="/consumer-dashboard" className="market-link">
          Back to Dashboard
        </Link>
      </div>

      <div className="carousel-container">
        <Slider {...carouselSettings}>
          {carouselImages.map((slide, index) => (
            <div key={index} className="carousel-slide">
              <img 
                src={slide.img} 
                alt={slide.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-slide.jpg";
                }}
              />
              <div className="slide-overlay">
                <h3>{slide.title}</h3>
                <p>{slide.desc}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className="wallet-section">
        <div className="wallet-balance-card">
          <div className="wallet-info">
            <FaWallet className="wallet-icon" />
            <div>
              <p className="wallet-label">Wallet Balance</p>
              <p className="wallet-amount">₹{walletBalance.toLocaleString()}</p>
            </div>
          </div>
          <button 
            className="wallet-action" 
            onClick={() => setShowWallet(true)}
          >
            Manage Wallet
          </button>
        </div>
      </div>

      <div className="subscription-plans">
        <h2 className="section-title">
          <span>Your Subscription Plans</span>
        </h2>
        
        {Object.entries(subscriptions).map(([plan, items]) => (
          <div key={plan} className={`plan-container ${collapsedPlans[plan] ? 'collapsed' : ''}`}>
            <div 
              className="plan-header"
              onClick={() => togglePlanCollapse(plan)}
            >
              <div className="plan-title-container">
                <h3 className="plan-title">
                  {plan} Plan
                  {items.length > 0 && (
                    <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  )}
                </h3>
                {collapsedPlans[plan] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <div 
                className="plan-controls"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="plan-timer-container">
                  <div className="modify-before-text">modify before</div>
                  <div className="plan-timer">
                    <FaClock /> {timeLeft}
                  </div>
                </div>
                {items.length > 0 && (
                  <button 
                    className="bill-icon"
                    onClick={() => setShowBill(plan)}
                  >
                    <FaFilePdf /> View Bill
                  </button>
                )}
              </div>
            </div>

            {!collapsedPlans[plan] && (
              <div className="plan-content">
                {items.length > 0 ? (
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Price</th>
                        <th>Start Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.subscription_id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price}</td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          <td>{formatDate(item.start_date)}</td>
                          <td className="product-actions">
                            <div className="action-menu-container">
                              <button
                                className="action-menu-btn"
                                onClick={() => toggleActionMenu(plan, item.subscription_id)}
                              >
                                <FaEllipsisV />
                              </button>
                              {showActionMenu === `${plan}-${item.subscription_id}` && (
                                <div className="action-menu">
                                  <button
                                    onClick={() => {
                                      setModifyItem({ 
                                        plan, 
                                        id: item.subscription_id, 
                                        quantity: item.quantity,
                                        name: item.product_name,
                                        price: item.price
                                      });
                                      setShowActionMenu(null);
                                    }}
                                  >
                                    <FaEdit /> Modify
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteItem({ 
                                        plan, 
                                        id: item.subscription_id, 
                                        name: item.product_name 
                                      });
                                      setShowActionMenu(null);
                                    }}
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-plan">
                    <p>No products in this subscription plan</p>
                  </div>
                )}
                <div className="add-product-section">
                  <button 
                    className="add-product-btn"
                    onClick={() => redirectToProducts(plan)}
                  >
                    <FaPlusCircle /> Add Products to {plan} Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showWallet && (
        <div className="popup-overlay">
          <div className="wallet-popup popup-content">
            <div className="popup-header">
              <h3>Wallet Management</h3>
              <button 
                className="close-popup"
                onClick={() => setShowWallet(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="current-balance">
              <h4>Current Balance</h4>
              <p className="balance-amount">₹{walletBalance.toLocaleString()}</p>
            </div>
            
            <div className="add-money-section">
              <h4>Add Money to Wallet</h4>
              <div className="add-money-controls">
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                />
                <button 
                  className="add-money-btn"
                  onClick={handleAddMoney}
                  disabled={!addAmount || Number(addAmount) <= 0}
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBill && (
        <div className="popup-overlay">
          <div className="bill-popup popup-content">
            <div className="popup-header">
              <h3>
                {showBill} Plan Bill
              </h3>
              <button 
                className="close-popup"
                onClick={() => setShowBill(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="bill-details">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatePlanBill(showBill).items.map(item => (
                    <tr key={item.subscription_id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="subtotal-row">
                    <td colSpan="3">Subtotal</td>
                    <td>₹{calculatePlanBill(showBill).subtotal.toFixed(2)}</td>
                  </tr>
                  <tr className="fee-row">
                    <td colSpan="3">Subscription Fee</td>
                    <td>₹{calculatePlanBill(showBill).subscriptionFee.toFixed(2)}</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan="3">Total Amount</td>
                    <td>₹{calculatePlanBill(showBill).total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="bill-actions">
              <button 
                className="download-pdf"
                onClick={() => generatePDF(showBill)}
              >
                <FaFilePdf /> Download PDF Bill
              </button>
              <button 
                className="close-bill"
                onClick={() => setShowBill(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {modifyItem && (
        <div className="popup-overlay">
          <div className="modify-popup popup-content">
            <div className="popup-header">
              <h3>Modify Quantity</h3>
              <button 
                className="close-popup"
                onClick={() => setModifyItem(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="product-info">
              <p className="product-name">{modifyItem.name}</p>
              <p className="current-price">
                Price: ₹{modifyItem.price} per unit
              </p>
            </div>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn decrease"
                onClick={() => {
                  if (modifyItem.quantity > 1) {
                    setModifyItem(prev => ({ ...prev, quantity: prev.quantity - 1 }));
                  }
                }}
                disabled={modifyItem.quantity <= 1}
              >
                <FaMinus />
              </button>
              <span className="quantity-display">{modifyItem.quantity}</span>
              <button 
                className="quantity-btn increase"
                onClick={() => setModifyItem(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
              >
                <FaPlus />
              </button>
            </div>
            
            <div className="new-price">
              New Total: ₹{(modifyItem.price * modifyItem.quantity).toFixed(2)}
            </div>
            
            <div className="modify-actions">
              <button 
                className="confirm-btn"
                onClick={() => handleModify(modifyItem.id, modifyItem.quantity)}
              >
                Confirm Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setModifyItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="popup-overlay">
          <div className="delete-popup popup-content">
            <div className="popup-header">
              <h3>Confirm Removal</h3>
              <button 
                className="close-popup"
                onClick={() => setDeleteItem(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="delete-message">
              <p>Are you sure you want to remove <strong>{deleteItem.name}</strong> from your subscription?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            
            <div className="delete-actions">
              <button 
                className="confirm-delete"
                onClick={() => handleDelete(deleteItem.id)}
              >
                Yes, Remove Item
              </button>
              <button 
                className="cancel-delete"
                onClick={() => setDeleteItem(null)}
              >
                No, Keep Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribe;