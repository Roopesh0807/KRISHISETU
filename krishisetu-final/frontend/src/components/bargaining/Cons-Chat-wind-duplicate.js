// // // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // // import { useAuth } from "../../context/AuthContext";
// // // // // import { io } from 'socket.io-client';
// // // // // import {
// // // // //   faSpinner,
// // // // //   faRupeeSign,
// // // // //   faArrowUp,
// // // // //   faArrowDown,
// // // // //   faTimes,
// // // // //   faHandshake
// // // // // } from '@fortawesome/free-solid-svg-icons';
// // // // // import './ConsumerChatWindow.css';

// // // // // const BargainChatWindow = () => {
// // // // //   const navigate = useNavigate();
// // // // //   const { bargainId } = useParams();
// // // // //   const { token, consumer } = useAuth();
// // // // //   const location = useLocation();
// // // // //   const socket = useRef(null);
// // // // //   const messagesEndRef = useRef(null);
// // // // //   // const reconnectAttempts = useRef(0);

// // // // //   // Extract initial state from location
// // // // //   const { 
// // // // //     product: initialProduct, 
// // // // //     farmer: initialFarmer, 
// // // // //     quantity: initialQuantity 
// // // // //   } = location.state || {};

// // // // //   // State management
// // // // //   const [messages, setMessages] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [currentPrice, setCurrentPrice] = useState(initialProduct?.price_per_kg || 0);
// // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // //   const [bargainStatus, setBargainStatus] = useState('pending'); // pending, accepted, rejected, completed
// // // // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // // // //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// // // // //   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
// // // // //   const [selectedFarmer] = useState(initialFarmer || null);
// // // // //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // //   const [error, setError] = useState(null);
// // // // //   const [, setInitialPrice] = useState(0);

// // // // //   // WebSocket connection management
// // // // //   const initializeSocketConnection = useCallback(() => {
// // // // //     if (!bargainId || !token) {
// // // // //       console.error("Missing bargainId or token for WebSocket connection");
// // // // //       return;
// // // // //     }
  
// // // // //     // Close existing connection if any
// // // // //     if (socket.current) {
// // // // //       socket.current.disconnect();
// // // // //       socket.current = null;
// // // // //     }
  
// // // // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // // //       auth: {
// // // // //         token: token // Make sure this is your valid JWT token
// // // // //       },
// // // // //       query: { bargainId },
// // // // //       transports: ['websocket'],
// // // // //       withCredentials: true,
// // // // //       extraHeaders: {
// // // // //         Authorization: `Bearer ${token}` // Fallback header
// // // // //       }
// // // // //     });
// // // // //     // Connection events
// // // // //     socket.current.on('connect', () => {
// // // // //       console.log("Socket connected");
// // // // //       setConnectionStatus("connected");
// // // // //     });
  
// // // // //     socket.current.on('connect_error', (err) => {
// // // // //       console.error("Connection error:", err.message);
// // // // //       setConnectionStatus("error");
// // // // //       // Attempt reconnection after delay
// // // // //       setTimeout(() => initializeSocketConnection(), 2000);
// // // // //     });
  
// // // // //     socket.current.on('disconnect', (reason) => {
// // // // //       console.log("Socket disconnected:", reason);
// // // // //       setConnectionStatus("disconnected");
// // // // //     });
  
// // // // //     // Application events
// // // // //     socket.current.on('priceUpdate', (data) => {
// // // // //       setCurrentPrice(data.newPrice);
// // // // //       setMessages(prev => [...prev, {
// // // // //         content: `Farmer updated price to ₹${data.newPrice}/kg`,
// // // // //         sender_type: "system",
// // // // //         timestamp: new Date().toISOString()
// // // // //       }]);
// // // // //       setWaitingForResponse(false);
// // // // //     });
  
// // // // //     socket.current.on('bargainStatusUpdate', (status) => {
// // // // //       setBargainStatus(status);
// // // // //       if (status === 'accepted') {
// // // // //         setMessages(prev => [...prev, {
// // // // //           content: "🎉 Farmer accepted your offer!",
// // // // //           sender_type: "system",
// // // // //           timestamp: new Date().toISOString()
// // // // //         }]);
// // // // //       }
// // // // //       setWaitingForResponse(false);
// // // // //     });
  
// // // // //     socket.current.on('newMessage', (message) => {
// // // // //       setMessages(prev => [...prev, message]);
// // // // //       if (message.sender_type === 'farmer') {
// // // // //         setWaitingForResponse(false);
// // // // //       }
// // // // //     });
  
// // // // //     socket.current.on('error', (error) => {
// // // // //       console.error("Socket error:", error);
// // // // //       setError(error.message);
// // // // //     });
  
// // // // //     return () => {
// // // // //       if (socket.current) {
// // // // //         socket.current.disconnect();
// // // // //       }
// // // // //     };
// // // // //   }, [bargainId, token]);

// // // // //   // Helper function to add system messages
// // // // //   const addSystemMessage = (content) => {
// // // // //     setMessages(prev => [
// // // // //       ...prev,
// // // // //       {
// // // // //         content,
// // // // //         sender_type: "system",
// // // // //         timestamp: new Date().toISOString()
// // // // //       }
// // // // //     ]);
// // // // //   };

// // // // //   // Initialize socket connection on mount
// // // // //   useEffect(() => {
// // // // //     initializeSocketConnection();
// // // // //     return () => {
// // // // //       if (socket.current) {
// // // // //         socket.current.disconnect();
// // // // //       }
// // // // //     };
// // // // //   }, [initializeSocketConnection]);

// // // // //   // useEffect(() => {
// // // // //   //   const fetchBargainData = async () => {
// // // // //   //     try {
// // // // //   //       console.log("🔐 Fetching with token:", token);
  
// // // // //   //       const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`, {
// // // // //   //         method: 'GET',
// // // // //   //         headers: {
// // // // //   //           'Content-Type': 'application/json',
// // // // //   //            Authorization: `Bearer ${token}`,
// // // // //   //         },
// // // // //   //       });
  
// // // // //   //       if (!response.ok) {
// // // // //   //         const errorText = await response.text();
// // // // //   //         console.error("❌ Server responded with an error:", errorText);
// // // // //   //         throw new Error(`HTTP error! Status: ${response.status}`);
// // // // //   //       }
  
// // // // //   //       const data = await response.json();
// // // // //   //       console.log("✅ Bargain data:", data);
  
// // // // //   //       const session = data.session;
// // // // //   //       setMessages(session.messages || []);
// // // // //   //       setCurrentPrice(session.price_per_kg || initialProduct?.price_per_kg || 0);
// // // // //   //       setBargainStatus(session.status || 'pending');
  
// // // // //   //     } catch (error) {
// // // // //   //       console.error("❌ Error fetching bargain data:", error.message);
// // // // //   //       setError(error.message);
// // // // //   //     } finally {
// // // // //   //       setLoading(false);
// // // // //   //     }
// // // // //   //   };
  
// // // // //   //   if (bargainId && token) {
// // // // //   //     fetchBargainData();
// // // // //   //   }
// // // // //   // }, [bargainId, token, initialProduct]);
  
// // // // //   useEffect(() => {
// // // // //     const fetchBargainData = async () => {
// // // // //       try {
// // // // //         if (!bargainId || !token) {
// // // // //           throw new Error("Missing bargain ID or authentication token");
// // // // //         }
  
// // // // //         console.log("🔐 Fetching bargain data for ID:", bargainId);
  
// // // // //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`, {
// // // // //           method: 'GET',
// // // // //           headers: {
// // // // //             'Content-Type': 'application/json',
// // // // //             'Authorization': `Bearer ${token}`,
// // // // //           },
// // // // //         });
  
// // // // //         const contentType = response.headers.get('content-type');
// // // // //         const rawText = await response.text();
  
// // // // //         console.log("📨 Raw response:", rawText);
// // // // //         console.log("📨 Response content-type:", contentType);
  
// // // // //         if (!response.ok) {
// // // // //           console.error("❌ Server error:", {
// // // // //             status: response.status,
// // // // //             statusText: response.statusText,
// // // // //             body: rawText
// // // // //           });
// // // // //           throw new Error(`Server error: ${response.status} - ${rawText || 'No error details'}`);
// // // // //         }
  
// // // // //         if (!rawText) {
// // // // //           throw new Error("Received empty response body");
// // // // //         }
  
// // // // //         if (!contentType || !contentType.includes('application/json')) {
// // // // //           throw new Error(`Expected JSON but got ${contentType}. Response: ${rawText}`);
// // // // //         }
  
// // // // //         let data;
// // // // //         try {
// // // // //           data = JSON.parse(rawText);
// // // // //         } catch (parseError) {
// // // // //           console.error("❌ JSON parse error:", parseError);
// // // // //           throw new Error("Failed to parse JSON from server");
// // // // //         }
  
// // // // //         console.log("✅ Bargain data received:", data);
  
// // // // //         if (!data.success) {
// // // // //           throw new Error(data.error || "Failed to fetch bargain data");
// // // // //         }
  
// // // // //         const { session } = data;
  
// // // // //         if (!session) {
// // // // //           throw new Error("No session data received from server");
// // // // //         }
  
// // // // //         setMessages(session.messages || []);
// // // // //         setCurrentPrice(
// // // // //           session.current_price ||
// // // // //           session.initial_price ||
// // // // //           initialProduct?.price_per_kg ||
// // // // //           0
// // // // //         );
// // // // //         setInitialPrice(
// // // // //           session.initial_price ||
// // // // //           initialProduct?.price_per_kg ||
// // // // //           0
// // // // //         );
// // // // //         setBargainStatus(session.status || 'pending');
// // // // //       } catch (error) {
// // // // //         console.error("❌ Error in fetchBargainData:", {
// // // // //           message: error.message,
// // // // //           stack: error.stack
// // // // //         });
// // // // //         setError(error.message || "Failed to load bargain data");
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };
  
// // // // //     fetchBargainData();
// // // // //   }, [bargainId, token, initialProduct]);
  
// // // // //   // Auto-scroll to bottom when messages change
// // // // //   useEffect(() => {
// // // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // // //   }, [messages]);

// // // // //   // Handle bargain initiation
// // // // //   // const handleBargainConfirm = async () => {
// // // // //   //   setError(null);
// // // // //   //   setIsLoading(true);
// // // // //   //   setWaitingForResponse(true);

// // // // //   //   try {
// // // // //   //     if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// // // // //   //       throw new Error("Please select a product and valid quantity");
// // // // //   //     }

// // // // //   //     if (!token) {
// // // // //   //       navigate('/login', { state: { from: location.pathname } });
// // // // //   //       return;
// // // // //   //     }

// // // // //   //     if (socket.current && socket.current.connected) {
// // // // //   //       socket.current.emit('initBargain', {
// // // // //   //         product: selectedProduct,
// // // // //   //         quantity,
// // // // //   //         initialPrice: selectedProduct.price_per_kg,
// // // // //   //         farmer: selectedFarmer,
// // // // //   //         consumerName: consumer?.name || 'Consumer'
// // // // //   //       });

// // // // //   //       addSystemMessage(`You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name}`);
// // // // //   //       setIsBargainPopupOpen(false);
// // // // //   //     }
// // // // //   //   } catch (error) {
// // // // //   //     setError(error.message);
// // // // //   //     setWaitingForResponse(false);
// // // // //   //   } finally {
// // // // //   //     setIsLoading(false);
// // // // //   //   }
// // // // //   // };
// // // // // // Handle bargain initiation
// // // // // const handleBargainConfirm = async () => {
// // // // //   setError(null);
// // // // //   setWaitingForResponse(false); // Don't show loader immediately

// // // // //   try {
// // // // //     if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// // // // //       throw new Error("Please select a product and valid quantity");
// // // // //     }

// // // // //     if (!token) {
// // // // //       navigate('/login', { state: { from: location.pathname } });
// // // // //       return;
// // // // //     }

// // // // //     // First show the message immediately
// // // // //     addSystemMessage(`You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name}`);
// // // // //     setIsBargainPopupOpen(false);

// // // // //     // Then initiate the bargain (show loader only if it takes time)
// // // // //     if (socket.current && socket.current.connected) {
// // // // //       setIsLoading(true);
// // // // //       socket.current.emit('initBargain', {
// // // // //         product: selectedProduct,
// // // // //         quantity,
// // // // //         initialPrice: selectedProduct.price_per_kg,
// // // // //         farmer: selectedFarmer,
// // // // //         consumerName: consumer?.name || 'Consumer'
// // // // //       });
// // // // //     }
// // // // //   } catch (error) {
// // // // //     setError(error.message);
// // // // //   } finally {
// // // // //     setIsLoading(false);
// // // // //   }
// // // // // };
// // // // //   // Handle price offer
// // // // //   // const handleMakeOffer = (price) => {
// // // // //   //   if (socket.current && socket.current.connected) {
// // // // //   //     socket.current.emit('priceOffer', {
// // // // //   //       price,
// // // // //   //       productId: selectedProduct?.product_id,
// // // // //   //       quantity
// // // // //   //     });

// // // // //   //     addSystemMessage(`You offered ₹${price}/kg for ${quantity}kg`);
// // // // //   //     setCurrentPrice(price);
// // // // //   //     setWaitingForResponse(true);
// // // // //   //   }
// // // // //   // };
// // // // // // Handle price offer
// // // // // const handleMakeOffer = (price) => {
// // // // //   if (socket.current && socket.current.connected) {
// // // // //     // First show the message immediately
// // // // //     addSystemMessage(`You offered ₹${price}/kg for ${quantity}kg`);
// // // // //     setCurrentPrice(price);
    
// // // // //     // Then send the offer (show loader only if waiting for response)
// // // // //     setWaitingForResponse(true);
// // // // //     socket.current.emit('priceOffer', {
// // // // //       price,
// // // // //       productId: selectedProduct?.product_id,
// // // // //       quantity
// // // // //     });
// // // // //   }
// // // // // };
// // // // //   // Render loading state
// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="loading-container">
// // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // //         <p>Loading bargain session...</p>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   // Render error state
// // // // //   // if (error) {
// // // // //   //   return (
// // // // //   //     <div className="error-container">
// // // // //   //       <h3>Error Loading Bargain</h3>
// // // // //   //       <p>{error}</p>
// // // // //   //       <button onClick={() => window.location.reload()}>Retry</button>
// // // // //   //     </div>
// // // // //   //   );
// // // // //   // }

// // // // //   return (
// // // // //     <div className="bargain-chat-container">
// // // // //       {/* Bargain Initiation Popup */}
// // // // //       {isBargainPopupOpen && selectedFarmer && (
// // // // //         <div className="bargain-initiation-popup">
// // // // //           <div className="popup-content">
// // // // //             <button onClick={() => navigate(-1)} className="close-btn">
// // // // //               <FontAwesomeIcon icon={faTimes} />
// // // // //             </button>
// // // // //             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
            
// // // // //             <div className="form-group">
// // // // //               <label>Select Product</label>
// // // // //               <select
// // // // //                 value={selectedProduct?.produce_name || ''}
// // // // //                 onChange={(e) => {
// // // // //                   const product = selectedFarmer.products.find(
// // // // //                     p => p.produce_name === e.target.value
// // // // //                   );
// // // // //                   setSelectedProduct(product || null);
// // // // //                   if (product) setCurrentPrice(product.price_per_kg);
// // // // //                 }}
// // // // //               >
// // // // //                 <option value="">Select a product</option>
// // // // //                 {selectedFarmer.products?.map(product => (
// // // // //                   <option key={product.product_id} value={product.produce_name}>
// // // // //                     {product.produce_name} (₹{product.price_per_kg}/kg)
// // // // //                   </option>
// // // // //                 ))}
// // // // //               </select>
// // // // //             </div>
            
// // // // //             <div className="form-group">
// // // // //               <label>Quantity (kg)</label>
// // // // //               <input
// // // // //                 type="number"
// // // // //                 min="1"
// // // // //                 max={selectedProduct?.availability || 100}
// // // // //                 value={quantity}
// // // // //                 onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
// // // // //               />
// // // // //             </div>
            
// // // // //             <div className="current-price-display">
// // // // //               Current Price: ₹{selectedProduct?.price_per_kg || 0}/kg
// // // // //             </div>
            
// // // // //             {error && <div className="error-message">{error}</div>}
            
// // // // //             <button
// // // // //               onClick={handleBargainConfirm}
// // // // //               disabled={!selectedProduct || isLoading}
// // // // //               className="confirm-btn"
// // // // //             >
// // // // //               {isLoading ? (
// // // // //                 <FontAwesomeIcon icon={faSpinner} spin />
// // // // //               ) : (
// // // // //                 <FontAwesomeIcon icon={faHandshake} />
// // // // //               )}
// // // // //               Start Bargaining
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* Chat Header */}
// // // // //       <div className="chat-header">
// // // // //         <div className="header-top">
// // // // //           <h2>
// // // // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
// // // // //           </h2>
// // // // //           <span className={`connection-status ${connectionStatus}`}>
// // // // //             {connectionStatus.toUpperCase()}
// // // // //           </span>
// // // // //         </div>
        
// // // // //         <div className="product-info">
// // // // //           {selectedProduct && (
// // // // //             <>
// // // // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // // // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // // // //               <p className="current-price">
// // // // //                 <strong>Current Price:</strong> ₹{currentPrice}/kg
// // // // //               </p>
// // // // //               {bargainStatus === 'accepted' && (
// // // // //                 <p className="status-accepted">Offer Accepted!</p>
// // // // //               )}
// // // // //               {bargainStatus === 'rejected' && (
// // // // //                 <p className="status-rejected">Offer Declined</p>
// // // // //               )}
// // // // //             </>
// // // // //           )}
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Chat Messages */}
// // // // //       <div className="chat-messages">
// // // // //         {messages.length === 0 ? (
// // // // //           <div className="no-messages">
// // // // //             <p>No messages yet. Start the negotiation!</p>
// // // // //           </div>
// // // // //         ) : (
// // // // //           messages.map((msg, index) => (
// // // // //             <div key={`msg-${index}`} className={`message ${msg.sender_type}`}>
// // // // //               <div className="message-content">
// // // // //                 {msg.message_type === 'offer' && `Offered ₹${msg.price}`}
// // // // //                 {msg.message_type === 'accept' && `Accepted ₹${msg.price}`}
// // // // //                 {msg.message_type === 'reject' && `Rejected ₹${msg.price}`}
// // // // //               </div>

// // // // //               <div className="message-meta">
// // // // //                 <span className="sender">
// // // // //                   {msg.sender_type === 'consumer' ? 'You' : 
// // // // //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// // // // //                 </span>
// // // // //                 <span className="timestamp">
// // // // //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // // // //                 </span>
// // // // //               </div>
// // // // //             </div>
// // // // //           ))
// // // // //         )}
// // // // //         <div ref={messagesEndRef} />
// // // // //       </div>

// // // // //       {/* Chat Controls */}
// // // // //       {/* <div className="chat-controls">
// // // // //         {bargainStatus === 'pending' && selectedProduct && messages.length > 0 && (
// // // // //           <div className="price-suggestions">
// // // // //             <h4>Make an Offer:</h4>
// // // // //             <div className="suggestion-buttons">
// // // // //               {[1, 2, 3, 5].map(amount => (
// // // // //                 <button 
// // // // //                   key={`decrease-${amount}`} 
// // // // //                   onClick={() => handleMakeOffer(currentPrice - amount)}
// // // // //                   disabled={currentPrice - amount <= 0 || waitingForResponse}
// // // // //                 >
// // // // //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
// // // // //                 </button>
// // // // //               ))}
// // // // //               {[1, 2, 3].map(amount => (
// // // // //                 <button 
// // // // //                   key={`increase-${amount}`} 
// // // // //                   onClick={() => handleMakeOffer(currentPrice + amount)}
// // // // //                   disabled={waitingForResponse}
// // // // //                 >
// // // // //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
// // // // //                 </button>
// // // // //               ))}
// // // // //             </div>
// // // // //           </div>
// // // // //         )}

// // // // //         {waitingForResponse && (
// // // // //           <div className="waiting-indicator">
// // // // //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
// // // // //           </div>
// // // // //         )}

// // // // //         {bargainStatus === 'accepted' && (
// // // // //           <div className="accepted-actions">
// // // // //             <button className="primary-action" onClick={() => navigate('/checkout')}>
// // // // //               Proceed to Checkout
// // // // //             </button>
// // // // //             <button className="secondary-action" onClick={() => navigate('/')}>
// // // // //               Continue Shopping
// // // // //             </button>
// // // // //           </div>
// // // // //         )}
// // // // //       </div> */}
// // // // //       {/* Chat Controls */}
// // // // // <div className="chat-controls">
// // // // //   {bargainStatus === 'pending' && 
// // // // //    selectedProduct && 
// // // // //    messages.length > 0 && 
// // // // //    messages.some(m => m.sender_type === 'consumer') && (
// // // // //     <div className="price-suggestions">
// // // // //       <h4>Make an Offer:</h4>
// // // // //       <div className="suggestion-buttons">
// // // // //         {[1, 2, 3, 5].map(amount => (
// // // // //           <button 
// // // // //             key={`decrease-${amount}`} 
// // // // //             onClick={() => handleMakeOffer(currentPrice - amount)}
// // // // //             disabled={currentPrice - amount <= 0 || waitingForResponse}
// // // // //           >
// // // // //             <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
// // // // //           </button>
// // // // //         ))}
// // // // //         {[1, 2, 3].map(amount => (
// // // // //           <button 
// // // // //             key={`increase-${amount}`} 
// // // // //             onClick={() => handleMakeOffer(currentPrice + amount)}
// // // // //             disabled={waitingForResponse}
// // // // //           >
// // // // //             <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
// // // // //           </button>
// // // // //         ))}
// // // // //       </div>
// // // // //     </div>
// // // // //   )}

// // // // //   {waitingForResponse && (
// // // // //     <div className="waiting-indicator">
// // // // //       <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's response...
// // // // //     </div>
// // // // //   )}
// // // // // </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default BargainChatWindow;
// // // // // // import React, { useState, useEffect, useRef,useCallback } from 'react';
// // // // // // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // // // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // // // import { useAuth } from "../../context/AuthContext";
// // // // // // import { io } from 'socket.io-client';
// // // // // // // import { initializeWebSocket, sendWebSocketMessage, closeWebSocket } from "../../utils/websocket"; // ✅ Import WebSocket utils
// // // // // // import { 
// // // // // //   faSpinner, 
// // // // // //   // faPaperPlane, 
// // // // // //   faRupeeSign,
// // // // // //   faArrowUp,
// // // // // //   faArrowDown,
// // // // // //   faTimes,
// // // // // //   faHandshake
// // // // // // } from '@fortawesome/free-solid-svg-icons';
// // // // // // import './ConsumerChatWindow.css';

// // // // // // const BargainChatWindow = () => {
// // // // // //   const navigate = useNavigate();
// // // // // //   const { bargainId } = useParams();
// // // // // //   const { token, consumer } = useAuth();
// // // // // //   const location = useLocation();
// // // // // //   const socket = useRef(null); // ✅ controlled by us

 
// // // // // //   const messagesEndRef = useRef(null);
// // // // // //   const reconnectAttempts = useRef(0);

// // // // // //   const { product: initialProduct, farmer: initialFarmer, quantity: initialQuantity } = location.state || {};
  
// // // // // //   // State
// // // // // //   const [messages, setMessages] = useState([]);
// // // // // //   // const [newMessage, setNewMessage] = useState('');
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [currentPrice, setCurrentPrice] = useState(initialProduct?.price_per_kg);
// // // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // // //   const [bargainAccepted, setBargainAccepted] = useState(false);
// // // // // //   const [waitingForReply, setWaitingForReply] = useState(false);
// // // // // //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// // // // // //   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
// // // // // //   const [selectedFarmer] = useState(initialFarmer || null);
// // // // // //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // //   const [error, setError] = useState(null);
 
  
// // // // // //   const initializeWebSocket = useCallback(() => {
// // // // // //     if (!bargainId || !token) {
// // // // // //       console.error("❌ Missing bargainId or token. WebSocket not initialized.");
// // // // // //       return;
// // // // // //     }
  
// // // // // //     const wsUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${encodeURIComponent(token)}`;
// // // // // //     console.log(`🔄 Connecting WebSocket to: ${wsUrl}`);
  
// // // // // //     // Close existing WebSocket before creating a new one
// // // // // //     if (socket.current) {
// // // // // //       console.log("🔴 Closing existing WebSocket before reconnecting...");
// // // // // //       socket.current.close();
// // // // // //       socket.current = null;
// // // // // //     }
  
// // // // // //     socket.current = new WebSocket(wsUrl);
  
// // // // // //     socket.current.onopen = () => {
// // // // // //       console.log("✅ WebSocket connected!");
// // // // // //       setConnectionStatus("connected");
// // // // // //       reconnectAttempts.current = 0;
// // // // // //     };
  
// // // // // //     socket.current.onerror = (error) => {
// // // // // //       console.error("🚨 WebSocket Error:", error);
// // // // // //       setConnectionStatus("error");
// // // // // //     };
  
// // // // // //     socket.current.onclose = (event) => {
// // // // // //       console.warn("⚠️ WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
// // // // // //       setConnectionStatus("disconnected");
  
// // // // // //       if (event.code === 1000) return;
  
// // // // // //       const maxAttempts = 2;
// // // // // //       if (reconnectAttempts.current < maxAttempts) {
// // // // // //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// // // // // //         reconnectAttempts.current += 1;
// // // // // //         console.log(`♻️ Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current}/${maxAttempts})`);
// // // // // //         setTimeout(() => initializeWebSocket(), delay);
// // // // // //       } else {
// // // // // //         console.error("❌ Max reconnection attempts reached. Please refresh the page.");
// // // // // //       }
// // // // // //     };
  
// // // // // //     socket.current.onmessage = (event) => {
// // // // // //       try {
// // // // // //         const data = JSON.parse(event.data);
// // // // // //         console.log("📩 WebSocket Message Received:", data);
  
// // // // // //         switch (data.type) {
// // // // // //           case "PRICE_UPDATE":
// // // // // //             setCurrentPrice(data.newPrice);
// // // // // //             setMessages((prev) => [
// // // // // //               ...prev,
// // // // // //               {
// // // // // //                 content: `Farmer updated price to ₹${data.newPrice}/kg`,
// // // // // //                 sender_type: "system",
// // // // // //                 timestamp: new Date().toISOString(),
// // // // // //               },
// // // // // //             ]);
// // // // // //             setWaitingForReply(false);
// // // // // //             break;
  
// // // // // //           case "BARGAIN_ACCEPTED":
// // // // // //             setBargainAccepted(true);
// // // // // //             setWaitingForReply(false);
// // // // // //             setMessages((prev) => [
// // // // // //               ...prev,
// // // // // //               {
// // // // // //                 content: "🎉 Farmer accepted your offer!",
// // // // // //                 sender_type: "system",
// // // // // //                 timestamp: new Date().toISOString(),
// // // // // //               },
// // // // // //             ]);
// // // // // //             break;
  
