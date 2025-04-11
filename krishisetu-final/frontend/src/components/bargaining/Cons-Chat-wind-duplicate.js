// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // import { useAuth } from "../../context/AuthContext";
// // import { io } from 'socket.io-client';
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
// //   // const reconnectAttempts = useRef(0);

// //   // Extract initial state from location
// //   const { 
// //     product: initialProduct, 
// //     farmer: initialFarmer, 
// //     quantity: initialQuantity 
// //   } = location.state || {};

// //   // State management
// //   const [messages, setMessages] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentPrice, setCurrentPrice] = useState(initialProduct?.price_per_kg || 0);
// //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// //   const [bargainStatus, setBargainStatus] = useState('pending'); // pending, accepted, rejected, completed
// //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// //   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
// //   const [selectedFarmer] = useState(initialFarmer || null);
// //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [, setInitialPrice] = useState(0);

// //   // WebSocket connection management
// //   const initializeSocketConnection = useCallback(() => {
// //     if (!bargainId || !token) {
// //       console.error("Missing bargainId or token for WebSocket connection");
// //       return;
// //     }
  
// //     // Close existing connection if any
// //     if (socket.current) {
// //       socket.current.disconnect();
// //       socket.current = null;
// //     }
  
// //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// //       auth: {
// //         token: token // Make sure this is your valid JWT token
// //       },
// //       query: { bargainId },
// //       transports: ['websocket'],
// //       withCredentials: true,
// //       extraHeaders: {
// //         Authorization: `Bearer ${token}` // Fallback header
// //       }
// //     });
// //     // Connection events
// //     socket.current.on('connect', () => {
// //       console.log("Socket connected");
// //       setConnectionStatus("connected");
// //     });
  
// //     socket.current.on('connect_error', (err) => {
// //       console.error("Connection error:", err.message);
// //       setConnectionStatus("error");
// //       // Attempt reconnection after delay
// //       setTimeout(() => initializeSocketConnection(), 2000);
// //     });
  
// //     socket.current.on('disconnect', (reason) => {
// //       console.log("Socket disconnected:", reason);
// //       setConnectionStatus("disconnected");
// //     });
  
// //     // Application events
// //     socket.current.on('priceUpdate', (data) => {
// //       setCurrentPrice(data.newPrice);
// //       setMessages(prev => [...prev, {
// //         content: `Farmer updated price to ₹${data.newPrice}/kg`,
// //         sender_type: "system",
// //         timestamp: new Date().toISOString()
// //       }]);
// //       setWaitingForResponse(false);
// //     });
  
// //     socket.current.on('bargainStatusUpdate', (status) => {
// //       setBargainStatus(status);
// //       if (status === 'accepted') {
// //         setMessages(prev => [...prev, {
// //           content: "🎉 Farmer accepted your offer!",
// //           sender_type: "system",
// //           timestamp: new Date().toISOString()
// //         }]);
// //       }
// //       setWaitingForResponse(false);
// //     });
  
// //     socket.current.on('newMessage', (message) => {
// //       setMessages(prev => [...prev, message]);
// //       if (message.sender_type === 'farmer') {
// //         setWaitingForResponse(false);
// //       }
// //     });
  
// //     socket.current.on('error', (error) => {
// //       console.error("Socket error:", error);
// //       setError(error.message);
// //     });
  
// //     return () => {
// //       if (socket.current) {
// //         socket.current.disconnect();
// //       }
// //     };
// //   }, [bargainId, token]);

// //   // Helper function to add system messages
// //   const addSystemMessage = (content) => {
// //     setMessages(prev => [
// //       ...prev,
// //       {
// //         content,
// //         sender_type: "system",
// //         timestamp: new Date().toISOString()
// //       }
// //     ]);
// //   };

// //   // Initialize socket connection on mount
// //   useEffect(() => {
// //     initializeSocketConnection();
// //     return () => {
// //       if (socket.current) {
// //         socket.current.disconnect();
// //       }
// //     };
// //   }, [initializeSocketConnection]);

// //   // useEffect(() => {
// //   //   const fetchBargainData = async () => {
// //   //     try {
// //   //       console.log("🔐 Fetching with token:", token);
  
// //   //       const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`, {
// //   //         method: 'GET',
// //   //         headers: {
// //   //           'Content-Type': 'application/json',
// //   //            Authorization: `Bearer ${token}`,
// //   //         },
// //   //       });
  
// //   //       if (!response.ok) {
// //   //         const errorText = await response.text();
// //   //         console.error("❌ Server responded with an error:", errorText);
// //   //         throw new Error(`HTTP error! Status: ${response.status}`);
// //   //       }
  
// //   //       const data = await response.json();
// //   //       console.log("✅ Bargain data:", data);
  
// //   //       const session = data.session;
// //   //       setMessages(session.messages || []);
// //   //       setCurrentPrice(session.price_per_kg || initialProduct?.price_per_kg || 0);
// //   //       setBargainStatus(session.status || 'pending');
  
// //   //     } catch (error) {
// //   //       console.error("❌ Error fetching bargain data:", error.message);
// //   //       setError(error.message);
// //   //     } finally {
// //   //       setLoading(false);
// //   //     }
// //   //   };
  
// //   //   if (bargainId && token) {
// //   //     fetchBargainData();
// //   //   }
// //   // }, [bargainId, token, initialProduct]);
  
// //   useEffect(() => {
// //     const fetchBargainData = async () => {
// //       try {
// //         if (!bargainId || !token) {
// //           throw new Error("Missing bargain ID or authentication token");
// //         }
  
// //         console.log("🔐 Fetching bargain data for ID:", bargainId);
  
// //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`, {
// //           method: 'GET',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'Authorization': `Bearer ${token}`,
// //           },
// //         });
  
// //         const contentType = response.headers.get('content-type');
// //         const rawText = await response.text();
  
// //         console.log("📨 Raw response:", rawText);
// //         console.log("📨 Response content-type:", contentType);
  
// //         if (!response.ok) {
// //           console.error("❌ Server error:", {
// //             status: response.status,
// //             statusText: response.statusText,
// //             body: rawText
// //           });
// //           throw new Error(`Server error: ${response.status} - ${rawText || 'No error details'}`);
// //         }
  
// //         if (!rawText) {
// //           throw new Error("Received empty response body");
// //         }
  
// //         if (!contentType || !contentType.includes('application/json')) {
// //           throw new Error(`Expected JSON but got ${contentType}. Response: ${rawText}`);
// //         }
  
// //         let data;
// //         try {
// //           data = JSON.parse(rawText);
// //         } catch (parseError) {
// //           console.error("❌ JSON parse error:", parseError);
// //           throw new Error("Failed to parse JSON from server");
// //         }
  
// //         console.log("✅ Bargain data received:", data);
  
// //         if (!data.success) {
// //           throw new Error(data.error || "Failed to fetch bargain data");
// //         }
  
// //         const { session } = data;
  
// //         if (!session) {
// //           throw new Error("No session data received from server");
// //         }
  
// //         setMessages(session.messages || []);
// //         setCurrentPrice(
// //           session.current_price ||
// //           session.initial_price ||
// //           initialProduct?.price_per_kg ||
// //           0
// //         );
// //         setInitialPrice(
// //           session.initial_price ||
// //           initialProduct?.price_per_kg ||
// //           0
// //         );
// //         setBargainStatus(session.status || 'pending');
// //       } catch (error) {
// //         console.error("❌ Error in fetchBargainData:", {
// //           message: error.message,
// //           stack: error.stack
// //         });
// //         setError(error.message || "Failed to load bargain data");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
  
// //     fetchBargainData();
// //   }, [bargainId, token, initialProduct]);
  
// //   // Auto-scroll to bottom when messages change
// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   // Handle bargain initiation
// //   // const handleBargainConfirm = async () => {
// //   //   setError(null);
// //   //   setIsLoading(true);
// //   //   setWaitingForResponse(true);

// //   //   try {
// //   //     if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// //   //       throw new Error("Please select a product and valid quantity");
// //   //     }

// //   //     if (!token) {
// //   //       navigate('/login', { state: { from: location.pathname } });
// //   //       return;
// //   //     }

// //   //     if (socket.current && socket.current.connected) {
// //   //       socket.current.emit('initBargain', {
// //   //         product: selectedProduct,
// //   //         quantity,
// //   //         initialPrice: selectedProduct.price_per_kg,
// //   //         farmer: selectedFarmer,
// //   //         consumerName: consumer?.name || 'Consumer'
// //   //       });

// //   //       addSystemMessage(`You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name}`);
// //   //       setIsBargainPopupOpen(false);
// //   //     }
// //   //   } catch (error) {
// //   //     setError(error.message);
// //   //     setWaitingForResponse(false);
// //   //   } finally {
// //   //     setIsLoading(false);
// //   //   }
// //   // };
// // // Handle bargain initiation
// // const handleBargainConfirm = async () => {
// //   setError(null);
// //   setWaitingForResponse(false); // Don't show loader immediately

// //   try {
// //     if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// //       throw new Error("Please select a product and valid quantity");
// //     }

// //     if (!token) {
// //       navigate('/login', { state: { from: location.pathname } });
// //       return;
// //     }

// //     // First show the message immediately
// //     addSystemMessage(`You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name}`);
// //     setIsBargainPopupOpen(false);

// //     // Then initiate the bargain (show loader only if it takes time)
// //     if (socket.current && socket.current.connected) {
// //       setIsLoading(true);
// //       socket.current.emit('initBargain', {
// //         product: selectedProduct,
// //         quantity,
// //         initialPrice: selectedProduct.price_per_kg,
// //         farmer: selectedFarmer,
// //         consumerName: consumer?.name || 'Consumer'
// //       });
// //     }
// //   } catch (error) {
// //     setError(error.message);
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };
// //   // Handle price offer
// //   // const handleMakeOffer = (price) => {
// //   //   if (socket.current && socket.current.connected) {
// //   //     socket.current.emit('priceOffer', {
// //   //       price,
// //   //       productId: selectedProduct?.product_id,
// //   //       quantity
// //   //     });

// //   //     addSystemMessage(`You offered ₹${price}/kg for ${quantity}kg`);
// //   //     setCurrentPrice(price);
// //   //     setWaitingForResponse(true);
// //   //   }
// //   // };
// // // Handle price offer
// // const handleMakeOffer = (price) => {
// //   if (socket.current && socket.current.connected) {
// //     // First show the message immediately
// //     addSystemMessage(`You offered ₹${price}/kg for ${quantity}kg`);
// //     setCurrentPrice(price);
    
// //     // Then send the offer (show loader only if waiting for response)
// //     setWaitingForResponse(true);
// //     socket.current.emit('priceOffer', {
// //       price,
// //       productId: selectedProduct?.product_id,
// //       quantity
// //     });
// //   }
// // };
// //   // Render loading state
// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// //         <p>Loading bargain session...</p>
// //       </div>
// //     );
// //   }

// //   // Render error state
// //   // if (error) {
// //   //   return (
// //   //     <div className="error-container">
// //   //       <h3>Error Loading Bargain</h3>
// //   //       <p>{error}</p>
// //   //       <button onClick={() => window.location.reload()}>Retry</button>
// //   //     </div>
// //   //   );
// //   // }

// //   return (
// //     <div className="bargain-chat-container">
// //       {/* Bargain Initiation Popup */}
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
// //                 onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
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

// //       {/* Chat Header */}
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
// //               {bargainStatus === 'accepted' && (
// //                 <p className="status-accepted">Offer Accepted!</p>
// //               )}
// //               {bargainStatus === 'rejected' && (
// //                 <p className="status-rejected">Offer Declined</p>
// //               )}
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       {/* Chat Messages */}
// //       <div className="chat-messages">
// //         {messages.length === 0 ? (
// //           <div className="no-messages">
// //             <p>No messages yet. Start the negotiation!</p>
// //           </div>
// //         ) : (
// //           messages.map((msg, index) => (
// //             <div key={`msg-${index}`} className={`message ${msg.sender_type}`}>
// //               <div className="message-content">
// //                 {msg.message_type === 'offer' && `Offered ₹${msg.price}`}
// //                 {msg.message_type === 'accept' && `Accepted ₹${msg.price}`}
// //                 {msg.message_type === 'reject' && `Rejected ₹${msg.price}`}
// //               </div>

