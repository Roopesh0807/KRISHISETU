// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useAuth } from "../../context/AuthContext";
// import { io } from 'socket.io-client';
// import {
//   faSpinner,
//   faRupeeSign,
//   faArrowUp,
//   faArrowDown,
//   faTimes,
//   faHandshake
// } from '@fortawesome/free-solid-svg-icons';
// import './ConsumerChatWindow.css';

// const BargainChatWindow = () => {
//   const navigate = useNavigate();
//   const { bargainId } = useParams();
//   const { token, consumer } = useAuth();
//   const location = useLocation();
//   const socket = useRef(null);
//   const messagesEndRef = useRef(null);
//   // const reconnectAttempts = useRef(0);

//   // Extract initial state from location
//   const { 
//     product: initialProduct, 
//     farmer: initialFarmer, 
//     quantity: initialQuantity 
//   } = location.state || {};

//   // State management
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPrice, setCurrentPrice] = useState(initialProduct?.price_per_kg || 0);
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [bargainStatus, setBargainStatus] = useState('pending'); // pending, accepted, rejected, completed
//   const [waitingForResponse, setWaitingForResponse] = useState(false);
//   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
//   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
//   const [selectedFarmer] = useState(initialFarmer || null);
//   const [quantity, setQuantity] = useState(initialQuantity || 1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [, setInitialPrice] = useState(0);

//   // WebSocket connection management
//   const initializeSocketConnection = useCallback(() => {
//     if (!bargainId || !token) {
//       console.error("Missing bargainId or token for WebSocket connection");
//       return;
//     }
  
//     // Close existing connection if any
//     if (socket.current) {
//       socket.current.disconnect();
//       socket.current = null;
//     }
  
//     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
//       auth: {
//         token: token // Make sure this is your valid JWT token
//       },
//       query: { bargainId },
//       transports: ['websocket'],
//       withCredentials: true,
//       extraHeaders: {
//         Authorization: `Bearer ${token}` // Fallback header
//       }
//     });
//     // Connection events
//     socket.current.on('connect', () => {
//       console.log("Socket connected");
//       setConnectionStatus("connected");
//     });
  
//     socket.current.on('connect_error', (err) => {
//       console.error("Connection error:", err.message);
//       setConnectionStatus("error");
//       // Attempt reconnection after delay
//       setTimeout(() => initializeSocketConnection(), 2000);
//     });
  
//     socket.current.on('disconnect', (reason) => {
//       console.log("Socket disconnected:", reason);
//       setConnectionStatus("disconnected");
//     });
  
//     // Application events
//     socket.current.on('priceUpdate', (data) => {
//       setCurrentPrice(data.newPrice);
//       setMessages(prev => [...prev, {
//         content: `Farmer updated price to ₹${data.newPrice}/kg`,
//         sender_type: "system",
//         timestamp: new Date().toISOString()
//       }]);
//       setWaitingForResponse(false);
//     });
  
//     socket.current.on('bargainStatusUpdate', (status) => {
//       setBargainStatus(status);
//       if (status === 'accepted') {
//         setMessages(prev => [...prev, {
//           content: "🎉 Farmer accepted your offer!",
//           sender_type: "system",
//           timestamp: new Date().toISOString()
//         }]);
//       }
//       setWaitingForResponse(false);
//     });
  
//     socket.current.on('newMessage', (message) => {
//       setMessages(prev => [...prev, message]);
//       if (message.sender_type === 'farmer') {
//         setWaitingForResponse(false);
//       }
//     });
  
//     socket.current.on('error', (error) => {
//       console.error("Socket error:", error);
//       setError(error.message);
//     });
  
//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [bargainId, token]);

//   // Helper function to add system messages
//   const addSystemMessage = (content) => {
//     setMessages(prev => [
//       ...prev,
//       {
//         content,
//         sender_type: "system",
//         timestamp: new Date().toISOString()
//       }
//     ]);
//   };

//   // Initialize socket connection on mount
//   useEffect(() => {
//     initializeSocketConnection();
//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [initializeSocketConnection]);

//   // useEffect(() => {
//   //   const fetchBargainData = async () => {
//   //     try {
//   //       console.log("🔐 Fetching with token:", token);
  
//   //       const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`, {
//   //         method: 'GET',
//   //         headers: {
//   //           'Content-Type': 'application/json',
//   //            Authorization: `Bearer ${token}`,
//   //         },
//   //       });
  
//   //       if (!response.ok) {
//   //         const errorText = await response.text();
//   //         console.error("❌ Server responded with an error:", errorText);
//   //         throw new Error(`HTTP error! Status: ${response.status}`);
//   //       }
  
//   //       const data = await response.json();
//   //       console.log("✅ Bargain data:", data);
  
//   //       const session = data.session;
//   //       setMessages(session.messages || []);
//   //       setCurrentPrice(session.price_per_kg || initialProduct?.price_per_kg || 0);
//   //       setBargainStatus(session.status || 'pending');
  
//   //     } catch (error) {
//   //       console.error("❌ Error fetching bargain data:", error.message);
//   //       setError(error.message);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
  
//   //   if (bargainId && token) {
//   //     fetchBargainData();
//   //   }
//   // }, [bargainId, token, initialProduct]);
  