// // // // // //           case "MESSAGE":
// // // // // //             setMessages((prev) => [...prev, data.message]);
// // // // // //             if (data.message.sender_type === "farmer") {
// // // // // //               setWaitingForReply(false);
// // // // // //             }
// // // // // //             break;
  
// // // // // //           default:
// // // // // //             console.warn("⚠️ Unknown message type:", data.type);
// // // // // //         }
// // // // // //       } catch (error) {
// // // // // //         console.error("❌ Error parsing WebSocket message:", error);
// // // // // //       }
// // // // // //     };
// // // // // //   }, [bargainId, token]);
  
  
  
// // // // // //   useEffect(() => {
// // // // // //     if (!bargainId || !token || socket.current) return;
  
// // // // // //     console.log("📡 Initializing WebSocket...");
// // // // // //     socket.current = io("http://localhost:5000", {
// // // // // //       auth: { token },
// // // // // //     });
  
// // // // // //     socket.current.on("connect", () => {
// // // // // //       console.log("✅ Connected to WebSocket");
// // // // // //     });
  
// // // // // //     socket.current.on("bargainMessage", (data) => {
// // // // // //       console.log("📩 Message received:", data);
// // // // // //       // Handle message here
// // // // // //     });
  
// // // // // //     socket.current.on("disconnect", () => {
// // // // // //       console.warn("⚠️ Socket disconnected");
// // // // // //     });
  
// // // // // //     return () => {
// // // // // //       if (socket.current) {
// // // // // //         console.log("🔴 Closing WebSocket...");
// // // // // //         socket.current.disconnect();
// // // // // //         socket.current = null;
// // // // // //       }
// // // // // //     };
// // // // // //   }, [bargainId, token]);
  

// // // // // //   // Load initial messages
// // // // // //   useEffect(() => {
// // // // // //     const fetchMessages = async () => {
// // // // // //       try {
// // // // // //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
// // // // // //           headers: {
// // // // // //             'Authorization': `Bearer ${localStorage.getItem('token')}`
// // // // // //           }
// // // // // //         });
// // // // // //         const data = await response.json();
// // // // // //         setMessages(data.messages || []);
// // // // // //         if (data.currentPrice) setCurrentPrice(data.currentPrice);
        
// // // // // //         if (data.messages?.length > 0) {
// // // // // //           setIsBargainPopupOpen(false);
// // // // // //         }
// // // // // //       } catch (error) {
// // // // // //         console.error("Error fetching messages:", error);
// // // // // //       } finally {
// // // // // //         setLoading(false);
// // // // // //       }
// // // // // //     };

// // // // // //     if (bargainId) {
// // // // // //       fetchMessages();
// // // // // //     }
// // // // // //   }, [bargainId]);

// // // // // //   // Auto-scroll to bottom when messages change
// // // // // //   useEffect(() => {
// // // // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // // // //   }, [messages]);

// // // // // //   const handleBargainConfirm = async () => {
// // // // // //     setError(null);
// // // // // //     setIsLoading(true);
// // // // // //     setWaitingForReply(true);

// // // // // //     try {
// // // // // //       if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// // // // // //         throw new Error("Please select a product and valid quantity");
// // // // // //       }

// // // // // //       if (!consumer?.token) {
// // // // // //         navigate('/login', { state: { from: location.pathname } });
// // // // // //         return;
// // // // // //       }

// // // // // //       if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // // // // //         const bargainMessage = {
// // // // // //           type: 'INIT_BARGAIN',
// // // // // //           product: selectedProduct,
// // // // // //           quantity,
// // // // // //           initialPrice: selectedProduct.price_per_kg,
// // // // // //           farmer: selectedFarmer,
// // // // // //           consumerName: consumer.name
// // // // // //         };
// // // // // //         socket.current.send(JSON.stringify(bargainMessage));
// // // // // //       }

// // // // // //       setMessages(prev => [...prev, {
// // // // // //         content: `You sent an bargain request for ${quantity}kg of ${selectedProduct.produce_name}`,
// // // // // //         sender_type: 'consumer',
// // // // // //         timestamp: new Date().toISOString()
// // // // // //       }]);

// // // // // //       setIsBargainPopupOpen(false);
// // // // // //     } catch (error) {
// // // // // //       setError(error.message);
// // // // // //       setWaitingForReply(false);
// // // // // //     } finally {
// // // // // //       setIsLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const handleMakeOffer = (price) => {
// // // // // //     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // // // // //       socket.current.send(JSON.stringify({
// // // // // //         type: "PRICE_OFFER",
// // // // // //         price,
// // // // // //         productId: selectedProduct.product_id,
// // // // // //         quantity,
// // // // // //       }));
// // // // // //     }

// // // // // //     setMessages(prev => [...prev, { 
// // // // // //       content: `You offered ₹${price}/kg for ${quantity}kg`, 
// // // // // //       sender_type: "consumer", 
// // // // // //       timestamp: new Date().toISOString() 
// // // // // //     }]);
// // // // // //     setCurrentPrice(price);
// // // // // //   };

// // // // // //   // const handleSendMessage = () => {
// // // // // //   //   if (!newMessage.trim() || !socket.current || socket.current.readyState !== WebSocket.OPEN) return;

// // // // // //   //   const message = {
// // // // // //   //     type: 'MESSAGE',
// // // // // //   //     content: newMessage,
// // // // // //   //     sender_type: 'consumer',
// // // // // //   //     timestamp: new Date().toISOString()
// // // // // //   //   };
    
// // // // // //   //   socket.current.send(JSON.stringify(message));
// // // // // //   //   setMessages(prev => [...prev, message]);
// // // // // //   //   setNewMessage('');
// // // // // //   // };

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="loading-container">
// // // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // // //         <p>Loading bargain session...</p>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="bargain-chat-container">
// // // // // //       {isBargainPopupOpen && selectedFarmer && (
// // // // // //         <div className="bargain-initiation-popup">
// // // // // //           <div className="popup-content">
// // // // // //             <button onClick={() => navigate(-1)} className="close-btn">
// // // // // //               <FontAwesomeIcon icon={faTimes} />
// // // // // //             </button>
// // // // // //             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
// // // // // //             <div className="form-group">
// // // // // //               <label>Select Product</label>
// // // // // //               <select
// // // // // //                 value={selectedProduct?.produce_name || ''}
// // // // // //                 onChange={(e) => {
// // // // // //                   const product = selectedFarmer.products.find(
// // // // // //                     p => p.produce_name === e.target.value
// // // // // //                   );
// // // // // //                   setSelectedProduct(product || null);
// // // // // //                   if (product) setCurrentPrice(product.price_per_kg);
// // // // // //                 }}
// // // // // //               >
// // // // // //                 <option value="">Select a product</option>
// // // // // //                 {selectedFarmer.products?.map(product => (
// // // // // //                   <option key={product.product_id} value={product.produce_name}>
// // // // // //                     {product.produce_name} (₹{product.price_per_kg}/kg)
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>
            
// // // // // //             <div className="form-group">
// // // // // //               <label>Quantity (kg)</label>
// // // // // //               <input
// // // // // //                 type="number"
// // // // // //                 min="1"
// // // // // //                 max={selectedProduct?.availability || 100}
// // // // // //                 value={quantity}
// // // // // //                 onChange={(e) => setQuantity(Math.max(1, e.target.value))}
// // // // // //               />
// // // // // //             </div>
            
// // // // // //             <div className="current-price-display">
// // // // // //               Current Price: ₹{selectedProduct?.price_per_kg || 0}/kg
// // // // // //             </div>
// // // // // //             {error && <div className="error-message">{error}</div>}
// // // // // //             <button
// // // // // //               onClick={handleBargainConfirm}
// // // // // //               disabled={!selectedProduct || isLoading}
// // // // // //               className="confirm-btn"
// // // // // //             >
// // // // // //               {isLoading ? (
// // // // // //                 <FontAwesomeIcon icon={faSpinner} spin />
// // // // // //               ) : (
// // // // // //                 <FontAwesomeIcon icon={faHandshake} />
// // // // // //               )}
// // // // // //               Start Bargaining
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       )}

// // // // // //       <div className="chat-header">
// // // // // //         <div className="header-top">
// // // // // //           <h2>
// // // // // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
// // // // // //           </h2>
// // // // // //           <span className={`connection-status ${connectionStatus}`}>
// // // // // //             {connectionStatus.toUpperCase()}
// // // // // //           </span>
// // // // // //         </div>
// // // // // //         <div className="product-info">
// // // // // //           {selectedProduct && (
// // // // // //             <>
// // // // // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // // // // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // // // // //               <p className="current-price">
// // // // // //                 <strong>Current Price:</strong> ₹{currentPrice}/kg
// // // // // //               </p>
// // // // // //             </>
// // // // // //           )}
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       <div className="chat-messages">
// // // // // //         {messages.length === 0 ? (
// // // // // //           <div className="no-messages">
// // // // // //             <p>No messages yet. Start the negotiation!</p>
// // // // // //           </div>
// // // // // //         ) : (
// // // // // //           messages.map((msg, index) => (
// // // // // //             <div key={index} className={`message ${msg.sender_type}`}>
// // // // // //               <div className="message-content">{msg.content}</div>
// // // // // //               <div className="message-meta">
// // // // // //                 <span className="sender">
// // // // // //                   {msg.sender_type === 'consumer' ? 'You' : 
// // // // // //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// // // // // //                 </span>
// // // // // //                 <span className="timestamp">
// // // // // //                   {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // //                 </span>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           ))
// // // // // //         )}
// // // // // //         <div ref={messagesEndRef} />
// // // // // //       </div>

// // // // // //       <div className="chat-controls">
// // // // // //         {!bargainAccepted && selectedProduct && messages.length > 0 && !waitingForReply && (
// // // // // //           <div className="price-suggestions">
// // // // // //             <h4>Make an Offer:</h4>
// // // // // //             <div className="suggestion-buttons">
// // // // // //               {[1, 2, 3, 5].map(amount => (
// // // // // //                 <button 
// // // // // //                   key={`decrease-${amount}`} 
// // // // // //                   onClick={() => handleMakeOffer(currentPrice - amount)}
// // // // // //                   disabled={currentPrice - amount <= 0}
// // // // // //                 >
// // // // // //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
// // // // // //                 </button>
// // // // // //               ))}
// // // // // //               {[1, 2, 3].map(amount => (
// // // // // //                 <button 
// // // // // //                   key={`increase-${amount}`} 
// // // // // //                   onClick={() => handleMakeOffer(currentPrice + amount)}
// // // // // //                 >
// // // // // //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
// // // // // //                 </button>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {waitingForReply && (
// // // // // //           <div className="waiting-indicator">
// // // // // //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's reply...
// // // // // //           </div>
// // // // // //         )}

// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default BargainChatWindow;
// // // // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // // // import { useParams, useNavigate, useLocation } from 'react-router-dom';
// // // // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // // // import { useAuth } from "../../context/AuthContext";
// // // // // // import { 
// // // // // //   faSpinner, 
// // // // // //   faRupeeSign,
// // // // // //   faArrowUp,
// // // // // //   faArrowDown,
// // // // // //   faTimes,
// // // // // //   faHandshake
// // // // // // } from '@fortawesome/free-solid-svg-icons';
// // // // // // import './ConsumerChatWindow.css';

// // // // // // const BargainChatWindow = () => {
// // // // // //   const navigate = useNavigate();
// // // // // //   const { bargainId } = useParams();
// // // // // //   const { token, consumer } = useAuth();
// // // // // //   const location = useLocation();
// // // // // //   const socket = useRef(null);
  
// // // // // //   const messagesEndRef = useRef(null);
// // // // // //   const reconnectAttempts = useRef(0);

// // // // // //   const { product: initialProduct, farmer: initialFarmer, quantity: initialQuantity } = location.state || {};
  
// // // // // //   // State
// // // // // //   const [messages, setMessages] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [currentPrice, setCurrentPrice] = useState(null);
// // // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // // //   const [bargainAccepted, setBargainAccepted] = useState(false);
// // // // // //   const [waitingForReply, setWaitingForReply] = useState(false);
// // // // // //   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
// // // // // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // // // // //   const [selectedFarmer] = useState(initialFarmer || null);
// // // // // //   const [quantity, setQuantity] = useState(initialQuantity || 1);
// // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // //   const [error, setError] = useState(null);
 
// // // // // //   const initializeWebSocket = useCallback(() => {
// // // // // //     if (!bargainId || !token) {
// // // // // //       console.error("❌ Missing bargainId or token. WebSocket not initialized.");
// // // // // //       return;
// // // // // //     }
  
// // // // // //     const wsUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${encodeURIComponent(token)}`;
// // // // // //     console.log(`🔄 Connecting WebSocket to: ${wsUrl}`);
  
// // // // // //     if (socket.current) {
// // // // // //       console.log("🔴 Closing existing WebSocket before reconnecting...");
// // // // // //       socket.current.close();
// // // // // //       socket.current = null;
// // // // // //     }
  
// // // // // //     socket.current = new WebSocket(wsUrl);
  
// // // // // //     socket.current.onopen = () => {
// // // // // //       console.log("✅ WebSocket connected!");
// // // // // //       setConnectionStatus("connected");
// // // // // //       reconnectAttempts.current = 0;
// // // // // //     };
  
// // // // // //     socket.current.onerror = (error) => {
// // // // // //       console.error("🚨 WebSocket Error:", error);
// // // // // //       setConnectionStatus("error");
// // // // // //     };
  
// // // // // //     socket.current.onclose = (event) => {
// // // // // //       console.warn("⚠️ WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
// // // // // //       setConnectionStatus("disconnected");
  
// // // // // //       if (event.code === 1000) return;
  
// // // // // //       const maxAttempts = 5;
// // // // // //       if (reconnectAttempts.current < maxAttempts) {
// // // // // //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// // // // // //         reconnectAttempts.current += 1;
// // // // // //         console.log(`♻️ Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current}/${maxAttempts})`);
// // // // // //         setTimeout(() => initializeWebSocket(), delay);
// // // // // //       } else {
// // // // // //         console.error("❌ Max reconnection attempts reached. Please refresh the page.");
// // // // // //       }
// // // // // //     };
  
// // // // // //     socket.current.onmessage = (event) => {
// // // // // //       try {
// // // // // //         const data = JSON.parse(event.data);
// // // // // //         console.log("📩 WebSocket Message Received:", data);
  
// // // // // //         switch (data.type) {
// // // // // //           case "PRICE_UPDATE":
// // // // // //             setCurrentPrice(data.newPrice);
// // // // // //             setMessages((prev) => [
// // // // // //               ...prev,
// // // // // //               {
// // // // // //                 content: `Farmer updated price to ₹${data.newPrice}/kg`,
// // // // // //                 sender_type: "system",
// // // // // //                 timestamp: new Date().toISOString(),
// // // // // //               },
// // // // // //             ]);
// // // // // //             setWaitingForReply(false);
// // // // // //             break;
  
// // // // // //           case "BARGAIN_ACCEPTED":
// // // // // //             setBargainAccepted(true);
// // // // // //             setWaitingForReply(false);
// // // // // //             setMessages((prev) => [
// // // // // //               ...prev,
// // // // // //               {
// // // // // //                 content: "🎉 Farmer accepted your offer!",
// // // // // //                 sender_type: "system",
// // // // // //                 timestamp: new Date().toISOString(),
// // // // // //               },
// // // // // //             ]);
// // // // // //             break;
  
// // // // // //           case "MESSAGE":
// // // // // //             setMessages((prev) => [...prev, data.message]);
// // // // // //             if (data.message.sender_type === "farmer") {
// // // // // //               setWaitingForReply(false);
// // // // // //             }
// // // // // //             break;
  
// // // // // //           default:
// // // // // //             console.warn("⚠️ Unknown message type:", data.type);
// // // // // //         }
// // // // // //       } catch (error) {
// // // // // //         console.error("❌ Error parsing WebSocket message:", error);
// // // // // //       }
// // // // // //     };
// // // // // //   }, [bargainId, token]);
  
// // // // // //   useEffect(() => {
// // // // // //     if (!bargainId || !token) return;
  
// // // // // //     console.log("📡 Initializing WebSocket...");
// // // // // //     initializeWebSocket();
  
// // // // // //     return () => {
// // // // // //       if (socket.current) {
// // // // // //         console.log("🔴 Closing WebSocket...");
// // // // // //         socket.current.close();
// // // // // //         socket.current = null;
// // // // // //       }
// // // // // //     };
// // // // // //   }, [bargainId, initializeWebSocket, token]);

// // // // // //   // Load initial messages
// // // // // //   useEffect(() => {
// // // // // //     const fetchMessages = async () => {
// // // // // //       try {
// // // // // //         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
// // // // // //           headers: {
// // // // // //             'Authorization': `Bearer ${localStorage.getItem('token')}`
// // // // // //           }
// // // // // //         });
// // // // // //         const data = await response.json();
// // // // // //         setMessages(data.messages || []);
// // // // // //         if (data.currentPrice) setCurrentPrice(data.currentPrice);
        
// // // // // //         if (data.messages?.length > 0) {
// // // // // //           setIsBargainPopupOpen(false);
// // // // // //         }
// // // // // //       } catch (error) {
// // // // // //         console.error("Error fetching messages:", error);
// // // // // //       } finally {
// // // // // //         setLoading(false);
// // // // // //       }
// // // // // //     };

// // // // // //     if (bargainId) {
// // // // // //       fetchMessages();
// // // // // //     }
// // // // // //   }, [bargainId]);

// // // // // //   // Auto-scroll to bottom when messages change
// // // // // //   useEffect(() => {
// // // // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // // // //   }, [messages]);

// // // // // //   const handleBargainConfirm = async () => {
// // // // // //     setError(null);
// // // // // //     setIsLoading(true);
// // // // // //     setWaitingForReply(true);

// // // // // //     try {
// // // // // //       if (!selectedProduct || !selectedFarmer || quantity <= 0) {
// // // // // //         throw new Error("Please select a product and valid quantity");
// // // // // //       }

// // // // // //       if (!consumer?.token) {
// // // // // //         navigate('/login', { state: { from: location.pathname } });
// // // // // //         return;
// // // // // //       }

// // // // // //       if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // // // // //         const bargainMessage = {
// // // // // //           type: 'INIT_BARGAIN',
// // // // // //           product: selectedProduct,
// // // // // //           quantity,
// // // // // //           initialPrice: selectedProduct.price_per_kg,
// // // // // //           farmer: selectedFarmer,
// // // // // //           consumerName: consumer.name
// // // // // //         };
// // // // // //         socket.current.send(JSON.stringify(bargainMessage));
// // // // // //       }

// // // // // //       setMessages(prev => [...prev, {
// // // // // //         content: `You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name} at ₹${selectedProduct.price_per_kg}/kg`,
// // // // // //         sender_type: 'consumer',
// // // // // //         timestamp: new Date().toISOString()
// // // // // //       }]);

// // // // // //       setIsBargainPopupOpen(false);
// // // // // //     } catch (error) {
// // // // // //       setError(error.message);
// // // // // //       setWaitingForReply(false);
// // // // // //     } finally {
// // // // // //       setIsLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const handleMakeOffer = (price) => {
// // // // // //     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
// // // // // //       socket.current.send(JSON.stringify({
// // // // // //         type: "PRICE_OFFER",
// // // // // //         price,
// // // // // //         productId: selectedProduct.product_id,
// // // // // //         quantity,
// // // // // //       }));
// // // // // //     }

// // // // // //     setMessages(prev => [...prev, { 
// // // // // //       content: `You offered ₹${price}/kg for ${quantity}kg of ${selectedProduct.produce_name}`, 
// // // // // //       sender_type: "consumer", 
// // // // // //       timestamp: new Date().toISOString() 
// // // // // //     }]);
// // // // // //     setCurrentPrice(price);
// // // // // //   };

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="loading-container">
// // // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // // //         <p>Loading bargain session...</p>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="bargain-chat-container">
// // // // // //       {isBargainPopupOpen && selectedFarmer && (
// // // // // //         <div className="bargain-initiation-popup">
// // // // // //           <div className="popup-content">
// // // // // //             <button onClick={() => navigate(-1)} className="close-btn">
// // // // // //               <FontAwesomeIcon icon={faTimes} />
// // // // // //             </button>
// // // // // //             <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
// // // // // //             <div className="form-group">
// // // // // //               <label>Select Product</label>
// // // // // //               <select
// // // // // //                 value={selectedProduct?.produce_name || ''}
// // // // // //                 onChange={(e) => {
// // // // // //                   const product = selectedFarmer.products.find(
// // // // // //                     p => p.produce_name === e.target.value
// // // // // //                   );
// // // // // //                   setSelectedProduct(product || null);
// // // // // //                   if (product) {
// // // // // //                     setCurrentPrice(product.price_per_kg);
// // // // // //                     setQuantity(1); // Reset quantity when product changes
// // // // // //                   }
// // // // // //                 }}
// // // // // //               >
// // // // // //                 <option value="">Select a product</option>
// // // // // //                 {selectedFarmer.products?.map(product => (
// // // // // //                   <option key={product.product_id} value={product.produce_name}>
// // // // // //                     {product.produce_name} (₹{product.price_per_kg}/kg)
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>
            
// // // // // //             {selectedProduct && (
// // // // // //               <>
// // // // // //                 <div className="product-details">
// // // // // //                   <p><strong>Category:</strong> {selectedProduct.category}</p>
// // // // // //                   <p><strong>Availability:</strong> {selectedProduct.availability} kg</p>
// // // // // //                 </div>
                
// // // // // //                 <div className="form-group">
// // // // // //                   <label>Quantity (kg)</label>
// // // // // //                   <input
// // // // // //                     type="number"
// // // // // //                     min="1"
// // // // // //                     max={selectedProduct.availability}
// // // // // //                     value={quantity}
// // // // // //                     onChange={(e) =>
// // // // // //                       setQuantity(
// // // // // //                         Math.max(1, Math.min(selectedProduct.availability, Number(e.target.value)))
// // // // // //                       )
// // // // // //                     }
// // // // // //                   />

// // // // // //                   <small>Max: {selectedProduct.availability} kg</small>
// // // // // //                 </div>
// // // // // //               </>
// // // // // //             )}
            
// // // // // //             <div className="current-price-display">
// // // // // //               {selectedProduct ? (
// // // // // //                 <>
// // // // // //                   <p>Product Price: ₹{selectedProduct.price_per_kg}/kg</p>
// // // // // //                   <p>Total for {quantity}kg: ₹{(selectedProduct.price_per_kg * quantity).toFixed(2)}</p>
// // // // // //                 </>
// // // // // //               ) : (
// // // // // //                 <p>Please select a product</p>
// // // // // //               )}
// // // // // //             </div>
// // // // // //             {error && <div className="error-message">{error}</div>}
// // // // // //             <button
// // // // // //               onClick={handleBargainConfirm}
// // // // // //               disabled={!selectedProduct || isLoading}
// // // // // //               className="confirm-btn"
// // // // // //             >
// // // // // //               {isLoading ? (
// // // // // //                 <FontAwesomeIcon icon={faSpinner} spin />
// // // // // //               ) : (
// // // // // //                 <FontAwesomeIcon icon={faHandshake} />
// // // // // //               )}
// // // // // //               Start Bargaining
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       )}

// // // // // //       <div className="chat-header">
// // // // // //         <div className="header-top">
// // // // // //           <h2>
// // // // // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
// // // // // //           </h2>
// // // // // //           <span className={`connection-status ${connectionStatus}`}>
// // // // // //             {connectionStatus.toUpperCase()}
// // // // // //           </span>
// // // // // //         </div>
// // // // // //         <div className="product-info">
// // // // // //           {selectedProduct && (
// // // // // //             <>
// // // // // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // // // // //               <p><strong>Category:</strong> {selectedProduct.category}</p>
// // // // // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // // // // //               <p className="current-price">
// // // // // //                 <strong>Current Price:</strong> ₹{currentPrice || selectedProduct.price_per_kg}/kg
// // // // // //               </p>
// // // // // //               <p className="total-price">
// // // // // //                 <strong>Total:</strong> ₹{(quantity * (currentPrice || selectedProduct.price_per_kg)).toFixed(2)}
// // // // // //               </p>
// // // // // //             </>
// // // // // //           )}
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       <div className="chat-messages">
// // // // // //         {messages.length === 0 ? (
// // // // // //           <div className="no-messages">
// // // // // //             <p>No messages yet. Start the negotiation!</p>
// // // // // //           </div>
// // // // // //         ) : (
// // // // // //           messages.map((msg, index) => (
// // // // // //             <div key={index} className={`message ${msg.sender_type}`}>
// // // // // //               <div className="message-content">{msg.content}</div>
// // // // // //               <div className="message-meta">
// // // // // //                 <span className="sender">
// // // // // //                   {msg.sender_type === 'consumer' ? 'You' : 
// // // // // //                    msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
// // // // // //                 </span>
// // // // // //                 <span className="timestamp">
// // // // // //                   {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // //                 </span>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           ))
// // // // // //         )}
// // // // // //         <div ref={messagesEndRef} />
// // // // // //       </div>

// // // // // //       <div className="chat-controls">
// // // // // //         {!bargainAccepted && selectedProduct && messages.length > 0 && !waitingForReply && (
// // // // // //           <div className="price-suggestions">
// // // // // //             <h4>Make an Offer (Current: ₹{currentPrice || selectedProduct.price_per_kg}/kg):</h4>
// // // // // //             <div className="suggestion-buttons">
// // // // // //               {[1, 2, 3, 5].map(amount => (
// // // // // //                 <button 
// // // // // //                   key={`decrease-${amount}`} 
// // // // // //                   onClick={() => handleMakeOffer((currentPrice || selectedProduct.price_per_kg) - amount)}
// // // // // //                   disabled={(currentPrice || selectedProduct.price_per_kg) - amount <= 0}
// // // // // //                 >
// // // // // //                   <FontAwesomeIcon icon={faArrowDown} /> ₹{(currentPrice || selectedProduct.price_per_kg) - amount}
// // // // // //                 </button>
// // // // // //               ))}
// // // // // //               {[1, 2, 3].map(amount => (
// // // // // //                 <button 
// // // // // //                   key={`increase-${amount}`} 
// // // // // //                   onClick={() => handleMakeOffer((currentPrice || selectedProduct.price_per_kg) + amount)}
// // // // // //                 >
// // // // // //                   <FontAwesomeIcon icon={faArrowUp} /> ₹{(currentPrice || selectedProduct.price_per_kg) + amount}
// // // // // //                 </button>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {waitingForReply && (
// // // // // //           <div className="waiting-indicator">
// // // // // //             <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's reply...
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default BargainChatWindow;









































// // // // // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // // // // import { useAuth } from "../../context/AuthContext";
// // // // // // // import { io } from 'socket.io-client';
// // // // // // // import {
// // // // // // //   faSpinner,
// // // // // // //   faRupeeSign,
// // // // // // //   faArrowUp,
// // // // // // //   faArrowDown,
// // // // // // //   faCheckCircle,
// // // // // // //   faTimesCircle,
// // // // // // //   faHandshake,
// // // // // // //   faPaperPlane
// // // // // // // } from '@fortawesome/free-solid-svg-icons';
// // // // // // // import './FarmerChatWindow.css';

// // // // // // // const FarmerChatWindow = () => {
// // // // // // //   const navigate = useNavigate();
// // // // // // //   const { bargainId } = useParams();
// // // // // // //   const { token } = useAuth();
// // // // // // //   const socket = useRef(null);
// // // // // // //   const messagesEndRef = useRef(null);

// // // // // // //   // State management
// // // // // // //   const [messages, setMessages] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // //   const [currentPrice, setCurrentPrice] = useState(0);
// // // // // // //   const [basePrice, setBasePrice] = useState(0);
// // // // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // // // //   const [bargainStatus, setBargainStatus] = useState('pending');
// // // // // // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // // // // // //   const [product, setProduct] = useState(null);
// // // // // // //   const [consumerDetails, setConsumerDetails] = useState({});
// // // // // // //   const [quantity, setQuantity] = useState(0);
// // // // // // //   const [newMessage, setNewMessage] = useState('');
// // // // // // //   const [isTyping, setIsTyping] = useState(false);
// // // // // // //   const [error, setError] = useState(null);

// // // // // // //   // Fetch bargain data
// // // // // // //   const fetchBargainData = useCallback(async () => {
// // // // // // //     try {
// // // // // // //       setLoading(true);
// // // // // // //       setError(null);
      
// // // // // // //       if (!bargainId || !token) {
// // // // // // //         throw new Error("Missing required parameters");
// // // // // // //       }

// // // // // // //       const response = await fetch(
// // // // // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`,
// // // // // // //         {
// // // // // // //           headers: {
// // // // // // //             'Authorization': `Bearer ${token}`,
// // // // // // //           },
// // // // // // //         }
// // // // // // //       );

// // // // // // //       if (!response.ok) {
// // // // // // //         const errorText = await response.text();
// // // // // // //         throw new Error(errorText || `HTTP error! status: ${response.status}`);
// // // // // // //       }

// // // // // // //       const data = await response.json();
      
// // // // // // //       if (!data || !data.session) {
// // // // // // //         throw new Error("Invalid response format");
// // // // // // //       }

// // // // // // //       // Set state from the response
// // // // // // //       setMessages(data.session.messages || []);
// // // // // // //       setCurrentPrice(data.session.current_price || 0);
// // // // // // //       setBasePrice(data.session.product?.price_per_kg || 0);
// // // // // // //       setProduct(data.session.product || null);
// // // // // // //       setConsumerDetails(data.session.consumer || {});
// // // // // // //       setQuantity(data.session.quantity || 0);
// // // // // // //       setBargainStatus(data.session.status || 'pending');

// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error loading bargain data:", error);
// // // // // // //       setError(error.message);
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   }, [bargainId, token]);

// // // // // // //   // WebSocket connection
// // // // // // //   const initializeSocketConnection = useCallback(() => {
// // // // // // //     if (!bargainId || !token) return;

// // // // // // //     if (socket.current) {
// // // // // // //       socket.current.disconnect();
// // // // // // //     }

// // // // // // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // // // // //       auth: { token },
// // // // // // //       query: { bargainId },
// // // // // // //       transports: ['websocket'],
// // // // // // //       reconnection: true,
// // // // // // //       reconnectionAttempts: 5,
// // // // // // //       reconnectionDelay: 1000,
// // // // // // //     });

// // // // // // //     // Connection events
// // // // // // //     socket.current.on('connect', () => {
// // // // // // //       setConnectionStatus("connected");
// // // // // // //       socket.current.emit('joinBargain', { bargainId });
// // // // // // //     });

// // // // // // //     socket.current.on('connect_error', (err) => {
// // // // // // //       setConnectionStatus("error");
// // // // // // //       console.error("Connection error:", err);
// // // // // // //     });

// // // // // // //     socket.current.on('disconnect', () => {
// // // // // // //       setConnectionStatus("disconnected");
// // // // // // //     });

// // // // // // //     // Application events
// // // // // // //     socket.current.on('priceUpdate', (data) => {
// // // // // // //       setCurrentPrice(data.newPrice);
// // // // // // //       addSystemMessage(`Price updated to ₹${data.newPrice}/kg`);
// // // // // // //       setWaitingForResponse(false);
// // // // // // //     });

// // // // // // //     socket.current.on('bargainStatusUpdate', (status) => {
// // // // // // //       setBargainStatus(status);
// // // // // // //       addSystemMessage(status === 'accepted' ? "🎉 Bargain accepted!" : "❌ Bargain rejected");
// // // // // // //       setWaitingForResponse(false);
// // // // // // //     });

// // // // // // //     socket.current.on('newMessage', (message) => {
// // // // // // //       setMessages(prev => [...prev, message]);
// // // // // // //       if (message.sender_type === 'consumer') {
// // // // // // //         setWaitingForResponse(false);
// // // // // // //       }
// // // // // // //     });

// // // // // // //     socket.current.on('typing', (typing) => {
// // // // // // //       setIsTyping(typing);
// // // // // // //     });

// // // // // // //     return () => {
// // // // // // //       if (socket.current) {
// // // // // // //         socket.current.disconnect();
// // // // // // //       }
// // // // // // //     };
// // // // // // //   }, [bargainId, token]);

// // // // // // //   // Initialize on mount
// // // // // // //   useEffect(() => {
// // // // // // //     fetchBargainData();
// // // // // // //     initializeSocketConnection();
// // // // // // //   }, [fetchBargainData, initializeSocketConnection]);

// // // // // // //   // Auto-scroll to bottom
// // // // // // //   useEffect(() => {
// // // // // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // // // // //   }, [messages]);

// // // // // // //   // Helper functions
// // // // // // //   const addSystemMessage = (content) => {
// // // // // // //     setMessages(prev => [...prev, {
// // // // // // //       content,
// // // // // // //       sender_type: "system",
// // // // // // //       timestamp: new Date().toISOString()
// // // // // // //     }]);
// // // // // // //   };

// // // // // // //   const handleSendMessage = () => {
// // // // // // //     if (!newMessage.trim() || !socket.current?.connected) return;

// // // // // // //     const message = {
// // // // // // //       content: newMessage,
// // // // // // //       sender_type: "farmer",
// // // // // // //       timestamp: new Date().toISOString()
// // // // // // //     };

// // // // // // //     socket.current.emit('bargainMessage', {
// // // // // // //       bargain_id: bargainId,
// // // // // // //       message,
// // // // // // //       recipientType: "consumer",
// // // // // // //       recipientId: consumerDetails.id,
// // // // // // //     });

// // // // // // //     setMessages(prev => [...prev, message]);
// // // // // // //     setNewMessage('');
// // // // // // //   };

// // // // // // //   const handleMakeOffer = (price) => {
// // // // // // //     if (!socket.current?.connected) return;

// // // // // // //     const messageContent = `💰 Offering ₹${price}/kg`;
// // // // // // //     addSystemMessage(messageContent);
// // // // // // //     setCurrentPrice(price);
// // // // // // //     setWaitingForResponse(true);

// // // // // // //     socket.current.emit('priceOffer', {
// // // // // // //       price,
// // // // // // //       productId: product?.product_id,
// // // // // // //       quantity
// // // // // // //     });

// // // // // // //     socket.current.emit('bargainMessage', {
// // // // // // //       bargain_id: bargainId,
// // // // // // //       message: {
// // // // // // //         content: messageContent,
// // // // // // //         sender_type: "farmer",
// // // // // // //         timestamp: new Date().toISOString()
// // // // // // //       },
// // // // // // //       recipientType: "consumer",
// // // // // // //       recipientId: consumerDetails.id,
// // // // // // //     });
// // // // // // //   };

// // // // // // //   const handleBargainResponse = (response) => {
// // // // // // //     if (!socket.current?.connected) return;

// // // // // // //     const messageContent = response ? "🎉 Accepted offer!" : "❌ Declined offer";
// // // // // // //     addSystemMessage(messageContent);
// // // // // // //     setWaitingForResponse(true);

// // // // // // //     socket.current.emit('bargainResponse', {
// // // // // // //       response,
// // // // // // //       bargainId
// // // // // // //     });

// // // // // // //     socket.current.emit('bargainMessage', {
// // // // // // //       bargain_id: bargainId,
// // // // // // //       message: {
// // // // // // //         content: messageContent,
// // // // // // //         sender_type: "farmer",
// // // // // // //         timestamp: new Date().toISOString()
// // // // // // //       },
// // // // // // //       recipientType: "consumer",
// // // // // // //       recipientId: consumerDetails.id,
// // // // // // //     });
// // // // // // //   };

// // // // // // //   if (loading) {
// // // // // // //     return (
// // // // // // //       <div className="loading-container">
// // // // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // // // //         <p>Loading bargain session...</p>
// // // // // // //       </div>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   if (error) {
// // // // // // //     return (
// // // // // // //       <div className="error-container">
// // // // // // //         <h3>Error Loading Chat</h3>
// // // // // // //         <p>{error}</p>
// // // // // // //         <button onClick={() => window.location.reload()}>Retry</button>
// // // // // // //       </div>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   return (
// // // // // // //     <div className="chat-window-container">
// // // // // // //       <div className="chat-header">
// // // // // // //         <button className="back-button" onClick={() => navigate(-1)}>
// // // // // // //           &larr; Back
// // // // // // //         </button>
// // // // // // //         <div className="header-info">
// // // // // // //           <h2>
// // // // // // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerDetails.name || "Consumer"}
// // // // // // //           </h2>
// // // // // // //           <div className="product-details">
// // // // // // //             {product && (
// // // // // // //               <>
// // // // // // //                 <span>{product.produce_name} ({quantity}kg)</span>
// // // // // // //                 <span>Base: ₹{basePrice}/kg</span>
// // // // // // //               </>
// // // // // // //             )}
// // // // // // //             <span className={`connection-status ${connectionStatus}`}>
// // // // // // //               {connectionStatus}
// // // // // // //             </span>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>

// // // // // // //       <div className="chat-messages">
// // // // // // //         {messages.length === 0 ? (
// // // // // // //           <div className="no-messages">
// // // // // // //             <p>Start the conversation with the consumer</p>
// // // // // // //           </div>
// // // // // // //         ) : (
// // // // // // //           messages.map((msg, index) => (
// // // // // // //             <div 
// // // // // // //               key={`msg-${index}`} 
// // // // // // //               className={`message ${msg.sender_type}`}
// // // // // // //             >
// // // // // // //               <div className="message-content">
// // // // // // //                 {msg.content}
// // // // // // //               </div>
// // // // // // //               <div className="message-meta">
// // // // // // //                 <span className="sender">
// // // // // // //                   {msg.sender_type === 'farmer' ? 'You' : 
// // // // // // //                    msg.sender_type === 'consumer' ? consumerDetails.name : 'System'}
// // // // // // //                 </span>
// // // // // // //                 <span className="timestamp">
// // // // // // //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // // // // // //                 </span>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           ))
// // // // // // //         )}
// // // // // // //         {isTyping && (
// // // // // // //           <div className="typing-indicator">
// // // // // // //             <div className="typing-dots">
// // // // // // //               <div></div>
// // // // // // //               <div></div>
// // // // // // //               <div></div>
// // // // // // //             </div>
// // // // // // //             <span>{consumerDetails.name || 'Consumer'} is typing...</span>
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //         <div ref={messagesEndRef} />
// // // // // // //       </div>

// // // // // // //       <div className="price-display">
// // // // // // //         <div className="price-item">
// // // // // // //           <span>Current Price:</span>
// // // // // // //           <span>₹{currentPrice}/kg</span>
// // // // // // //         </div>
// // // // // // //         <div className="price-item">
// // // // // // //           <span>Total:</span>
// // // // // // //           <span>₹{(quantity * currentPrice).toFixed(2)}</span>
// // // // // // //         </div>
// // // // // // //         {bargainStatus === 'accepted' && (
// // // // // // //           <div className="status-accepted">
// // // // // // //             <FontAwesomeIcon icon={faCheckCircle} /> Accepted
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //         {bargainStatus === 'rejected' && (
// // // // // // //           <div className="status-rejected">
// // // // // // //             <FontAwesomeIcon icon={faTimesCircle} /> Rejected
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //       </div>

// // // // // // //       <div className="message-input">
// // // // // // //         <input
// // // // // // //           type="text"
// // // // // // //           value={newMessage}
// // // // // // //           onChange={(e) => {
// // // // // // //             setNewMessage(e.target.value);
// // // // // // //             socket.current?.emit('typing', e.target.value.length > 0);
// // // // // // //           }}
// // // // // // //           placeholder="Type your message..."
// // // // // // //           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
// // // // // // //         />
// // // // // // //         <button onClick={handleSendMessage}>
// // // // // // //           <FontAwesomeIcon icon={faPaperPlane} />
// // // // // // //         </button>
// // // // // // //       </div>

// // // // // // //       {bargainStatus === 'pending' && (
// // // // // // //         <div className="bargain-controls">
// // // // // // //           <div className="price-buttons">
// // // // // // //             <button 
// // // // // // //               onClick={() => handleMakeOffer(currentPrice + 1)}
// // // // // // //               disabled={waitingForResponse}
// // // // // // //             >
// // // // // // //               <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + 1}
// // // // // // //             </button>
// // // // // // //             <button 
// // // // // // //               onClick={() => handleMakeOffer(Math.max(1, currentPrice - 1))}
// // // // // // //               disabled={waitingForResponse || currentPrice <= 1}
// // // // // // //             >
// // // // // // //               <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 1}
// // // // // // //             </button>
// // // // // // //           </div>
// // // // // // //           <div className="action-buttons">
// // // // // // //             <button 
// // // // // // //               onClick={() => handleBargainResponse(true)}
// // // // // // //               disabled={waitingForResponse}
// // // // // // //             >
// // // // // // //               <FontAwesomeIcon icon={faHandshake} /> Accept
// // // // // // //             </button>
// // // // // // //             <button 
// // // // // // //               onClick={() => handleBargainResponse(false)}
// // // // // // //               disabled={waitingForResponse}
// // // // // // //             >
// // // // // // //               <FontAwesomeIcon icon={faTimesCircle} /> Reject
// // // // // // //             </button>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       )}

// // // // // // //       {waitingForResponse && (
// // // // // // //         <div className="waiting-indicator">
// // // // // // //           <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
// // // // // // //         </div>
// // // // // // //       )}
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default FarmerChatWindow;
// // // // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // // // import { useAuth } from "../../context/AuthContext";
// // // // // // import { io } from 'socket.io-client';
// // // // // // import {
// // // // // //   faSpinner,
// // // // // //   faRupeeSign,
// // // // // //   faArrowUp,
// // // // // //   faArrowDown,
// // // // // //   faCheckCircle,
// // // // // //   faTimesCircle,
// // // // // //   faHandshake,
// // // // // //   faPaperPlane
// // // // // // } from '@fortawesome/free-solid-svg-icons';
// // // // // // import './FarmerChatWindow.css';

// // // // // // const FarmerChatWindow = () => {
// // // // // //   const navigate = useNavigate();
// // // // // //   const { bargainId } = useParams();
// // // // // //   const { token } = useAuth();
// // // // // //   const socket = useRef(null);
// // // // // //   const messagesEndRef = useRef(null);

// // // // // //   // State management
// // // // // //   const [messages, setMessages] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [currentPrice, setCurrentPrice] = useState(0);
// // // // // //   const [basePrice, setBasePrice] = useState(0);
// // // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // // //   const [bargainStatus, setBargainStatus] = useState('pending');
// // // // // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // // // // //   const [product, setProduct] = useState(null);
// // // // // //   const [consumerDetails, setConsumerDetails] = useState({});
// // // // // //   const [quantity, setQuantity] = useState(0);
// // // // // //   const [newMessage, setNewMessage] = useState('');
// // // // // //   const [isTyping, setIsTyping] = useState(false);
// // // // // //   const [error, setError] = useState(null);

// // // // // //   // Fetch bargain data from both tables
// // // // // //   const fetchBargainData = useCallback(async () => {
// // // // // //     try {
// // // // // //       setLoading(true);
// // // // // //       setError(null);
      
// // // // // //       if (!bargainId || !token) {
// // // // // //         throw new Error("Missing bargain ID or authentication token");
// // // // // //       }

// // // // // //       // First fetch the bargain session
// // // // // //       const sessionResponse = await fetch(
// // // // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// // // // // //         {
// // // // // //           headers: {
// // // // // //             'Authorization': `Bearer ${token}`,
// // // // // //           },
// // // // // //         }
// // // // // //       );

// // // // // //       if (!sessionResponse.ok) {
// // // // // //         const errorText = await sessionResponse.text();
// // // // // //         throw new Error(`Failed to fetch bargain session: ${errorText || sessionResponse.status}`);
// // // // // //       }

// // // // // //       const sessionData = await sessionResponse.json();
// // // // // //       if (!sessionData || !sessionData.session) {
// // // // // //         throw new Error("No session data received from server");
// // // // // //       }

// // // // // //       // Then fetch the product details if available
// // // // // //       let productData = { product: null };
// // // // // //       if (sessionData.session.product_id) {
// // // // // //         const productResponse = await fetch(
// // // // // //           `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/product`,
// // // // // //           {
// // // // // //             headers: {
// // // // // //               'Authorization': `Bearer ${token}`,
// // // // // //             },
// // // // // //           }
// // // // // //         );

// // // // // //         if (productResponse.ok) {
// // // // // //           productData = await productResponse.json();
// // // // // //         }
// // // // // //       }

// // // // // //       // Combine the data
// // // // // //       const combinedData = {
// // // // // //         ...sessionData.session,
// // // // // //         product: productData.product || null,
// // // // // //         messages: sessionData.session.messages || []
// // // // // //       };

// // // // // //       // Set all state from the combined data
// // // // // //       setMessages(combinedData.messages);
// // // // // //       setCurrentPrice(combinedData.current_price || 0);
// // // // // //       setBasePrice(combinedData.product?.price_per_kg || 0);
// // // // // //       setProduct(combinedData.product);
// // // // // //       setConsumerDetails(combinedData.consumer || {});
// // // // // //       setQuantity(combinedData.quantity || 0);
// // // // // //       setBargainStatus(combinedData.status || 'pending');

// // // // // //       // Add initial product message if needed
// // // // // //       if (!combinedData.messages.some(msg => msg.content.includes('selected')) && combinedData.product) {
// // // // // //         const productMessage = {
// // // // // //           content: `🛒 ${combinedData.consumer?.name || 'Consumer'} selected ${combinedData.product.produce_name} (${combinedData.quantity}kg) at ₹${combinedData.product.price_per_kg}/kg`,
// // // // // //           sender_type: "system",
// // // // // //           timestamp: new Date().toISOString()
// // // // // //         };
// // // // // //         setMessages(prev => [...prev, productMessage]);
// // // // // //       }

// // // // // //       return combinedData;
// // // // // //     } catch (error) {
// // // // // //       console.error("Error loading bargain data:", error);
// // // // // //       setError(error.message);
// // // // // //       return null;
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   }, [bargainId, token]);

// // // // // //   // WebSocket connection management
// // // // // //   const initializeSocketConnection = useCallback(() => {
// // // // // //     if (!bargainId || !token) {
// // // // // //       console.error("Missing bargainId or token for WebSocket connection");
// // // // // //       return;
// // // // // //     }
  
// // // // // //     if (socket.current) {
// // // // // //       socket.current.disconnect();
// // // // // //       socket.current = null;
// // // // // //     }
  
// // // // // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // // // //       auth: { token },
// // // // // //       query: { bargainId },
// // // // // //       transports: ['websocket'],
// // // // // //       reconnection: true,
// // // // // //       reconnectionAttempts: 5,
// // // // // //       reconnectionDelay: 1000,
// // // // // //       extraHeaders: {
// // // // // //         Authorization: `Bearer ${token}`
// // // // // //       }
// // // // // //     });
    
// // // // // //     // Connection events
// // // // // //     socket.current.on('connect', () => {
// // // // // //       console.log("Socket connected");
// // // // // //       setConnectionStatus("connected");
// // // // // //       socket.current.emit('joinBargain', { bargainId });
// // // // // //     });
  
// // // // // //     socket.current.on('connect_error', (err) => {
// // // // // //       console.error("Connection error:", err.message);
// // // // // //       setConnectionStatus("error");
// // // // // //     });
  
// // // // // //     socket.current.on('disconnect', (reason) => {
// // // // // //       console.log("Socket disconnected:", reason);
// // // // // //       setConnectionStatus("disconnected");
// // // // // //     });
  
// // // // // //     // Application events
// // // // // //     socket.current.on('priceUpdate', (data) => {
// // // // // //       setCurrentPrice(data.newPrice);
// // // // // //       addSystemMessage(`Consumer updated price to ₹${data.newPrice}/kg`);
// // // // // //       setWaitingForResponse(false);
// // // // // //     });
  
// // // // // //     socket.current.on('bargainStatusUpdate', (status) => {
// // // // // //       setBargainStatus(status);
// // // // // //       if (status === 'accepted') {
// // // // // //         addSystemMessage("🎉 You accepted the offer!");
// // // // // //       } else if (status === 'rejected') {
// // // // // //         addSystemMessage("❌ You declined the offer");
// // // // // //       }
// // // // // //       setWaitingForResponse(false);
// // // // // //     });
  
// // // // // //     socket.current.on('newMessage', (message) => {
// // // // // //       setMessages(prev => [...prev, message]);
// // // // // //       if (message.sender_type === 'consumer') {
// // // // // //         setWaitingForResponse(false);
// // // // // //       }
// // // // // //     });

// // // // // //     socket.current.on('typing', (isTyping) => {
// // // // // //       setIsTyping(isTyping);
// // // // // //     });
  
// // // // // //     socket.current.on('error', (error) => {
// // // // // //       console.error("Socket error:", error);
// // // // // //       setError(error.message);
// // // // // //     });
  
// // // // // //     return () => {
// // // // // //       if (socket.current) {
// // // // // //         socket.current.disconnect();
// // // // // //       }
// // // // // //     };
// // // // // //   }, [bargainId, token]);

// // // // // //   // Initialize socket connection on mount
// // // // // //   useEffect(() => {
// // // // // //     fetchBargainData().then(() => {
// // // // // //       initializeSocketConnection();
// // // // // //     });
    
// // // // // //     return () => {
// // // // // //       if (socket.current) {
// // // // // //         socket.current.disconnect();
// // // // // //       }
// // // // // //     };
// // // // // //   }, [initializeSocketConnection, fetchBargainData]);

// // // // // //   // Auto-scroll to bottom when messages change
// // // // // //   useEffect(() => {
// // // // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // // // //   }, [messages]);

// // // // // //   // Helper function to add system messages
// // // // // //   const addSystemMessage = (content) => {
// // // // // //     setMessages(prev => [
// // // // // //       ...prev,
// // // // // //       {
// // // // // //         content,
// // // // // //         sender_type: "system",
// // // // // //         timestamp: new Date().toISOString()
// // // // // //       }
// // // // // //     ]);
// // // // // //   };

// // // // // //   // Handle sending a message
// // // // // //   const handleSendMessage = () => {
// // // // // //     if (!newMessage.trim() || !socket.current?.connected) return;

// // // // // //     const message = {
// // // // // //       content: newMessage,
// // // // // //       sender_type: "farmer",
// // // // // //       timestamp: new Date().toISOString()
// // // // // //     };

// // // // // //     socket.current.emit('bargainMessage', {
// // // // // //       bargain_id: bargainId,
// // // // // //       message,
// // // // // //       recipientType: "consumer",
// // // // // //       recipientId: consumerDetails.id,
// // // // // //     });

// // // // // //     setMessages(prev => [...prev, message]);
// // // // // //     setNewMessage('');
// // // // // //   };

// // // // // //   // Handle price offer
// // // // // //   const handleMakeOffer = (price) => {
// // // // // //     if (!socket.current?.connected) return;

// // // // // //     const messageContent = `💰 I'm offering ₹${price}/kg`;
// // // // // //     addSystemMessage(messageContent);
// // // // // //     setCurrentPrice(price);
// // // // // //     setWaitingForResponse(true);
    
// // // // // //     socket.current.emit('priceOffer', {
// // // // // //       price,
// // // // // //       productId: product?.product_id,
// // // // // //       quantity
// // // // // //     });

// // // // // //     socket.current.emit("bargainMessage", {
// // // // // //       bargain_id: bargainId,
// // // // // //       message: {
// // // // // //         content: messageContent,
// // // // // //         sender_type: "farmer",
// // // // // //         timestamp: new Date().toISOString()
// // // // // //       },
// // // // // //       recipientType: "consumer",
// // // // // //       recipientId: consumerDetails.id,
// // // // // //     });
// // // // // //   };

// // // // // //   // Handle accept/reject
// // // // // //   const handleBargainResponse = (response) => {
// // // // // //     if (!socket.current?.connected) return;

// // // // // //     const messageContent = response ? "🎉 I accept this offer!" : "❌ I decline this offer";
// // // // // //     addSystemMessage(messageContent);
// // // // // //     setWaitingForResponse(true);
    
// // // // // //     socket.current.emit('bargainResponse', {
// // // // // //       response,
// // // // // //       bargainId
// // // // // //     });