// //               <div className="message-meta">
// //                 <span className="sender">
// //                   {msg.sender_type === 'consumer' ? 'You' : 
// //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// //                 </span>
// //                 <span className="timestamp">
// //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                 </span>
// //               </div>
// //             </div>
// //           ))
// //         )}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       {/* Chat Controls */}
// //       {/* <div className="chat-controls">
// //         {bargainStatus === 'pending' && selectedProduct && messages.length > 0 && (
// //           <div className="price-suggestions">
// //             <h4>Make an Offer:</h4>
// //             <div className="suggestion-buttons">
// //               {[1, 2, 3, 5].map(amount => (
// //                 <button 
// //                   key={`decrease-${amount}`} 
// //                   onClick={() => handleMakeOffer(currentPrice - amount)}
// //                   disabled={currentPrice - amount <= 0 || waitingForResponse}
// //                 >
// //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
// //                 </button>
// //               ))}
// //               {[1, 2, 3].map(amount => (
// //                 <button 
// //                   key={`increase-${amount}`} 
// //                   onClick={() => handleMakeOffer(currentPrice + amount)}
// //                   disabled={waitingForResponse}
// //                 >
// //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         )}

// //         {waitingForResponse && (
// //           <div className="waiting-indicator">
// //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
// //           </div>
// //         )}

// //         {bargainStatus === 'accepted' && (
// //           <div className="accepted-actions">
// //             <button className="primary-action" onClick={() => navigate('/checkout')}>
// //               Proceed to Checkout
// //             </button>
// //             <button className="secondary-action" onClick={() => navigate('/')}>
// //               Continue Shopping
// //             </button>
// //           </div>
// //         )}
// //       </div> */}
// //       {/* Chat Controls */}
// // <div className="chat-controls">
// //   {bargainStatus === 'pending' && 
// //    selectedProduct && 
// //    messages.length > 0 && 
// //    messages.some(m => m.sender_type === 'consumer') && (
// //     <div className="price-suggestions">
// //       <h4>Make an Offer:</h4>
// //       <div className="suggestion-buttons">
// //         {[1, 2, 3, 5].map(amount => (
// //           <button 
// //             key={`decrease-${amount}`} 
// //             onClick={() => handleMakeOffer(currentPrice - amount)}
// //             disabled={currentPrice - amount <= 0 || waitingForResponse}
// //           >
// //             <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
// //           </button>
// //         ))}
// //         {[1, 2, 3].map(amount => (
// //           <button 
// //             key={`increase-${amount}`} 
// //             onClick={() => handleMakeOffer(currentPrice + amount)}
// //             disabled={waitingForResponse}
// //           >
// //             <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
// //           </button>
// //         ))}
// //       </div>
// //     </div>
// //   )}

// //   {waitingForResponse && (
// //     <div className="waiting-indicator">
// //       <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's response...
// //     </div>
// //   )}
// // </div>
// //     </div>
// //   );
// // };

// // export default BargainChatWindow;
// // // import React, { useState, useEffect, useRef,useCallback } from 'react';
// // // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // import { useAuth } from "../../context/AuthContext";
// // // import { io } from 'socket.io-client';
// // // // import { initializeWebSocket, sendWebSocketMessage, closeWebSocket } from "../../utils/websocket"; // ✅ Import WebSocket utils
// // // import { 
// // //   faSpinner, 
// // //   // faPaperPlane, 
// // //   faRupeeSign,
// // //   faArrowUp,
// // //   faArrowDown,
// // //   faTimes,
// // //   faHandshake
// // // } from '@fortawesome/free-solid-svg-icons';
// // // import './ConsumerChatWindow.css';

// // // const BargainChatWindow = () => {
// // //   const navigate = useNavigate();
// // //   const { bargainId } = useParams();
// // //   const { token, consumer } = useAuth();
// // //   const location = useLocation();
// // //   const socket = useRef(null); // ✅ controlled by us

 
// // //   const messagesEndRef = useRef(null);
// // //   const reconnectAttempts = useRef(0);

// // //   const { product: initialProduct, farmer: initialFarmer, quantity: initialQuantity } = location.state || {};
  
// // //   // State
// // //   const [messages, setMessages] = useState([]);
// // //   // const [newMessage, setNewMessage] = useState('');
// // //   const [loading, setLoading] = useState(true);
// // //   const [currentPrice, setCurrentPrice] = useState(initialProduct?.price_per_kg);
// // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // //   const [bargainAccepted, setBargainAccepted] = useState(false);
// // //   const [waitingForReply, setWaitingForReply] = useState(false);
// // //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// // //   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
// // //   const [selectedFarmer] = useState(initialFarmer || null);
// // //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [error, setError] = useState(null);
 
  
// // //   const initializeWebSocket = useCallback(() => {
// // //     if (!bargainId || !token) {
// // //       console.error("❌ Missing bargainId or token. WebSocket not initialized.");
// // //       return;
// // //     }
  
// // //     const wsUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${encodeURIComponent(token)}`;
// // //     console.log(`🔄 Connecting WebSocket to: ${wsUrl}`);
  
// // //     // Close existing WebSocket before creating a new one
// // //     if (socket.current) {
// // //       console.log("🔴 Closing existing WebSocket before reconnecting...");
// // //       socket.current.close();
// // //       socket.current = null;
// // //     }
  
// // //     socket.current = new WebSocket(wsUrl);
  
// // //     socket.current.onopen = () => {
// // //       console.log("✅ WebSocket connected!");
// // //       setConnectionStatus("connected");
// // //       reconnectAttempts.current = 0;
// // //     };
  
// // //     socket.current.onerror = (error) => {
// // //       console.error("🚨 WebSocket Error:", error);
// // //       setConnectionStatus("error");
// // //     };
  
// // //     socket.current.onclose = (event) => {
// // //       console.warn("⚠️ WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
// // //       setConnectionStatus("disconnected");
  
// // //       if (event.code === 1000) return;
  
// // //       const maxAttempts = 2;
// // //       if (reconnectAttempts.current < maxAttempts) {
// // //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// // //         reconnectAttempts.current += 1;
// // //         console.log(`♻️ Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current}/${maxAttempts})`);
// // //         setTimeout(() => initializeWebSocket(), delay);
// // //       } else {
// // //         console.error("❌ Max reconnection attempts reached. Please refresh the page.");
// // //       }
// // //     };
  
// // //     socket.current.onmessage = (event) => {
// // //       try {
// // //         const data = JSON.parse(event.data);
// // //         console.log("📩 WebSocket Message Received:", data);
  
// // //         switch (data.type) {
// // //           case "PRICE_UPDATE":
// // //             setCurrentPrice(data.newPrice);
// // //             setMessages((prev) => [
// // //               ...prev,
// // //               {
// // //                 content: `Farmer updated price to ₹${data.newPrice}/kg`,
// // //                 sender_type: "system",
// // //                 timestamp: new Date().toISOString(),
// // //               },
// // //             ]);
// // //             setWaitingForReply(false);
// // //             break;
  
// // //           case "BARGAIN_ACCEPTED":
// // //             setBargainAccepted(true);
// // //             setWaitingForReply(false);
// // //             setMessages((prev) => [
// // //               ...prev,
// // //               {
// // //                 content: "🎉 Farmer accepted your offer!",
// // //                 sender_type: "system",
// // //                 timestamp: new Date().toISOString(),
// // //               },
// // //             ]);
// // //             break;
  
// // //           case "MESSAGE":
// // //             setMessages((prev) => [...prev, data.message]);
// // //             if (data.message.sender_type === "farmer") {
// // //               setWaitingForReply(false);
// // //             }
// // //             break;
  
// // //           default:
// // //             console.warn("⚠️ Unknown message type:", data.type);
// // //         }
// // //       } catch (error) {
// // //         console.error("❌ Error parsing WebSocket message:", error);
// // //       }
// // //     };
// // //   }, [bargainId, token]);
  
  
  
// // //   useEffect(() => {
// // //     if (!bargainId || !token || socket.current) return;
  
// // //     console.log("📡 Initializing WebSocket...");
// // //     socket.current = io("http://localhost:5000", {
// // //       auth: { token },
// // //     });
  
// // //     socket.current.on("connect", () => {
// // //       console.log("✅ Connected to WebSocket");
// // //     });
  
// // //     socket.current.on("bargainMessage", (data) => {
// // //       console.log("📩 Message received:", data);
// // //       // Handle message here
// // //     });
  
// // //     socket.current.on("disconnect", () => {
// // //       console.warn("⚠️ Socket disconnected");
// // //     });
  
// // //     return () => {
// // //       if (socket.current) {
// // //         console.log("🔴 Closing WebSocket...");
// // //         socket.current.disconnect();
// // //         socket.current = null;
// // //       }
// // //     };
// // //   }, [bargainId, token]);
  

// // //   // Load initial messages
// // //   useEffect(() => {
// // //     const fetchMessages = async () => {
// // //       try {
// // //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
// // //           headers: {
// // //             'Authorization': `Bearer ${localStorage.getItem('token')}`
// // //           }
// // //         });
// // //         const data = await response.json();
// // //         setMessages(data.messages || []);
// // //         if (data.currentPrice) setCurrentPrice(data.currentPrice);
        
// // //         if (data.messages?.length > 0) {
// // //           setIsBargainPopupOpen(false);
// // //         }
// // //       } catch (error) {
// // //         console.error("Error fetching messages:", error);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     if (bargainId) {
// // //       fetchMessages();
// // //     }
// // //   }, [bargainId]);

// // //   // Auto-scroll to bottom when messages change
// // //   useEffect(() => {
// // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // //   }, [messages]);

// // //   const handleBargainConfirm = async () => {
// // //     setError(null);
// // //     setIsLoading(true);
// // //     setWaitingForReply(true);

// // //     try {
// // //       if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// // //         throw new Error("Please select a product and valid quantity");
// // //       }

// // //       if (!consumer?.token) {
// // //         navigate('/login', { state: { from: location.pathname } });
// // //         return;
// // //       }

// // //       if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // //         const bargainMessage = {
// // //           type: 'INIT_BARGAIN',
// // //           product: selectedProduct,
// // //           quantity,
// // //           initialPrice: selectedProduct.price_per_kg,
// // //           farmer: selectedFarmer,
// // //           consumerName: consumer.name
// // //         };
// // //         socket.current.send(JSON.stringify(bargainMessage));
// // //       }

// // //       setMessages(prev => [...prev, {
// // //         content: `You sent an bargain request for ${quantity}kg of ${selectedProduct.produce_name}`,
// // //         sender_type: 'consumer',
// // //         timestamp: new Date().toISOString()
// // //       }]);

// // //       setIsBargainPopupOpen(false);
// // //     } catch (error) {
// // //       setError(error.message);
// // //       setWaitingForReply(false);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   const handleMakeOffer = (price) => {
// // //     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // //       socket.current.send(JSON.stringify({
// // //         type: "PRICE_OFFER",
// // //         price,
// // //         productId: selectedProduct.product_id,
// // //         quantity,
// // //       }));
// // //     }

// // //     setMessages(prev => [...prev, { 
// // //       content: `You offered ₹${price}/kg for ${quantity}kg`, 
// // //       sender_type: "consumer", 
// // //       timestamp: new Date().toISOString() 
// // //     }]);
// // //     setCurrentPrice(price);
// // //   };

// // //   // const handleSendMessage = () => {
// // //   //   if (!newMessage.trim() || !socket.current || socket.current.readyState !== WebSocket.OPEN) return;

// // //   //   const message = {
// // //   //     type: 'MESSAGE',
// // //   //     content: newMessage,
// // //   //     sender_type: 'consumer',
// // //   //     timestamp: new Date().toISOString()
// // //   //   };
    
// // //   //   socket.current.send(JSON.stringify(message));
// // //   //   setMessages(prev => [...prev, message]);
// // //   //   setNewMessage('');
// // //   // };

// // //   if (loading) {
// // //     return (
// // //       <div className="loading-container">
// // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // //         <p>Loading bargain session...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="bargain-chat-container">
// // //       {isBargainPopupOpen && selectedFarmer && (
// // //         <div className="bargain-initiation-popup">
// // //           <div className="popup-content">
// // //             <button onClick={() => navigate(-1)} className="close-btn">
// // //               <FontAwesomeIcon icon={faTimes} />
// // //             </button>
// // //             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
// // //             <div className="form-group">
// // //               <label>Select Product</label>
// // //               <select
// // //                 value={selectedProduct?.produce_name || ''}
// // //                 onChange={(e) => {
// // //                   const product = selectedFarmer.products.find(
// // //                     p => p.produce_name === e.target.value
// // //                   );
// // //                   setSelectedProduct(product || null);
// // //                   if (product) setCurrentPrice(product.price_per_kg);
// // //                 }}
// // //               >
// // //                 <option value="">Select a product</option>
// // //                 {selectedFarmer.products?.map(product => (
// // //                   <option key={product.product_id} value={product.produce_name}>
// // //                     {product.produce_name} (₹{product.price_per_kg}/kg)
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
            