//   useEffect(() => {
//     const fetchBargainData = async () => {
//       try {
//         if (!bargainId || !token) {
//           throw new Error("Missing bargain ID or authentication token");
//         }
  
//         console.log("🔐 Fetching bargain data for ID:", bargainId);
  
//         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//         });
  
//         const contentType = response.headers.get('content-type');
//         const rawText = await response.text();
  
//         console.log("📨 Raw response:", rawText);
//         console.log("📨 Response content-type:", contentType);
  
//         if (!response.ok) {
//           console.error("❌ Server error:", {
//             status: response.status,
//             statusText: response.statusText,
//             body: rawText
//           });
//           throw new Error(`Server error: ${response.status} - ${rawText || 'No error details'}`);
//         }
  
//         if (!rawText) {
//           throw new Error("Received empty response body");
//         }
  
//         if (!contentType || !contentType.includes('application/json')) {
//           throw new Error(`Expected JSON but got ${contentType}. Response: ${rawText}`);
//         }
  
//         let data;
//         try {
//           data = JSON.parse(rawText);
//         } catch (parseError) {
//           console.error("❌ JSON parse error:", parseError);
//           throw new Error("Failed to parse JSON from server");
//         }
  
//         console.log("✅ Bargain data received:", data);
  
//         if (!data.success) {
//           throw new Error(data.error || "Failed to fetch bargain data");
//         }
  
//         const { session } = data;
  
//         if (!session) {
//           throw new Error("No session data received from server");
//         }
  
//         setMessages(session.messages || []);
//         setCurrentPrice(
//           session.current_price ||
//           session.initial_price ||
//           initialProduct?.price_per_kg ||
//           0
//         );
//         setInitialPrice(
//           session.initial_price ||
//           initialProduct?.price_per_kg ||
//           0
//         );
//         setBargainStatus(session.status || 'pending');
//       } catch (error) {
//         console.error("❌ Error in fetchBargainData:", {
//           message: error.message,
//           stack: error.stack
//         });
//         setError(error.message || "Failed to load bargain data");
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchBargainData();
//   }, [bargainId, token, initialProduct]);
  
//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Handle bargain initiation
//   // const handleBargainConfirm = async () => {
//   //   setError(null);
//   //   setIsLoading(true);
//   //   setWaitingForResponse(true);

//   //   try {
//   //     if (!selectedProduct || !selectedFarmer || quantity <= 0) {
//   //       throw new Error("Please select a product and valid quantity");
//   //     }

//   //     if (!token) {
//   //       navigate('/login', { state: { from: location.pathname } });
//   //       return;
//   //     }

//   //     if (socket.current && socket.current.connected) {
//   //       socket.current.emit('initBargain', {
//   //         product: selectedProduct,
//   //         quantity,
//   //         initialPrice: selectedProduct.price_per_kg,
//   //         farmer: selectedFarmer,
//   //         consumerName: consumer?.name || 'Consumer'
//   //       });

//   //       addSystemMessage(`You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name}`);
//   //       setIsBargainPopupOpen(false);
//   //     }
//   //   } catch (error) {
//   //     setError(error.message);
//   //     setWaitingForResponse(false);
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };
// // Handle bargain initiation
// const handleBargainConfirm = async () => {
//   setError(null);
//   setWaitingForResponse(false); // Don't show loader immediately

//   try {
//     if (!selectedProduct || !selectedFarmer || quantity <= 0) {
//       throw new Error("Please select a product and valid quantity");
//     }

//     if (!token) {
//       navigate('/login', { state: { from: location.pathname } });
//       return;
//     }

//     // First show the message immediately
//     addSystemMessage(`You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name}`);
//     setIsBargainPopupOpen(false);

//     // Then initiate the bargain (show loader only if it takes time)
//     if (socket.current && socket.current.connected) {
//       setIsLoading(true);
//       socket.current.emit('initBargain', {
//         product: selectedProduct,
//         quantity,
//         initialPrice: selectedProduct.price_per_kg,
//         farmer: selectedFarmer,
//         consumerName: consumer?.name || 'Consumer'
//       });
//     }
//   } catch (error) {
//     setError(error.message);
//   } finally {
//     setIsLoading(false);
//   }
// };
//   // Handle price offer
//   // const handleMakeOffer = (price) => {
//   //   if (socket.current && socket.current.connected) {
//   //     socket.current.emit('priceOffer', {
//   //       price,
//   //       productId: selectedProduct?.product_id,
//   //       quantity
//   //     });

//   //     addSystemMessage(`You offered ₹${price}/kg for ${quantity}kg`);
//   //     setCurrentPrice(price);
//   //     setWaitingForResponse(true);
//   //   }
//   // };
// // Handle price offer
// const handleMakeOffer = (price) => {
//   if (socket.current && socket.current.connected) {
//     // First show the message immediately
//     addSystemMessage(`You offered ₹${price}/kg for ${quantity}kg`);
//     setCurrentPrice(price);
    
//     // Then send the offer (show loader only if waiting for response)
//     setWaitingForResponse(true);
//     socket.current.emit('priceOffer', {
//       price,
//       productId: selectedProduct?.product_id,
//       quantity
//     });
//   }
// };
//   // Render loading state
//   if (loading) {
//     return (
//       <div className="loading-container">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain session...</p>
//       </div>
//     );
//   }