// // // // // //     socket.current.emit("bargainMessage", {
// // // // // //       bargain_id: bargainId,
// // // // // //       message: {
// // // // // //         content: messageContent,
// // // // // //         sender_type: "farmer",
// // // // // //         timestamp: new Date().toISOString()
// // // // // //       },
// // // // // //       recipientType: "consumer",
// // // // // //       recipientId: consumerDetails.id,
// // // // // //     });
// // // // // //   };

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="loading-container">
// // // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // // //         <p>Loading bargain session...</p>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   if (error) {
// // // // // //     return (
// // // // // //       <div className="error-container">
// // // // // //         <h3>Error Loading Chat</h3>
// // // // // //         <p>{error}</p>
// // // // // //         <button onClick={() => window.location.reload()}>Retry</button>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="chat-window-container">
// // // // // //       {/* Chat Header */}
// // // // // //       <div className="chat-header">
// // // // // //         <button className="back-button" onClick={() => navigate(-1)}>
// // // // // //           &larr; Back
// // // // // //         </button>
// // // // // //         <div className="header-info">
// // // // // //           <h2>
// // // // // //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerDetails.name || "Consumer"}
// // // // // //           </h2>
// // // // // //           <div className="product-details">
// // // // // //             {product && (
// // // // // //               <>
// // // // // //                 <span>{product.produce_name} ({quantity}kg)</span>
// // // // // //                 <span>Base: ₹{basePrice}/kg</span>
// // // // // //               </>
// // // // // //             )}
// // // // // //             <span className={`connection-status ${connectionStatus}`}>
// // // // // //               {connectionStatus}
// // // // // //             </span>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Chat Messages */}
// // // // // //       <div className="chat-messages">
// // // // // //         {messages.length === 0 ? (
// // // // // //           <div className="no-messages">
// // // // // //             <p>Waiting for consumer to initiate bargain...</p>
// // // // // //           </div>
// // // // // //         ) : (
// // // // // //           messages.map((msg, index) => (
// // // // // //             <div 
// // // // // //               key={`msg-${index}`} 
// // // // // //               className={`message ${
// // // // // //                 msg.sender_type === 'farmer' ? 'sent' : 
// // // // // //                 msg.sender_type === 'system' ? 'system' : 'received'
// // // // // //               }`}
// // // // // //             >
// // // // // //               <div className="message-content">
// // // // // //                 {msg.content}
// // // // // //               </div>
// // // // // //               <div className="message-meta">
// // // // // //                 <span className="sender">
// // // // // //                   {msg.sender_type === 'farmer' ? 'You' : 
// // // // // //                    msg.sender_type === 'consumer' ? consumerDetails.name : 'System'}
// // // // // //                 </span>
// // // // // //                 <span className="timestamp">
// // // // // //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // // // // //                 </span>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           ))
// // // // // //         )}
// // // // // //         {isTyping && (
// // // // // //           <div className="typing-indicator">
// // // // // //             <div className="typing-dots">
// // // // // //               <div></div>
// // // // // //               <div></div>
// // // // // //               <div></div>
// // // // // //             </div>
// // // // // //             <span>{consumerDetails.name || 'Consumer'} is typing...</span>
// // // // // //           </div>
// // // // // //         )}
// // // // // //         <div ref={messagesEndRef} />
// // // // // //       </div>

// // // // // //       {/* Price Display */}
// // // // // //       <div className="price-display">
// // // // // //         <div className="price-item">
// // // // // //           <span className="price-label">Current Price:</span>
// // // // // //           <span className="price-value">₹{currentPrice}/kg</span>
// // // // // //         </div>
// // // // // //         <div className="price-item">
// // // // // //           <span className="price-label">Total:</span>
// // // // // //           <span className="price-value">₹{(quantity * currentPrice).toFixed(2)}</span>
// // // // // //         </div>
// // // // // //         {bargainStatus === 'accepted' && (
// // // // // //           <div className="status-accepted">
// // // // // //             <FontAwesomeIcon icon={faCheckCircle} /> Accepted
// // // // // //           </div>
// // // // // //         )}
// // // // // //         {bargainStatus === 'rejected' && (
// // // // // //           <div className="status-rejected">
// // // // // //             <FontAwesomeIcon icon={faTimesCircle} /> Rejected
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>

// // // // // //       {/* Message Input */}
// // // // // //       <div className="message-input">
// // // // // //         <input
// // // // // //           type="text"
// // // // // //           value={newMessage}
// // // // // //           onChange={(e) => {
// // // // // //             setNewMessage(e.target.value);
// // // // // //             socket.current?.emit('typing', e.target.value.length > 0);
// // // // // //           }}
// // // // // //           placeholder="Type your message..."
// // // // // //           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
// // // // // //         />
// // // // // //         <button onClick={handleSendMessage}>
// // // // // //           <FontAwesomeIcon icon={faPaperPlane} />
// // // // // //         </button>
// // // // // //       </div>

// // // // // //       {/* Bargain Controls */}
// // // // // //       {bargainStatus === 'pending' && (
// // // // // //         <div className="bargain-controls">
// // // // // //           <div className="price-buttons">
// // // // // //             <button 
// // // // // //               className="price-up"
// // // // // //               onClick={() => handleMakeOffer(currentPrice + 1)}
// // // // // //               disabled={waitingForResponse}
// // // // // //             >
// // // // // //               <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + 1}
// // // // // //             </button>
// // // // // //             <button 
// // // // // //               className="price-down"
// // // // // //               onClick={() => handleMakeOffer(Math.max(1, currentPrice - 1))}
// // // // // //               disabled={waitingForResponse || currentPrice <= 1}
// // // // // //             >
// // // // // //               <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 1}
// // // // // //             </button>
// // // // // //           </div>
// // // // // //           <div className="action-buttons">
// // // // // //             <button 
// // // // // //               className="accept-button"
// // // // // //               onClick={() => handleBargainResponse(true)}
// // // // // //               disabled={waitingForResponse}
// // // // // //             >
// // // // // //               <FontAwesomeIcon icon={faHandshake} /> Accept
// // // // // //             </button>
// // // // // //             <button 
// // // // // //               className="reject-button"
// // // // // //               onClick={() => handleBargainResponse(false)}
// // // // // //               disabled={waitingForResponse}
// // // // // //             >
// // // // // //               <FontAwesomeIcon icon={faTimesCircle} /> Reject
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       )}

// // // // // //       {waitingForResponse && (
// // // // // //         <div className="waiting-indicator">
// // // // // //           <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
// // // // // //         </div>
// // // // // //       )}
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default FarmerChatWindow;
// // // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // // import { useAuth } from "../../context/AuthContext";
// // // // // import { io } from 'socket.io-client';
// // // // // import {
// // // // //   faSpinner,
// // // // //   faRupeeSign,
// // // // //   faArrowUp,
// // // // //   faArrowDown,
// // // // //   faCheckCircle,
// // // // //   faTimesCircle
// // // // // } from '@fortawesome/free-solid-svg-icons';
// // // // // import './ConsumerChatWindow.css';

// // // // // const FarmerChatWindow = () => {
// // // // //   const navigate = useNavigate();
// // // // //   const { bargainId } = useParams();
// // // // //   const { token } = useAuth();
// // // // //   const socket = useRef(null);
// // // // //   const messagesEndRef = useRef(null);

// // // // //   const [messages, setMessages] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [currentPrice, setCurrentPrice] = useState(0);
// // // // //   const [connectionStatus, setConnectionStatus] = useState("disconnected");
// // // // //   const [bargainStatus, setBargainStatus] = useState('pending');
// // // // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // // // //   const [selectedConsumer, setSelectedConsumer] = useState(null);
// // // // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // // // //   const [quantity, setQuantity] = useState(0);
// // // // //   const [priceSuggestions, setPriceSuggestions] = useState([]);
// // // // //   const [error, setError] = useState(null);

// // // // //   // Generate price suggestions
// // // // //   const generatePriceSuggestions = useCallback((basePrice) => {
// // // // //     return [
// // // // //       { amount: -2, price: basePrice - 2, label: "Counter Offer" },
// // // // //       { amount: -1, price: basePrice - 1, label: "Small Decrease" },
// // // // //       { amount: 1, price: basePrice + 1, label: "Small Increase" },
// // // // //       { amount: 2, price: basePrice + 2, label: "Counter Offer" }
// // // // //     ].filter(suggestion => suggestion.price > 0);
// // // // //   }, []);

// // // // //   // Add system messages
// // // // //   const addSystemMessage = (content) => {
// // // // //     setMessages(prev => [
// // // // //       ...prev,
// // // // //       {
// // // // //         content,
// // // // //         sender_type: "system",
// // // // //         timestamp: new Date().toISOString()
// // // // //       }
// // // // //     ]);
// // // // //   };

// // // // //   // Fetch messages from database
// // // // //   const fetchMessages = async () => {
// // // // //     try {
// // // // //       const response = await fetch(
// // // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
// // // // //         {
// // // // //           headers: {
// // // // //             'Authorization': `Bearer ${token}`,
// // // // //           },
// // // // //         }
// // // // //       );

// // // // //       if (!response.ok) {
// // // // //         throw new Error('Failed to fetch messages');
// // // // //       }

// // // // //       const data = await response.json();
// // // // //       setMessages(data);
// // // // //     } catch (err) {
// // // // //       console.error('Error fetching messages:', err);
// // // // //       setError(err.message);
// // // // //     }
// // // // //   };

// // // // //   // Save message to database
// // // // //   const sendMessageToDb = async (messageData) => {
// // // // //     try {
// // // // //       const response = await fetch(
// // // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/messages`,
// // // // //         {
// // // // //           method: 'POST',
// // // // //           headers: {
// // // // //             'Content-Type': 'application/json',
// // // // //             'Authorization': `Bearer ${token}`,
// // // // //           },
// // // // //           body: JSON.stringify(messageData),
// // // // //         }
// // // // //       );

// // // // //       if (!response.ok) {
// // // // //         throw new Error('Failed to save message');
// // // // //       }

// // // // //       return await response.json();
// // // // //     } catch (err) {
// // // // //       console.error('Error saving message:', err);
// // // // //       throw err;
// // // // //     }
// // // // //   };

// // // // //   // Fetch bargain data
// // // // //   const fetchBargainData = async () => {
// // // // //     try {
// // // // //       if (!bargainId || !token) {
// // // // //         throw new Error("Missing bargain ID or authentication token");
// // // // //       }

// // // // //       const response = await fetch(
// // // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// // // // //         {
// // // // //           headers: {
// // // // //             'Authorization': `Bearer ${token}`,
// // // // //           },
// // // // //         }
// // // // //       );

// // // // //       if (!response.ok) {
// // // // //         throw new Error(`Server error: ${response.status}`);
// // // // //       }

// // // // //       const data = await response.json();

// // // // //       if (!data.success) {
// // // // //         throw new Error(data.error || "Failed to fetch bargain data");
// // // // //       }

// // // // //       if (data.products && data.products.length > 0) {
// // // // //         const product = data.products[0];
// // // // //         setSelectedProduct(product);
// // // // //         setCurrentPrice(product.current_offer || product.price_per_kg);
// // // // //         setQuantity(product.quantity || 1);
        
// // // // //         // Generate initial price suggestions
// // // // //         const suggestions = generatePriceSuggestions(product.current_offer || product.price_per_kg);
// // // // //         setPriceSuggestions(suggestions);
// // // // //       }
      
// // // // //       if (data.consumer) {
// // // // //         setSelectedConsumer(data.consumer);
// // // // //       }
      
// // // // //       setBargainStatus(data.status || 'pending');
      
// // // // //     } catch (error) {
// // // // //       setError(error.message || "Failed to load bargain data");
// // // // //     }
// // // // //   };

// // // // //   // Initialize socket connection
// // // // //   const initializeSocketConnection = useCallback(() => {
// // // // //     if (!bargainId || !token) return;

// // // // //     if (socket.current) {
// // // // //       socket.current.disconnect();
// // // // //     }

// // // // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // // //       auth: { token },
// // // // //       query: { bargainId },
// // // // //       transports: ['websocket'],
// // // // //     });

// // // // //     // Connection events
// // // // //     socket.current.on('connect', () => {
// // // // //       console.log("Socket connected");
// // // // //       setConnectionStatus("connected");
// // // // //     });

// // // // //     socket.current.on('connect_error', (err) => {
// // // // //       console.error("Connection error:", err.message);
// // // // //       setConnectionStatus("error");
// // // // //     });

// // // // //     socket.current.on('disconnect', (reason) => {
// // // // //       console.log("Socket disconnected:", reason);
// // // // //       setConnectionStatus("disconnected");
// // // // //     });

// // // // //     // Application events
// // // // //     socket.current.on('priceUpdate', (data) => {
// // // // //       setCurrentPrice(data.newPrice);
// // // // //       addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
// // // // //       setWaitingForResponse(false);
// // // // //     });

// // // // //     socket.current.on('bargainStatusUpdate', (status) => {
// // // // //       setBargainStatus(status);
// // // // //       if (status === 'accepted') {
// // // // //         addSystemMessage("🎉 Consumer accepted your offer!");
// // // // //       } else if (status === 'rejected') {
// // // // //         addSystemMessage("❌ Consumer declined your offer");
// // // // //       }
// // // // //       setWaitingForResponse(false);
// // // // //     });

// // // // //     socket.current.on('newMessage', (message) => {
// // // // //       setMessages(prev => [...prev, message]);
// // // // //     });

// // // // //     socket.current.on('error', (error) => {
// // // // //       console.error("Socket error:", error);
// // // // //       setError(error.message);
// // // // //     });
// // // // //   }, [bargainId, token]);

// // // // //   // Initialize chat (fetch data and connect socket)
// // // // //   useEffect(() => {
// // // // //     const initializeChat = async () => {
// // // // //       try {
// // // // //         setLoading(true);
// // // // //         await fetchBargainData();
// // // // //         await fetchMessages();
// // // // //         initializeSocketConnection();
// // // // //       } catch (err) {
// // // // //         setError(err.message);
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     initializeChat();

// // // // //     return () => {
// // // // //       if (socket.current) {
// // // // //         socket.current.disconnect();
// // // // //       }
// // // // //     };
// // // // //   }, [initializeSocketConnection]);

// // // // //   // Auto-scroll to bottom when messages change
// // // // //   useEffect(() => {
// // // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // // //   }, [messages]);

// // // // //   const handlePriceSelection = async (price) => {
// // // // //     const messageContent = `💰 Counter offered ₹${price}/kg`;
    
// // // // //     try {
// // // // //       // Save to database first
// // // // //       const messageData = {
// // // // //         bargain_id: bargainId,
// // // // //         bsp_id: selectedProduct.bsp_id,
// // // // //         sender_type: "farmer",
// // // // //         sender_id: selectedConsumer.consumer_id,
// // // // //         content: messageContent,
// // // // //         price_offer: price
// // // // //       };

// // // // //       const savedMessage = await sendMessageToDb(messageData);

// // // // //       // Update local state
// // // // //       setCurrentPrice(price);
// // // // //       setWaitingForResponse(true);
// // // // //       setMessages(prev => [...prev, savedMessage]);

// // // // //       // Emit socket event
// // // // //       if (socket.current && socket.current.connected) {
// // // // //         socket.current.emit("bargainMessage", {
// // // // //           bargain_id: bargainId,
// // // // //           message: {
// // // // //             content: messageContent,
// // // // //             sender_type: "farmer",
// // // // //             timestamp: new Date().toISOString()
// // // // //           },
// // // // //           recipientType: "consumer",
// // // // //           recipientId: selectedConsumer.consumer_id,
// // // // //         });

// // // // //         socket.current.emit('priceOffer', {
// // // // //           price,
// // // // //           productId: selectedProduct.product_id,
// // // // //           quantity: quantity
// // // // //         });
// // // // //       }
// // // // //     } catch (err) {
// // // // //       setError(err.message);
// // // // //     }
// // // // //   };

// // // // //   const handleAccept = async () => {
// // // // //     const messageContent = "✅ You accepted the offer";
    
// // // // //     try {
// // // // //       // Save to database
// // // // //       const messageData = {
// // // // //         bargain_id: bargainId,
// // // // //         bsp_id: selectedProduct.bsp_id,
// // // // //         sender_type: "farmer",
// // // // //         sender_id: selectedConsumer.consumer_id,
// // // // //         content: messageContent
// // // // //       };

// // // // //       await sendMessageToDb(messageData);

// // // // //       // Update local state
// // // // //       addSystemMessage(messageContent);
// // // // //       setBargainStatus('accepted');

// // // // //       // Emit socket events
// // // // //       if (socket.current && socket.current.connected) {
// // // // //         socket.current.emit("bargainStatusUpdate", {
// // // // //           bargainId,
// // // // //           status: 'accepted'
// // // // //         });
        
// // // // //         socket.current.emit("bargainMessage", {
// // // // //           bargain_id: bargainId,
// // // // //           message: {
// // // // //             content: messageContent,
// // // // //             sender_type: "farmer",
// // // // //             timestamp: new Date().toISOString()
// // // // //           },
// // // // //           recipientType: "consumer",
// // // // //           recipientId: selectedConsumer.consumer_id,
// // // // //         });
// // // // //       }
// // // // //     } catch (err) {
// // // // //       setError(err.message);
// // // // //     }
// // // // //   };

// // // // //   const handleReject = async () => {
// // // // //     const messageContent = "❌ You rejected the offer";
    
// // // // //     try {
// // // // //       // Save to database
// // // // //       const messageData = {
// // // // //         bargain_id: bargainId,
// // // // //         bsp_id: selectedProduct.bsp_id,
// // // // //         sender_type: "farmer",
// // // // //         sender_id: selectedConsumer.consumer_id,
// // // // //         content: messageContent
// // // // //       };

// // // // //       await sendMessageToDb(messageData);

// // // // //       // Update local state
// // // // //       addSystemMessage(messageContent);
// // // // //       setBargainStatus('rejected');

// // // // //       // Emit socket events
// // // // //       if (socket.current && socket.current.connected) {
// // // // //         socket.current.emit("bargainStatusUpdate", {
// // // // //           bargainId,
// // // // //           status: 'rejected'
// // // // //         });
        
// // // // //         socket.current.emit("bargainMessage", {
// // // // //           bargain_id: bargainId,
// // // // //           message: {
// // // // //             content: messageContent,
// // // // //             sender_type: "farmer",
// // // // //             timestamp: new Date().toISOString()
// // // // //           },
// // // // //           recipientType: "consumer",
// // // // //           recipientId: selectedConsumer.consumer_id,
// // // // //         });
// // // // //       }
// // // // //     } catch (err) {
// // // // //       setError(err.message);
// // // // //     }
// // // // //   };

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="loading-container">
// // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // //         <p>Loading bargain session...</p>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (error) {
// // // // //     return (
// // // // //       <div className="error-container">
// // // // //         <h3>Error Loading Bargain</h3>
// // // // //         <p>{error}</p>
// // // // //         <button onClick={() => navigate('/farmer-dashboard')}>
// // // // //           Back to Dashboard
// // // // //         </button>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <div className="bargain-chat-container">
// // // // //       {selectedProduct && selectedConsumer && (
// // // // //         <div className="chat-interface">
// // // // //           {/* Chat Header */}
// // // // //           <div className="chat-header">
// // // // //             <div className="header-top">
// // // // //               <h2>
// // // // //                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.consumer_name}
// // // // //               </h2>
// // // // //               <span className={`connection-status ${connectionStatus}`}>
// // // // //                 {connectionStatus.toUpperCase()}
// // // // //               </span>
// // // // //             </div>
            
// // // // //             <div className="product-info">
// // // // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // // // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // // // //               <div className="price-display">
// // // // //                 <span className="current-price">
// // // // //                   <strong>Current:</strong> ₹{currentPrice}/kg
// // // // //                 </span>
// // // // //                 <span className="base-price">
// // // // //                   <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
// // // // //                 </span>
// // // // //                 <span className="total-price">
// // // // //                   <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
// // // // //                 </span>
// // // // //               </div>
// // // // //               {bargainStatus === 'accepted' && (
// // // // //                 <p className="status-accepted">
// // // // //                   <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
// // // // //                 </p>
// // // // //               )}
// // // // //               {bargainStatus === 'rejected' && (
// // // // //                 <p className="status-rejected">
// // // // //                   <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
// // // // //                 </p>
// // // // //               )}
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* Chat Messages */}
// // // // //           <div className="chat-messages">
// // // // //             {messages.length === 0 ? (
// // // // //               <div className="no-messages">
// // // // //                 <p>No messages yet. Waiting for consumer's offer...</p>
// // // // //               </div>
// // // // //             ) : (
// // // // //               messages.map((msg, index) => (
// // // // //                 <div 
// // // // //                   key={`msg-${index}`} 
// // // // //                   className={`message ${msg.sender_type}`}
// // // // //                 >
// // // // //                   <div className="message-content">
// // // // //                     {msg.content}
// // // // //                   </div>
// // // // //                   <div className="message-meta">
// // // // //                     <span className="sender">
// // // // //                       {msg.sender_type === 'farmer' ? 'You' : 
// // // // //                        msg.sender_type === 'consumer' ? selectedConsumer.consumer_name : 'System'}
// // // // //                     </span>
// // // // //                     <span className="timestamp">
// // // // //                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // // // //                     </span>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               ))
// // // // //             )}
// // // // //             <div ref={messagesEndRef} />
// // // // //           </div>

// // // // //           {/* Chat Controls */}
// // // // //           <div className="chat-controls">
// // // // //             {bargainStatus === 'pending' && priceSuggestions.length > 0 && (
// // // // //               <div className="price-suggestions">
// // // // //                 <h4>Respond to Offer:</h4>
// // // // //                 <div className="suggestion-buttons">
// // // // //                   {priceSuggestions.map((suggestion, index) => (
// // // // //                     <button
// // // // //                       key={`price-${index}`}
// // // // //                       onClick={() => handlePriceSelection(suggestion.price)}
// // // // //                       className={`suggestion-btn ${suggestion.amount < 0 ? 'decrease' : 'increase'}`}
// // // // //                       disabled={waitingForResponse}
// // // // //                     >
// // // // //                       <div className="price-change">
// // // // //                         {suggestion.amount < 0 ? (
// // // // //                           <FontAwesomeIcon icon={faArrowDown} />
// // // // //                         ) : (
// // // // //                           <FontAwesomeIcon icon={faArrowUp} />
// // // // //                         )}
// // // // //                         ₹{suggestion.price}
// // // // //                       </div>
// // // // //                       <div className="price-label">{suggestion.label}</div>
// // // // //                     </button>
// // // // //                   ))}
// // // // //                 </div>
                
// // // // //                 <div className="action-buttons">
// // // // //                   <button 
// // // // //                     onClick={handleAccept}
// // // // //                     className="accept-btn"
// // // // //                     disabled={waitingForResponse}
// // // // //                   >
// // // // //                     <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
// // // // //                   </button>
// // // // //                   <button 
// // // // //                     onClick={handleReject}
// // // // //                     className="reject-btn"
// // // // //                     disabled={waitingForResponse}
// // // // //                   >
// // // // //                     <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
// // // // //                   </button>
// // // // //                 </div>
// // // // //               </div>
// // // // //             )}

// // // // //             {waitingForResponse && (
// // // // //               <div className="waiting-indicator">
// // // // //                 <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
// // // // //               </div>
// // // // //             )}

// // // // //             {bargainStatus === 'accepted' && (
// // // // //               <div className="accepted-actions">
// // // // //                 <button 
// // // // //                   className="primary-action"
// // // // //                   onClick={() => navigate('/farmer/orders')}
// // // // //                 >
// // // // //                   View Order Details
// // // // //                 </button>
// // // // //                 <button 
// // // // //                   className="secondary-action"
// // // // //                   onClick={() => navigate('/farmer-dashboard')}
// // // // //                 >
// // // // //                   Back to Dashboard
// // // // //                 </button>
// // // // //               </div>
// // // // //             )}

// // // // //             {bargainStatus === 'rejected' && (
// // // // //               <div className="rejected-actions">
// // // // //                 <button 
// // // // //                   className="secondary-action"
// // // // //                   onClick={() => navigate('/farmer-dashboard')}
// // // // //                 >
// // // // //                   Back to Dashboard
// // // // //                 </button>
// // // // //               </div>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default FarmerChatWindow;
// // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // import { useAuth } from "../../context/AuthContext";
// // // // import { io } from 'socket.io-client';
// // // // import {
// // // //   faSpinner,
// // // //   faRupeeSign,
// // // //   faArrowUp,
// // // //   // faArrowDown,
// // // //   faExclamationCircle,
// // // //   faHome,
// // // //   faSyncAlt,
// // // //   faRedo,
// // // //   faCheckCircle,
// // // //   faTimesCircle
// // // // } from '@fortawesome/free-solid-svg-icons';
// // // // import './ConsumerChatWindow.css';

// // // // const FarmerChatWindow = () => {
// // // //   const navigate = useNavigate();
// // // //   const { bargainId } = useParams();
// // // //   const { token } = useAuth();
// // // //   const socket = useRef(null);
// // // //   const messagesEndRef = useRef(null);

// // // //   const [messages, setMessages] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [currentPrice, setCurrentPrice] = useState(0);
// // // //   const [connectionStatus, setConnectionStatus] = useState("disconnected");
// // // //   const [bargainStatus, setBargainStatus] = useState('pending');
// // // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // // //   const [selectedConsumer, setSelectedConsumer] = useState(null);
// // // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // // //   const [quantity, setQuantity] = useState(0);
// // // //   const [priceSuggestions, setPriceSuggestions] = useState([]);
// // // //   const [error, setError] = useState(null);

// // // //   // Generate 6 increasing price suggestions from consumer's price
// // // //   const generatePriceSuggestions = useCallback((basePrice) => {
// // // //     return Array.from({ length: 6 }, (_, i) => ({
// // // //       amount: i + 1,
// // // //       price: basePrice + (i + 1),
// // // //       label: `Offer ₹${basePrice + (i + 1)}/kg`
// // // //     }));
// // // //   }, []);

// // // //   // Add system messages
// // // //   const addSystemMessage = (content) => {
// // // //     setMessages(prev => [
// // // //       ...prev,
// // // //       {
// // // //         content,
// // // //         sender_type: "system",
// // // //         timestamp: new Date().toISOString()
// // // //       }
// // // //     ]);
// // // //   };

// // // //   // Fetch messages from database
// // // //   const fetchMessages = async () => {
// // // //     try {
// // // //       const response = await fetch(
// // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
// // // //         {
// // // //           headers: {
// // // //             'Authorization': `Bearer ${token}`,
// // // //           },
// // // //         }
// // // //       );

// // // //       if (!response.ok) {
// // // //         throw new Error('Failed to fetch messages');
// // // //       }

// // // //       const data = await response.json();
// // // //       setMessages(data);
// // // //     } catch (err) {
// // // //       console.error('Error fetching messages:', err);
// // // //       setError(err.message);
// // // //     }
// // // //   };

// // // //   // Save message to database
// // // //   const sendMessageToDb = async (messageData) => {
// // // //     try {
// // // //       const response = await fetch(
// // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/messages`,
// // // //         {
// // // //           method: 'POST',
// // // //           headers: {
// // // //             'Content-Type': 'application/json',
// // // //             'Authorization': `Bearer ${token}`,
// // // //           },
// // // //           body: JSON.stringify(messageData),
// // // //         }
// // // //       );

// // // //       if (!response.ok) {
// // // //         throw new Error('Failed to save message');
// // // //       }

// // // //       return await response.json();
// // // //     } catch (err) {
// // // //       console.error('Error saving message:', err);
// // // //       throw err;
// // // //     }
// // // //   };

// // // //   // Fetch bargain data
// // // //   // const fetchBargainData = async () => {
// // // //   //   try {
// // // //   //     if (!bargainId || !token) {
// // // //   //       throw new Error("Missing bargain ID or authentication token");
// // // //   //     }

// // // //   //     const response = await fetch(
// // // //   //       `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// // // //   //       {
// // // //   //         headers: {
// // // //   //           'Authorization': `Bearer ${token}`,
// // // //   //         },
// // // //   //       }
// // // //   //     );

// // // //   //     if (!response.ok) {
// // // //   //       throw new Error(`Server error: ${response.status}`);
// // // //   //     }

// // // //   //     const data = await response.json();

// // // //   //     if (!data.success) {
// // // //   //       throw new Error(data.error || "Failed to fetch bargain data");
// // // //   //     }