// // //             <div className="form-group">
// // //               <label>Quantity (kg)</label>
// // //               <input
// // //                 type="number"
// // //                 min="1"
// // //                 max={selectedProduct?.availability || 100}
// // //                 value={quantity}
// // //                 onChange={(e) => setQuantity(Math.max(1, e.target.value))}
// // //               />
// // //             </div>
            
// // //             <div className="current-price-display">
// // //               Current Price: ₹{selectedProduct?.price_per_kg || 0}/kg
// // //             </div>
// // //             {error && <div className="error-message">{error}</div>}
// // //             <button
// // //               onClick={handleBargainConfirm}
// // //               disabled={!selectedProduct || isLoading}
// // //               className="confirm-btn"
// // //             >
// // //               {isLoading ? (
// // //                 <FontAwesomeIcon icon={faSpinner} spin />
// // //               ) : (
// // //                 <FontAwesomeIcon icon={faHandshake} />
// // //               )}
// // //               Start Bargaining
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       <div className="chat-header">
// // //         <div className="header-top">
// // //           <h2>
// // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
// // //           </h2>
// // //           <span className={`connection-status ${connectionStatus}`}>
// // //             {connectionStatus.toUpperCase()}
// // //           </span>
// // //         </div>
// // //         <div className="product-info">
// // //           {selectedProduct && (
// // //             <>
// // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // //               <p className="current-price">
// // //                 <strong>Current Price:</strong> ₹{currentPrice}/kg
// // //               </p>
// // //             </>
// // //           )}
// // //         </div>
// // //       </div>

// // //       <div className="chat-messages">
// // //         {messages.length === 0 ? (
// // //           <div className="no-messages">
// // //             <p>No messages yet. Start the negotiation!</p>
// // //           </div>
// // //         ) : (
// // //           messages.map((msg, index) => (
// // //             <div key={index} className={`message ${msg.sender_type}`}>
// // //               <div className="message-content">{msg.content}</div>
// // //               <div className="message-meta">
// // //                 <span className="sender">
// // //                   {msg.sender_type === 'consumer' ? 'You' : 
// // //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// // //                 </span>
// // //                 <span className="timestamp">
// // //                   {new Date(msg.timestamp).toLocaleTimeString()}
// // //                 </span>
// // //               </div>
// // //             </div>
// // //           ))
// // //         )}
// // //         <div ref={messagesEndRef} />
// // //       </div>

// // //       <div className="chat-controls">
// // //         {!bargainAccepted && selectedProduct && messages.length > 0 && !waitingForReply && (
// // //           <div className="price-suggestions">
// // //             <h4>Make an Offer:</h4>
// // //             <div className="suggestion-buttons">
// // //               {[1, 2, 3, 5].map(amount => (
// // //                 <button 
// // //                   key={`decrease-${amount}`} 
// // //                   onClick={() => handleMakeOffer(currentPrice - amount)}
// // //                   disabled={currentPrice - amount <= 0}
// // //                 >
// // //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
// // //                 </button>
// // //               ))}
// // //               {[1, 2, 3].map(amount => (
// // //                 <button 
// // //                   key={`increase-${amount}`} 
// // //                   onClick={() => handleMakeOffer(currentPrice + amount)}
// // //                 >
// // //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
// // //                 </button>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         )}

// // //         {waitingForReply && (
// // //           <div className="waiting-indicator">
// // //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's reply...
// // //           </div>
// // //         )}

// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default BargainChatWindow;
// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // import { useAuth } from "../../context/AuthContext";
// // // import { 
// // //   faSpinner, 
// // //   faRupeeSign,
// // //   faArrowUp,
// // //   faArrowDown,
// // //   faTimes,
// // //   faHandshake
// // // } from '@fortawesome/free-solid-svg-icons';
// // // import './ConsumerChatWindow.css';

// // // const BargainChatWindow = () => {
// // //   const navigate = useNavigate();
// // //   const { bargainId } = useParams();
// // //   const { token, consumer } = useAuth();
// // //   const location = useLocation();
// // //   const socket = useRef(null);
  
// // //   const messagesEndRef = useRef(null);
// // //   const reconnectAttempts = useRef(0);

// // //   const { product: initialProduct, farmer: initialFarmer, quantity: initialQuantity } = location.state || {};
  
// // //   // State
// // //   const [messages, setMessages] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [currentPrice, setCurrentPrice] = useState(null);
// // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // //   const [bargainAccepted, setBargainAccepted] = useState(false);
// // //   const [waitingForReply, setWaitingForReply] = useState(false);
// // //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // //   const [selectedFarmer] = useState(initialFarmer || null);
// // //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [error, setError] = useState(null);
 
// // //   const initializeWebSocket = useCallback(() => {
// // //     if (!bargainId || !token) {
// // //       console.error("❌ Missing bargainId or token. WebSocket not initialized.");
// // //       return;
// // //     }
  
// // //     const wsUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${encodeURIComponent(token)}`;
// // //     console.log(`🔄 Connecting WebSocket to: ${wsUrl}`);
  
// // //     if (socket.current) {
// // //       console.log("🔴 Closing existing WebSocket before reconnecting...");
// // //       socket.current.close();
// // //       socket.current = null;
// // //     }
  
// // //     socket.current = new WebSocket(wsUrl);
  
// // //     socket.current.onopen = () => {
// // //       console.log("✅ WebSocket connected!");
// // //       setConnectionStatus("connected");
// // //       reconnectAttempts.current = 0;
// // //     };
  
// // //     socket.current.onerror = (error) => {
// // //       console.error("🚨 WebSocket Error:", error);
// // //       setConnectionStatus("error");
// // //     };
  
// // //     socket.current.onclose = (event) => {
// // //       console.warn("⚠️ WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
// // //       setConnectionStatus("disconnected");
  
// // //       if (event.code === 1000) return;
  
// // //       const maxAttempts = 5;
// // //       if (reconnectAttempts.current < maxAttempts) {
// // //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// // //         reconnectAttempts.current += 1;
// // //         console.log(`♻️ Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current}/${maxAttempts})`);
// // //         setTimeout(() => initializeWebSocket(), delay);
// // //       } else {
// // //         console.error("❌ Max reconnection attempts reached. Please refresh the page.");
// // //       }
// // //     };
  
// // //     socket.current.onmessage = (event) => {
// // //       try {
// // //         const data = JSON.parse(event.data);
// // //         console.log("📩 WebSocket Message Received:", data);
  
// // //         switch (data.type) {
// // //           case "PRICE_UPDATE":
// // //             setCurrentPrice(data.newPrice);
// // //             setMessages((prev) => [
// // //               ...prev,
// // //               {
// // //                 content: `Farmer updated price to ₹${data.newPrice}/kg`,
// // //                 sender_type: "system",
// // //                 timestamp: new Date().toISOString(),
// // //               },
// // //             ]);
// // //             setWaitingForReply(false);
// // //             break;
  
// // //           case "BARGAIN_ACCEPTED":
// // //             setBargainAccepted(true);
// // //             setWaitingForReply(false);
// // //             setMessages((prev) => [
// // //               ...prev,
// // //               {
// // //                 content: "🎉 Farmer accepted your offer!",
// // //                 sender_type: "system",
// // //                 timestamp: new Date().toISOString(),
// // //               },
// // //             ]);
// // //             break;
  
// // //           case "MESSAGE":
// // //             setMessages((prev) => [...prev, data.message]);
// // //             if (data.message.sender_type === "farmer") {
// // //               setWaitingForReply(false);
// // //             }
// // //             break;
  
// // //           default:
// // //             console.warn("⚠️ Unknown message type:", data.type);
// // //         }
// // //       } catch (error) {
// // //         console.error("❌ Error parsing WebSocket message:", error);
// // //       }
// // //     };
// // //   }, [bargainId, token]);
  
// // //   useEffect(() => {
// // //     if (!bargainId || !token) return;
  
// // //     console.log("📡 Initializing WebSocket...");
// // //     initializeWebSocket();
  
// // //     return () => {
// // //       if (socket.current) {
// // //         console.log("🔴 Closing WebSocket...");
// // //         socket.current.close();
// // //         socket.current = null;
// // //       }
// // //     };
// // //   }, [bargainId, initializeWebSocket, token]);

// // //   // Load initial messages
// // //   useEffect(() => {
// // //     const fetchMessages = async () => {
// // //       try {
// // //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
// // //           headers: {
// // //             'Authorization': `Bearer ${localStorage.getItem('token')}`
// // //           }
// // //         });
// // //         const data = await response.json();
// // //         setMessages(data.messages || []);
// // //         if (data.currentPrice) setCurrentPrice(data.currentPrice);
        
// // //         if (data.messages?.length > 0) {
// // //           setIsBargainPopupOpen(false);
// // //         }
// // //       } catch (error) {
// // //         console.error("Error fetching messages:", error);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     if (bargainId) {
// // //       fetchMessages();
// // //     }
// // //   }, [bargainId]);

// // //   // Auto-scroll to bottom when messages change
// // //   useEffect(() => {
// // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // //   }, [messages]);

// // //   const handleBargainConfirm = async () => {
// // //     setError(null);
// // //     setIsLoading(true);
// // //     setWaitingForReply(true);

// // //     try {
// // //       if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// // //         throw new Error("Please select a product and valid quantity");
// // //       }

// // //       if (!consumer?.token) {
// // //         navigate('/login', { state: { from: location.pathname } });
// // //         return;
// // //       }

// // //       if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // //         const bargainMessage = {
// // //           type: 'INIT_BARGAIN',
// // //           product: selectedProduct,
// // //           quantity,
// // //           initialPrice: selectedProduct.price_per_kg,
// // //           farmer: selectedFarmer,
// // //           consumerName: consumer.name
// // //         };
// // //         socket.current.send(JSON.stringify(bargainMessage));
// // //       }

// // //       setMessages(prev => [...prev, {
// // //         content: `You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name} at ₹${selectedProduct.price_per_kg}/kg`,
// // //         sender_type: 'consumer',
// // //         timestamp: new Date().toISOString()
// // //       }]);

// // //       setIsBargainPopupOpen(false);
// // //     } catch (error) {
// // //       setError(error.message);
// // //       setWaitingForReply(false);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   const handleMakeOffer = (price) => {
// // //     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // //       socket.current.send(JSON.stringify({
// // //         type: "PRICE_OFFER",
// // //         price,
// // //         productId: selectedProduct.product_id,
// // //         quantity,
// // //       }));
// // //     }

// // //     setMessages(prev => [...prev, { 
// // //       content: `You offered ₹${price}/kg for ${quantity}kg of ${selectedProduct.produce_name}`, 
// // //       sender_type: "consumer", 
// // //       timestamp: new Date().toISOString() 
// // //     }]);
// // //     setCurrentPrice(price);
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="loading-container">
// // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // //         <p>Loading bargain session...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="bargain-chat-container">
// // //       {isBargainPopupOpen && selectedFarmer && (
// // //         <div className="bargain-initiation-popup">
// // //           <div className="popup-content">
// // //             <button onClick={() => navigate(-1)} className="close-btn">
// // //               <FontAwesomeIcon icon={faTimes} />
// // //             </button>
// // //             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
// // //             <div className="form-group">
// // //               <label>Select Product</label>
// // //               <select
// // //                 value={selectedProduct?.produce_name || ''}
// // //                 onChange={(e) => {
// // //                   const product = selectedFarmer.products.find(
// // //                     p => p.produce_name === e.target.value
// // //                   );
// // //                   setSelectedProduct(product || null);
// // //                   if (product) {
// // //                     setCurrentPrice(product.price_per_kg);
// // //                     setQuantity(1); // Reset quantity when product changes
// // //                   }
// // //                 }}
// // //               >
// // //                 <option value="">Select a product</option>
// // //                 {selectedFarmer.products?.map(product => (
// // //                   <option key={product.product_id} value={product.produce_name}>
// // //                     {product.produce_name} (₹{product.price_per_kg}/kg)
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
            
// // //             {selectedProduct && (
// // //               <>
// // //                 <div className="product-details">
// // //                   <p><strong>Category:</strong> {selectedProduct.category}</p>
// // //                   <p><strong>Availability:</strong> {selectedProduct.availability} kg</p>
// // //                 </div>
                