//   // Render error state
//   // if (error) {
//   //   return (
//   //     <div className="error-container">
//   //       <h3>Error Loading Bargain</h3>
//   //       <p>{error}</p>
//   //       <button onClick={() => window.location.reload()}>Retry</button>
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="bargain-chat-container">
//       {/* Bargain Initiation Popup */}
//       {isBargainPopupOpen && selectedFarmer && (
//         <div className="bargain-initiation-popup">
//           <div className="popup-content">
//             <button onClick={() => navigate(-1)} className="close-btn">
//               <FontAwesomeIcon icon={faTimes} />
//             </button>
//             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
            
//             <div className="form-group">
//               <label>Select Product</label>
//               <select
//                 value={selectedProduct?.produce_name || ''}
//                 onChange={(e) => {
//                   const product = selectedFarmer.products.find(
//                     p => p.produce_name === e.target.value
//                   );
//                   setSelectedProduct(product || null);
//                   if (product) setCurrentPrice(product.price_per_kg);
//                 }}
//               >
//                 <option value="">Select a product</option>
//                 {selectedFarmer.products?.map(product => (
//                   <option key={product.product_id} value={product.produce_name}>
//                     {product.produce_name} (₹{product.price_per_kg}/kg)
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="form-group">
//               <label>Quantity (kg)</label>
//               <input
//                 type="number"
//                 min="1"
//                 max={selectedProduct?.availability || 100}
//                 value={quantity}
//                 onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
//               />
//             </div>
            
//             <div className="current-price-display">
//               Current Price: ₹{selectedProduct?.price_per_kg || 0}/kg
//             </div>
            
//             {error && <div className="error-message">{error}</div>}
            
//             <button
//               onClick={handleBargainConfirm}
//               disabled={!selectedProduct || isLoading}
//               className="confirm-btn"
//             >
//               {isLoading ? (
//                 <FontAwesomeIcon icon={faSpinner} spin />
//               ) : (
//                 <FontAwesomeIcon icon={faHandshake} />
//               )}
//               Start Bargaining
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Chat Header */}
//       <div className="chat-header">
//         <div className="header-top">
//           <h2>
//             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
//           </h2>
//           <span className={`connection-status ${connectionStatus}`}>
//             {connectionStatus.toUpperCase()}
//           </span>
//         </div>
        
//         <div className="product-info">
//           {selectedProduct && (
//             <>
//               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
//               <p><strong>Quantity:</strong> {quantity}kg</p>
//               <p className="current-price">
//                 <strong>Current Price:</strong> ₹{currentPrice}/kg
//               </p>
//               {bargainStatus === 'accepted' && (
//                 <p className="status-accepted">Offer Accepted!</p>
//               )}
//               {bargainStatus === 'rejected' && (
//                 <p className="status-rejected">Offer Declined</p>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <div className="no-messages">
//             <p>No messages yet. Start the negotiation!</p>
//           </div>
//         ) : (
//           messages.map((msg, index) => (
//             <div key={`msg-${index}`} className={`message ${msg.sender_type}`}>
//               <div className="message-content">
//                 {msg.message_type === 'offer' && `Offered ₹${msg.price}`}
//                 {msg.message_type === 'accept' && `Accepted ₹${msg.price}`}
//                 {msg.message_type === 'reject' && `Rejected ₹${msg.price}`}
//               </div>

//               <div className="message-meta">
//                 <span className="sender">
//                   {msg.sender_type === 'consumer' ? 'You' : 
//                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
//                 </span>
//                 <span className="timestamp">
//                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </span>
//               </div>
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Chat Controls */}
//       {/* <div className="chat-controls">
//         {bargainStatus === 'pending' && selectedProduct && messages.length > 0 && (
//           <div className="price-suggestions">
//             <h4>Make an Offer:</h4>
//             <div className="suggestion-buttons">
//               {[1, 2, 3, 5].map(amount => (
//                 <button 
//                   key={`decrease-${amount}`} 
//                   onClick={() => handleMakeOffer(currentPrice - amount)}
//                   disabled={currentPrice - amount <= 0 || waitingForResponse}
//                 >
//                   <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
//                 </button>
//               ))}
//               {[1, 2, 3].map(amount => (
//                 <button 
//                   key={`increase-${amount}`} 
//                   onClick={() => handleMakeOffer(currentPrice + amount)}
//                   disabled={waitingForResponse}
//                 >
//                   <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {waitingForResponse && (
//           <div className="waiting-indicator">
//             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
//           </div>
//         )}