// // // //   //     if (data.products && data.products.length > 0) {
// // // //   //       const product = data.products[0];
// // // //   //       setSelectedProduct(product);
        
// // // //   //       // Use consumer's current offer if available, otherwise use base price
// // // //   //       const currentOffer = product.current_offer || product.price_per_kg;
// // // //   //       setCurrentPrice(currentOffer);
// // // //   //       setQuantity(product.quantity || 1);
        
// // // //   //       // Generate price suggestions based on consumer's offer
// // // //   //       const suggestions = generatePriceSuggestions(currentOffer);
// // // //   //       setPriceSuggestions(suggestions);
// // // //   //     }
      
// // // //   //     if (data.consumer) {
// // // //   //       setSelectedConsumer(data.consumer);
// // // //   //     }
      
// // // //   //     setBargainStatus(data.status || 'pending');
      
// // // //   //   } catch (error) {
// // // //   //     setError(error.message || "Failed to load bargain data");
// // // //   //   }
// // // //   // };
// // // //   // Update the fetchBargainData function
// // // //   const fetchBargainData = async () => {
// // // //     try {
// // // //       if (!bargainId || !token) {
// // // //         throw new Error("Missing bargain ID or authentication token");
// // // //       }
  
// // // //       const response = await fetch(
// // // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// // // //         {
// // // //           headers: {
// // // //             'Authorization': `Bearer ${token}`,
// // // //             'Content-Type': 'application/json'
// // // //           },
// // // //           signal: AbortSignal.timeout(8000) // 8 second timeout
// // // //         }
// // // //       );
  
// // // //       // First verify we got a response
// // // //       if (!response) {
// // // //         throw new Error("No response from server");
// // // //       }
  
// // // //       // Handle HTTP errors
// // // //       if (!response.ok) {
// // // //         const errorText = await response.text();
// // // //         throw new Error(`Server error: ${response.status} - ${errorText || 'No error details'}`);
// // // //       }
  
// // // //       // Verify content type
// // // //       const contentType = response.headers.get('content-type');
// // // //       if (!contentType || !contentType.includes('application/json')) {
// // // //         const body = await response.text();
// // // //         throw new Error(`Unexpected content type: ${contentType}. Response: ${body.substring(0, 100)}...`);
// // // //       }
  
// // // //       // Parse JSON
// // // //       const data = await response.json();
  
// // // //       // Validate response structure
// // // //       if (!data || typeof data !== 'object') {
// // // //         throw new Error("Invalid response format from server");
// // // //       }
  
// // // //       // Process successful response
// // // //       if (data.products && data.products.length > 0) {
// // // //         const product = data.products[0];
// // // //         setSelectedProduct(product);
        
// // // //         const currentOffer = product.current_offer || product.price_per_kg;
// // // //         setCurrentPrice(currentOffer);
// // // //         setQuantity(product.quantity || 1);
        
// // // //         const suggestions = generatePriceSuggestions(currentOffer);
// // // //         setPriceSuggestions(suggestions);
// // // //       } else {
// // // //         console.warn("No products found in response", data);
// // // //       }
      
// // // //       if (data.consumer) {
// // // //         setSelectedConsumer(data.consumer);
// // // //       } else {
// // // //         console.warn("No consumer data found in response", data);
// // // //       }
      
// // // //       setBargainStatus(data.status || 'pending');
      
// // // //     } catch (error) {
// // // //       console.error("Bargain data fetch failed:", {
// // // //         bargainId,
// // // //         error: error.message,
// // // //         stack: error.stack
// // // //       });
      
// // // //       // Special handling for empty responses
// // // //       if (error.message.includes("empty response") || 
// // // //           error.message.includes("Unexpected end of JSON")) {
// // // //         throw new Error("The server returned an empty response. The bargain may not exist or you may not have permission to view it.");
// // // //       }
      
// // // //       throw error;
// // // //     }
// // // //   };


// // // //   // Initialize socket connection
// // // //   const initializeSocketConnection = useCallback(() => {
// // // //     if (!bargainId || !token) return;

// // // //     if (socket.current) {
// // // //       socket.current.disconnect();
// // // //     }

// // // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // //       auth: { token },
// // // //       query: { bargainId },
// // // //       transports: ['websocket'],
// // // //     });

// // // //     // Connection events
// // // //     socket.current.on('connect', () => {
// // // //       console.log("Socket connected");
// // // //       setConnectionStatus("connected");
// // // //     });

// // // //     socket.current.on('connect_error', (err) => {
// // // //       console.error("Connection error:", err.message);
// // // //       setConnectionStatus("error");
// // // //     });

// // // //     socket.current.on('disconnect', (reason) => {
// // // //       console.log("Socket disconnected:", reason);
// // // //       setConnectionStatus("disconnected");
// // // //     });

// // // //     // Application events
// // // //     socket.current.on('priceUpdate', (data) => {
// // // //       setCurrentPrice(data.newPrice);
// // // //       addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
// // // //       setWaitingForResponse(false);
      
// // // //       // Regenerate price suggestions based on consumer's new price
// // // //       const newSuggestions = generatePriceSuggestions(data.newPrice);
// // // //       setPriceSuggestions(newSuggestions);
// // // //     });

// // // //     socket.current.on('bargainStatusUpdate', (status) => {
// // // //       setBargainStatus(status);
// // // //       if (status === 'accepted') {
// // // //         addSystemMessage("🎉 Consumer accepted your offer!");
// // // //       } else if (status === 'rejected') {
// // // //         addSystemMessage("❌ Consumer declined your offer");
// // // //       }
// // // //       setWaitingForResponse(false);
// // // //     });

// // // //     socket.current.on('newMessage', (message) => {
// // // //       setMessages(prev => [...prev, message]);
// // // //     });

// // // //     socket.current.on('error', (error) => {
// // // //       console.error("Socket error:", error);
// // // //       setError(error.message);
// // // //     });
// // // //   }, [bargainId, token, generatePriceSuggestions]);

// // // //   // Initialize chat (fetch data and connect socket)
// // // //   useEffect(() => {
// // // //     // const initializeChat = async () => {
// // // //     //   try {
// // // //     //     setLoading(true);
// // // //     //     await fetchBargainData();
// // // //     //     await fetchMessages();
// // // //     //     initializeSocketConnection();
// // // //     //   } catch (err) {
// // // //     //     setError(err.message);
// // // //     //   } finally {
// // // //     //     setLoading(false);
// // // //     //   }
// // // //     // };
// // // //     const initializeChat = async () => {
// // // //       try {
// // // //         setLoading(true);
// // // //         setError(null);
        
// // // //         await fetchBargainData();
// // // //         await fetchMessages();
        
// // // //         // Only initialize socket if we have valid data
// // // //         initializeSocketConnection();
        
// // // //       } catch (err) {
// // // //         // Differentiate between network errors and business logic errors
// // // //         if (err.message.includes("Failed to fetch")) {
// // // //           setError("Network error: Please check your internet connection");
// // // //         } else {
// // // //           setError(err.message || "Failed to initialize chat");
// // // //         }
        
// // // //         // Attempt to reconnect after delay if it's a network error
// // // //         if (err.message.includes("Network")) {
// // // //           setTimeout(() => {
// // // //             initializeChat();
// // // //           }, 3000);
// // // //         }
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };
// // // //     initializeChat();

// // // //     return () => {
// // // //       if (socket.current) {
// // // //         socket.current.disconnect();
// // // //       }
// // // //     };
// // // //   }, [initializeSocketConnection]);

// // // //   // Auto-scroll to bottom when messages change
// // // //   useEffect(() => {
// // // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // // //   }, [messages]);

// // // //   const handlePriceSelection = async (price) => {
// // // //     const messageContent = `💰 Counter offered ₹${price}/kg`;
    
// // // //     try {
// // // //       // Save to database first
// // // //       const messageData = {
// // // //         bargain_id: bargainId,
// // // //         bsp_id: selectedProduct.bsp_id,
// // // //         sender_type: "farmer",
// // // //         sender_id: selectedConsumer.consumer_id,
// // // //         content: messageContent,
// // // //         price_offer: price
// // // //       };

// // // //       const savedMessage = await sendMessageToDb(messageData);

// // // //       // Update local state
// // // //       setCurrentPrice(price);
// // // //       setWaitingForResponse(true);
// // // //       setMessages(prev => [...prev, savedMessage]);

// // // //       // Emit socket event
// // // //       if (socket.current && socket.current.connected) {
// // // //         socket.current.emit("bargainMessage", {
// // // //           bargain_id: bargainId,
// // // //           message: {
// // // //             content: messageContent,
// // // //             sender_type: "farmer",
// // // //             timestamp: new Date().toISOString()
// // // //           },
// // // //           recipientType: "consumer",
// // // //           recipientId: selectedConsumer.consumer_id,
// // // //         });

// // // //         socket.current.emit('priceOffer', {
// // // //           price,
// // // //           productId: selectedProduct.product_id,
// // // //           quantity: quantity
// // // //         });
// // // //       }
// // // //     } catch (err) {
// // // //       setError(err.message);
// // // //     }
// // // //   };

// // // //   const handleAccept = async () => {
// // // //     const messageContent = "✅ You accepted the offer";
    
// // // //     try {
// // // //       // Save to database
// // // //       const messageData = {
// // // //         bargain_id: bargainId,
// // // //         bsp_id: selectedProduct.bsp_id,
// // // //         sender_type: "farmer",
// // // //         sender_id: selectedConsumer.consumer_id,
// // // //         content: messageContent
// // // //       };

// // // //       await sendMessageToDb(messageData);

// // // //       // Update local state
// // // //       addSystemMessage(messageContent);
// // // //       setBargainStatus('accepted');

// // // //       // Emit socket events
// // // //       if (socket.current && socket.current.connected) {
// // // //         socket.current.emit("bargainStatusUpdate", {
// // // //           bargainId,
// // // //           status: 'accepted'
// // // //         });
        
// // // //         socket.current.emit("bargainMessage", {
// // // //           bargain_id: bargainId,
// // // //           message: {
// // // //             content: messageContent,
// // // //             sender_type: "farmer",
// // // //             timestamp: new Date().toISOString()
// // // //           },
// // // //           recipientType: "consumer",
// // // //           recipientId: selectedConsumer.consumer_id,
// // // //         });
// // // //       }
// // // //     } catch (err) {
// // // //       setError(err.message);
// // // //     }
// // // //   };

// // // //   const handleReject = async () => {
// // // //     const messageContent = "❌ You rejected the offer";
    
// // // //     try {
// // // //       // Save to database
// // // //       const messageData = {
// // // //         bargain_id: bargainId,
// // // //         bsp_id: selectedProduct.bsp_id,
// // // //         sender_type: "farmer",
// // // //         sender_id: selectedConsumer.consumer_id,
// // // //         content: messageContent
// // // //       };

// // // //       await sendMessageToDb(messageData);

// // // //       // Update local state
// // // //       addSystemMessage(messageContent);
// // // //       setBargainStatus('rejected');

// // // //       // Emit socket events
// // // //       if (socket.current && socket.current.connected) {
// // // //         socket.current.emit("bargainStatusUpdate", {
// // // //           bargainId,
// // // //           status: 'rejected'
// // // //         });
        
// // // //         socket.current.emit("bargainMessage", {
// // // //           bargain_id: bargainId,
// // // //           message: {
// // // //             content: messageContent,
// // // //             sender_type: "farmer",
// // // //             timestamp: new Date().toISOString()
// // // //           },
// // // //           recipientType: "consumer",
// // // //           recipientId: selectedConsumer.consumer_id,
// // // //         });
// // // //       }
// // // //     } catch (err) {
// // // //       setError(err.message);
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="loading-container">
// // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // //         <p>Loading bargain session...</p>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   // if (error) {
// // // //   //   return (
// // // //   //     <div className="error-container">
// // // //   //       <h3>Error Loading Bargain</h3>
// // // //   //       <p>{error}</p>
// // // //   //       <button onClick={() => navigate('/farmer-dashboard')}>
// // // //   //         Back to Dashboard
// // // //   //       </button>
// // // //   //     </div>
// // // //   //   );
// // // //   // }
// // // // // Update the error display in your render method
// // // // if (error) {
// // // //   return (
// // // //     <div className="error-container">
// // // //       <div className="error-icon">
// // // //         <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
// // // //       </div>
// // // //       <h3>Couldn't Load Bargain #{bargainId}</h3>
      
// // // //       <div className="error-message">
// // // //         <p>{error}</p>
        
// // // //         {error.includes("empty response") && (
// // // //           <div className="special-notice">
// // // //             <p>This could mean:</p>
// // // //             <ul>
// // // //               <li>The bargain doesn't exist</li>
// // // //               <li>You don't have permission to view it</li>
// // // //               <li>The server encountered an error</li>
// // // //             </ul>
// // // //           </div>
// // // //         )}
// // // //       </div>
      
// // // //       <div className="error-actions">
// // // //         <button 
// // // //           onClick={() => navigate('/farmer-dashboard')}
// // // //           className="action-button primary"
// // // //         >
// // // //           <FontAwesomeIcon icon={faHome} /> Back to Dashboard
// // // //         </button>
// // // //         <button 
// // // //           onClick={() => navigate(`/bargain/${bargainId}`)}
// // // //           className="action-button secondary"
// // // //         >
// // // //           <FontAwesomeIcon icon={faSyncAlt} /> Try Again
// // // //         </button>
// // // //         <button 
// // // //           onClick={() => window.location.reload()}
// // // //           className="action-button tertiary"
// // // //         >
// // // //           <FontAwesomeIcon icon={faRedo} /> Refresh Page
// // // //         </button>
// // // //       </div>
      
// // // //       <div className="debug-info">
// // // //         <p>Bargain ID: {bargainId}</p>
// // // //         <p>Error time: {new Date().toLocaleString()}</p>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // //   return (
// // // //     <div className="bargain-chat-container">
// // // //       {selectedProduct && selectedConsumer && (
// // // //         <div className="chat-interface">
// // // //           {/* Chat Header */}
// // // //           <div className="chat-header">
// // // //             <div className="header-top">
// // // //               <h2>
// // // //                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.consumer_name}
// // // //               </h2>
// // // //               <span className={`connection-status ${connectionStatus}`}>
// // // //                 {connectionStatus.toUpperCase()}
// // // //               </span>
// // // //             </div>
            
// // // //             <div className="product-info">
// // // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // // //               <div className="price-display">
// // // //                 <span className="current-price">
// // // //                   <strong>Current:</strong> ₹{currentPrice}/kg
// // // //                 </span>
// // // //                 <span className="base-price">
// // // //                   <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
// // // //                 </span>
// // // //                 <span className="total-price">
// // // //                   <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
// // // //                 </span>
// // // //               </div>
// // // //               {bargainStatus === 'accepted' && (
// // // //                 <p className="status-accepted">
// // // //                   <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
// // // //                 </p>
// // // //               )}
// // // //               {bargainStatus === 'rejected' && (
// // // //                 <p className="status-rejected">
// // // //                   <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
// // // //                 </p>
// // // //               )}
// // // //             </div>
// // // //           </div>

// // // //           {/* Chat Messages */}
// // // //           <div className="chat-messages">
// // // //             {messages.length === 0 ? (
// // // //               <div className="no-messages">
// // // //                 <p>No messages yet. Waiting for consumer's offer...</p>
// // // //               </div>
// // // //             ) : (
// // // //               messages.map((msg, index) => (
// // // //                 <div 
// // // //                   key={`msg-${index}`} 
// // // //                   className={`message ${msg.sender_type}`}
// // // //                 >
// // // //                   <div className="message-content">
// // // //                     {msg.content}
// // // //                   </div>
// // // //                   <div className="message-meta">
// // // //                     <span className="sender">
// // // //                       {msg.sender_type === 'farmer' ? 'You' : 
// // // //                        msg.sender_type === 'consumer' ? selectedConsumer.consumer_name : 'System'}
// // // //                     </span>
// // // //                     <span className="timestamp">
// // // //                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // // //                     </span>
// // // //                   </div>
// // // //                 </div>
// // // //               ))
// // // //             )}
// // // //             <div ref={messagesEndRef} />
// // // //           </div>

// // // //           {/* Chat Controls */}
// // // //           <div className="chat-controls">
// // // //             {bargainStatus === 'pending' && priceSuggestions.length > 0 && (
// // // //               <div className="price-suggestions">
// // // //                 <h4>Make a Counter Offer:</h4>
// // // //                 <div className="suggestion-buttons">
// // // //                   {priceSuggestions.map((suggestion, index) => (
// // // //                     <button
// // // //                       key={`price-${index}`}
// // // //                       onClick={() => handlePriceSelection(suggestion.price)}
// // // //                       className="suggestion-btn increase"
// // // //                       disabled={waitingForResponse}
// // // //                     >
// // // //                       <div className="price-change">
// // // //                         <FontAwesomeIcon icon={faArrowUp} />
// // // //                         ₹{suggestion.price}
// // // //                       </div>
// // // //                       <div className="price-label">{suggestion.label}</div>
// // // //                     </button>
// // // //                   ))}
// // // //                 </div>
                
// // // //                 <div className="action-buttons">
// // // //                   <button 
// // // //                     onClick={handleAccept}
// // // //                     className="accept-btn"
// // // //                     disabled={waitingForResponse}
// // // //                   >
// // // //                     <FontAwesomeIcon icon={faCheckCircle} /> Accept Consumer's Offer
// // // //                   </button>
// // // //                   <button 
// // // //                     onClick={handleReject}
// // // //                     className="reject-btn"
// // // //                     disabled={waitingForResponse}
// // // //                   >
// // // //                     <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
// // // //                   </button>
// // // //                 </div>
// // // //               </div>
// // // //             )}

// // // //             {waitingForResponse && (
// // // //               <div className="waiting-indicator">
// // // //                 <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
// // // //               </div>
// // // //             )}

// // // //             {bargainStatus === 'accepted' && (
// // // //               <div className="accepted-actions">
// // // //                 <button 
// // // //                   className="primary-action"
// // // //                   onClick={() => navigate('/farmer/orders')}
// // // //                 >
// // // //                   View Order Details
// // // //                 </button>
// // // //                 <button 
// // // //                   className="secondary-action"
// // // //                   onClick={() => navigate('/farmer-dashboard')}
// // // //                 >
// // // //                   Back to Dashboard
// // // //                 </button>
// // // //               </div>
// // // //             )}

// // // //             {bargainStatus === 'rejected' && (
// // // //               <div className="rejected-actions">
// // // //                 <button 
// // // //                   className="secondary-action"
// // // //                   onClick={() => navigate('/farmer-dashboard')}
// // // //                 >
// // // //                   Back to Dashboard
// // // //                 </button>
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default FarmerChatWindow;
// // // /* Base Styles with Agri Theme */
// // // :root {
// // //     --primary-green: #2e7d32;
// // //     --secondary-green: #388e3c;
// // //     --light-green: #8bc34a;
// // //     --lighter-green: #dcedc8;
// // //     --dark-green: #1b5e20;
// // //     --soil-brown: #5d4037;
// // //     --wheat-yellow: #ffd54f;
// // //     --sun-orange: #ff9800;
// // //     --sky-blue: #4fc3f7;
// // //     --error-red: #d32f2f;
// // //   }
  
// // //   /* Animations */
// // //   @keyframes growFromSoil {
// // //     0% { transform: translateY(20px); opacity: 0; }
// // //     100% { transform: translateY(0); opacity: 1; }
// // //   }
  
// // //   @keyframes leafWiggle {
// // //     0%, 100% { transform: rotate(-2deg); }
// // //     50% { transform: rotate(2deg); }
// // //   }
  
// // //   @keyframes sunPulse {
// // //     0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
// // //     70% { box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
// // //     100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
// // //   }
  
// // //   /* Chat Container */
// // //   .bargain-chat-container {
// // //     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
// // //     background: linear-gradient(135deg, var(--lighter-green) 0%, #f5f5f5 100%);
// // //     min-height: 100vh;
// // //     position: relative;
// // //     overflow: hidden;
// // //     margin-top:60px;
// // //   }
  
// // //   .bargain-chat-container::before {
// // //     content: "";
// // //     position: absolute;
// // //     bottom: 0;
// // //     left: 0;
// // //     right: 0;
// // //     height: 100px;
// // //     background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="%235D4037"/><path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="%235D4037"/><path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="%235D4037"/></svg>');
// // //     background-size: cover;
// // //     z-index: 0;
// // //   }
  
// // //   /* Loading Container */
// // //   .loading-container {
// // //     display: flex;
// // //     flex-direction: column;
// // //     align-items: center;
// // //     justify-content: center;
// // //     height: 100vh;
// // //     color: var(--dark-green);
// // //     background-color: rgba(255, 255, 255, 0.9);
// // //     z-index: 10;
// // //     position: relative;
// // //   }
  
// // //   .loading-container svg {
// // //     color: var(--primary-green);
// // //     margin-bottom: 20px;
// // //   }
  
// // //   /* Bargain Initiation Popup */
// // //   .bargain-initiation-popup {
// // //     position: fixed;
// // //     top: 0;
// // //     left: 0;
// // //     right: 0;
// // //     bottom: 0;
// // //     background-color: rgba(75, 54, 33, 0.8);
// // //     display: flex;
// // //     justify-content: center;
// // //     align-items: center;
// // //     z-index: 1000;
// // //     /* backdrop-filter: blur(5px); */
// // //   }
  
// // //   .popup-content {
// // //     background: white;
// // //     padding: 25px;
// // //     border-radius: 15px;
// // //     width: 90%;
// // //     max-width: 500px;
// // //     box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
// // //     position: relative;
// // //     border: 2px solid var(--primary-green);
// // //     animation: growFromSoil 0.6s ease-out;
// // //     background-color: #fffdf7;
// // //   }
  
// // //   .popup-content h3 {
// // //     color: var(--dark-green);
// // //     text-align: center;
// // //     margin-bottom: 20px;
// // //     font-size: 1.5rem;
// // //     border-bottom: 2px dashed var(--light-green);
// // //     padding-bottom: 10px;
// // //   }
  
// // //   .close-btn {
// // //     position: absolute;
// // //     top: 15px;
// // //     right: 15px;
// // //     background: none;
// // //     border: none;
// // //     font-size: 1.2rem;
// // //     cursor: pointer;
// // //     color: var(--soil-brown);
// // //     transition: transform 0.3s;
// // //   }
  
// // //   .close-btn:hover {
// // //     transform: rotate(90deg);
// // //     color: var(--error-red);
// // //   }
  
// // //   .form-group {
// // //     margin-bottom: 20px;
// // //   }
  
// // //   .form-group label {
// // //     display: block;
// // //     margin-bottom: 8px;
// // //     color: var(--soil-brown);
// // //     font-weight: 600;
// // //   }
  
// // //   .form-group select, 
// // //   .form-group input {
// // //     width: 100%;
// // //     padding: 12px;
// // //     border: 2px solid var(--light-green);
// // //     border-radius: 8px;
// // //     background-color: white;
// // //     font-size: 1rem;
// // //     transition: all 0.3s;
// // //   }
  
// // //   .form-group select:focus, 
// // //   .form-group input:focus {
// // //     outline: none;
// // //     border-color: var(--primary-green);
// // //     box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.2);
// // //   }
  
// // //   .product-details {
// // //     background-color: var(--lighter-green);
// // //     padding: 15px;
// // //     border-radius: 8px;
// // //     margin: 15px 0;
// // //     border-left: 4px solid var(--primary-green);
// // //   }
  
// // //   .quantity-hints {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     margin-top: 5px;
// // //     font-size: 0.8rem;
// // //     color: var(--soil-brown);
// // //   }
  
// // //   .current-price-display {
// // //     background-color: #f5f5f5;
// // //     padding: 15px;
// // //     border-radius: 8px;
// // //     margin: 20px 0;
// // //     text-align: center;
// // //     border: 1px dashed var(--primary-green);
// // //   }
  
// // //   .total-price {
// // //     font-size: 1.3rem;
// // //     color: var(--primary-green);
// // //     font-weight: bold;
// // //     margin-top: 10px;
// // //   }
  
// // //   .error-message {
// // //     color: var(--error-red);
// // //     background-color: #ffebee;
// // //     padding: 10px;
// // //     border-radius: 5px;
// // //     margin: 15px 0;
// // //     text-align: center;
// // //   }
  
// // //   .confirm-btn {
// // //     width: 100%;
// // //     padding: 15px;
// // //     background-color: var(--primary-green);
// // //     color: white;
// // //     border: none;
// // //     border-radius: 8px;
// // //     font-size: 1.1rem;
// // //     font-weight: bold;
// // //     cursor: pointer;
// // //     transition: all 0.3s;
// // //     display: flex;
// // //     align-items: center;
// // //     justify-content: center;
// // //     gap: 10px;
// // //   }
  
// // //   .confirm-btn:hover {
// // //     background-color: var(--dark-green);
// // //     transform: translateY(-2px);
// // //     box-shadow: 0 5px 15px rgba(46, 125, 50, 0.4);
// // //   }
  
// // //   .confirm-btn.loading {
// // //     background-color: var(--light-green);
// // //   }
  
// // //   /* Chat Interface */
// // //   .chat-interface {
// // //     max-width: 1200px;
// // //     margin: 0 auto;
// // //     padding: 20px;
// // //     position: relative;
// // //     z-index: 1;
// // //     background-color: rgba(255, 255, 255, 0.95);
// // //     border-radius: 15px;
// // //     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
// // //     margin-top: 20px;
// // //     margin-bottom: 100px;
// // //     border: 1px solid var(--light-green);
// // //   }
  
// // //   .chat-header {
// // //     background: linear-gradient(to right, var(--primary-green), var(--secondary-green));
// // //     color: white;
// // //     padding: 15px 20px;
// // //     border-radius: 12px 12px 0 0;
// // //     margin-bottom: 20px;
// // //     position: relative;
// // //     overflow: hidden;
// // //   }
  
// // //   .chat-header::after {
// // //     content: "";
// // //     position: absolute;
// // //     bottom: 0;
// // //     left: 0;
// // //     right: 0;
// // //     height: 5px;
// // //     background: linear-gradient(to right, var(--wheat-yellow), var(--sun-orange));
// // //   }
  
// // //   .header-top {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     align-items: center;
// // //     margin-bottom: 10px;
// // //   }
  
// // //   .header-top h2 {
// // //     margin: 0;
// // //     font-size: 1.4rem;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 10px;
// // //   }
  
// // //   .connection-status {
// // //     padding: 5px 10px;
// // //     border-radius: 15px;
// // //     font-size: 0.7rem;
// // //     font-weight: bold;
// // //     text-transform: uppercase;
// // //   }
  
// // //   .connection-status.connected {
// // //     background-color: #4caf50;
// // //     animation: leafWiggle 2s infinite;
// // //   }
  
// // //   .connection-status.connecting {
// // //     background-color: #ffc107;
// // //   }
  
// // //   .connection-status.error,
// // //   .connection-status.disconnected {
// // //     background-color: #f44336;
// // //   }
  