// // //                 <div className="form-group">
// // //                   <label>Quantity (kg)</label>
// // //                   <input
// // //                     type="number"
// // //                     min="1"
// // //                     max={selectedProduct.availability}
// // //                     value={quantity}
// // //                     onChange={(e) =>
// // //                       setQuantity(
// // //                         Math.max(1, Math.min(selectedProduct.availability, Number(e.target.value)))
// // //                       )
// // //                     }
// // //                   />

// // //                   <small>Max: {selectedProduct.availability} kg</small>
// // //                 </div>
// // //               </>
// // //             )}
            
// // //             <div className="current-price-display">
// // //               {selectedProduct ? (
// // //                 <>
// // //                   <p>Product Price: ₹{selectedProduct.price_per_kg}/kg</p>
// // //                   <p>Total for {quantity}kg: ₹{(selectedProduct.price_per_kg * quantity).toFixed(2)}</p>
// // //                 </>
// // //               ) : (
// // //                 <p>Please select a product</p>
// // //               )}
// // //             </div>
// // //             {error && <div className="error-message">{error}</div>}
// // //             <button
// // //               onClick={handleBargainConfirm}
// // //               disabled={!selectedProduct || isLoading}
// // //               className="confirm-btn"
// // //             >
// // //               {isLoading ? (
// // //                 <FontAwesomeIcon icon={faSpinner} spin />
// // //               ) : (
// // //                 <FontAwesomeIcon icon={faHandshake} />
// // //               )}
// // //               Start Bargaining
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       <div className="chat-header">
// // //         <div className="header-top">
// // //           <h2>
// // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
// // //           </h2>
// // //           <span className={`connection-status ${connectionStatus}`}>
// // //             {connectionStatus.toUpperCase()}
// // //           </span>
// // //         </div>
// // //         <div className="product-info">
// // //           {selectedProduct && (
// // //             <>
// // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // //               <p><strong>Category:</strong> {selectedProduct.category}</p>
// // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // //               <p className="current-price">
// // //                 <strong>Current Price:</strong> ₹{currentPrice || selectedProduct.price_per_kg}/kg
// // //               </p>
// // //               <p className="total-price">
// // //                 <strong>Total:</strong> ₹{(quantity * (currentPrice || selectedProduct.price_per_kg)).toFixed(2)}
// // //               </p>
// // //             </>
// // //           )}
// // //         </div>
// // //       </div>

// // //       <div className="chat-messages">
// // //         {messages.length === 0 ? (
// // //           <div className="no-messages">
// // //             <p>No messages yet. Start the negotiation!</p>
// // //           </div>
// // //         ) : (
// // //           messages.map((msg, index) => (
// // //             <div key={index} className={`message ${msg.sender_type}`}>
// // //               <div className="message-content">{msg.content}</div>
// // //               <div className="message-meta">
// // //                 <span className="sender">
// // //                   {msg.sender_type === 'consumer' ? 'You' : 
// // //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// // //                 </span>
// // //                 <span className="timestamp">
// // //                   {new Date(msg.timestamp).toLocaleTimeString()}
// // //                 </span>
// // //               </div>
// // //             </div>
// // //           ))
// // //         )}
// // //         <div ref={messagesEndRef} />
// // //       </div>

// // //       <div className="chat-controls">
// // //         {!bargainAccepted && selectedProduct && messages.length > 0 && !waitingForReply && (
// // //           <div className="price-suggestions">
// // //             <h4>Make an Offer (Current: ₹{currentPrice || selectedProduct.price_per_kg}/kg):</h4>
// // //             <div className="suggestion-buttons">
// // //               {[1, 2, 3, 5].map(amount => (
// // //                 <button 
// // //                   key={`decrease-${amount}`} 
// // //                   onClick={() => handleMakeOffer((currentPrice || selectedProduct.price_per_kg) - amount)}
// // //                   disabled={(currentPrice || selectedProduct.price_per_kg) - amount <= 0}
// // //                 >
// // //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{(currentPrice || selectedProduct.price_per_kg) - amount}
// // //                 </button>
// // //               ))}
// // //               {[1, 2, 3].map(amount => (
// // //                 <button 
// // //                   key={`increase-${amount}`} 
// // //                   onClick={() => handleMakeOffer((currentPrice || selectedProduct.price_per_kg) + amount)}
// // //                 >
// // //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{(currentPrice || selectedProduct.price_per_kg) + amount}
// // //                 </button>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         )}

// // //         {waitingForReply && (
// // //           <div className="waiting-indicator">
// // //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's reply...
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default BargainChatWindow;









































// // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // import { useAuth } from "../../context/AuthContext";
// // // // import { io } from 'socket.io-client';
// // // // import {
// // // //   faSpinner,
// // // //   faRupeeSign,
// // // //   faArrowUp,
// // // //   faArrowDown,
// // // //   faCheckCircle,
// // // //   faTimesCircle,
// // // //   faHandshake,
// // // //   faPaperPlane
// // // // } from '@fortawesome/free-solid-svg-icons';
// // // // import './FarmerChatWindow.css';

// // // // const FarmerChatWindow = () => {
// // // //   const navigate = useNavigate();
// // // //   const { bargainId } = useParams();
// // // //   const { token } = useAuth();
// // // //   const socket = useRef(null);
// // // //   const messagesEndRef = useRef(null);

// // // //   // State management
// // // //   const [messages, setMessages] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [currentPrice, setCurrentPrice] = useState(0);
// // // //   const [basePrice, setBasePrice] = useState(0);
// // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // //   const [bargainStatus, setBargainStatus] = useState('pending');
// // // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // // //   const [product, setProduct] = useState(null);
// // // //   const [consumerDetails, setConsumerDetails] = useState({});
// // // //   const [quantity, setQuantity] = useState(0);
// // // //   const [newMessage, setNewMessage] = useState('');
// // // //   const [isTyping, setIsTyping] = useState(false);
// // // //   const [error, setError] = useState(null);

// // // //   // Fetch bargain data
// // // //   const fetchBargainData = useCallback(async () => {
// // // //     try {
// // // //       setLoading(true);
// // // //       setError(null);
      
// // // //       if (!bargainId || !token) {
// // // //         throw new Error("Missing required parameters");
// // // //       }

// // // //       const response = await fetch(
// // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`,
// // // //         {
// // // //           headers: {
// // // //             'Authorization': `Bearer ${token}`,
// // // //           },
// // // //         }
// // // //       );

// // // //       if (!response.ok) {
// // // //         const errorText = await response.text();
// // // //         throw new Error(errorText || `HTTP error! status: ${response.status}`);
// // // //       }

// // // //       const data = await response.json();
      
// // // //       if (!data || !data.session) {
// // // //         throw new Error("Invalid response format");
// // // //       }

// // // //       // Set state from the response
// // // //       setMessages(data.session.messages || []);
// // // //       setCurrentPrice(data.session.current_price || 0);
// // // //       setBasePrice(data.session.product?.price_per_kg || 0);
// // // //       setProduct(data.session.product || null);
// // // //       setConsumerDetails(data.session.consumer || {});
// // // //       setQuantity(data.session.quantity || 0);
// // // //       setBargainStatus(data.session.status || 'pending');

// // // //     } catch (error) {
// // // //       console.error("Error loading bargain data:", error);
// // // //       setError(error.message);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }, [bargainId, token]);

// // // //   // WebSocket connection
// // // //   const initializeSocketConnection = useCallback(() => {
// // // //     if (!bargainId || !token) return;

// // // //     if (socket.current) {
// // // //       socket.current.disconnect();
// // // //     }

// // // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // //       auth: { token },
// // // //       query: { bargainId },
// // // //       transports: ['websocket'],
// // // //       reconnection: true,
// // // //       reconnectionAttempts: 5,
// // // //       reconnectionDelay: 1000,
// // // //     });

// // // //     // Connection events
// // // //     socket.current.on('connect', () => {
// // // //       setConnectionStatus("connected");
// // // //       socket.current.emit('joinBargain', { bargainId });
// // // //     });

// // // //     socket.current.on('connect_error', (err) => {
// // // //       setConnectionStatus("error");
// // // //       console.error("Connection error:", err);
// // // //     });

// // // //     socket.current.on('disconnect', () => {
// // // //       setConnectionStatus("disconnected");
// // // //     });

// // // //     // Application events
// // // //     socket.current.on('priceUpdate', (data) => {
// // // //       setCurrentPrice(data.newPrice);
// // // //       addSystemMessage(`Price updated to ₹${data.newPrice}/kg`);
// // // //       setWaitingForResponse(false);
// // // //     });

// // // //     socket.current.on('bargainStatusUpdate', (status) => {
// // // //       setBargainStatus(status);
// // // //       addSystemMessage(status === 'accepted' ? "🎉 Bargain accepted!" : "❌ Bargain rejected");
// // // //       setWaitingForResponse(false);
// // // //     });

// // // //     socket.current.on('newMessage', (message) => {
// // // //       setMessages(prev => [...prev, message]);
// // // //       if (message.sender_type === 'consumer') {
// // // //         setWaitingForResponse(false);
// // // //       }
// // // //     });

// // // //     socket.current.on('typing', (typing) => {
// // // //       setIsTyping(typing);
// // // //     });

// // // //     return () => {
// // // //       if (socket.current) {
// // // //         socket.current.disconnect();
// // // //       }
// // // //     };
// // // //   }, [bargainId, token]);

// // // //   // Initialize on mount
// // // //   useEffect(() => {
// // // //     fetchBargainData();
// // // //     initializeSocketConnection();
// // // //   }, [fetchBargainData, initializeSocketConnection]);

// // // //   // Auto-scroll to bottom
// // // //   useEffect(() => {
// // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // //   }, [messages]);

// // // //   // Helper functions
// // // //   const addSystemMessage = (content) => {
// // // //     setMessages(prev => [...prev, {
// // // //       content,
// // // //       sender_type: "system",
// // // //       timestamp: new Date().toISOString()
// // // //     }]);
// // // //   };

// // // //   const handleSendMessage = () => {
// // // //     if (!newMessage.trim() || !socket.current?.connected) return;

// // // //     const message = {
// // // //       content: newMessage,
// // // //       sender_type: "farmer",
// // // //       timestamp: new Date().toISOString()
// // // //     };

// // // //     socket.current.emit('bargainMessage', {
// // // //       bargain_id: bargainId,
// // // //       message,
// // // //       recipientType: "consumer",
// // // //       recipientId: consumerDetails.id,
// // // //     });

// // // //     setMessages(prev => [...prev, message]);
// // // //     setNewMessage('');
// // // //   };

// // // //   const handleMakeOffer = (price) => {
// // // //     if (!socket.current?.connected) return;

// // // //     const messageContent = `💰 Offering ₹${price}/kg`;
// // // //     addSystemMessage(messageContent);
// // // //     setCurrentPrice(price);
// // // //     setWaitingForResponse(true);

// // // //     socket.current.emit('priceOffer', {
// // // //       price,
// // // //       productId: product?.product_id,
// // // //       quantity
// // // //     });

// // // //     socket.current.emit('bargainMessage', {
// // // //       bargain_id: bargainId,
// // // //       message: {
// // // //         content: messageContent,
// // // //         sender_type: "farmer",
// // // //         timestamp: new Date().toISOString()
// // // //       },
// // // //       recipientType: "consumer",
// // // //       recipientId: consumerDetails.id,
// // // //     });
// // // //   };

// // // //   const handleBargainResponse = (response) => {
// // // //     if (!socket.current?.connected) return;

// // // //     const messageContent = response ? "🎉 Accepted offer!" : "❌ Declined offer";
// // // //     addSystemMessage(messageContent);
// // // //     setWaitingForResponse(true);

// // // //     socket.current.emit('bargainResponse', {
// // // //       response,
// // // //       bargainId
// // // //     });