//         {bargainStatus === 'accepted' && (
//           <div className="accepted-actions">
//             <button className="primary-action" onClick={() => navigate('/checkout')}>
//               Proceed to Checkout
//             </button>
//             <button className="secondary-action" onClick={() => navigate('/')}>
//               Continue Shopping
//             </button>
//           </div>
//         )}
//       </div> */}
//       {/* Chat Controls */}
// <div className="chat-controls">
//   {bargainStatus === 'pending' && 
//    selectedProduct && 
//    messages.length > 0 && 
//    messages.some(m => m.sender_type === 'consumer') && (
//     <div className="price-suggestions">
//       <h4>Make an Offer:</h4>
//       <div className="suggestion-buttons">
//         {[1, 2, 3, 5].map(amount => (
//           <button 
//             key={`decrease-${amount}`} 
//             onClick={() => handleMakeOffer(currentPrice - amount)}
//             disabled={currentPrice - amount <= 0 || waitingForResponse}
//           >
//             <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
//           </button>
//         ))}
//         {[1, 2, 3].map(amount => (
//           <button 
//             key={`increase-${amount}`} 
//             onClick={() => handleMakeOffer(currentPrice + amount)}
//             disabled={waitingForResponse}
//           >
//             <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
//           </button>
//         ))}
//       </div>
//     </div>
//   )}

//   {waitingForResponse && (
//     <div className="waiting-indicator">
//       <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's response...
//     </div>
//   )}
// </div>
//     </div>
//   );
// };

// export default BargainChatWindow;
// // import React, { useState, useEffect, useRef,useCallback } from 'react';
// // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // import { useAuth } from "../../context/AuthContext";
// // import { io } from 'socket.io-client';
// // // import { initializeWebSocket, sendWebSocketMessage, closeWebSocket } from "../../utils/websocket"; // ✅ Import WebSocket utils
// // import { 
// //   faSpinner, 
// //   // faPaperPlane, 
// //   faRupeeSign,
// //   faArrowUp,
// //   faArrowDown,
// //   faTimes,
// //   faHandshake
// // } from '@fortawesome/free-solid-svg-icons';
// // import './ConsumerChatWindow.css';

// // const BargainChatWindow = () => {
// //   const navigate = useNavigate();
// //   const { bargainId } = useParams();
// //   const { token, consumer } = useAuth();
// //   const location = useLocation();
// //   const socket = useRef(null); // ✅ controlled by us

 
// //   const messagesEndRef = useRef(null);
// //   const reconnectAttempts = useRef(0);

// //   const { product: initialProduct, farmer: initialFarmer, quantity: initialQuantity } = location.state || {};
  
// //   // State
// //   const [messages, setMessages] = useState([]);
// //   // const [newMessage, setNewMessage] = useState('');
// //   const [loading, setLoading] = useState(true);
// //   const [currentPrice, setCurrentPrice] = useState(initialProduct?.price_per_kg);
// //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// //   const [bargainAccepted, setBargainAccepted] = useState(false);
// //   const [waitingForReply, setWaitingForReply] = useState(false);
// //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// //   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
// //   const [selectedFarmer] = useState(initialFarmer || null);
// //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState(null);
 
  
// //   const initializeWebSocket = useCallback(() => {
// //     if (!bargainId || !token) {
// //       console.error("❌ Missing bargainId or token. WebSocket not initialized.");
// //       return;
// //     }
  
// //     const wsUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${encodeURIComponent(token)}`;
// //     console.log(`🔄 Connecting WebSocket to: ${wsUrl}`);
  
// //     // Close existing WebSocket before creating a new one
// //     if (socket.current) {
// //       console.log("🔴 Closing existing WebSocket before reconnecting...");
// //       socket.current.close();
// //       socket.current = null;
// //     }
  
// //     socket.current = new WebSocket(wsUrl);
  
// //     socket.current.onopen = () => {
// //       console.log("✅ WebSocket connected!");
// //       setConnectionStatus("connected");
// //       reconnectAttempts.current = 0;
// //     };
  
// //     socket.current.onerror = (error) => {
// //       console.error("🚨 WebSocket Error:", error);
// //       setConnectionStatus("error");
// //     };
  
// //     socket.current.onclose = (event) => {
// //       console.warn("⚠️ WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
// //       setConnectionStatus("disconnected");
  
// //       if (event.code === 1000) return;
  
// //       const maxAttempts = 2;
// //       if (reconnectAttempts.current < maxAttempts) {
// //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// //         reconnectAttempts.current += 1;
// //         console.log(`♻️ Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current}/${maxAttempts})`);
// //         setTimeout(() => initializeWebSocket(), delay);
// //       } else {
// //         console.error("❌ Max reconnection attempts reached. Please refresh the page.");
// //       }
// //     };
  
// //     socket.current.onmessage = (event) => {
// //       try {
// //         const data = JSON.parse(event.data);
// //         console.log("📩 WebSocket Message Received:", data);
  
// //         switch (data.type) {
// //           case "PRICE_UPDATE":
// //             setCurrentPrice(data.newPrice);
// //             setMessages((prev) => [
// //               ...prev,
// //               {
// //                 content: `Farmer updated price to ₹${data.newPrice}/kg`,
// //                 sender_type: "system",
// //                 timestamp: new Date().toISOString(),
// //               },
// //             ]);
// //             setWaitingForReply(false);
// //             break;
  
// //           case "BARGAIN_ACCEPTED":
// //             setBargainAccepted(true);
// //             setWaitingForReply(false);
// //             setMessages((prev) => [
// //               ...prev,
// //               {
// //                 content: "🎉 Farmer accepted your offer!",
// //                 sender_type: "system",
// //                 timestamp: new Date().toISOString(),
// //               },
// //             ]);
// //             break;
  