// // //   .product-info {
// // //     background-color: rgba(255, 255, 255, 0.9);
// // //     padding: 12px;
// // //     border-radius: 8px;
// // //     color: var(--soil-brown);
// // //     margin-top: 10px;
// // //     display: flex;
// // //     flex-wrap: wrap;
// // //     gap: 15px;
// // //     justify-content: space-between;
// // //     font-size: 0.9rem;
// // //     border: 1px solid var(--light-green);
// // //   }
  
// // //   .product-info p {
// // //     margin: 5px 0;
// // //   }
  
// // //   .price-display {
// // //     display: flex;
// // //     gap: 15px;
// // //     flex-wrap: wrap;
// // //   }
  
// // //   .current-price, .base-price, .total-price {
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 5px;
// // //   }
  
// // //   .current-price::before {
// // //     content: "🌱";
// // //   }
  
// // //   .base-price::before {
// // //     content: "🌾";
// // //   }
  
// // //   .total-price::before {
// // //     content: "💰";
// // //   }
  
// // //   .status-accepted, .status-rejected {
// // //     width: 100%;
// // //     text-align: center;
// // //     padding: 5px;
// // //     border-radius: 5px;
// // //     margin-top: 5px;
// // //     font-weight: bold;
// // //   }
  
// // //   .status-accepted {
// // //     background-color: rgba(76, 175, 80, 0.2);
// // //     color: var(--primary-green);
// // //   }
  
// // //   .status-rejected {
// // //     background-color: rgba(244, 67, 54, 0.2);
// // //     color: var(--error-red);
// // //   }
  
// // //   /* Chat Messages */
// // //   .chat-messages {
// // //     height: 50vh;
// // //     overflow-y: auto;
// // //     padding: 15px;
// // //     background-color: #f9f9f7;
// // //     border-radius: 8px;
// // //     margin-bottom: 20px;
// // //     border: 1px solid #e0e0e0;
// // //     scroll-behavior: smooth;
// // //   }
  
// // //   .no-messages {
// // //     display: flex;
// // //     justify-content: center;
// // //     align-items: center;
// // //     height: 100%;
// // //     color: var(--soil-brown);
// // //     font-style: italic;
// // //   }
  
// // //   .message {
// // //     margin-bottom: 15px;
// // //     max-width: 80%;
// // //     position: relative;
// // //   }
  
// // //   .message::after {
// // //     content: "";
// // //     position: absolute;
// // //     bottom: 0;
// // //     width: 20px;
// // //     height: 20px;
// // //     background-size: contain;
// // //     background-repeat: no-repeat;
// // //   }
  
// // //   .message.consumer {
// // //     margin-right: auto;
// // //     text-align: left;
// // //   }
  
// // //   .message.farmer {
// // //     margin-left: auto;
// // //     text-align: right;
// // //   }
  
// // //   .message.system {
// // //     margin: 20px auto;
// // //     text-align: center;
// // //     max-width: 90%;
// // //   }
  
// // //   .message-content {
// // //     padding: 12px 15px;
// // //     border-radius: 18px;
// // //     display: inline-block;
// // //     position: relative;
// // //     word-wrap: break-word;
// // //     animation: growFromSoil 0.3s ease-out;
// // //   }
  
// // //   .consumer .message-content {
// // //     background-color: var(--sky-blue);
// // //     color: #333;
// // //     border-bottom-left-radius: 5px;
// // //     text-align: left;
// // //   }
  
// // //   .farmer .message-content {
// // //     background-color: var(--light-green);
// // //     color: #333;
// // //     border-bottom-right-radius: 5px;
// // //     text-align: right;
// // //   }
  
// // //   .system .message-content {
// // //     background-color: #f5f5f5;
// // //     color: var(--soil-brown);
// // //     border: 1px dashed var(--light-green);
// // //     font-size: 0.9rem;
// // //   }
  
// // //   .message-meta {
// // //     font-size: 0.7rem;
// // //     color: #666;
// // //     margin-top: 5px;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 8px;
// // //   }
  
// // //   .consumer .message-meta {
// // //     justify-content: flex-start;
// // //   }
  
// // //   .farmer .message-meta {
// // //     justify-content: flex-end;
// // //   }
  
// // //   .system .message-meta {
// // //     justify-content: center;
// // //   }
  
// // //   .typing-indicator {
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 10px;
// // //     margin: 10px 0;
// // //     color: var(--soil-brown);
// // //     font-style: italic;
// // //   }
  
// // //   .typing-dots {
// // //     display: flex;
// // //     gap: 5px;
// // //   }
  
// // //   .typing-dots div {
// // //     width: 8px;
// // //     height: 8px;
// // //     background-color: var(--light-green);
// // //     border-radius: 50%;
// // //     animation: typingAnimation 1.4s infinite ease-in-out;
// // //   }
  
// // //   .typing-dots div:nth-child(1) {
// // //     animation-delay: 0s;
// // //   }
  
// // //   .typing-dots div:nth-child(2) {
// // //     animation-delay: 0.2s;
// // //   }
  
// // //   .typing-dots div:nth-child(3) {
// // //     animation-delay: 0.4s;
// // //   }
  
// // //   @keyframes typingAnimation {
// // //     0%, 60%, 100% { transform: translateY(0); }
// // //     30% { transform: translateY(-5px); }
// // //   }
  
// // //   /* Chat Controls */
// // //   .chat-controls {
// // //     background-color: white;
// // //     padding: 15px;
// // //     border-radius: 8px;
// // //     box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
// // //     border: 1px solid #e0e0e0;
// // //   }
  
// // //   .price-suggestions {
// // //     background-color: var(--lighter-green);
// // //     padding: 15px;
// // //     border-radius: 8px;
// // //     margin-bottom: 15px;
// // //     border: 1px dashed var(--primary-green);
   
// // //   }
  
// // //   .price-suggestions h4 {
// // //     margin-top: 0;
// // //     color: var(--dark-green);
// // //     text-align: center;
// // //     margin-bottom: 15px;
// // //   }
  
// // //   .suggestion-buttons {
// // //     display: grid;
// // //     grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
// // //     gap: 10px;
   
// // //   }
  
// // //   .suggestion-btn {
// // //     padding: 12px;
// // //     border: none;
// // //     border-radius: 8px;
// // //     cursor: pointer;
// // //     transition: all 0.3s;
// // //     display: flex;
// // //     flex-direction: column;
// // //     align-items: center;
// // //     font-weight: bold;
// // //     background-color: white;
// // //     animation: leafWiggle 2s infinite;
// // //   }
  
// // //   .suggestion-btn:hover {
// // //     transform: translateY(-3px);
// // //     box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
// // //   }
  
// // //   .suggestion-btn.increase {
// // //     border: 2px solid var(--sun-orange);
// // //     color: var(--sun-orange);
// // //   }
  
// // //   .suggestion-btn.decrease {
// // //     border: 2px solid var(--primary-green);
// // //     color: var(--primary-green);
// // //   }
  
// // //   .suggestion-btn .price-change {
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 5px;
// // //     font-size: 1.1rem;
// // //   }
  
// // //   .suggestion-btn .price-label {
// // //     font-size: 0.7rem;
// // //     font-weight: normal;
// // //     margin-top: 5px;
// // //   }
  
// // //   .waiting-indicator {
// // //     text-align: center;
// // //     padding: 10px;
// // //     color: var(--soil-brown);
// // //     background-color: #fff3e0;
// // //     border-radius: 8px;
// // //     margin-bottom: 15px;
// // //     border: 1px solid var(--wheat-yellow);
// // //   }
  
// // //   .accepted-actions {
// // //     display: flex;
// // //     flex-direction: column;
// // //     gap: 10px;
// // //   }
  
// // //   .primary-action, .secondary-action {
// // //     padding: 15px;
// // //     border: none;
// // //     border-radius: 8px;
// // //     font-weight: bold;
// // //     cursor: pointer;
// // //     transition: all 0.3s;
// // //     text-align: center;
// // //   }
  
// // //   .primary-action {
// // //     background-color: var(--primary-green);
// // //     color: white;
// // //   }
  
// // //   .primary-action:hover {
// // //     background-color: var(--dark-green);
// // //     transform: translateY(-2px);
// // //     box-shadow: 0 5px 15px rgba(46, 125, 50, 0.4);
// // //   }
  
// // //   .secondary-action {
// // //     background-color: white;
// // //     color: var(--primary-green);
// // //     border: 2px solid var(--primary-green);
// // //   }
  
// // //   .secondary-action:hover {
// // //     background-color: var(--lighter-green);
// // //   }
  
// // //   /* Responsive Adjustments */
// // //   @media (max-width: 768px) {
// // //     .popup-content {
// // //       width: 95%;
// // //       padding: 15px;
// // //     }
    
// // //     .chat-header h2 {
// // //       font-size: 1.2rem;
// // //     }
    
// // //     .product-info {
// // //       flex-direction: column;
// // //       gap: 8px;
// // //     }
    
// // //     .price-display {
// // //       flex-direction: column;
// // //       gap: 5px;
// // //     }
    
// // //     .suggestion-buttons {
// // //       grid-template-columns: 1fr 1fr;
// // //     }
    
// // //     .message {
// // //       max-width: 90%;
// // //     }
// // //   }
  
// // //   @media (max-width: 480px) {
// // //     .chat-interface {
// // //       padding: 10px;
// // //     }
    
// // //     .suggestion-buttons {
// // //       grid-template-columns: 1fr;
// // //     }
    
// // //     .message-content {
// // //       padding: 10px 12px;
// // //     }
// // //   }
// // //   /* Unique Close Button Styles */
// // //   .unique-close-btn {
// // //     position: absolute;
// // //     top: 28px;
// // //     right: 150px;
// // //     background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
// // //     color: white;
// // //     border: none;
// // //     border-radius: 25px;
// // //     padding: 8px 15px;
// // //     cursor: pointer;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 8px;
// // //     font-weight: 600;
// // //     box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
// // //     z-index: 100;
// // //     transition: all 0.3s ease;
// // //     animation: leafWiggle 2s infinite;
// // //   }
  
// // //   .unique-close-btn:hover {
// // //     background: linear-gradient(135deg, #ff5252, #ff7676);
// // //     transform: translateY(-2px);
// // //     box-shadow: 0 6px 12px rgba(255, 107, 107, 0.4);
// // //   }
  
// // //   .unique-close-btn:active {
// // //     transform: translateY(0);
// // //   }
  
// // //   .unique-close-btn svg {
// // //     font-size: 1.1rem;
// // //   }
// // //   /* Bargain Popup Styles */
// // //   .bargain-popup-overlay {
// // //     position: fixed;
// // //     top: 0;
// // //     left: 0;
// // //     right: 0;
// // //     bottom: 0;
// // //     background-color: rgba(0, 0, 0, 0.5);
// // //     display: flex;
// // //     justify-content: center;
// // //     align-items: center;
// // //     z-index: 1000;
// // //     /* backdrop-filter: blur(3px); */
// // //   }
  
// // //   .bargain-popup-container {
// // //     width: 90%;
// // //     max-width: 500px;
// // //     background: white;
// // //     border-radius: 12px;
// // //     box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
// // //     overflow: hidden;
// // //     animation: popIn 0.3s ease-out;
// // //   }
  
// // //   @keyframes popIn {
// // //     from {
// // //       transform: scale(0.95);
// // //       opacity: 0;
// // //     }
// // //     to {
// // //       transform: scale(1);
// // //       opacity: 1;
// // //     }
// // //   }
  
// // //   .bargain-popup-content {
// // //     padding: 25px;
// // //   }
  
// // //   .popup-header {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     align-items: center;
// // //     margin-bottom: 20px;
// // //   }
  
// // //   .popup-header h3 {
// // //     margin: 0;
// // //     color: #2c3e50;
// // //     font-size: 1.4rem;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 10px;
// // //   }
  
// // //   .popup-close-btn {
// // //     background: none;
// // //     border: none;
// // //     font-size: 1.2rem;
// // //     color: #7f8c8d;
// // //     cursor: pointer;
// // //     transition: color 0.2s;
// // //   }
  
// // //   .popup-close-btn:hover {
// // //     color: #e74c3c;
// // //   }
  
// // //   .popup-section {
// // //     margin-bottom: 20px;
// // //   }
  
// // //   .popup-label {
// // //     display: block;
// // //     margin-bottom: 8px;
// // //     font-weight: 600;
// // //     color: #34495e;
// // //   }
  
// // //   .popup-select, .popup-input {
// // //     width: 100%;
// // //     padding: 12px 15px;
// // //     border: 1px solid #ddd;
// // //     border-radius: 6px;
// // //     font-size: 1rem;
// // //     transition: border-color 0.2s;
// // //   }
  
// // //   .popup-select:focus, .popup-input:focus {
// // //     outline: none;
// // //     border-color: #3498db;
// // //   }
  
// // //   .quantity-input-container {
// // //     position: relative;
// // //   }
  
// // //   .quantity-range {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     margin-top: 5px;
// // //     font-size: 0.85rem;
// // //     color: #7f8c8d;
// // //   }
  
// // //   .product-details {
// // //     background: #f8f9fa;
// // //     padding: 15px;
// // //     border-radius: 6px;
// // //     margin-top: 15px;
// // //   }
  
// // //   .detail-row {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     margin-bottom: 8px;
// // //   }
  
// // //   .detail-label {
// // //     font-weight: 600;
// // //     color: #34495e;
// // //   }
  
// // //   .detail-value {
// // //     color: #2c3e50;
// // //   }
  
// // //   .price-summary {
// // //     margin: 20px 0;
// // //     padding: 15px;
// // //     background: #f8f9fa;
// // //     border-radius: 6px;
// // //   }
  
// // //   .price-row {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     margin-bottom: 8px;
// // //   }
  
// // //   .price-row.total {
// // //     font-weight: 600;
// // //     font-size: 1.1rem;
// // //     margin-top: 10px;
// // //     padding-top: 10px;
// // //     border-top: 1px dashed #ddd;
// // //   }
  
// // //   .popup-error {
// // //     background: #ffebee;
// // //     color: #c62828;
// // //     padding: 12px;
// // //     border-radius: 6px;
// // //     margin: 15px 0;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 10px;
// // //     animation: shake 0.5s;
// // //   }
  
// // //   @keyframes shake {
// // //     0%, 100% { transform: translateX(0); }
// // //     20%, 60% { transform: translateX(-5px); }
// // //     40%, 80% { transform: translateX(5px); }
// // //   }
  
// // //   .popup-actions {
// // //     display: flex;
// // //     gap: 15px;
// // //     margin-top: 20px;
// // //   }
  
// // //   .popup-cancel-btn, .popup-confirm-btn {
// // //     flex: 1;
// // //     padding: 12px;
// // //     border-radius: 6px;
// // //     font-weight: 600;
// // //     cursor: pointer;
// // //     transition: all 0.2s;
// // //     display: flex;
// // //     align-items: center;
// // //     justify-content: center;
// // //     gap: 8px;
// // //   }
  
// // //   .popup-cancel-btn {
// // //     background: #f1f2f6;
// // //     color: #7f8c8d;
// // //     border: 1px solid #ddd;
// // //   }
  
// // //   .popup-cancel-btn:hover {
// // //     background: #e0e0e0;
// // //   }
  
// // //   .popup-confirm-btn {
// // //     background: #2ecc71;
// // //     color: white;
// // //     border: none;
// // //   }
  
// // //   .popup-confirm-btn:disabled {
// // //     background: #bdc3c7;
// // //     cursor: not-allowed;
// // //   }
  
// // //   .popup-confirm-btn.loading {
// // //     background: #27ae60;
// // //   }
  
// // //   /* Responsive adjustments */
// // //   @media (max-width: 480px) {
// // //     .bargain-popup-content {
// // //       padding: 20px;
// // //     }
    
// // //     .popup-actions {
// // //       flex-direction: column;
// // //     }
// // //   }
// // //   .popup-confirm-btn {
// // //     padding: 12px 24px;
// // //     background-color: #4CAF50;
// // //     color: white;
// // //     border: none;
// // //     border-radius: 4px;
// // //     cursor: pointer;
// // //     font-size: 16px;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 8px;
// // //     transition: all 0.3s ease;
// // //   }
  
// // //   .popup-confirm-btn:hover:not(:disabled) {
// // //     background-color: #45a049;
// // //     transform: translateY(-1px);
// // //   }
  
// // //   .popup-confirm-btn:disabled {
// // //     background-color: #cccccc;
// // //     cursor: not-allowed;
// // //   }
  
// // //   .popup-confirm-btn.loading {
// // //     background-color: #2196F3;
// // //   }
  
// // //   .popup-confirm-btn .fa-spinner {
// // //     margin-right: 8px;
// // //   }
// // //   .popup-confirm-btn {
// // //     padding: 12px 24px;
// // //     background-color: #4CAF50;
// // //     color: white;
// // //     border: none;
// // //     border-radius: 4px;
// // //     cursor: pointer;
// // //     font-size: 16px;
// // //     display: flex;
// // //     align-items: center;
// // //     justify-content: center;
// // //     gap: 8px;
// // //     transition: all 0.3s ease;
// // //     min-width: 180px;
// // //   }
  
// // //   .popup-confirm-btn:hover:not(:disabled) {
// // //     background-color: #45a049;
// // //     transform: translateY(-1px);
// // //     box-shadow: 0 2px 5px rgba(0,0,0,0.2);
// // //   }
  
// // //   .popup-confirm-btn:disabled {
// // //     background-color: #cccccc;
// // //     cursor: not-allowed;
// // //     opacity: 0.7;
// // //   }
  
// // //   .popup-confirm-btn.loading {
// // //     background-color: #2196F3;
// // //   }
  
// // //   .popup-confirm-btn .fa-spinner {
// // //     animation: spin 1s linear infinite;
// // //   }
  
// // //   @keyframes spin {
// // //     0% { transform: rotate(0deg); }
// // //     100% { transform: rotate(360deg); }
// // //   }
// // //   /* Message styling */
// // //   .message {
// // //     max-width: 70%;
// // //     padding: 10px 15px;
// // //     border-radius: 18px;
// // //     margin: 5px 0;
// // //     position: relative;
// // //   }
  
// // //   .message.system {
// // //     align-self: center;
// // //     background-color: #f0f0f0;
// // //     color: #555;
// // //     text-align: center;
// // //     max-width: 90%;
// // //   }
  
// // //   .message.consumer {
// // //     align-self: flex-end;
// // //     background-color: #0084ff;
// // //     color: white;
// // //     margin-left: auto;
// // //   }
  
// // //   .message.farmer {
// // //     align-self: flex-start;
// // //     background-color: #e5e5ea;
// // //     color: black;
// // //     margin-right: auto;
// // //   }
  
// // //   .system-label {
// // //     font-weight: bold;
// // //     margin-right: 5px;
// // //   }
// // //   /* For both consumer and farmer */
// // //   .final-actions, .accepted-actions, .rejected-actions {
// // //     display: flex;
// // //     flex-wrap: wrap;
// // //     gap: 10px;
// // //     margin-top: 20px;
// // //     justify-content: center;
// // //   }
  
// // //   .final-actions button, .accepted-actions button, .rejected-actions button {
// // //     padding: 10px 15px;
// // //     border-radius: 5px;
// // //     border: none;
// // //     cursor: pointer;
// // //     font-weight: bold;
// // //     transition: all 0.3s;
// // //   }
  
// // //   /* Consumer specific buttons */
// // //   .accepted-actions .bargain-again-btn {
// // //     background-color: #4CAF50;
// // //     color: white;
// // //   }
  
// // //   .accepted-actions .view-orders-btn {
// // //     background-color: #2196F3;
// // //     color: white;
// // //   }
  
// // //   .accepted-actions .dashboard-btn {
// // //     background-color: #9E9E9E;
// // //     color: white;
// // //   }
  
// // //   .accepted-actions .view-cart-btn {
// // //     background-color: #FF9800;
// // //     color: white;
// // //   }
  
// // //   /* Farmer buttons */
// // //   .final-actions .dashboard-btn {
// // //     background-color: #9E9E9E;
// // //     color: white;
// // //   }
  
// // //   .final-actions .view-orders-btn {
// // //     background-color: #2196F3;
// // //     color: white;
// // //   }
  
// // //   /* Hover effects */
// // //   .final-actions button:hover, .accepted-actions button:hover, .rejected-actions button:hover {
// // //     opacity: 0.9;
// // //     transform: translateY(-2px);
// // //   }
// // //   /* Farmer Chat Window - Agri Theme */
// // // :root {
// // //     --primary-green: #2e7d32;
// // //     --secondary-green: #388e3c;
// // //     --light-green: #8bc34a;
// // //     --lighter-green: #dcedc8;
// // //     --dark-green: #1b5e20;
// // //     --soil-brown: #5d4037;
// // //     --wheat-yellow: #ffd54f;
// // //     --sun-orange: #ff9800;
// // //     --sky-blue: #4fc3f7;
// // //     --error-red: #d32f2f;
// // //     --farmer-blue: #1976d2;
// // //   }
  
// // //   /* Animations */
// // //   @keyframes growFromField {
// // //     0% { transform: scale(0.9); opacity: 0; }
// // //     100% { transform: scale(1); opacity: 1; }
// // //   }
  
// // //   @keyframes tractorDrive {
// // //     0% { transform: translateX(-20px); opacity: 0; }
// // //     100% { transform: translateX(0); opacity: 1; }
// // //   }
  
// // //   /* Base Styles */
// // //   .bargain-chat-container {
// // //     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
// // //     background: linear-gradient(135deg, var(--lighter-green) 0%, #f5f5f5 100%);
// // //     min-height: 100vh;
// // //     position: relative;
// // //     overflow: hidden;
// // //   }
  
// // //   .bargain-chat-container::before {
// // //     content: "";
// // //     position: absolute;
// // //     bottom: 0;
// // //     left: 0;
// // //     right: 0;
// // //     height: 100px;
// // //     background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="%235D4037"/><path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="%235D4037"/><path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="%235D4037"/></svg>');
// // //     background-size: cover;
// // //     z-index: 0;
// // //   }
  
// // //   /* Loading and Error States */
// // //   .loading-container, .error-container {
// // //     display: flex;
// // //     flex-direction: column;
// // //     align-items: center;
// // //     justify-content: center;
// // //     height: 100vh;
// // //     color: var(--dark-green);
// // //     background-color: rgba(255, 255, 255, 0.9);
// // //     z-index: 10;
// // //     position: relative;
// // //   }
  
// // //   .loading-container svg {
// // //     color: var(--primary-green);
// // //     margin-bottom: 20px;
// // //   }
  
// // //   .error-container {
// // //     text-align: center;
// // //     padding: 20px;
// // //   }
  
// // //   .error-container button {
// // //     margin-top: 20px;
// // //     padding: 10px 20px;
// // //     background-color: var(--primary-green);
// // //     color: white;
// // //     border: none;
// // //     border-radius: 5px;
// // //     cursor: pointer;
// // //     transition: all 0.3s;
// // //   }
  
// // //   .error-container button:hover {
// // //     background-color: var(--dark-green);
// // //   }
  
// // //   /* Chat Interface */
// // //   .chat-interface {
// // //     max-width: 800px;
// // //     margin: 0 auto;
// // //     padding: 20px;
// // //     position: relative;
// // //     z-index: 1;
// // //     background-color: rgba(255, 255, 255, 0.95);
// // //     border-radius: 15px;
// // //     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
// // //     margin-top: 20px;
// // //     margin-bottom: 100px;
// // //     border: 1px solid var(--light-green);
// // //     animation: growFromField 0.5s ease-out;
// // //   }
  
// // //   /* Chat Header */
// // //   .chat-header {
// // //     background: linear-gradient(to right, var(--primary-green), var(--secondary-green));
// // //     color: white;
// // //     padding: 15px 20px;
// // //     border-radius: 12px 12px 0 0;
// // //     margin-bottom: 20px;
// // //     position: relative;
// // //     overflow: hidden;
// // //   }
  
// // //   .chat-header::after {
// // //     content: "";
// // //     position: absolute;
// // //     bottom: 0;
// // //     left: 0;
// // //     right: 0;
// // //     height: 5px;
// // //     background: linear-gradient(to right, var(--wheat-yellow), var(--sun-orange));
// // //   }
  
// // //   .header-top {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     align-items: center;
// // //     margin-bottom: 10px;
// // //   }
  
// // //   .header-top h2 {
// // //     margin: 0;
// // //     font-size: 1.4rem;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 10px;
// // //   }
  
// // //   .connection-status {
// // //     padding: 5px 10px;
// // //     border-radius: 15px;
// // //     font-size: 0.7rem;
// // //     font-weight: bold;
// // //     text-transform: uppercase;
// // //   }
  
// // //   .connection-status.connected {
// // //     background-color: var(--light-green);
// // //     animation: tractorDrive 0.5s ease-out;
// // //   }
  
// // //   .connection-status.connecting {
// // //     background-color: var(--wheat-yellow);
// // //   }
  
// // //   .connection-status.error,
// // //   .connection-status.disconnected {
// // //     background-color: var(--error-red);
// // //   }
  
// // //   .product-info {
// // //     background-color: rgba(255, 255, 255, 0.9);
// // //     padding: 12px;
// // //     border-radius: 8px;
// // //     color: var(--soil-brown);
// // //     margin-top: 10px;
// // //     display: flex;
// // //     flex-wrap: wrap;
// // //     gap: 15px;
// // //     justify-content: space-between;
// // //     font-size: 0.9rem;
// // //     border: 1px solid var(--light-green);
// // //   }
  
// // //   .product-info p {
// // //     margin: 5px 0;
// // //   }
  
// // //   .price-display {
// // //     display: flex;
// // //     gap: 15px;
// // //     flex-wrap: wrap;
// // //   }
  
// // //   .current-price, .base-price, .total-price {
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 5px;
// // //   }
  
// // //   .current-price::before {
// // //     content: "🌱";
// // //   }
  
// // //   .base-price::before {
// // //     content: "🌾";
// // //   }
  
// // //   .total-price::before {
// // //     content: "💰";
// // //   }
  
// // //   .status-accepted, .status-rejected {
// // //     width: 100%;
// // //     text-align: center;
// // //     padding: 5px;
// // //     border-radius: 5px;
// // //     margin-top: 5px;
// // //     font-weight: bold;
// // //   }
  
// // //   .status-accepted {
// // //     background-color: rgba(76, 175, 80, 0.2);
// // //     color: var(--primary-green);
// // //   }
  
// // //   .status-rejected {
// // //     background-color: rgba(244, 67, 54, 0.2);
// // //     color: var(--error-red);
// // //   }
  
// // //   /* Chat Messages */
// // //   /* .chat-messages {
// // //     height: 50vh;
// // //     overflow-y: auto;
// // //     padding: 15px;
// // //     background-color: #f9f9f7;
// // //     border-radius: 8px;
// // //     margin-bottom: 20px;
// // //     border: 1px solid #e0e0e0;
// // //     scroll-behavior: smooth;
// // //   } */
// // //   .chat-messages {
// // //     padding: 1rem;
// // //     overflow-y: auto;
// // //     flex: 1;
// // //   }
  