// // // //     socket.current.emit('bargainMessage', {
// // // //       bargain_id: bargainId,
// // // //       message: {
// // // //         content: messageContent,
// // // //         sender_type: "farmer",
// // // //         timestamp: new Date().toISOString()
// // // //       },
// // // //       recipientType: "consumer",
// // // //       recipientId: consumerDetails.id,
// // // //     });
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="loading-container">
// // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // //         <p>Loading bargain session...</p>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (error) {
// // // //     return (
// // // //       <div className="error-container">
// // // //         <h3>Error Loading Chat</h3>
// // // //         <p>{error}</p>
// // // //         <button onClick={() => window.location.reload()}>Retry</button>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="chat-window-container">
// // // //       <div className="chat-header">
// // // //         <button className="back-button" onClick={() => navigate(-1)}>
// // // //           &larr; Back
// // // //         </button>
// // // //         <div className="header-info">
// // // //           <h2>
// // // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerDetails.name || "Consumer"}
// // // //           </h2>
// // // //           <div className="product-details">
// // // //             {product && (
// // // //               <>
// // // //                 <span>{product.produce_name} ({quantity}kg)</span>
// // // //                 <span>Base: ₹{basePrice}/kg</span>
// // // //               </>
// // // //             )}
// // // //             <span className={`connection-status ${connectionStatus}`}>
// // // //               {connectionStatus}
// // // //             </span>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       <div className="chat-messages">
// // // //         {messages.length === 0 ? (
// // // //           <div className="no-messages">
// // // //             <p>Start the conversation with the consumer</p>
// // // //           </div>
// // // //         ) : (
// // // //           messages.map((msg, index) => (
// // // //             <div 
// // // //               key={`msg-${index}`} 
// // // //               className={`message ${msg.sender_type}`}
// // // //             >
// // // //               <div className="message-content">
// // // //                 {msg.content}
// // // //               </div>
// // // //               <div className="message-meta">
// // // //                 <span className="sender">
// // // //                   {msg.sender_type === 'farmer' ? 'You' : 
// // // //                    msg.sender_type === 'consumer' ? consumerDetails.name : 'System'}
// // // //                 </span>
// // // //                 <span className="timestamp">
// // // //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // // //                 </span>
// // // //               </div>
// // // //             </div>
// // // //           ))
// // // //         )}
// // // //         {isTyping && (
// // // //           <div className="typing-indicator">
// // // //             <div className="typing-dots">
// // // //               <div></div>
// // // //               <div></div>
// // // //               <div></div>
// // // //             </div>
// // // //             <span>{consumerDetails.name || 'Consumer'} is typing...</span>
// // // //           </div>
// // // //         )}
// // // //         <div ref={messagesEndRef} />
// // // //       </div>

// // // //       <div className="price-display">
// // // //         <div className="price-item">
// // // //           <span>Current Price:</span>
// // // //           <span>₹{currentPrice}/kg</span>
// // // //         </div>
// // // //         <div className="price-item">
// // // //           <span>Total:</span>
// // // //           <span>₹{(quantity * currentPrice).toFixed(2)}</span>
// // // //         </div>
// // // //         {bargainStatus === 'accepted' && (
// // // //           <div className="status-accepted">
// // // //             <FontAwesomeIcon icon={faCheckCircle} /> Accepted
// // // //           </div>
// // // //         )}
// // // //         {bargainStatus === 'rejected' && (
// // // //           <div className="status-rejected">
// // // //             <FontAwesomeIcon icon={faTimesCircle} /> Rejected
// // // //           </div>
// // // //         )}
// // // //       </div>

// // // //       <div className="message-input">
// // // //         <input
// // // //           type="text"
// // // //           value={newMessage}
// // // //           onChange={(e) => {
// // // //             setNewMessage(e.target.value);
// // // //             socket.current?.emit('typing', e.target.value.length > 0);
// // // //           }}
// // // //           placeholder="Type your message..."
// // // //           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
// // // //         />
// // // //         <button onClick={handleSendMessage}>
// // // //           <FontAwesomeIcon icon={faPaperPlane} />
// // // //         </button>
// // // //       </div>

// // // //       {bargainStatus === 'pending' && (
// // // //         <div className="bargain-controls">
// // // //           <div className="price-buttons">
// // // //             <button 
// // // //               onClick={() => handleMakeOffer(currentPrice + 1)}
// // // //               disabled={waitingForResponse}
// // // //             >
// // // //               <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + 1}
// // // //             </button>
// // // //             <button 
// // // //               onClick={() => handleMakeOffer(Math.max(1, currentPrice - 1))}
// // // //               disabled={waitingForResponse || currentPrice <= 1}
// // // //             >
// // // //               <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 1}
// // // //             </button>
// // // //           </div>
// // // //           <div className="action-buttons">
// // // //             <button 
// // // //               onClick={() => handleBargainResponse(true)}
// // // //               disabled={waitingForResponse}
// // // //             >
// // // //               <FontAwesomeIcon icon={faHandshake} /> Accept
// // // //             </button>
// // // //             <button 
// // // //               onClick={() => handleBargainResponse(false)}
// // // //               disabled={waitingForResponse}
// // // //             >
// // // //               <FontAwesomeIcon icon={faTimesCircle} /> Reject
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {waitingForResponse && (
// // // //         <div className="waiting-indicator">
// // // //           <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default FarmerChatWindow;
// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // import { useAuth } from "../../context/AuthContext";
// // // import { io } from 'socket.io-client';
// // // import {
// // //   faSpinner,
// // //   faRupeeSign,
// // //   faArrowUp,
// // //   faArrowDown,
// // //   faCheckCircle,
// // //   faTimesCircle,
// // //   faHandshake,
// // //   faPaperPlane
// // // } from '@fortawesome/free-solid-svg-icons';
// // // import './FarmerChatWindow.css';

// // // const FarmerChatWindow = () => {
// // //   const navigate = useNavigate();
// // //   const { bargainId } = useParams();
// // //   const { token } = useAuth();
// // //   const socket = useRef(null);
// // //   const messagesEndRef = useRef(null);

// // //   // State management
// // //   const [messages, setMessages] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [currentPrice, setCurrentPrice] = useState(0);
// // //   const [basePrice, setBasePrice] = useState(0);
// // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // //   const [bargainStatus, setBargainStatus] = useState('pending');
// // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // //   const [product, setProduct] = useState(null);
// // //   const [consumerDetails, setConsumerDetails] = useState({});
// // //   const [quantity, setQuantity] = useState(0);
// // //   const [newMessage, setNewMessage] = useState('');
// // //   const [isTyping, setIsTyping] = useState(false);
// // //   const [error, setError] = useState(null);

// // //   // Fetch bargain data from both tables
// // //   const fetchBargainData = useCallback(async () => {
// // //     try {
// // //       setLoading(true);
// // //       setError(null);
      
// // //       if (!bargainId || !token) {
// // //         throw new Error("Missing bargain ID or authentication token");
// // //       }

// // //       // First fetch the bargain session
// // //       const sessionResponse = await fetch(
// // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// // //         {
// // //           headers: {
// // //             'Authorization': `Bearer ${token}`,
// // //           },
// // //         }
// // //       );

// // //       if (!sessionResponse.ok) {
// // //         const errorText = await sessionResponse.text();
// // //         throw new Error(`Failed to fetch bargain session: ${errorText || sessionResponse.status}`);
// // //       }

// // //       const sessionData = await sessionResponse.json();
// // //       if (!sessionData || !sessionData.session) {
// // //         throw new Error("No session data received from server");
// // //       }

// // //       // Then fetch the product details if available
// // //       let productData = { product: null };
// // //       if (sessionData.session.product_id) {
// // //         const productResponse = await fetch(
// // //           `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/product`,
// // //           {
// // //             headers: {
// // //               'Authorization': `Bearer ${token}`,
// // //             },
// // //           }
// // //         );

// // //         if (productResponse.ok) {
// // //           productData = await productResponse.json();
// // //         }
// // //       }

// // //       // Combine the data
// // //       const combinedData = {
// // //         ...sessionData.session,
// // //         product: productData.product || null,
// // //         messages: sessionData.session.messages || []
// // //       };

// // //       // Set all state from the combined data
// // //       setMessages(combinedData.messages);
// // //       setCurrentPrice(combinedData.current_price || 0);
// // //       setBasePrice(combinedData.product?.price_per_kg || 0);
// // //       setProduct(combinedData.product);
// // //       setConsumerDetails(combinedData.consumer || {});
// // //       setQuantity(combinedData.quantity || 0);
// // //       setBargainStatus(combinedData.status || 'pending');

// // //       // Add initial product message if needed
// // //       if (!combinedData.messages.some(msg => msg.content.includes('selected')) && combinedData.product) {
// // //         const productMessage = {
// // //           content: `🛒 ${combinedData.consumer?.name || 'Consumer'} selected ${combinedData.product.produce_name} (${combinedData.quantity}kg) at ₹${combinedData.product.price_per_kg}/kg`,
// // //           sender_type: "system",
// // //           timestamp: new Date().toISOString()
// // //         };
// // //         setMessages(prev => [...prev, productMessage]);
// // //       }

// // //       return combinedData;
// // //     } catch (error) {
// // //       console.error("Error loading bargain data:", error);
// // //       setError(error.message);
// // //       return null;
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [bargainId, token]);

// // //   // WebSocket connection management
// // //   const initializeSocketConnection = useCallback(() => {
// // //     if (!bargainId || !token) {
// // //       console.error("Missing bargainId or token for WebSocket connection");
// // //       return;
// // //     }
  
// // //     if (socket.current) {
// // //       socket.current.disconnect();
// // //       socket.current = null;
// // //     }
  
// // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // //       auth: { token },
// // //       query: { bargainId },
// // //       transports: ['websocket'],
// // //       reconnection: true,
// // //       reconnectionAttempts: 5,
// // //       reconnectionDelay: 1000,
// // //       extraHeaders: {
// // //         Authorization: `Bearer ${token}`
// // //       }
// // //     });
    
// // //     // Connection events
// // //     socket.current.on('connect', () => {
// // //       console.log("Socket connected");
// // //       setConnectionStatus("connected");
// // //       socket.current.emit('joinBargain', { bargainId });
// // //     });
  
// // //     socket.current.on('connect_error', (err) => {
// // //       console.error("Connection error:", err.message);
// // //       setConnectionStatus("error");
// // //     });
  
// // //     socket.current.on('disconnect', (reason) => {
// // //       console.log("Socket disconnected:", reason);
// // //       setConnectionStatus("disconnected");
// // //     });
  
// // //     // Application events
// // //     socket.current.on('priceUpdate', (data) => {
// // //       setCurrentPrice(data.newPrice);
// // //       addSystemMessage(`Consumer updated price to ₹${data.newPrice}/kg`);
// // //       setWaitingForResponse(false);
// // //     });
  
// // //     socket.current.on('bargainStatusUpdate', (status) => {
// // //       setBargainStatus(status);
// // //       if (status === 'accepted') {
// // //         addSystemMessage("🎉 You accepted the offer!");
// // //       } else if (status === 'rejected') {
// // //         addSystemMessage("❌ You declined the offer");
// // //       }
// // //       setWaitingForResponse(false);
// // //     });
  
// // //     socket.current.on('newMessage', (message) => {
// // //       setMessages(prev => [...prev, message]);
// // //       if (message.sender_type === 'consumer') {
// // //         setWaitingForResponse(false);
// // //       }
// // //     });

// // //     socket.current.on('typing', (isTyping) => {
// // //       setIsTyping(isTyping);
// // //     });
  
// // //     socket.current.on('error', (error) => {
// // //       console.error("Socket error:", error);
// // //       setError(error.message);
// // //     });
  
// // //     return () => {
// // //       if (socket.current) {
// // //         socket.current.disconnect();
// // //       }
// // //     };
// // //   }, [bargainId, token]);

// // //   // Initialize socket connection on mount
// // //   useEffect(() => {
// // //     fetchBargainData().then(() => {
// // //       initializeSocketConnection();
// // //     });
    
// // //     return () => {
// // //       if (socket.current) {
// // //         socket.current.disconnect();
// // //       }
// // //     };
// // //   }, [initializeSocketConnection, fetchBargainData]);

// // //   // Auto-scroll to bottom when messages change
// // //   useEffect(() => {
// // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // //   }, [messages]);

// // //   // Helper function to add system messages
// // //   const addSystemMessage = (content) => {
// // //     setMessages(prev => [
// // //       ...prev,
// // //       {
// // //         content,
// // //         sender_type: "system",
// // //         timestamp: new Date().toISOString()
// // //       }
// // //     ]);
// // //   };

// // //   // Handle sending a message
// // //   const handleSendMessage = () => {
// // //     if (!newMessage.trim() || !socket.current?.connected) return;

// // //     const message = {
// // //       content: newMessage,
// // //       sender_type: "farmer",
// // //       timestamp: new Date().toISOString()
// // //     };

// // //     socket.current.emit('bargainMessage', {
// // //       bargain_id: bargainId,
// // //       message,
// // //       recipientType: "consumer",
// // //       recipientId: consumerDetails.id,
// // //     });

// // //     setMessages(prev => [...prev, message]);
// // //     setNewMessage('');
// // //   };

// // //   // Handle price offer
// // //   const handleMakeOffer = (price) => {
// // //     if (!socket.current?.connected) return;

// // //     const messageContent = `💰 I'm offering ₹${price}/kg`;
// // //     addSystemMessage(messageContent);
// // //     setCurrentPrice(price);
// // //     setWaitingForResponse(true);
    
// // //     socket.current.emit('priceOffer', {
// // //       price,
// // //       productId: product?.product_id,
// // //       quantity
// // //     });

// // //     socket.current.emit("bargainMessage", {
// // //       bargain_id: bargainId,
// // //       message: {
// // //         content: messageContent,
// // //         sender_type: "farmer",
// // //         timestamp: new Date().toISOString()
// // //       },
// // //       recipientType: "consumer",
// // //       recipientId: consumerDetails.id,
// // //     });
// // //   };

// // //   // Handle accept/reject
// // //   const handleBargainResponse = (response) => {
// // //     if (!socket.current?.connected) return;

// // //     const messageContent = response ? "🎉 I accept this offer!" : "❌ I decline this offer";
// // //     addSystemMessage(messageContent);
// // //     setWaitingForResponse(true);
    
// // //     socket.current.emit('bargainResponse', {
// // //       response,
// // //       bargainId
// // //     });

// // //     socket.current.emit("bargainMessage", {
// // //       bargain_id: bargainId,
// // //       message: {
// // //         content: messageContent,
// // //         sender_type: "farmer",
// // //         timestamp: new Date().toISOString()
// // //       },
// // //       recipientType: "consumer",
// // //       recipientId: consumerDetails.id,
// // //     });
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="loading-container">
// // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // //         <p>Loading bargain session...</p>
// // //       </div>
// // //     );
// // //   }

// // //   if (error) {
// // //     return (
// // //       <div className="error-container">
// // //         <h3>Error Loading Chat</h3>
// // //         <p>{error}</p>
// // //         <button onClick={() => window.location.reload()}>Retry</button>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="chat-window-container">
// // //       {/* Chat Header */}
// // //       <div className="chat-header">
// // //         <button className="back-button" onClick={() => navigate(-1)}>
// // //           &larr; Back
// // //         </button>
// // //         <div className="header-info">
// // //           <h2>
// // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerDetails.name || "Consumer"}
// // //           </h2>
// // //           <div className="product-details">
// // //             {product && (
// // //               <>
// // //                 <span>{product.produce_name} ({quantity}kg)</span>
// // //                 <span>Base: ₹{basePrice}/kg</span>
// // //               </>
// // //             )}
// // //             <span className={`connection-status ${connectionStatus}`}>
// // //               {connectionStatus}
// // //             </span>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Chat Messages */}
// // //       <div className="chat-messages">
// // //         {messages.length === 0 ? (
// // //           <div className="no-messages">
// // //             <p>Waiting for consumer to initiate bargain...</p>
// // //           </div>
// // //         ) : (
// // //           messages.map((msg, index) => (
// // //             <div 
// // //               key={`msg-${index}`} 
// // //               className={`message ${
// // //                 msg.sender_type === 'farmer' ? 'sent' : 
// // //                 msg.sender_type === 'system' ? 'system' : 'received'
// // //               }`}
// // //             >
// // //               <div className="message-content">
// // //                 {msg.content}
// // //               </div>
// // //               <div className="message-meta">
// // //                 <span className="sender">
// // //                   {msg.sender_type === 'farmer' ? 'You' : 
// // //                    msg.sender_type === 'consumer' ? consumerDetails.name : 'System'}
// // //                 </span>
// // //                 <span className="timestamp">
// // //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // //                 </span>
// // //               </div>
// // //             </div>
// // //           ))
// // //         )}
// // //         {isTyping && (
// // //           <div className="typing-indicator">
// // //             <div className="typing-dots">
// // //               <div></div>
// // //               <div></div>
// // //               <div></div>
// // //             </div>
// // //             <span>{consumerDetails.name || 'Consumer'} is typing...</span>
// // //           </div>
// // //         )}
// // //         <div ref={messagesEndRef} />
// // //       </div>

// // //       {/* Price Display */}
// // //       <div className="price-display">
// // //         <div className="price-item">
// // //           <span className="price-label">Current Price:</span>
// // //           <span className="price-value">₹{currentPrice}/kg</span>
// // //         </div>
// // //         <div className="price-item">
// // //           <span className="price-label">Total:</span>
// // //           <span className="price-value">₹{(quantity * currentPrice).toFixed(2)}</span>
// // //         </div>
// // //         {bargainStatus === 'accepted' && (
// // //           <div className="status-accepted">
// // //             <FontAwesomeIcon icon={faCheckCircle} /> Accepted
// // //           </div>
// // //         )}
// // //         {bargainStatus === 'rejected' && (
// // //           <div className="status-rejected">
// // //             <FontAwesomeIcon icon={faTimesCircle} /> Rejected
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* Message Input */}
// // //       <div className="message-input">
// // //         <input
// // //           type="text"
// // //           value={newMessage}
// // //           onChange={(e) => {
// // //             setNewMessage(e.target.value);
// // //             socket.current?.emit('typing', e.target.value.length > 0);
// // //           }}
// // //           placeholder="Type your message..."
// // //           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
// // //         />
// // //         <button onClick={handleSendMessage}>
// // //           <FontAwesomeIcon icon={faPaperPlane} />
// // //         </button>
// // //       </div>