// //           case "MESSAGE":
// //             setMessages((prev) => [...prev, data.message]);
// //             if (data.message.sender_type === "farmer") {
// //               setWaitingForReply(false);
// //             }
// //             break;
  
// //           default:
// //             console.warn("⚠️ Unknown message type:", data.type);
// //         }
// //       } catch (error) {
// //         console.error("❌ Error parsing WebSocket message:", error);
// //       }
// //     };
// //   }, [bargainId, token]);
  
  
  
// //   useEffect(() => {
// //     if (!bargainId || !token || socket.current) return;
  
// //     console.log("📡 Initializing WebSocket...");
// //     socket.current = io("http://localhost:5000", {
// //       auth: { token },
// //     });
  
// //     socket.current.on("connect", () => {
// //       console.log("✅ Connected to WebSocket");
// //     });
  
// //     socket.current.on("bargainMessage", (data) => {
// //       console.log("📩 Message received:", data);
// //       // Handle message here
// //     });
  
// //     socket.current.on("disconnect", () => {
// //       console.warn("⚠️ Socket disconnected");
// //     });
  
// //     return () => {
// //       if (socket.current) {
// //         console.log("🔴 Closing WebSocket...");
// //         socket.current.disconnect();
// //         socket.current = null;
// //       }
// //     };
// //   }, [bargainId, token]);
  

// //   // Load initial messages
// //   useEffect(() => {
// //     const fetchMessages = async () => {
// //       try {
// //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
// //           headers: {
// //             'Authorization': `Bearer ${localStorage.getItem('token')}`
// //           }
// //         });
// //         const data = await response.json();
// //         setMessages(data.messages || []);
// //         if (data.currentPrice) setCurrentPrice(data.currentPrice);
        
// //         if (data.messages?.length > 0) {
// //           setIsBargainPopupOpen(false);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching messages:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     if (bargainId) {
// //       fetchMessages();
// //     }
// //   }, [bargainId]);

// //   // Auto-scroll to bottom when messages change
// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   const handleBargainConfirm = async () => {
// //     setError(null);
// //     setIsLoading(true);
// //     setWaitingForReply(true);

// //     try {
// //       if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// //         throw new Error("Please select a product and valid quantity");
// //       }

// //       if (!consumer?.token) {
// //         navigate('/login', { state: { from: location.pathname } });
// //         return;
// //       }

// //       if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// //         const bargainMessage = {
// //           type: 'INIT_BARGAIN',
// //           product: selectedProduct,
// //           quantity,
// //           initialPrice: selectedProduct.price_per_kg,
// //           farmer: selectedFarmer,
// //           consumerName: consumer.name
// //         };
// //         socket.current.send(JSON.stringify(bargainMessage));
// //       }

// //       setMessages(prev => [...prev, {
// //         content: `You sent an bargain request for ${quantity}kg of ${selectedProduct.produce_name}`,
// //         sender_type: 'consumer',
// //         timestamp: new Date().toISOString()
// //       }]);

// //       setIsBargainPopupOpen(false);
// //     } catch (error) {
// //       setError(error.message);
// //       setWaitingForReply(false);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleMakeOffer = (price) => {
// //     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// //       socket.current.send(JSON.stringify({
// //         type: "PRICE_OFFER",
// //         price,
// //         productId: selectedProduct.product_id,
// //         quantity,
// //       }));
// //     }

// //     setMessages(prev => [...prev, { 
// //       content: `You offered ₹${price}/kg for ${quantity}kg`, 
// //       sender_type: "consumer", 
// //       timestamp: new Date().toISOString() 
// //     }]);
// //     setCurrentPrice(price);
// //   };

// //   // const handleSendMessage = () => {
// //   //   if (!newMessage.trim() || !socket.current || socket.current.readyState !== WebSocket.OPEN) return;

// //   //   const message = {
// //   //     type: 'MESSAGE',
// //   //     content: newMessage,
// //   //     sender_type: 'consumer',
// //   //     timestamp: new Date().toISOString()
// //   //   };
    
// //   //   socket.current.send(JSON.stringify(message));
// //   //   setMessages(prev => [...prev, message]);
// //   //   setNewMessage('');
// //   // };

// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// //         <p>Loading bargain session...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bargain-chat-container">
// //       {isBargainPopupOpen && selectedFarmer && (
// //         <div className="bargain-initiation-popup">
// //           <div className="popup-content">
// //             <button onClick={() => navigate(-1)} className="close-btn">
// //               <FontAwesomeIcon icon={faTimes} />
// //             </button>
// //             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
// //             <div className="form-group">
// //               <label>Select Product</label>
// //               <select
// //                 value={selectedProduct?.produce_name || ''}
// //                 onChange={(e) => {
// //                   const product = selectedFarmer.products.find(
// //                     p => p.produce_name === e.target.value
// //                   );
// //                   setSelectedProduct(product || null);
// //                   if (product) setCurrentPrice(product.price_per_kg);
// //                 }}
// //               >
// //                 <option value="">Select a product</option>
// //                 {selectedFarmer.products?.map(product => (
// //                   <option key={product.product_id} value={product.produce_name}>
// //                     {product.produce_name} (₹{product.price_per_kg}/kg)
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
            