// // //   .message-bubble-wrapper {
// // //     display: flex;
// // //     margin-bottom: 12px;
// // //   }
  
// // //   .message-bubble-wrapper.sent {
// // //     justify-content: flex-end;
// // //   }
  
// // //   .message-bubble-wrapper.received {
// // //     justify-content: flex-start;
// // //   }
  
// // //   .message-bubble {
// // //     max-width: 70%;
// // //     padding: 12px;
// // //     border-radius: 16px;
// // //     background-color: #e6f7e8; /* Light green for farmer */
// // //     color: #000;
// // //     position: relative;
// // //   }
  
// // //   .message-bubble-wrapper.received .message-bubble {
// // //     background-color: #f0f0f0; /* Light gray for consumer */
// // //   }
  
// // //   .message-meta {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     font-size: 0.75rem;
// // //     color: #555;
// // //     margin-top: 6px;
// // //   }
  
// // //   .no-messages {
// // //     display: flex;
// // //     justify-content: center;
// // //     align-items: center;
// // //     height: 100%;
// // //     color: var(--soil-brown);
// // //     font-style: italic;
// // //   }
  
// // //   .message {
// // //     margin-bottom: 15px;
// // //     max-width: 80%;
// // //     position: relative;
// // //     animation: growFromField 0.3s ease-out;
// // //   }
  
// // //   .message.farmer {
// // //     margin-left: auto;
// // //     text-align: right;
// // //   }
  
// // //   .message.consumer {
// // //     margin-right: auto;
// // //     text-align: left;
// // //   }
  
// // //   .message.system {
// // //     margin: 20px auto;
// // //     text-align: center;
// // //     max-width: 90%;
// // //   }
  
// // //   .message-content {
// // //     padding: 12px 15px;
// // //     border-radius: 18px;
// // //     display: inline-block;
// // //     position: relative;
// // //     word-wrap: break-word;
// // //   }
  
// // //   .farmer .message-content {
// // //     background-color: var(--light-green);
// // //     color: #333;
// // //     border-bottom-right-radius: 5px;
// // //     text-align: right;
// // //   }
  
// // //   .consumer .message-content {
// // //     background-color: var(--sky-blue);
// // //     color: #333;
// // //     border-bottom-left-radius: 5px;
// // //     text-align: left;
// // //   }
  
// // //   .system .message-content {
// // //     background-color: #f5f5f5;
// // //     color: var(--soil-brown);
// // //     border: 1px dashed var(--light-green);
// // //     font-size: 0.9rem;
// // //   }
  
// // //   .message-meta {
// // //     font-size: 0.7rem;
// // //     color: #666;
// // //     margin-top: 5px;
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 8px;
// // //   }
  
// // //   .farmer .message-meta {
// // //     justify-content: flex-end;
// // //   }
  
// // //   .consumer .message-meta {
// // //     justify-content: flex-start;
// // //   }
  
// // //   .system .message-meta {
// // //     justify-content: center;
// // //   }
  
// // //   /* Chat Controls */
// // //   .chat-controls {
// // //     background-color: white;
// // //     padding: 15px;
// // //     border-radius: 8px;
// // //     box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
// // //     border: 1px solid #e0e0e0;
// // //   }
  
// // //   .price-suggestions {
// // //     background-color: var(--lighter-green);
// // //     padding: 15px;
// // //     border-radius: 8px;
// // //     margin-bottom: 15px;
// // //     border: 1px dashed var(--primary-green);
// // //   }
  
// // //   .price-suggestions h4 {
// // //     margin-top: 0;
// // //     color: var(--dark-green);
// // //     text-align: center;
// // //     margin-bottom: 15px;
// // //   }
  
// // //   .suggestion-buttons {
// // //     display: grid;
// // //     grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
// // //     gap: 10px;
// // //     margin-bottom: 15px;
// // //   }
  
// // //   .suggestion-btn {
// // //     padding: 12px;
// // //     border: none;
// // //     border-radius: 8px;
// // //     cursor: pointer;
// // //     transition: all 0.3s;
// // //     display: flex;
// // //     flex-direction: column;
// // //     align-items: center;
// // //     font-weight: bold;
// // //     background-color: white;
// // //   }
  
// // //   .suggestion-btn:hover {
// // //     transform: translateY(-3px);
// // //     box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
// // //   }
  
// // //   .suggestion-btn.increase {
// // //     border: 2px solid var(--sun-orange);
// // //     color: var(--sun-orange);
// // //   }
  
// // //   .suggestion-btn.decrease {
// // //     border: 2px solid var(--primary-green);
// // //     color: var(--primary-green);
// // //   }
  
// // //   .suggestion-btn .price-change {
// // //     display: flex;
// // //     align-items: center;
// // //     gap: 5px;
// // //     font-size: 1.1rem;
// // //   }
  
// // //   .suggestion-btn .price-label {
// // //     font-size: 0.7rem;
// // //     font-weight: normal;
// // //     margin-top: 5px;
// // //   }
  
// // //   .action-buttons {
// // //     display: flex;
// // //     gap: 10px;
// // //     margin-top: 15px;
// // //   }
  
// // //   .accept-btn, .reject-btn {
// // //     flex: 1;
// // //     padding: 12px;
// // //     border: none;
// // //     border-radius: 8px;
// // //     font-weight: bold;
// // //     cursor: pointer;
// // //     transition: all 0.3s;
// // //     display: flex;
// // //     align-items: center;
// // //     justify-content: center;
// // //     gap: 8px;
// // //   }
  
// // //   .accept-btn {
// // //     background-color: var(--primary-green);
// // //     color: white;
// // //   }
  
// // //   .accept-btn:hover {
// // //     background-color: var(--dark-green);
// // //   }
  
// // //   .reject-btn {
// // //     background-color: white;
// // //     color: var(--error-red);
// // //     border: 2px solid var(--error-red);
// // //   }
  
// // //   .reject-btn:hover {
// // //     background-color: #ffebee;
// // //   }
  
// // //   .waiting-indicator {
// // //     text-align: center;
// // //     padding: 10px;
// // //     color: var(--soil-brown);
// // //     background-color: #fff3e0;
// // //     border-radius: 8px;
// // //     margin-bottom: 15px;
// // //     border: 1px solid var(--wheat-yellow);
// // //   }
  
// // //   .accepted-actions, .rejected-actions {
// // //     display: flex;
// // //     gap: 10px;
// // //   }
  
// // //   .primary-action, .secondary-action {
// // //     flex: 1;
// // //     padding: 15px;
// // //     border: none;
// // //     border-radius: 8px;
// // //     font-weight: bold;
// // //     cursor: pointer;
// // //     transition: all 0.3s;
// // //     text-align: center;
// // //   }
  
// // //   .primary-action {
// // //     background-color: var(--primary-green);
// // //     color: white;
// // //   }
  
// // //   .primary-action:hover {
// // //     background-color: var(--dark-green);
// // //     transform: translateY(-2px);
// // //     box-shadow: 0 5px 15px rgba(46, 125, 50, 0.4);
// // //   }
  
// // //   .secondary-action {
// // //     background-color: white;
// // //     color: var(--primary-green);
// // //     border: 2px solid var(--primary-green);
// // //   }
  
// // //   .secondary-action:hover {
// // //     background-color: var(--lighter-green);
// // //   }
  
// // //   /* Responsive Adjustments */
// // //   @media (max-width: 768px) {
// // //     .chat-interface {
// // //       padding: 15px;
// // //       margin: 10px;
// // //       margin-bottom: 80px;
// // //     }
    
// // //     .header-top h2 {
// // //       font-size: 1.2rem;
// // //     }
    
// // //     .price-display {
// // //       flex-direction: column;
// // //       gap: 5px;
// // //     }
    
// // //     .suggestion-buttons {
// // //       grid-template-columns: 1fr 1fr;
// // //     }
    
// // //     .action-buttons {
// // //       flex-direction: column;
// // //     }
// // //   }
  
// // //   @media (max-width: 480px) {
// // //     .chat-interface {
// // //       padding: 10px;
// // //     }
    
// // //     .suggestion-buttons {
// // //       grid-template-columns: 1fr;
// // //     }
    
// // //     .message-content {
// // //       padding: 10px 12px;
// // //     }
    
// // //     .product-info {
// // //       flex-direction: column;
// // //     }
// // //   }
// // //   /* Error State */
// // //   .chat-error-container {
// // //     display: flex;
// // //     flex-direction: column;
// // //     align-items: center;
// // //     justify-content: center;
// // //     height: 100%;
// // //     padding: 2rem;
// // //     text-align: center;
// // //   }
  
// // //   .error-content {
// // //     max-width: 500px;
// // //   }
  
// // //   .error-actions {
// // //     display: flex;
// // //     gap: 1rem;
// // //     margin-top: 2rem;
// // //   }
  
// // //   /* Message Bubbles */
// // //   .message-bubble {
// // //     max-width: 70%;
// // //     padding: 0.75rem 1rem;
// // //     border-radius: 1rem;
// // //     margin-bottom: 0.5rem;
// // //     position: relative;
// // //   }
  
// // //   .message-bubble.sent {
// // //     background: #dcf8c6;
// // //     align-self: flex-end;
// // //   }
  
// // //   .message-bubble.received {
// // //     background: #ffffff;
// // //     align-self: flex-start;
// // //     border: 1px solid #e5e5ea;
// // //   }
  
// // //   .price-offer {
// // //     font-weight: bold;
// // //     color: #25D366;
// // //     margin-top: 0.25rem;
// // //   }
  
// // //   /* Price Controls */
// // //   .price-controls {
// // //     border-top: 1px solid #eee;
// // //     padding: 1rem;
// // //     background: #f9f9f9;
// // //   }
  
// // //   .suggestion-grid {
// // //     display: grid;
// // //     grid-template-columns: repeat(3, 1fr);
// // //     gap: 0.5rem;
// // //     margin: 1rem 0;
// // //   }
  
// // //   .price-btn {
// // //     padding: 0.75rem;
// // //     border-radius: 0.5rem;
// // //     border: 1px solid #ddd;
// // //     background: white;
// // //     transition: all 0.2s;
// // //   }
  
// // //   .price-btn:hover:not(:disabled) {
// // //     background: #f0f0f0;
// // //   }
  
// // //   .price-btn.active {
// // //     background: #4CAF50;
// // //     color: white;
// // //     border-color: #4CAF50;
// // //   }
  
// // //   .price-amount {
// // //     font-weight: bold;
// // //     font-size: 1.1rem;
// // //   }
  
// // //   /* Price Suggestions Styles */
// // //   .price-suggestions {
// // //     background: #f8f9fa;
// // //     border-radius: 10px;
// // //     padding: 15px;
// // //     margin-bottom: 15px;
// // //     box-shadow: 0 2px 5px rgba(0,0,0,0.1);
// // //   }
  
// // //   .suggestion-header {
// // //     display: flex;
// // //     justify-content: space-between;
// // //     align-items: center;
// // //     margin-bottom: 10px;
// // //   }
  
// // //   .close-suggestions {
// // //     background: none;
// // //     border: none;
// // //     color: #6c757d;
// // //     cursor: pointer;
// // //     font-size: 1rem;
// // //   }
  
// // //   .suggestion-buttons-grid {
// // //     display: grid;
// // //     grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
// // //     gap: 10px;
// // //   }
  
// // //   .suggestion-btn {
// // //     display: flex;
// // //     align-items: center;
// // //     padding: 10px;
// // //     border-radius: 8px;
// // //     border: 1px solid #ddd;
// // //     background: white;
// // //     cursor: pointer;
// // //     transition: all 0.2s;
// // //   }
  
// // //   .suggestion-btn:hover {
// // //     transform: translateY(-2px);
// // //     box-shadow: 0 3px 8px rgba(0,0,0,0.1);
// // //   }
  
// // //   .suggestion-btn.increase {
// // //     border-left: 3px solid #28a745;
// // //   }
  
// // //   .suggestion-btn.decrease {
// // //     border-left: 3px solid #dc3545;
// // //   }
  
// // //   .suggestion-icon {
// // //     margin-right: 10px;
// // //     font-size: 1.2rem;
// // //   }
  
// // //   .suggestion-details {
// // //     display: flex;
// // //     flex-direction: column;
// // //     text-align: left;
// // //   }
  
// // //   .suggestion-price {
// // //     font-weight: bold;
// // //   }
  
// // //   .suggestion-diff {
// // //     font-size: 0.8rem;
// // //     color: #6c757d;
// // //   }
  
// // //   /* Bargain Action Buttons */
// // //   .bargain-actions {
// // //     display: flex;
// // //     flex-direction: column;
// // //     gap: 10px;
// // //   }
  
// // //   .show-suggestions-btn {
// // //     background: #17a2b8;
// // //     color: white;
// // //     padding: 10px 15px;
// // //     border: none;
// // //     border-radius: 5px;
// // //     cursor: pointer;
// // //   }
  
// // //   .status-buttons {
// // //     display: flex;
// // //     gap: 10px;
// // //   }
  
// // //   .accept-btn {
// // //     background: #28a745;
// // //     color: white;
// // //     padding: 10px 15px;
// // //     border: none;
// // //     border-radius: 5px;
// // //     cursor: pointer;
// // //     flex: 1;
// // //   }
  
// // //   .reject-btn {
// // //     background: #dc3545;
// // //     color: white;
// // //     padding: 10px 15px;
// // //     border: none;
// // //     border-radius: 5px;
// // //     cursor: pointer;
// // //     flex: 1;
// // //   }
// // //   /* Message styling */
// // //   .message {
// // //     max-width: 70%;
// // //     padding: 10px 15px;
// // //     border-radius: 18px;
// // //     margin: 5px 0;
// // //     position: relative;
// // //   }
  
// // //   .message.system {
// // //     align-self: center;
// // //     background-color: #f0f0f0;
// // //     color: #555;
// // //     text-align: center;
// // //     max-width: 90%;
// // //   }
  
// // //   .message.farmer {
// // //     align-self: flex-end;
// // //     background-color: #0084ff;
// // //     color: white;
// // //     margin-left: auto;
// // //   }
  
// // //   .message.consumer {
// // //     align-self: flex-start;
// // //     background-color: #e5e5ea;
// // //     color: black;
// // //     margin-right: auto;
// // //   }
  
// // //   .system-label {
// // //     font-weight: bold;
// // //     margin-right: 5px;
// // //   }
  
// // //   /* Typing indicator */
// // //   .typing-indicator {
// // //     display: flex;
// // //     align-items: center;
// // //     padding: 10px;
// // //     color: #666;
// // //     font-style: italic;
// // //   }
  
// // //   .typing-dots {
// // //     display: flex;
// // //     margin-right: 8px;
// // //   }
  
// // //   .typing-dots div {
// // //     width: 8px;
// // //     height: 8px;
// // //     background-color: #666;
// // //     border-radius: 50%;
// // //     margin: 0 2px;
// // //     animation: typingAnimation 1.4s infinite ease-in-out;
// // //   }
  
// // //   .typing-dots div:nth-child(1) {
// // //     animation-delay: 0s;
// // //   }
// // //   .typing-dots div:nth-child(2) {
// // //     animation-delay: 0.2s;
// // //   }
// // //   .typing-dots div:nth-child(3) {
// // //     animation-delay: 0.4s;
// // //   }
  
// // //   @keyframes typingAnimation {
// // //     0%, 60%, 100% { transform: translateY(0); }
// // //     30% { transform: translateY(-5px); }
// // //   }
// // //   /* For both consumer and farmer */
// // //   .final-actions, .accepted-actions, .rejected-actions {
// // //     display: flex;
// // //     flex-wrap: wrap;
// // //     gap: 10px;
// // //     margin-top: 20px;
// // //     justify-content: center;
// // //   }
  
// // //   .final-actions button, .accepted-actions button, .rejected-actions button {
// // //     padding: 10px 15px;
// // //     border-radius: 5px;
// // //     border: none;
// // //     cursor: pointer;
// // //     font-weight: bold;
// // //     transition: all 0.3s;
// // //   }
  
// // //   /* Consumer specific buttons */
// // //   .accepted-actions .bargain-again-btn {
// // //     background-color: #4CAF50;
// // //     color: white;
// // //   }
  
// // //   .accepted-actions .view-orders-btn {
// // //     background-color: #2196F3;
// // //     color: white;
// // //   }
  
// // //   .accepted-actions .dashboard-btn {
// // //     background-color: #9E9E9E;
// // //     color: white;
// // //   }
  
// // //   .accepted-actions .view-cart-btn {
// // //     background-color: #FF9800;
// // //     color: white;
// // //   }
  
// // //   /* Farmer buttons */
// // //   .final-actions .dashboard-btn {
// // //     background-color: #9E9E9E;
// // //     color: white;
// // //   }
  
// // //   .final-actions .view-orders-btn {
// // //     background-color: #2196F3;
// // //     color: white;
// // //   }
  
// // //   /* Hover effects */
// // //   .final-actions button:hover, .accepted-actions button:hover, .rejected-actions button:hover {
// // //     opacity: 0.9;
// // //     transform: translateY(-2px);
// // //   }
// // /* General Styling - Agri Theme */
// // .addproduce-container {
// //     font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
// //     max-width: 1200px;
// //     margin: 0 auto;
// //     padding: 20px;
// //     color: #3e3d36;
// //     background-color: #f8f6f0;
// //     border-radius: 12px;
// //     box-shadow: 0 4px 12px rgba(94, 84, 45, 0.1);
// //     background-image: linear-gradient(to bottom, #f8f6f0, #f1eee4);
// //     border: 1px solid #d4d0c0;
// //   }
  
// //   .addproduce-container h1 {
// //     color: #4a6b22;
// //     text-align: center;
// //     margin-bottom: 30px;
// //     font-size: 2.2rem;
// //     border-bottom: 3px solid #8ba153;
// //     padding-bottom: 10px;
// //     text-shadow: 1px 1px 2px rgba(139, 161, 83, 0.2);
// //     font-weight: 700;
// //     letter-spacing: 0.5px;
// //   }
  
// //   .addproduce-container h3 {
// //     color: #5a7242;
// //     margin: 25px 0 15px;
// //     font-size: 1.4rem;
// //     border-left: 4px solid #a3b899;
// //     padding-left: 10px;
// //   }
  
// //   /* Farmer Info Section - Farm Card Style */
// //   .farmer-info {
// //     background-color: #f0ede4;
// //     padding: 15px;
// //     border-radius: 8px;
// //     margin-bottom: 25px;
// //     border: 1px solid #d1c7a3;
// //     box-shadow: inset 0 0 10px rgba(139, 161, 83, 0.1);
// //     background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill="%23d1c7a3" fill-opacity="0.1" d="M30,10 Q50,5 70,10 Q95,15 90,40 Q85,65 70,80 Q50,95 30,80 Q15,65 10,40 Q5,15 30,10 Z"/></svg>');
// //     background-size: 50px;
// //   }
  
// //   .farmer-info p {
// //     margin: 8px 0;
// //     font-size: 1rem;
// //     color: #5a5a4a;
// //     font-weight: 500;
// //   }
  
// //   /* Market Buttons - Farm Stand Style */
// //   .addproduce-market-buttons {
// //     display: flex;
// //     justify-content: center;
// //     gap: 20px;
// //     margin-bottom: 30px;
// //     flex-wrap: wrap;
// //   }
  
// //   .addproduce-market-buttons button {
// //     flex: 1;
// //     min-width: 250px;
// //     max-width: 350px;
// //     padding: 15px;
// //     border: none;
// //     border-radius: 8px;
// //     background-color: #f0e8d5;
// //     color: #5a7242;
// //     font-size: 1rem;
// //     font-weight: 600;
// //     cursor: pointer;
// //     transition: all 0.3s ease;
// //     box-shadow: 0 4px 8px rgba(94, 84, 45, 0.1);
// //     display: flex;
// //     align-items: center;
// //     justify-content: center;
// //     gap: 10px;
// //     border: 1px solid #d1c7a3;
// //     position: relative;
// //     overflow: hidden;
// //   }
  
// //   .addproduce-market-buttons button::before {
// //     content: "";
// //     position: absolute;
// //     top: 0;
// //     left: 0;
// //     right: 0;
// //     height: 3px;
// //     background-color: #8ba153;
// //   }
  
// //   .addproduce-market-buttons button:hover {
// //     transform: translateY(-3px);
// //     box-shadow: 0 6px 12px rgba(94, 84, 45, 0.15);
// //     background-color: #e8dfc6;
// //   }
  
// //   .addproduce-market-buttons button.active {
// //     background-color: #8ba153;
// //     color: white;
// //     border-color: #738a44;
// //   }
  
// //   .addproduce-market-buttons button.active::before {
// //     background-color: #5a7242;
// //   }
  
// //   .addproduce-market-buttons button:disabled {
// //     background-color: #e0d9c8;
// //     color: #a8a294;
// //     cursor: not-allowed;
// //     transform: none;
// //     box-shadow: none;
// //   }
  
// //   .addproduce-market-buttons img {
// //     width: 30px;
// //     height: 30px;
// //     border-radius: 50%;
// //     object-fit: cover;
// //     border: 2px solid rgba(255, 255, 255, 0.3);
// //   }
  
// //   /* Add Produce Button - Harvest Button */
// //   .addproduce-button {
// //     display: block;
// //     margin: 0 auto 25px;
// //     padding: 12px 25px;
// //     background-color: #8ba153;
// //     color: white;
// //     border: none;
// //     border-radius: 6px;
// //     font-size: 1rem;
// //     font-weight: 600;
// //     cursor: pointer;
// //     transition: all 0.3s ease;
// //     box-shadow: 0 2px 5px rgba(94, 84, 45, 0.2);
// //     text-transform: uppercase;
// //     letter-spacing: 0.5px;
// //     position: relative;
// //     overflow: hidden;
// //   }
  
// //   .addproduce-button::after {
// //     content: "";
// //     position: absolute;
// //     top: 50%;
// //     left: 50%;
// //     width: 5px;
// //     height: 5px;
// //     background: rgba(255, 255, 255, 0.5);
// //     opacity: 0;
// //     border-radius: 100%;
// //     transform: scale(1, 1) translate(-50%);
// //     transform-origin: 50% 50%;
// //   }
  
// //   .addproduce-button:hover {
// //     background-color: #7d934a;
// //     transform: translateY(-2px);
// //     box-shadow: 0 4px 8px rgba(94, 84, 45, 0.3);
// //   }
  
// //   .addproduce-button:hover::after {
// //     animation: ripple 1s ease-out;
// //   }
  
// //   @keyframes ripple {
// //     0% {
// //       transform: scale(0, 0);
// //       opacity: 0.5;
// //     }
// //     100% {
// //       transform: scale(20, 20);
// //       opacity: 0;
// //     }
// //   }
  
// //   .addproduce-button:disabled {
// //     background-color: #b8b8a8;
// //     cursor: not-allowed;
// //     transform: none;
// //     box-shadow: none;
// //   }
  
// //   /* Form Styling - Farm Form */
// //   .addproduce-form {
// //     background-color: white;
// //     padding: 25px;
// //     border-radius: 10px;
// //     margin-bottom: 30px;
// //     box-shadow: 0 4px 10px rgba(94, 84, 45, 0.08);
// //     border: 1px solid #d1c7a3;
// //     background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="%23f0e8d5" d="M0 0h20v20H0z"/></svg>');
// //   }
  
// //   .addproduce-form h3 {
// //     margin-top: 0;
// //     margin-bottom: 20px;
// //     color: #5a7242;
// //     text-align: center;
// //     font-size: 1.5rem;
// //     padding: 10px;
// //     background-color: #f0e8d5;
// //     border-radius: 6px;
// //     border-left: none;
// //   }
  
// //   .addproduce-form form > div {
// //     margin-bottom: 20px;
// //   }
  
// //   .addproduce-form label {
// //     display: block;
// //     margin-bottom: 8px;
// //     font-weight: 600;
// //     color: #5a5a4a;
// //     font-size: 0.95rem;
// //   }
  
// //   .addproduce-form input,
// //   .addproduce-form select {
// //     width: 100%;
// //     padding: 12px;
// //     border: 1px solid #d1c7a3;
// //     border-radius: 6px;
// //     font-size: 1rem;
// //     transition: all 0.3s ease;
// //     background-color: #f9f7f0;
// //   }
  
// //   .addproduce-form input:focus,
// //   .addproduce-form select:focus {
// //     border-color: #8ba153;
// //     outline: none;
// //     box-shadow: 0 0 0 3px rgba(139, 161, 83, 0.2);
// //     background-color: white;
// //   }
  
// //   .addproduce-form input[type="number"] {
// //     -moz-appearance: textfield;
// //   }
  
// //   .addproduce-form input::-webkit-outer-spin-button,
// //   .addproduce-form input::-webkit-inner-spin-button {
// //     -webkit-appearance: none;
// //     margin: 0;
// //   }
  
// //   /* Submit Button - Plant Button */
// //   .addproduce-submit-button {
// //     width: 100%;
// //     padding: 12px;
// //     background-color: #8ba153;
// //     color: white;
// //     border: none;
// //     border-radius: 6px;
// //     font-size: 1rem;
// //     font-weight: 600;
// //     cursor: pointer;
// //     transition: all 0.3s ease;
// //     margin-top: 10px;
// //     position: relative;
// //     overflow: hidden;
// //   }
  
// //   .addproduce-submit-button:hover {
// //     background-color: #7d934a;
// //     transform: translateY(-2px);
// //     box-shadow: 0 4px 8px rgba(94, 84, 45, 0.2);
// //   }
  
// //   .addproduce-submit-button::before {
// //     content: "";
// //     position: absolute;
// //     top: 0;
// //     left: -100%;
// //     width: 100%;
// //     height: 100%;
// //     background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
// //     transition: 0.5s;
// //   }
  
// //   .addproduce-submit-button:hover::before {
// //     left: 100%;
// //   }
  
// //   .addproduce-submit-button:disabled {
// //     background-color: #b8b8a8;
// //     cursor: not-allowed;
// //     transform: none;
// //     box-shadow: none;
// //   }
  
// //   /* Table Styling - Farm Stand Table */
// //   .addproduce-table {
// //     width: 100%;
// //     border-collapse: separate;
// //     border-spacing: 0;
// //     margin-top: 20px;
// //     background-color: white;
// //     border-radius: 8px;
// //     overflow: hidden;
// //     box-shadow: 0 4px 10px rgba(94, 84, 45, 0.08);
// //     border: 1px solid #d1c7a3;
// //   }
  
// //   .addproduce-table th,
// //   .addproduce-table td {
// //     padding: 15px;
// //     text-align: left;
// //     border-bottom: 1px solid #e8e3d5;
// //   }
  
// //   .addproduce-table th {
// //     background-color: #8ba153;
// //     color: white;
// //     font-weight: 600;
// //     text-transform: uppercase;
// //     font-size: 0.9rem;
// //     letter-spacing: 0.5px;
// //   }
  