// // //       {/* Bargain Controls */}
// // //       {bargainStatus === 'pending' && (
// // //         <div className="bargain-controls">
// // //           <div className="price-buttons">
// // //             <button 
// // //               className="price-up"
// // //               onClick={() => handleMakeOffer(currentPrice + 1)}
// // //               disabled={waitingForResponse}
// // //             >
// // //               <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + 1}
// // //             </button>
// // //             <button 
// // //               className="price-down"
// // //               onClick={() => handleMakeOffer(Math.max(1, currentPrice - 1))}
// // //               disabled={waitingForResponse || currentPrice <= 1}
// // //             >
// // //               <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 1}
// // //             </button>
// // //           </div>
// // //           <div className="action-buttons">
// // //             <button 
// // //               className="accept-button"
// // //               onClick={() => handleBargainResponse(true)}
// // //               disabled={waitingForResponse}
// // //             >
// // //               <FontAwesomeIcon icon={faHandshake} /> Accept
// // //             </button>
// // //             <button 
// // //               className="reject-button"
// // //               onClick={() => handleBargainResponse(false)}
// // //               disabled={waitingForResponse}
// // //             >
// // //               <FontAwesomeIcon icon={faTimesCircle} /> Reject
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {waitingForResponse && (
// // //         <div className="waiting-indicator">
// // //           <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default FarmerChatWindow;
// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // import { useAuth } from "../../context/AuthContext";
// // import { io } from 'socket.io-client';
// // import {
// //   faSpinner,
// //   faRupeeSign,
// //   faArrowUp,
// //   faArrowDown,
// //   faCheckCircle,
// //   faTimesCircle
// // } from '@fortawesome/free-solid-svg-icons';
// // import './ConsumerChatWindow.css';

// // const FarmerChatWindow = () => {
// //   const navigate = useNavigate();
// //   const { bargainId } = useParams();
// //   const { token } = useAuth();
// //   const socket = useRef(null);
// //   const messagesEndRef = useRef(null);

// //   const [messages, setMessages] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentPrice, setCurrentPrice] = useState(0);
// //   const [connectionStatus, setConnectionStatus] = useState("disconnected");
// //   const [bargainStatus, setBargainStatus] = useState('pending');
// //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// //   const [selectedConsumer, setSelectedConsumer] = useState(null);
// //   const [selectedProduct, setSelectedProduct] = useState(null);
// //   const [quantity, setQuantity] = useState(0);
// //   const [priceSuggestions, setPriceSuggestions] = useState([]);
// //   const [error, setError] = useState(null);

// //   // Generate price suggestions
// //   const generatePriceSuggestions = useCallback((basePrice) => {
// //     return [
// //       { amount: -2, price: basePrice - 2, label: "Counter Offer" },
// //       { amount: -1, price: basePrice - 1, label: "Small Decrease" },
// //       { amount: 1, price: basePrice + 1, label: "Small Increase" },
// //       { amount: 2, price: basePrice + 2, label: "Counter Offer" }
// //     ].filter(suggestion => suggestion.price > 0);
// //   }, []);

// //   // Add system messages
// //   const addSystemMessage = (content) => {
// //     setMessages(prev => [
// //       ...prev,
// //       {
// //         content,
// //         sender_type: "system",
// //         timestamp: new Date().toISOString()
// //       }
// //     ]);
// //   };

// //   // Fetch messages from database
// //   const fetchMessages = async () => {
// //     try {
// //       const response = await fetch(
// //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
// //         {
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error('Failed to fetch messages');
// //       }

// //       const data = await response.json();
// //       setMessages(data);
// //     } catch (err) {
// //       console.error('Error fetching messages:', err);
// //       setError(err.message);
// //     }
// //   };

// //   // Save message to database
// //   const sendMessageToDb = async (messageData) => {
// //     try {
// //       const response = await fetch(
// //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/messages`,
// //         {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'Authorization': `Bearer ${token}`,
// //           },
// //           body: JSON.stringify(messageData),
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error('Failed to save message');
// //       }

// //       return await response.json();
// //     } catch (err) {
// //       console.error('Error saving message:', err);
// //       throw err;
// //     }
// //   };

// //   // Fetch bargain data
// //   const fetchBargainData = async () => {
// //     try {
// //       if (!bargainId || !token) {
// //         throw new Error("Missing bargain ID or authentication token");
// //       }

// //       const response = await fetch(
// //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// //         {
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error(`Server error: ${response.status}`);
// //       }

// //       const data = await response.json();

// //       if (!data.success) {
// //         throw new Error(data.error || "Failed to fetch bargain data");
// //       }

// //       if (data.products && data.products.length > 0) {
// //         const product = data.products[0];
// //         setSelectedProduct(product);
// //         setCurrentPrice(product.current_offer || product.price_per_kg);
// //         setQuantity(product.quantity || 1);
        
// //         // Generate initial price suggestions
// //         const suggestions = generatePriceSuggestions(product.current_offer || product.price_per_kg);
// //         setPriceSuggestions(suggestions);
// //       }
      
// //       if (data.consumer) {
// //         setSelectedConsumer(data.consumer);
// //       }
      
// //       setBargainStatus(data.status || 'pending');
      
// //     } catch (error) {
// //       setError(error.message || "Failed to load bargain data");
// //     }
// //   };

// //   // Initialize socket connection
// //   const initializeSocketConnection = useCallback(() => {
// //     if (!bargainId || !token) return;

// //     if (socket.current) {
// //       socket.current.disconnect();
// //     }

// //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// //       auth: { token },
// //       query: { bargainId },
// //       transports: ['websocket'],
// //     });

// //     // Connection events
// //     socket.current.on('connect', () => {
// //       console.log("Socket connected");
// //       setConnectionStatus("connected");
// //     });

// //     socket.current.on('connect_error', (err) => {
// //       console.error("Connection error:", err.message);
// //       setConnectionStatus("error");
// //     });

// //     socket.current.on('disconnect', (reason) => {
// //       console.log("Socket disconnected:", reason);
// //       setConnectionStatus("disconnected");
// //     });

// //     // Application events
// //     socket.current.on('priceUpdate', (data) => {
// //       setCurrentPrice(data.newPrice);
// //       addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
// //       setWaitingForResponse(false);
// //     });

// //     socket.current.on('bargainStatusUpdate', (status) => {
// //       setBargainStatus(status);
// //       if (status === 'accepted') {
// //         addSystemMessage("🎉 Consumer accepted your offer!");
// //       } else if (status === 'rejected') {
// //         addSystemMessage("❌ Consumer declined your offer");
// //       }
// //       setWaitingForResponse(false);
// //     });

// //     socket.current.on('newMessage', (message) => {
// //       setMessages(prev => [...prev, message]);
// //     });

// //     socket.current.on('error', (error) => {
// //       console.error("Socket error:", error);
// //       setError(error.message);
// //     });
// //   }, [bargainId, token]);

// //   // Initialize chat (fetch data and connect socket)
// //   useEffect(() => {
// //     const initializeChat = async () => {
// //       try {
// //         setLoading(true);
// //         await fetchBargainData();
// //         await fetchMessages();
// //         initializeSocketConnection();
// //       } catch (err) {
// //         setError(err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     initializeChat();

// //     return () => {
// //       if (socket.current) {
// //         socket.current.disconnect();
// //       }
// //     };
// //   }, [initializeSocketConnection]);

// //   // Auto-scroll to bottom when messages change
// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   const handlePriceSelection = async (price) => {
// //     const messageContent = `💰 Counter offered ₹${price}/kg`;
    
// //     try {
// //       // Save to database first
// //       const messageData = {
// //         bargain_id: bargainId,
// //         bsp_id: selectedProduct.bsp_id,
// //         sender_type: "farmer",
// //         sender_id: selectedConsumer.consumer_id,
// //         content: messageContent,
// //         price_offer: price
// //       };

// //       const savedMessage = await sendMessageToDb(messageData);

// //       // Update local state
// //       setCurrentPrice(price);
// //       setWaitingForResponse(true);
// //       setMessages(prev => [...prev, savedMessage]);

// //       // Emit socket event
// //       if (socket.current && socket.current.connected) {
// //         socket.current.emit("bargainMessage", {
// //           bargain_id: bargainId,
// //           message: {
// //             content: messageContent,
// //             sender_type: "farmer",
// //             timestamp: new Date().toISOString()
// //           },
// //           recipientType: "consumer",
// //           recipientId: selectedConsumer.consumer_id,
// //         });

// //         socket.current.emit('priceOffer', {
// //           price,
// //           productId: selectedProduct.product_id,
// //           quantity: quantity
// //         });
// //       }
// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   const handleAccept = async () => {
// //     const messageContent = "✅ You accepted the offer";
    
// //     try {
// //       // Save to database
// //       const messageData = {
// //         bargain_id: bargainId,
// //         bsp_id: selectedProduct.bsp_id,
// //         sender_type: "farmer",
// //         sender_id: selectedConsumer.consumer_id,
// //         content: messageContent
// //       };

// //       await sendMessageToDb(messageData);

// //       // Update local state
// //       addSystemMessage(messageContent);
// //       setBargainStatus('accepted');

// //       // Emit socket events
// //       if (socket.current && socket.current.connected) {
// //         socket.current.emit("bargainStatusUpdate", {
// //           bargainId,
// //           status: 'accepted'
// //         });
        
// //         socket.current.emit("bargainMessage", {
// //           bargain_id: bargainId,
// //           message: {
// //             content: messageContent,
// //             sender_type: "farmer",
// //             timestamp: new Date().toISOString()
// //           },
// //           recipientType: "consumer",
// //           recipientId: selectedConsumer.consumer_id,
// //         });
// //       }
// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   const handleReject = async () => {
// //     const messageContent = "❌ You rejected the offer";
    
// //     try {
// //       // Save to database
// //       const messageData = {
// //         bargain_id: bargainId,
// //         bsp_id: selectedProduct.bsp_id,
// //         sender_type: "farmer",
// //         sender_id: selectedConsumer.consumer_id,
// //         content: messageContent
// //       };

// //       await sendMessageToDb(messageData);

// //       // Update local state
// //       addSystemMessage(messageContent);
// //       setBargainStatus('rejected');

// //       // Emit socket events
// //       if (socket.current && socket.current.connected) {
// //         socket.current.emit("bargainStatusUpdate", {
// //           bargainId,
// //           status: 'rejected'
// //         });
        
// //         socket.current.emit("bargainMessage", {
// //           bargain_id: bargainId,
// //           message: {
// //             content: messageContent,
// //             sender_type: "farmer",
// //             timestamp: new Date().toISOString()
// //           },
// //           recipientType: "consumer",
// //           recipientId: selectedConsumer.consumer_id,
// //         });
// //       }
// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// //         <p>Loading bargain session...</p>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="error-container">
// //         <h3>Error Loading Bargain</h3>
// //         <p>{error}</p>
// //         <button onClick={() => navigate('/farmer-dashboard')}>
// //           Back to Dashboard
// //         </button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bargain-chat-container">
// //       {selectedProduct && selectedConsumer && (
// //         <div className="chat-interface">
// //           {/* Chat Header */}
// //           <div className="chat-header">
// //             <div className="header-top">
// //               <h2>
// //                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.consumer_name}
// //               </h2>
// //               <span className={`connection-status ${connectionStatus}`}>
// //                 {connectionStatus.toUpperCase()}
// //               </span>
// //             </div>
            
// //             <div className="product-info">
// //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// //               <p><strong>Quantity:</strong> {quantity}kg</p>
// //               <div className="price-display">
// //                 <span className="current-price">
// //                   <strong>Current:</strong> ₹{currentPrice}/kg
// //                 </span>
// //                 <span className="base-price">
// //                   <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
// //                 </span>
// //                 <span className="total-price">
// //                   <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
// //                 </span>
// //               </div>
// //               {bargainStatus === 'accepted' && (
// //                 <p className="status-accepted">
// //                   <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
// //                 </p>
// //               )}
// //               {bargainStatus === 'rejected' && (
// //                 <p className="status-rejected">
// //                   <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
// //                 </p>
// //               )}
// //             </div>
// //           </div>

// //           {/* Chat Messages */}
// //           <div className="chat-messages">
// //             {messages.length === 0 ? (
// //               <div className="no-messages">
// //                 <p>No messages yet. Waiting for consumer's offer...</p>
// //               </div>
// //             ) : (
// //               messages.map((msg, index) => (
// //                 <div 
// //                   key={`msg-${index}`} 
// //                   className={`message ${msg.sender_type}`}
// //                 >
// //                   <div className="message-content">
// //                     {msg.content}
// //                   </div>
// //                   <div className="message-meta">
// //                     <span className="sender">
// //                       {msg.sender_type === 'farmer' ? 'You' : 
// //                        msg.sender_type === 'consumer' ? selectedConsumer.consumer_name : 'System'}
// //                     </span>
// //                     <span className="timestamp">
// //                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                     </span>
// //                   </div>
// //                 </div>
// //               ))
// //             )}
// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* Chat Controls */}
// //           <div className="chat-controls">
// //             {bargainStatus === 'pending' && priceSuggestions.length > 0 && (
// //               <div className="price-suggestions">
// //                 <h4>Respond to Offer:</h4>
// //                 <div className="suggestion-buttons">
// //                   {priceSuggestions.map((suggestion, index) => (
// //                     <button
// //                       key={`price-${index}`}
// //                       onClick={() => handlePriceSelection(suggestion.price)}
// //                       className={`suggestion-btn ${suggestion.amount < 0 ? 'decrease' : 'increase'}`}
// //                       disabled={waitingForResponse}
// //                     >
// //                       <div className="price-change">
// //                         {suggestion.amount < 0 ? (
// //                           <FontAwesomeIcon icon={faArrowDown} />
// //                         ) : (
// //                           <FontAwesomeIcon icon={faArrowUp} />
// //                         )}
// //                         ₹{suggestion.price}
// //                       </div>
// //                       <div className="price-label">{suggestion.label}</div>
// //                     </button>
// //                   ))}
// //                 </div>
                
// //                 <div className="action-buttons">
// //                   <button 
// //                     onClick={handleAccept}
// //                     className="accept-btn"
// //                     disabled={waitingForResponse}
// //                   >
// //                     <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
// //                   </button>
// //                   <button 
// //                     onClick={handleReject}
// //                     className="reject-btn"
// //                     disabled={waitingForResponse}
// //                   >
// //                     <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
// //                   </button>
// //                 </div>
// //               </div>
// //             )}

// //             {waitingForResponse && (
// //               <div className="waiting-indicator">
// //                 <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
// //               </div>
// //             )}

// //             {bargainStatus === 'accepted' && (
// //               <div className="accepted-actions">
// //                 <button 
// //                   className="primary-action"
// //                   onClick={() => navigate('/farmer/orders')}
// //                 >
// //                   View Order Details
// //                 </button>
// //                 <button 
// //                   className="secondary-action"
// //                   onClick={() => navigate('/farmer-dashboard')}
// //                 >
// //                   Back to Dashboard
// //                 </button>
// //               </div>
// //             )}

// //             {bargainStatus === 'rejected' && (
// //               <div className="rejected-actions">
// //                 <button 
// //                   className="secondary-action"
// //                   onClick={() => navigate('/farmer-dashboard')}
// //                 >
// //                   Back to Dashboard
// //                 </button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default FarmerChatWindow;
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useAuth } from "../../context/AuthContext";
// import { io } from 'socket.io-client';
// import {
//   faSpinner,
//   faRupeeSign,
//   faArrowUp,
//   // faArrowDown,
//   faExclamationCircle,
//   faHome,
//   faSyncAlt,
//   faRedo,
//   faCheckCircle,
//   faTimesCircle
// } from '@fortawesome/free-solid-svg-icons';
// import './ConsumerChatWindow.css';

// const FarmerChatWindow = () => {
//   const navigate = useNavigate();
//   const { bargainId } = useParams();
//   const { token } = useAuth();
//   const socket = useRef(null);
//   const messagesEndRef = useRef(null);

//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [bargainStatus, setBargainStatus] = useState('pending');
//   const [waitingForResponse, setWaitingForResponse] = useState(false);
//   const [selectedConsumer, setSelectedConsumer] = useState(null);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [quantity, setQuantity] = useState(0);
//   const [priceSuggestions, setPriceSuggestions] = useState([]);
//   const [error, setError] = useState(null);

//   // Generate 6 increasing price suggestions from consumer's price
//   const generatePriceSuggestions = useCallback((basePrice) => {
//     return Array.from({ length: 6 }, (_, i) => ({
//       amount: i + 1,
//       price: basePrice + (i + 1),
//       label: `Offer ₹${basePrice + (i + 1)}/kg`
//     }));
//   }, []);

//   // Add system messages
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

//   // Fetch messages from database
//   const fetchMessages = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to fetch messages');
//       }

//       const data = await response.json();
//       setMessages(data);
//     } catch (err) {
//       console.error('Error fetching messages:', err);
//       setError(err.message);
//     }
//   };

//   // Save message to database
//   const sendMessageToDb = async (messageData) => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/messages`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify(messageData),
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to save message');
//       }

//       return await response.json();
//     } catch (err) {
//       console.error('Error saving message:', err);
//       throw err;
//     }
//   };

//   // Fetch bargain data
//   // const fetchBargainData = async () => {
//   //   try {
//   //     if (!bargainId || !token) {
//   //       throw new Error("Missing bargain ID or authentication token");
//   //     }

//   //     const response = await fetch(
//   //       `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
//   //       {
//   //         headers: {
//   //           'Authorization': `Bearer ${token}`,
//   //         },
//   //       }
//   //     );

//   //     if (!response.ok) {
//   //       throw new Error(`Server error: ${response.status}`);
//   //     }

//   //     const data = await response.json();

//   //     if (!data.success) {
//   //       throw new Error(data.error || "Failed to fetch bargain data");
//   //     }

//   //     if (data.products && data.products.length > 0) {
//   //       const product = data.products[0];
//   //       setSelectedProduct(product);
        
//   //       // Use consumer's current offer if available, otherwise use base price
//   //       const currentOffer = product.current_offer || product.price_per_kg;
//   //       setCurrentPrice(currentOffer);
//   //       setQuantity(product.quantity || 1);
        
//   //       // Generate price suggestions based on consumer's offer
//   //       const suggestions = generatePriceSuggestions(currentOffer);
//   //       setPriceSuggestions(suggestions);
//   //     }
      
//   //     if (data.consumer) {
//   //       setSelectedConsumer(data.consumer);
//   //     }
      
//   //     setBargainStatus(data.status || 'pending');
      
//   //   } catch (error) {
//   //     setError(error.message || "Failed to load bargain data");
//   //   }
//   // };
//   // Update the fetchBargainData function
//   const fetchBargainData = async () => {
//     try {
//       if (!bargainId || !token) {
//         throw new Error("Missing bargain ID or authentication token");
//       }
  
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           },
//           signal: AbortSignal.timeout(8000) // 8 second timeout
//         }
//       );
  