// //             <div className="form-group">
// //               <label>Quantity (kg)</label>
// //               <input
// //                 type="number"
// //                 min="1"
// //                 max={selectedProduct?.availability || 100}
// //                 value={quantity}
// //                 onChange={(e) => setQuantity(Math.max(1, e.target.value))}
// //               />
// //             </div>
            
// //             <div className="current-price-display">
// //               Current Price: ₹{selectedProduct?.price_per_kg || 0}/kg
// //             </div>
// //             {error && <div className="error-message">{error}</div>}
// //             <button
// //               onClick={handleBargainConfirm}
// //               disabled={!selectedProduct || isLoading}
// //               className="confirm-btn"
// //             >
// //               {isLoading ? (
// //                 <FontAwesomeIcon icon={faSpinner} spin />
// //               ) : (
// //                 <FontAwesomeIcon icon={faHandshake} />
// //               )}
// //               Start Bargaining
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <div className="chat-header">
// //         <div className="header-top">
// //           <h2>
// //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
// //           </h2>
// //           <span className={`connection-status ${connectionStatus}`}>
// //             {connectionStatus.toUpperCase()}
// //           </span>
// //         </div>
// //         <div className="product-info">
// //           {selectedProduct && (
// //             <>
// //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// //               <p><strong>Quantity:</strong> {quantity}kg</p>
// //               <p className="current-price">
// //                 <strong>Current Price:</strong> ₹{currentPrice}/kg
// //               </p>
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       <div className="chat-messages">
// //         {messages.length === 0 ? (
// //           <div className="no-messages">
// //             <p>No messages yet. Start the negotiation!</p>
// //           </div>
// //         ) : (
// //           messages.map((msg, index) => (
// //             <div key={index} className={`message ${msg.sender_type}`}>
// //               <div className="message-content">{msg.content}</div>
// //               <div className="message-meta">
// //                 <span className="sender">
// //                   {msg.sender_type === 'consumer' ? 'You' : 
// //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// //                 </span>
// //                 <span className="timestamp">
// //                   {new Date(msg.timestamp).toLocaleTimeString()}
// //                 </span>
// //               </div>
// //             </div>
// //           ))
// //         )}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       <div className="chat-controls">
// //         {!bargainAccepted && selectedProduct && messages.length > 0 && !waitingForReply && (
// //           <div className="price-suggestions">
// //             <h4>Make an Offer:</h4>
// //             <div className="suggestion-buttons">
// //               {[1, 2, 3, 5].map(amount => (
// //                 <button 
// //                   key={`decrease-${amount}`} 
// //                   onClick={() => handleMakeOffer(currentPrice - amount)}
// //                   disabled={currentPrice - amount <= 0}
// //                 >
// //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
// //                 </button>
// //               ))}
// //               {[1, 2, 3].map(amount => (
// //                 <button 
// //                   key={`increase-${amount}`} 
// //                   onClick={() => handleMakeOffer(currentPrice + amount)}
// //                 >
// //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         )}

// //         {waitingForReply && (
// //           <div className="waiting-indicator">
// //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's reply...
// //           </div>
// //         )}

// //       </div>
// //     </div>
// //   );
// // };

// // export default BargainChatWindow;
// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // import { useAuth } from "../../context/AuthContext";
// // import { 
// //   faSpinner, 
// //   faRupeeSign,
// //   faArrowUp,
// //   faArrowDown,
// //   faTimes,
// //   faHandshake
// // } from '@fortawesome/free-solid-svg-icons';
// // import './ConsumerChatWindow.css';

// // const BargainChatWindow = () => {
// //   const navigate = useNavigate();
// //   const { bargainId } = useParams();
// //   const { token, consumer } = useAuth();
// //   const location = useLocation();
// //   const socket = useRef(null);
  
// //   const messagesEndRef = useRef(null);
// //   const reconnectAttempts = useRef(0);

// //   const { product: initialProduct, farmer: initialFarmer, quantity: initialQuantity } = location.state || {};
  
// //   // State
// //   const [messages, setMessages] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentPrice, setCurrentPrice] = useState(null);
// //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// //   const [bargainAccepted, setBargainAccepted] = useState(false);
// //   const [waitingForReply, setWaitingForReply] = useState(false);
// //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// //   const [selectedProduct, setSelectedProduct] = useState(null);
// //   const [selectedFarmer] = useState(initialFarmer || null);
// //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState(null);
 
// //   const initializeWebSocket = useCallback(() => {
// //     if (!bargainId || !token) {
// //       console.error("❌ Missing bargainId or token. WebSocket not initialized.");
// //       return;
// //     }
  
// //     const wsUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${encodeURIComponent(token)}`;
// //     console.log(`🔄 Connecting WebSocket to: ${wsUrl}`);
  
// //     if (socket.current) {
// //       console.log("🔴 Closing existing WebSocket before reconnecting...");
// //       socket.current.close();
// //       socket.current = null;
// //     }
  
// //     socket.current = new WebSocket(wsUrl);
  
// //     socket.current.onopen = () => {
// //       console.log("✅ WebSocket connected!");
// //       setConnectionStatus("connected");
// //       reconnectAttempts.current = 0;
// //     };
  
// //     socket.current.onerror = (error) => {
// //       console.error("🚨 WebSocket Error:", error);
// //       setConnectionStatus("error");
// //     };
  