// //   .addproduce-table tr:nth-child(even) {
// //     background-color: #f9f7f0;
// //   }
  
// //   .addproduce-table tr:hover {
// //     background-color: #f0e8d5;
// //   }
  
// //   /* Action Buttons - Farm Tools */
// //   .addproduce-edit-button,
// //   .addproduce-remove-button {
// //     padding: 8px 12px;
// //     margin-right: 8px;
// //     border: none;
// //     border-radius: 4px;
// //     font-size: 0.9rem;
// //     cursor: pointer;
// //     transition: all 0.2s ease;
// //     font-weight: 600;
// //   }
  
// //   .addproduce-edit-button {
// //     background-color: #e8a33d;
// //     color: white;
// //   }
  
// //   .addproduce-edit-button:hover {
// //     background-color: #d18d2a;
// //   }
  
// //   .addproduce-remove-button {
// //     background-color: #d15a4a;
// //     color: white;
// //   }
  
// //   .addproduce-remove-button:hover {
// //     background-color: #b74738;
// //   }
  
// //   .addproduce-edit-button:disabled,
// //   .addproduce-remove-button:disabled {
// //     background-color: #b8b8a8;
// //     cursor: not-allowed;
// //   }
  
// //   /* Messages - Farm Alerts */
// //   .error-message {
// //     background-color: #f8e8e6;
// //     color: #b74738;
// //     padding: 15px;
// //     border-radius: 6px;
// //     margin: 20px 0;
// //     border-left: 4px solid #d15a4a;
// //     font-weight: 500;
// //     box-shadow: inset 0 0 10px rgba(209, 90, 74, 0.1);
// //   }
  
// //   .loading-indicator {
// //     text-align: center;
// //     padding: 15px;
// //     color: #8ba153;
// //     font-weight: 600;
// //     background-color: #f0e8d5;
// //     border-radius: 6px;
// //     border-left: 4px solid #8ba153;
// //   }
  
// //   /* Instructions Modal - Farm Guide */
// //   .addproduce-instructions {
// //     max-width: 800px;
// //     margin: 0 auto;
// //     padding: 30px;
// //     background-color: white;
// //     border-radius: 10px;
// //     box-shadow: 0 5px 20px rgba(94, 84, 45, 0.15);
// //     border: 1px solid #d1c7a3;
// //     background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill="%23f0e8d5" fill-opacity="0.3" d="M20,20 L80,20 L80,80 L20,80 Z"/></svg>');
// //   }
  
// //   .addproduce-instructions h2 {
// //     color: #5a7242;
// //     text-align: center;
// //     margin-bottom: 25px;
// //     font-size: 1.8rem;
// //     padding-bottom: 10px;
// //     border-bottom: 2px solid #d1c7a3;
// //   }
  
// //   .instructions-content {
// //     background-color: #f9f7f0;
// //     padding: 20px;
// //     border-radius: 8px;
// //     margin-bottom: 25px;
// //     border: 1px dashed #d1c7a3;
// //   }
  
// //   .instructions-content ol {
// //     padding-left: 20px;
// //   }
  
// //   .instructions-content li {
// //     margin-bottom: 15px;
// //     line-height: 1.6;
// //     color: #5a5a4a;
// //     position: relative;
// //     padding-left: 30px;
// //   }
  
// //   .instructions-content li::before {
// //     content: "🌱";
// //     position: absolute;
// //     left: 0;
// //   }
  
// //   .instructions-content strong {
// //     color: #5a7242;
// //     font-weight: 700;
// //   }
  
// //   .close-instructions-button {
// //     display: block;
// //     width: 100%;
// //     padding: 15px;
// //     background-color: #8ba153;
// //     color: white;
// //     border: none;
// //     border-radius: 6px;
// //     font-size: 1rem;
// //     font-weight: 600;
// //     cursor: pointer;
// //     transition: all 0.3s ease;
// //     margin-top: 20px;
// //     text-transform: uppercase;
// //     letter-spacing: 0.5px;
// //   }
  
// //   .close-instructions-button:hover {
// //     background-color: #7d934a;
// //     transform: translateY(-2px);
// //     box-shadow: 0 4px 8px rgba(94, 84, 45, 0.2);
// //   }
  
// //   /* Responsive Design - Mobile Farm Stand */
// //   @media (max-width: 768px) {
// //     .addproduce-market-buttons {
// //       flex-direction: column;
// //       align-items: center;
// //     }
    
// //     .addproduce-market-buttons button {
// //       width: 100%;
// //     }
    
// //     .addproduce-table {
// //       display: block;
// //       overflow-x: auto;
// //     }
    
// //     .addproduce-instructions {
// //       padding: 20px;
// //     }
    
// //     .addproduce-container h1 {
// //       font-size: 1.8rem;
// //     }
// //   }
  
// //   @media (max-width: 480px) {
// //     .addproduce-container {
// //       padding: 15px;
// //     }
    
// //     .addproduce-form {
// //       padding: 15px;
// //     }
    
// //     .addproduce-table th,
// //     .addproduce-table td {
// //       padding: 10px;
// //       font-size: 0.9rem;
// //     }
    
// //     .addproduce-edit-button,
// //     .addproduce-remove-button {
// //       padding: 6px 8px;
// //       font-size: 0.8rem;
// //       margin-right: 5px;
// //     }
    
// //     .instructions-content li {
// //       padding-left: 25px;
// //     }
// //   }
// /* subscribe.css */

// /* Base Styles */
// .subscribe-page {
//     font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
//     max-width: 1200px;
//     margin: 0 auto;
//     padding: 20px;
//     color: #333;
//     background-color: #f8f9fa;
//     min-height: 100vh;
//   }
  
//   /* Loading Overlay */
//   .loading-overlay {
//     position: fixed;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background-color: rgba(255, 255, 255, 0.8);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     z-index: 1000;
//   }
  
//   .loading-spinner {
//     border: 5px solid #f3f3f3;
//     border-top: 5px solid #4CAF50;
//     border-radius: 50%;
//     width: 50px;
//     height: 50px;
//     animation: spin 1s linear infinite;
//   }
  
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
  
//   /* Success Message */
//   .success-message {
//     position: fixed;
//     top: 20px;
//     left: 50%;
//     transform: translateX(-50%);
//     background-color: #4CAF50;
//     color: white;
//     padding: 12px 24px;
//     border-radius: 4px;
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     z-index: 100;
//     animation: fadeIn 0.3s ease-out;
//   }
  
//   @keyframes fadeIn {
//     from { opacity: 0; transform: translate(-50%, -20px); }
//     to { opacity: 1; transform: translate(-50%, 0); }
//   }
  
//   /* Welcome Container */
//   .welcome-container {
//     background: linear-gradient(135deg, #6e8efb, #a777e3);
//     color: white;
//     border-radius: 12px;
//     padding: 20px;
//     margin-bottom: 24px;
//     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
//   }
  
//   .welcome-content {
//     display: flex;
//     align-items: center;
//     gap: 16px;
//   }
  
//   .welcome-icon {
//     font-size: 32px;
//     background-color: rgba(255, 255, 255, 0.2);
//     width: 60px;
//     height: 60px;
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }
  
//   .welcome-text h2 {
//     margin: 0;
//     font-size: 24px;
//     font-weight: 600;
//   }
  
//   .welcome-text p {
//     margin: 4px 0 0;
//     opacity: 0.9;
//   }
  
//   /* Header */
//   .subscribe-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 20px;
//   }
  
//   .back-button {
//     background: none;
//     border: none;
//     font-size: 20px;
//     color: #555;
//     cursor: pointer;
//     transition: color 0.2s;
//   }
  
//   .back-button:hover {
//     color: #333;
//   }
  
//   .modify-notice {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     background-color: #f0f4ff;
//     padding: 8px 16px;
//     border-radius: 20px;
//     font-size: 14px;
//     color: #4a6bdf;
//   }
  
//   .market-link {
//     background-color: #4CAF50;
//     color: white;
//     padding: 8px 16px;
//     border-radius: 4px;
//     text-decoration: none;
//     font-weight: 500;
//     transition: background-color 0.2s;
//   }
  
//   .market-link:hover {
//     background-color: #3d8b40;
//   }
  
//   /* Carousel */
//   .carousel-container {
//     margin: 20px 0;
//     border-radius: 12px;
//     overflow: hidden;
//     box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
//   }
  
//   .carousel-slide {
//     position: relative;
//     height: 300px;
//   }
  
//   .carousel-slide img {
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//   }
  
//   .slide-overlay {
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     right: 0;
//     background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
//     color: white;
//     padding: 20px;
//   }
  
//   .slide-overlay h3 {
//     margin: 0 0 8px;
//     font-size: 22px;
//   }
  
//   .slide-overlay p {
//     margin: 0;
//     font-size: 16px;
//     opacity: 0.9;
//   }
  
//   /* Wallet Section */
//   .wallet-section {
//     margin: 24px 0;
//   }
  
//   .wallet-balance-card {
//     background: linear-gradient(135deg, #4b6cb7, #182848);
//     color: white;
//     border-radius: 12px;
//     padding: 20px;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
//   }
  
//   .wallet-info {
//     display: flex;
//     align-items: center;
//     gap: 16px;
//   }
  
//   .wallet-icon {
//     font-size: 32px;
//     background-color: rgba(255, 255, 255, 0.2);
//     width: 60px;
//     height: 60px;
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }
  
//   .wallet-label {
//     margin: 0;
//     font-size: 14px;
//     opacity: 0.9;
//   }
  
//   .wallet-amount {
//     margin: 4px 0 0;
//     font-size: 28px;
//     font-weight: 700;
//   }
  
//   .wallet-actions {
//     display: flex;
//     gap: 12px;
//   }
  
//   .wallet-action {
//     background-color: rgba(255, 255, 255, 0.2);
//     color: white;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//   }
  
//   .wallet-action:hover {
//     background-color: rgba(255, 255, 255, 0.3);
//   }
  
//   .wallet-action.history {
//     background-color: rgba(255, 255, 255, 0.1);
//   }
  
//   .combined-bill-btn {
//     background-color: #ff6b6b;
//     color: white;
//     border: none;
//     padding: 12px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     margin: 16px 0;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     transition: background-color 0.2s;
//   }
  
//   .combined-bill-btn:hover {
//     background-color: #ff5252;
//   }
  
//   /* Subscription Plans */
//   .subscription-plans {
//     margin-top: 32px;
//   }
  
//   .section-title {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 24px;
//     position: relative;
//   }
  
//   .section-title span {
//     font-size: 22px;
//     font-weight: 600;
//     color: #333;
//   }
  
//   .plan-container {
//     background-color: white;
//     border-radius: 12px;
//     margin-bottom: 20px;
//     box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
//     overflow: hidden;
//     transition: all 0.3s ease;
//   }
  
//   .plan-container.collapsed {
//     margin-bottom: 10px;
//   }
  
//   .plan-header {
//     padding: 16px 20px;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     cursor: pointer;
//     background-color: #f8f9fa;
//     transition: background-color 0.2s;
//   }
  
//   .plan-header:hover {
//     background-color: #f1f3f5;
//   }
  
//   .plan-title-container {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//   }
  
//   .plan-title {
//     margin: 0;
//     font-size: 18px;
//     font-weight: 600;
//     color: #333;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//   }
  
//   .item-count {
//     background-color: #e9ecef;
//     color: #495057;
//     padding: 2px 8px;
//     border-radius: 10px;
//     font-size: 12px;
//     font-weight: 500;
//   }
  
//   .plan-controls {
//     display: flex;
//     align-items: center;
//     gap: 16px;
//   }
  
//   .plan-timer-container {
//     display: flex;
//     flex-direction: column;
//     align-items: flex-end;
//   }
  
//   .modify-before-text {
//     font-size: 12px;
//     color: #6c757d;
//   }
  
//   .plan-timer {
//     display: flex;
//     align-items: center;
//     gap: 4px;
//     font-size: 14px;
//     color: #495057;
//   }
  
//   .bill-icon {
//     background: none;
//     border: none;
//     color: #4a6bdf;
//     font-weight: 500;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     padding: 6px 12px;
//     border-radius: 4px;
//     transition: background-color 0.2s;
//   }
  
//   .bill-icon:hover {
//     background-color: #f0f4ff;
//   }
  
//   .plan-content {
//     padding: 0 20px;
//     max-height: 500px;
//     overflow: hidden;
//     transition: all 0.3s ease;
//   }
  
//   .plan-container.collapsed .plan-content {
//     max-height: 0;
//     padding: 0 20px;
//   }
  
//   /* Products Table */
//   .products-table {
//     width: 100%;
//     border-collapse: collapse;
//     margin: 16px 0;
//   }
  
//   .products-table th {
//     text-align: left;
//     padding: 12px 16px;
//     background-color: #f8f9fa;
//     color: #495057;
//     font-weight: 600;
//     font-size: 14px;
//   }
  
//   .products-table td {
//     padding: 12px 16px;
//     border-bottom: 1px solid #e9ecef;
//     vertical-align: middle;
//   }
  
//   .products-table tr:last-child td {
//     border-bottom: none;
//   }
  
//   .product-actions {
//     text-align: right;
//   }
  
//   .action-menu-container {
//     position: relative;
//     display: inline-block;
//   }
  
//   .action-menu-btn {
//     background: none;
//     border: none;
//     color: #6c757d;
//     cursor: pointer;
//     padding: 8px;
//     border-radius: 50%;
//     transition: background-color 0.2s;
//   }
  
//   .action-menu-btn:hover {
//     background-color: #f1f3f5;
//   }
  
//   .action-menu {
//     position: absolute;
//     right: 0;
//     top: 100%;
//     background-color: white;
//     border-radius: 8px;
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//     z-index: 10;
//     min-width: 160px;
//     overflow: hidden;
//   }
  
//   .action-menu button {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     width: 100%;
//     padding: 10px 16px;
//     background: none;
//     border: none;
//     text-align: left;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .action-menu button:hover {
//     background-color: #f8f9fa;
//   }
  
//   .action-menu button:disabled {
//     color: #adb5bd;
//     cursor: not-allowed;
//   }
  
//   .action-menu button:disabled:hover {
//     background-color: transparent;
//   }
  
//   .empty-plan {
//     padding: 24px;
//     text-align: center;
//     color: #6c757d;
//     border: 1px dashed #dee2e6;
//     border-radius: 8px;
//     margin: 16px 0;
//   }
  
//   .add-product-section {
//     margin: 20px 0;
//     text-align: center;
//   }
  
//   .add-product-btn {
//     background-color: #4CAF50;
//     color: white;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     display: inline-flex;
//     align-items: center;
//     gap: 8px;
//     transition: background-color 0.2s;
//   }
  
//   .add-product-btn:hover {
//     background-color: #3d8b40;
//   }
  
//   .add-product-btn:disabled {
//     background-color: #adb5bd;
//     cursor: not-allowed;
//   }
  
//   .modify-disabled-message {
//     margin-top: 8px;
//     font-size: 14px;
//     color: #dc3545;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 6px;
//   }
  
//   /* Popup Overlay */
//   .popup-overlay {
//     position: fixed;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background-color: rgba(0, 0, 0, 0.5);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     z-index: 1000;
//     animation: fadeIn 0.3s ease-out;
//   }
  
//   .popup-content {
//     background-color: white;
//     border-radius: 12px;
//     width: 90%;
//     max-width: 500px;
//     max-height: 90vh;
//     overflow-y: auto;
//     box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
//     animation: slideUp 0.3s ease-out;
//   }
  
//   @keyframes slideUp {
//     from { transform: translateY(20px); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
//   }
  
//   .popup-header {
//     padding: 16px 20px;
//     border-bottom: 1px solid #e9ecef;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//   }
  
//   .popup-header h3 {
//     margin: 0;
//     font-size: 18px;
//     color: #333;
//   }
  
//   .close-popup {
//     background: none;
//     border: none;
//     font-size: 24px;
//     color: #6c757d;
//     cursor: pointer;
//     padding: 0;
//     line-height: 1;
//   }
  
//   .close-popup:hover {
//     color: #495057;
//   }
  
//   /* Instruction Popup */
//   .instruction-popup {
//     max-width: 600px;
//   }
  
//   .instruction-content {
//     padding: 20px;
//   }
  
//   .instruction-item {
//     display: flex;
//     align-items: flex-start;
//     gap: 12px;
//     margin-bottom: 16px;
//   }
  
//   .instruction-item:last-child {
//     margin-bottom: 0;
//   }
  
//   .instruction-item .icon {
//     font-size: 20px;
//     flex-shrink: 0;
//     margin-top: 2px;
//   }
  
//   .instruction-item .warning {
//     color: #ffc107;
//   }
  
//   .instruction-item .info {
//     color: #17a2b8;
//   }
  
//   .instruction-item .success {
//     color: #28a745;
//   }
  
//   .instruction-item p {
//     margin: 0;
//     font-size: 15px;
//     line-height: 1.5;
//   }
  
//   .instruction-actions {
//     padding: 16px 20px;
//     border-top: 1px solid #e9ecef;
//     text-align: right;
//   }
  
//   .agree-btn {
//     background-color: #4CAF50;
//     color: white;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .agree-btn:hover {
//     background-color: #3d8b40;
//   }
  
//   /* Wallet Popup */
//   .wallet-popup {
//     max-width: 500px;
//   }
  
//   .wallet-user-details {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 16px;
//     padding: 20px;
//   }
  
//   .wallet-user-info {
//     background-color: #f8f9fa;
//     border-radius: 8px;
//     padding: 12px;
//   }
  
//   .wallet-user-info h4 {
//     margin: 0 0 4px;
//     font-size: 12px;
//     color: #6c757d;
//     font-weight: 500;
//   }
  
//   .wallet-user-info p {
//     margin: 0;
//     font-size: 16px;
//     font-weight: 500;
//   }
  
//   .current-balance {
//     padding: 0 20px 20px;
//     text-align: center;
//   }
  
//   .current-balance h4 {
//     margin: 0 0 8px;
//     font-size: 14px;
//     color: #6c757d;
//     font-weight: 500;
//   }
  
//   .balance-amount {
//     margin: 0;
//     font-size: 32px;
//     font-weight: 700;
//     color: #333;
//   }
  
//   .add-money-section {
//     padding: 0 20px 20px;
//   }
  
//   .add-money-section h4 {
//     margin: 0 0 12px;
//     font-size: 16px;
//     color: #333;
//   }
  
//   .add-money-controls {
//     display: flex;
//     gap: 10px;
//   }
  
//   .add-money-controls input {
//     flex: 1;
//     padding: 10px 16px;
//     border: 1px solid #ced4da;
//     border-radius: 6px;
//     font-size: 16px;
//   }
  
//   .add-money-controls input:focus {
//     outline: none;
//     border-color: #80bdff;
//     box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
//   }
  
//   .add-money-btn {
//     background-color: #4CAF50;
//     color: white;
//     border: none;
//     padding: 0 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .add-money-btn:hover {
//     background-color: #3d8b40;
//   }
  
//   .add-money-btn:disabled {
//     background-color: #adb5bd;
//     cursor: not-allowed;
//   }
  
//   /* History Popup */
//   .history-popup {
//     max-width: 800px;
//   }
  
//   .transactions-list {
//     padding: 0 20px 20px;
//   }
  
//   .transactions-list h4 {
//     margin: 0 0 16px;
//     font-size: 16px;
//     color: #333;
//   }
  
//   .transactions-table-container {
//     max-height: 400px;
//     overflow-y: auto;
//     border: 1px solid #e9ecef;
//     border-radius: 8px;
//   }
  
//   .transactions-table {
//     width: 100%;
//     border-collapse: collapse;
//   }
  
//   .transactions-table th {
//     position: sticky;
//     top: 0;
//     background-color: #f8f9fa;
//     padding: 12px 16px;
//     text-align: left;
//     font-size: 14px;
//     color: #495057;
//     font-weight: 600;
//   }
  
//   .transactions-table td {
//     padding: 12px 16px;
//     border-bottom: 1px solid #e9ecef;
//     font-size: 14px;
//   }
  
//   .transactions-table tr:last-child td {
//     border-bottom: none;
//   }
  
//   .txn-type {
//     font-weight: 500;
//   }
  
//   .txn-type.credit {
//     color: #28a745;
//   }
  
//   .txn-type.debit {
//     color: #dc3545;
//   }
  
//   .txn-amount {
//     font-weight: 500;
//   }
  
//   .txn-amount.credit {
//     color: #28a745;
//   }
  
//   .txn-amount.debit {
//     color: #dc3545;
//   }
  
//   .no-transactions {
//     padding: 24px;
//     text-align: center;
//     color: #6c757d;
//     border: 1px dashed #dee2e6;
//     border-radius: 8px;
//   }
  
//   /* Bill Popup */
//   .bill-popup {
//     max-width: 600px;
//   }
  
//   .bill-period {
//     padding: 0 20px 16px;
//   }
  
//   .bill-period p {
//     margin: 0 0 8px;
//     font-size: 14px;
//     color: #495057;
//   }
  
//   .bill-message {
//     padding: 20px;
//     text-align: center;
//     color: #6c757d;
//   }
  
//   .bill-details {
//     padding: 0 20px;
//   }
  
//   .bill-table {
//     width: 100%;
//     border-collapse: collapse;
//     margin-bottom: 20px;
//   }
  
//   .bill-table th {
//     padding: 12px 16px;
//     text-align: left;
//     background-color: #f8f9fa;
//     color: #495057;
//     font-weight: 600;
//     font-size: 14px;
//   }
  
//   .bill-table td {
//     padding: 12px 16px;
//     border-bottom: 1px solid #e9ecef;
//   }
  
//   .bill-table tfoot tr:first-child td {
//     padding-top: 16px;
//   }
  
//   .subtotal-row td {
//     font-weight: 500;
//   }
  
//   .fee-row td {
//     font-weight: 500;
//   }
  
//   .total-row td {
//     font-weight: 700;
//     font-size: 16px;
//   }
  
//   .no-items {
//     color: #6c757d;
//     text-align: center;
//   }
  
//   .bill-actions {
//     padding: 16px 20px;
//     border-top: 1px solid #e9ecef;
//     display: flex;
//     justify-content: flex-end;
//     gap: 12px;
//   }
  
//   .download-pdf {
//     background-color: #6c757d;
//     color: white;
//     border: none;
//     padding: 10px 16px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     transition: background-color 0.2s;
//   }
  
//   .download-pdf:hover {
//     background-color: #5a6268;
//   }
  
//   .pay-now {
//     background-color: #4CAF50;
//     color: white;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .pay-now:hover {
//     background-color: #3d8b40;
//   }
  
//   .close-bill {
//     background-color: #f8f9fa;
//     color: #495057;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .close-bill:hover {
//     background-color: #e9ecef;
//   }
  
//   /* Modify Popup */
//   .modify-popup {
//     max-width: 400px;
//   }
  
//   .product-info {
//     padding: 20px;
//     text-align: center;
//   }
  
//   .product-name {
//     margin: 0 0 8px;
//     font-size: 18px;
//     font-weight: 600;
//     color: #333;
//   }
  
//   .current-price {
//     margin: 0;
//     color: #6c757d;
//   }
  
//   .quantity-controls {
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     gap: 20px;
//     padding: 20px;
//   }
  
//   .quantity-btn {
//     background-color: #f8f9fa;
//     border: none;
//     width: 40px;
//     height: 40px;
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .quantity-btn:hover {
//     background-color: #e9ecef;
//   }
  
//   .quantity-btn:disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
//   }
  
//   .quantity-btn:disabled:hover {
//     background-color: #f8f9fa;
//   }
  
//   .quantity-display {
//     font-size: 24px;
//     font-weight: 600;
//     min-width: 40px;
//     text-align: center;
//   }
  
//   .new-price {
//     text-align: center;
//     font-size: 18px;
//     font-weight: 600;
//     color: #333;
//     padding: 0 20px 20px;
//   }
  
//   .modify-actions {
//     padding: 16px 20px;
//     border-top: 1px solid #e9ecef;
//     display: flex;
//     justify-content: flex-end;
//     gap: 12px;
//   }
  
//   .confirm-btn {
//     background-color: #4CAF50;
//     color: white;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .confirm-btn:hover {
//     background-color: #3d8b40;
//   }
  
//   .cancel-btn {
//     background-color: #f8f9fa;
//     color: #495057;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .cancel-btn:hover {
//     background-color: #e9ecef;
//   }
  
//   /* Delete Popup */
//   .delete-popup {
//     max-width: 400px;
//   }
  
//   .delete-message {
//     padding: 20px;
//     text-align: center;
//   }
  
//   .delete-message p {
//     margin: 0 0 12px;
//   }
  
//   .warning-text {
//     color: #dc3545;
//     font-weight: 500;
//   }
  
//   .delete-actions {
//     padding: 16px 20px;
//     border-top: 1px solid #e9ecef;
//     display: flex;
//     justify-content: flex-end;
//     gap: 12px;
//   }
  
//   .confirm-delete {
//     background-color: #dc3545;
//     color: white;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .confirm-delete:hover {
//     background-color: #c82333;
//   }
  
//   .cancel-delete {
//     background-color: #f8f9fa;
//     color: #495057;
//     border: none;
//     padding: 10px 20px;
//     border-radius: 6px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: background-color 0.2s;
//   }
  
//   .cancel-delete:hover {
//     background-color: #e9ecef;
//   }
  
//   /* Responsive Adjustments */
//   @media (max-width: 768px) {
//     .welcome-content {
//       flex-direction: column;
//       text-align: center;
//     }
    
//     .wallet-balance-card {
//       flex-direction: column;
//       gap: 16px;
//     }
    
//     .wallet-actions {
//       width: 100%;
//       justify-content: center;
//     }
    
//     .plan-header {
//       flex-direction: column;
//       align-items: flex-start;
//       gap: 12px;
//     }
    
//     .plan-controls {
//       width: 100%;
//       justify-content: space-between;
//     }
    
//     .products-table {
//       display: block;
//       overflow-x: auto;
//     }
    
//     .wallet-user-details {
//       grid-template-columns: 1fr;
//     }
    
//     .bill-actions, .modify-actions, .delete-actions {
//       flex-wrap: wrap;
//     }
    
//     .bill-actions button, .modify-actions button, .delete-actions button {
//       flex: 1;
//       min-width: 120px;
//     }
//   }
  
//   @media (max-width: 480px) {
//     .subscribe-page {
//       padding: 12px;
//     }
    
//     .carousel-slide {
//       height: 200px;
//     }
    
//     .slide-overlay h3 {
//       font-size: 18px;
//     }
    
//     .slide-overlay p {
//       font-size: 14px;
//     }
    
//     .plan-title {
//       font-size: 16px;
//     }
    
//     .products-table th, 
//     .products-table td,
//     .transactions-table th,
//     .transactions-table td {
//       padding: 8px 12px;
//       font-size: 13px;
//     }
//   }