//       // First verify we got a response
//       if (!response) {
//         throw new Error("No response from server");
//       }
  
//       // Handle HTTP errors
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Server error: ${response.status} - ${errorText || 'No error details'}`);
//       }
  
//       // Verify content type
//       const contentType = response.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         const body = await response.text();
//         throw new Error(`Unexpected content type: ${contentType}. Response: ${body.substring(0, 100)}...`);
//       }
  
//       // Parse JSON
//       const data = await response.json();
  
//       // Validate response structure
//       if (!data || typeof data !== 'object') {
//         throw new Error("Invalid response format from server");
//       }
  
//       // Process successful response
//       if (data.products && data.products.length > 0) {
//         const product = data.products[0];
//         setSelectedProduct(product);
        
//         const currentOffer = product.current_offer || product.price_per_kg;
//         setCurrentPrice(currentOffer);
//         setQuantity(product.quantity || 1);
        
//         const suggestions = generatePriceSuggestions(currentOffer);
//         setPriceSuggestions(suggestions);
//       } else {
//         console.warn("No products found in response", data);
//       }
      
//       if (data.consumer) {
//         setSelectedConsumer(data.consumer);
//       } else {
//         console.warn("No consumer data found in response", data);
//       }
      
//       setBargainStatus(data.status || 'pending');
      
//     } catch (error) {
//       console.error("Bargain data fetch failed:", {
//         bargainId,
//         error: error.message,
//         stack: error.stack
//       });
      
//       // Special handling for empty responses
//       if (error.message.includes("empty response") || 
//           error.message.includes("Unexpected end of JSON")) {
//         throw new Error("The server returned an empty response. The bargain may not exist or you may not have permission to view it.");
//       }
      
//       throw error;
//     }
//   };


//   // Initialize socket connection
//   const initializeSocketConnection = useCallback(() => {
//     if (!bargainId || !token) return;

//     if (socket.current) {
//       socket.current.disconnect();
//     }

//     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
//       auth: { token },
//       query: { bargainId },
//       transports: ['websocket'],
//     });

//     // Connection events
//     socket.current.on('connect', () => {
//       console.log("Socket connected");
//       setConnectionStatus("connected");
//     });

//     socket.current.on('connect_error', (err) => {
//       console.error("Connection error:", err.message);
//       setConnectionStatus("error");
//     });

//     socket.current.on('disconnect', (reason) => {
//       console.log("Socket disconnected:", reason);
//       setConnectionStatus("disconnected");
//     });

//     // Application events
//     socket.current.on('priceUpdate', (data) => {
//       setCurrentPrice(data.newPrice);
//       addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
//       setWaitingForResponse(false);
      
//       // Regenerate price suggestions based on consumer's new price
//       const newSuggestions = generatePriceSuggestions(data.newPrice);
//       setPriceSuggestions(newSuggestions);
//     });

//     socket.current.on('bargainStatusUpdate', (status) => {
//       setBargainStatus(status);
//       if (status === 'accepted') {
//         addSystemMessage("🎉 Consumer accepted your offer!");
//       } else if (status === 'rejected') {
//         addSystemMessage("❌ Consumer declined your offer");
//       }
//       setWaitingForResponse(false);
//     });

//     socket.current.on('newMessage', (message) => {
//       setMessages(prev => [...prev, message]);
//     });

//     socket.current.on('error', (error) => {
//       console.error("Socket error:", error);
//       setError(error.message);
//     });
//   }, [bargainId, token, generatePriceSuggestions]);

//   // Initialize chat (fetch data and connect socket)
//   useEffect(() => {
//     // const initializeChat = async () => {
//     //   try {
//     //     setLoading(true);
//     //     await fetchBargainData();
//     //     await fetchMessages();
//     //     initializeSocketConnection();
//     //   } catch (err) {
//     //     setError(err.message);
//     //   } finally {
//     //     setLoading(false);
//     //   }
//     // };
//     const initializeChat = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         await fetchBargainData();
//         await fetchMessages();
        
//         // Only initialize socket if we have valid data
//         initializeSocketConnection();
        
//       } catch (err) {
//         // Differentiate between network errors and business logic errors
//         if (err.message.includes("Failed to fetch")) {
//           setError("Network error: Please check your internet connection");
//         } else {
//           setError(err.message || "Failed to initialize chat");
//         }
        
//         // Attempt to reconnect after delay if it's a network error
//         if (err.message.includes("Network")) {
//           setTimeout(() => {
//             initializeChat();
//           }, 3000);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     initializeChat();

//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [initializeSocketConnection]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handlePriceSelection = async (price) => {
//     const messageContent = `💰 Counter offered ₹${price}/kg`;
    
//     try {
//       // Save to database first
//       const messageData = {
//         bargain_id: bargainId,
//         bsp_id: selectedProduct.bsp_id,
//         sender_type: "farmer",
//         sender_id: selectedConsumer.consumer_id,
//         content: messageContent,
//         price_offer: price
//       };

//       const savedMessage = await sendMessageToDb(messageData);

//       // Update local state
//       setCurrentPrice(price);
//       setWaitingForResponse(true);
//       setMessages(prev => [...prev, savedMessage]);

//       // Emit socket event
//       if (socket.current && socket.current.connected) {
//         socket.current.emit("bargainMessage", {
//           bargain_id: bargainId,
//           message: {
//             content: messageContent,
//             sender_type: "farmer",
//             timestamp: new Date().toISOString()
//           },
//           recipientType: "consumer",
//           recipientId: selectedConsumer.consumer_id,
//         });

//         socket.current.emit('priceOffer', {
//           price,
//           productId: selectedProduct.product_id,
//           quantity: quantity
//         });
//       }
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleAccept = async () => {
//     const messageContent = "✅ You accepted the offer";
    
//     try {
//       // Save to database
//       const messageData = {
//         bargain_id: bargainId,
//         bsp_id: selectedProduct.bsp_id,
//         sender_type: "farmer",
//         sender_id: selectedConsumer.consumer_id,
//         content: messageContent
//       };

//       await sendMessageToDb(messageData);

//       // Update local state
//       addSystemMessage(messageContent);
//       setBargainStatus('accepted');

//       // Emit socket events
//       if (socket.current && socket.current.connected) {
//         socket.current.emit("bargainStatusUpdate", {
//           bargainId,
//           status: 'accepted'
//         });
        
//         socket.current.emit("bargainMessage", {
//           bargain_id: bargainId,
//           message: {
//             content: messageContent,
//             sender_type: "farmer",
//             timestamp: new Date().toISOString()
//           },
//           recipientType: "consumer",
//           recipientId: selectedConsumer.consumer_id,
//         });
//       }
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleReject = async () => {
//     const messageContent = "❌ You rejected the offer";
    
//     try {
//       // Save to database
//       const messageData = {
//         bargain_id: bargainId,
//         bsp_id: selectedProduct.bsp_id,
//         sender_type: "farmer",
//         sender_id: selectedConsumer.consumer_id,
//         content: messageContent
//       };

//       await sendMessageToDb(messageData);

//       // Update local state
//       addSystemMessage(messageContent);
//       setBargainStatus('rejected');

//       // Emit socket events
//       if (socket.current && socket.current.connected) {
//         socket.current.emit("bargainStatusUpdate", {
//           bargainId,
//           status: 'rejected'
//         });
        
//         socket.current.emit("bargainMessage", {
//           bargain_id: bargainId,
//           message: {
//             content: messageContent,
//             sender_type: "farmer",
//             timestamp: new Date().toISOString()
//           },
//           recipientType: "consumer",
//           recipientId: selectedConsumer.consumer_id,
//         });
//       }
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain session...</p>
//       </div>
//     );
//   }

//   // if (error) {
//   //   return (
//   //     <div className="error-container">
//   //       <h3>Error Loading Bargain</h3>
//   //       <p>{error}</p>
//   //       <button onClick={() => navigate('/farmer-dashboard')}>
//   //         Back to Dashboard
//   //       </button>
//   //     </div>
//   //   );
//   // }
// // Update the error display in your render method
// if (error) {
//   return (
//     <div className="error-container">
//       <div className="error-icon">
//         <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
//       </div>
//       <h3>Couldn't Load Bargain #{bargainId}</h3>
      
//       <div className="error-message">
//         <p>{error}</p>
        
//         {error.includes("empty response") && (
//           <div className="special-notice">
//             <p>This could mean:</p>
//             <ul>
//               <li>The bargain doesn't exist</li>
//               <li>You don't have permission to view it</li>
//               <li>The server encountered an error</li>
//             </ul>
//           </div>
//         )}
//       </div>
      
//       <div className="error-actions">
//         <button 
//           onClick={() => navigate('/farmer-dashboard')}
//           className="action-button primary"
//         >
//           <FontAwesomeIcon icon={faHome} /> Back to Dashboard
//         </button>
//         <button 
//           onClick={() => navigate(`/bargain/${bargainId}`)}
//           className="action-button secondary"
//         >
//           <FontAwesomeIcon icon={faSyncAlt} /> Try Again
//         </button>
//         <button 
//           onClick={() => window.location.reload()}
//           className="action-button tertiary"
//         >
//           <FontAwesomeIcon icon={faRedo} /> Refresh Page
//         </button>
//       </div>
      
//       <div className="debug-info">
//         <p>Bargain ID: {bargainId}</p>
//         <p>Error time: {new Date().toLocaleString()}</p>
//       </div>
//     </div>
//   );
// }
//   return (
//     <div className="bargain-chat-container">
//       {selectedProduct && selectedConsumer && (
//         <div className="chat-interface">
//           {/* Chat Header */}
//           <div className="chat-header">
//             <div className="header-top">
//               <h2>
//                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.consumer_name}
//               </h2>
//               <span className={`connection-status ${connectionStatus}`}>
//                 {connectionStatus.toUpperCase()}
//               </span>
//             </div>
            
//             <div className="product-info">
//               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
//               <p><strong>Quantity:</strong> {quantity}kg</p>
//               <div className="price-display">
//                 <span className="current-price">
//                   <strong>Current:</strong> ₹{currentPrice}/kg
//                 </span>
//                 <span className="base-price">
//                   <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
//                 </span>
//                 <span className="total-price">
//                   <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
//                 </span>
//               </div>
//               {bargainStatus === 'accepted' && (
//                 <p className="status-accepted">
//                   <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
//                 </p>
//               )}
//               {bargainStatus === 'rejected' && (
//                 <p className="status-rejected">
//                   <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Chat Messages */}
//           <div className="chat-messages">
//             {messages.length === 0 ? (
//               <div className="no-messages">
//                 <p>No messages yet. Waiting for consumer's offer...</p>
//               </div>
//             ) : (
//               messages.map((msg, index) => (
//                 <div 
//                   key={`msg-${index}`} 
//                   className={`message ${msg.sender_type}`}
//                 >
//                   <div className="message-content">
//                     {msg.content}
//                   </div>
//                   <div className="message-meta">
//                     <span className="sender">
//                       {msg.sender_type === 'farmer' ? 'You' : 
//                        msg.sender_type === 'consumer' ? selectedConsumer.consumer_name : 'System'}
//                     </span>
//                     <span className="timestamp">
//                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Chat Controls */}
//           <div className="chat-controls">
//             {bargainStatus === 'pending' && priceSuggestions.length > 0 && (
//               <div className="price-suggestions">
//                 <h4>Make a Counter Offer:</h4>
//                 <div className="suggestion-buttons">
//                   {priceSuggestions.map((suggestion, index) => (
//                     <button
//                       key={`price-${index}`}
//                       onClick={() => handlePriceSelection(suggestion.price)}
//                       className="suggestion-btn increase"
//                       disabled={waitingForResponse}
//                     >
//                       <div className="price-change">
//                         <FontAwesomeIcon icon={faArrowUp} />
//                         ₹{suggestion.price}
//                       </div>
//                       <div className="price-label">{suggestion.label}</div>
//                     </button>
//                   ))}
//                 </div>
                
//                 <div className="action-buttons">
//                   <button 
//                     onClick={handleAccept}
//                     className="accept-btn"
//                     disabled={waitingForResponse}
//                   >
//                     <FontAwesomeIcon icon={faCheckCircle} /> Accept Consumer's Offer
//                   </button>
//                   <button 
//                     onClick={handleReject}
//                     className="reject-btn"
//                     disabled={waitingForResponse}
//                   >
//                     <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
//                   </button>
//                 </div>
//               </div>
//             )}

//             {waitingForResponse && (
//               <div className="waiting-indicator">
//                 <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
//               </div>
//             )}

//             {bargainStatus === 'accepted' && (
//               <div className="accepted-actions">
//                 <button 
//                   className="primary-action"
//                   onClick={() => navigate('/farmer/orders')}
//                 >
//                   View Order Details
//                 </button>
//                 <button 
//                   className="secondary-action"
//                   onClick={() => navigate('/farmer-dashboard')}
//                 >
//                   Back to Dashboard
//                 </button>
//               </div>
//             )}

//             {bargainStatus === 'rejected' && (
//               <div className="rejected-actions">
//                 <button 
//                   className="secondary-action"
//                   onClick={() => navigate('/farmer-dashboard')}
//                 >
//                   Back to Dashboard
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FarmerChatWindow;