// //     socket.current.onclose = (event) => {
// //       console.warn("⚠️ WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
// //       setConnectionStatus("disconnected");
  
// //       if (event.code === 1000) return;
  
// //       const maxAttempts = 5;
// //       if (reconnectAttempts.current < maxAttempts) {
// //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// //         reconnectAttempts.current += 1;
// //         console.log(`♻️ Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current}/${maxAttempts})`);
// //         setTimeout(() => initializeWebSocket(), delay);
// //       } else {
// //         console.error("❌ Max reconnection attempts reached. Please refresh the page.");
// //       }
// //     };
  
// //     socket.current.onmessage = (event) => {
// //       try {
// //         const data = JSON.parse(event.data);
// //         console.log("📩 WebSocket Message Received:", data);
  
// //         switch (data.type) {
// //           case "PRICE_UPDATE":
// //             setCurrentPrice(data.newPrice);
// //             setMessages((prev) => [
// //               ...prev,
// //               {
// //                 content: `Farmer updated price to ₹${data.newPrice}/kg`,
// //                 sender_type: "system",
// //                 timestamp: new Date().toISOString(),
// //               },
// //             ]);
// //             setWaitingForReply(false);
// //             break;
  
// //           case "BARGAIN_ACCEPTED":
// //             setBargainAccepted(true);
// //             setWaitingForReply(false);
// //             setMessages((prev) => [
// //               ...prev,
// //               {
// //                 content: "🎉 Farmer accepted your offer!",
// //                 sender_type: "system",
// //                 timestamp: new Date().toISOString(),
// //               },
// //             ]);
// //             break;
  
// //           case "MESSAGE":
// //             setMessages((prev) => [...prev, data.message]);
// //             if (data.message.sender_type === "farmer") {
// //               setWaitingForReply(false);
// //             }
// //             break;
  
// //           default:
// //             console.warn("⚠️ Unknown message type:", data.type);
// //         }
// //       } catch (error) {
// //         console.error("❌ Error parsing WebSocket message:", error);
// //       }
// //     };
// //   }, [bargainId, token]);
  
// //   useEffect(() => {
// //     if (!bargainId || !token) return;
  
// //     console.log("📡 Initializing WebSocket...");
// //     initializeWebSocket();
  
// //     return () => {
// //       if (socket.current) {
// //         console.log("🔴 Closing WebSocket...");
// //         socket.current.close();
// //         socket.current = null;
// //       }
// //     };
// //   }, [bargainId, initializeWebSocket, token]);

// //   // Load initial messages
// //   useEffect(() => {
// //     const fetchMessages = async () => {
// //       try {
// //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
// //           headers: {
// //             'Authorization': `Bearer ${localStorage.getItem('token')}`
// //           }
// //         });
// //         const data = await response.json();
// //         setMessages(data.messages || []);
// //         if (data.currentPrice) setCurrentPrice(data.currentPrice);
        
// //         if (data.messages?.length > 0) {
// //           setIsBargainPopupOpen(false);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching messages:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     if (bargainId) {
// //       fetchMessages();
// //     }
// //   }, [bargainId]);

// //   // Auto-scroll to bottom when messages change
// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   const handleBargainConfirm = async () => {
// //     setError(null);
// //     setIsLoading(true);
// //     setWaitingForReply(true);

// //     try {
// //       if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// //         throw new Error("Please select a product and valid quantity");
// //       }

// //       if (!consumer?.token) {
// //         navigate('/login', { state: { from: location.pathname } });
// //         return;
// //       }

// //       if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// //         const bargainMessage = {
// //           type: 'INIT_BARGAIN',
// //           product: selectedProduct,
// //           quantity,
// //           initialPrice: selectedProduct.price_per_kg,
// //           farmer: selectedFarmer,
// //           consumerName: consumer.name
// //         };
// //         socket.current.send(JSON.stringify(bargainMessage));
// //       }

// //       setMessages(prev => [...prev, {
// //         content: `You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name} at ₹${selectedProduct.price_per_kg}/kg`,
// //         sender_type: 'consumer',
// //         timestamp: new Date().toISOString()
// //       }]);

// //       setIsBargainPopupOpen(false);
// //     } catch (error) {
// //       setError(error.message);
// //       setWaitingForReply(false);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleMakeOffer = (price) => {
// //     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// //       socket.current.send(JSON.stringify({
// //         type: "PRICE_OFFER",
// //         price,
// //         productId: selectedProduct.product_id,
// //         quantity,
// //       }));
// //     }

// //     setMessages(prev => [...prev, { 
// //       content: `You offered ₹${price}/kg for ${quantity}kg of ${selectedProduct.produce_name}`, 
// //       sender_type: "consumer", 
// //       timestamp: new Date().toISOString() 
// //     }]);
// //     setCurrentPrice(price);
// //   };

// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// //         <p>Loading bargain session...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bargain-chat-container">
// //       {isBargainPopupOpen && selectedFarmer && (
// //         <div className="bargain-initiation-popup">
// //           <div className="popup-content">
// //             <button onClick={() => navigate(-1)} className="close-btn">
// //               <FontAwesomeIcon icon={faTimes} />
// //             </button>
// //             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
// //             <div className="form-group">
// //               <label>Select Product</label>
// //               <select
// //                 value={selectedProduct?.produce_name || ''}
// //                 onChange={(e) => {
// //                   const product = selectedFarmer.products.find(
// //                     p => p.produce_name === e.target.value
// //                   );
// //                   setSelectedProduct(product || null);
// //                   if (product) {
// //                     setCurrentPrice(product.price_per_kg);
// //                     setQuantity(1); // Reset quantity when product changes
// //                   }
// //                 }}
// //               >
// //                 <option value="">Select a product</option>
// //                 {selectedFarmer.products?.map(product => (
// //                   <option key={product.product_id} value={product.produce_name}>
// //                     {product.produce_name} (₹{product.price_per_kg}/kg)
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
            
// //             {selectedProduct && (
// //               <>
// //                 <div className="product-details">
// //                   <p><strong>Category:</strong> {selectedProduct.category}</p>
// //                   <p><strong>Availability:</strong> {selectedProduct.availability} kg</p>
// //                 </div>
                
// //                 <div className="form-group">
// //                   <label>Quantity (kg)</label>
// //                   <input
// //                     type="number"
// //                     min="1"
// //                     max={selectedProduct.availability}
// //                     value={quantity}
// //                     onChange={(e) =>
// //                       setQuantity(
// //                         Math.max(1, Math.min(selectedProduct.availability, Number(e.target.value)))
// //                       )
// //                     }
// //                   />

// //                   <small>Max: {selectedProduct.availability} kg</small>
// //                 </div>
// //               </>
// //             )}
            
// //             <div className="current-price-display">
// //               {selectedProduct ? (
// //                 <>
// //                   <p>Product Price: ₹{selectedProduct.price_per_kg}/kg</p>
// //                   <p>Total for {quantity}kg: ₹{(selectedProduct.price_per_kg * quantity).toFixed(2)}</p>
// //                 </>
// //               ) : (
// //                 <p>Please select a product</p>
// //               )}
// //             </div>
// //             {error && <div className="error-message">{error}</div>}
// //             <button
// //               onClick={handleBargainConfirm}
// //               disabled={!selectedProduct || isLoading}
// //               className="confirm-btn"
// //             >
// //               {isLoading ? (
// //                 <FontAwesomeIcon icon={faSpinner} spin />
// //               ) : (
// //                 <FontAwesomeIcon icon={faHandshake} />
// //               )}
// //               Start Bargaining
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <div className="chat-header">
// //         <div className="header-top">
// //           <h2>
// //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
// //           </h2>
// //           <span className={`connection-status ${connectionStatus}`}>
// //             {connectionStatus.toUpperCase()}
// //           </span>
// //         </div>
// //         <div className="product-info">
// //           {selectedProduct && (
// //             <>
// //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// //               <p><strong>Category:</strong> {selectedProduct.category}</p>
// //               <p><strong>Quantity:</strong> {quantity}kg</p>
// //               <p className="current-price">
// //                 <strong>Current Price:</strong> ₹{currentPrice || selectedProduct.price_per_kg}/kg
// //               </p>
// //               <p className="total-price">
// //                 <strong>Total:</strong> ₹{(quantity * (currentPrice || selectedProduct.price_per_kg)).toFixed(2)}
// //               </p>
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       <div className="chat-messages">
// //         {messages.length === 0 ? (
// //           <div className="no-messages">
// //             <p>No messages yet. Start the negotiation!</p>
// //           </div>
// //         ) : (
// //           messages.map((msg, index) => (
// //             <div key={index} className={`message ${msg.sender_type}`}>
// //               <div className="message-content">{msg.content}</div>
// //               <div className="message-meta">
// //                 <span className="sender">
// //                   {msg.sender_type === 'consumer' ? 'You' : 
// //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// //                 </span>
// //                 <span className="timestamp">
// //                   {new Date(msg.timestamp).toLocaleTimeString()}
// //                 </span>
// //               </div>
// //             </div>
// //           ))
// //         )}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       <div className="chat-controls">
// //         {!bargainAccepted && selectedProduct && messages.length > 0 && !waitingForReply && (
// //           <div className="price-suggestions">
// //             <h4>Make an Offer (Current: ₹{currentPrice || selectedProduct.price_per_kg}/kg):</h4>
// //             <div className="suggestion-buttons">
// //               {[1, 2, 3, 5].map(amount => (
// //                 <button 
// //                   key={`decrease-${amount}`} 
// //                   onClick={() => handleMakeOffer((currentPrice || selectedProduct.price_per_kg) - amount)}
// //                   disabled={(currentPrice || selectedProduct.price_per_kg) - amount <= 0}
// //                 >
// //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{(currentPrice || selectedProduct.price_per_kg) - amount}
// //                 </button>
// //               ))}
// //               {[1, 2, 3].map(amount => (
// //                 <button 
// //                   key={`increase-${amount}`} 
// //                   onClick={() => handleMakeOffer((currentPrice || selectedProduct.price_per_kg) + amount)}
// //                 >
// //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{(currentPrice || selectedProduct.price_per_kg) + amount}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         )}

// //         {waitingForReply && (
// //           <div className="waiting-indicator">
// //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's reply...
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default BargainChatWindow;