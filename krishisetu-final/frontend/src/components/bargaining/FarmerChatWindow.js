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
// //   faTimesCircle,
// //   faHandshake,
// //   faPaperPlane
// // } from '@fortawesome/free-solid-svg-icons';
// // import './FarmerChatWindow.css';

// // const FarmerChatWindow = () => {
// //   const navigate = useNavigate();
// //   const { bargainId } = useParams();
// //   const { token } = useAuth();
// //   const socket = useRef(null);
// //   const messagesEndRef = useRef(null);

// //   // State management
// //   const [messages, setMessages] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentPrice, setCurrentPrice] = useState(0);
// //   const [basePrice, setBasePrice] = useState(0);
// //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// //   const [bargainStatus, setBargainStatus] = useState('pending');
// //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// //   const [product, setProduct] = useState(null);
// //   const [consumerDetails, setConsumerDetails] = useState({});
// //   const [quantity, setQuantity] = useState(0);
// //   const [newMessage, setNewMessage] = useState('');
// //   const [isTyping, setIsTyping] = useState(false);
// //   const [error, setError] = useState(null);

// //   // Fetch bargain data
// //   const fetchBargainData = useCallback(async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);
      
// //       if (!bargainId || !token) {
// //         throw new Error("Missing required parameters");
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
// //         const errorText = await response.text();
// //         throw new Error(errorText || `HTTP error! status: ${response.status}`);
// //       }

// //       const data = await response.json();
      
// //       if (!data || !data.session) {
// //         throw new Error("Invalid response format");
// //       }

// //       // Set state from the response
// //       setMessages(data.session.messages || []);
// //       setCurrentPrice(data.session.current_price || 0);
// //       setBasePrice(data.session.product?.price_per_kg || 0);
// //       setProduct(data.session.product || null);
// //       setConsumerDetails(data.session.consumer || {});
// //       setQuantity(data.session.quantity || 0);
// //       setBargainStatus(data.session.status || 'pending');

// //     } catch (error) {
// //       console.error("Error loading bargain data:", error);
// //       setError(error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [bargainId, token]);

// //   // WebSocket connection
// //   const initializeSocketConnection = useCallback(() => {
// //     if (!bargainId || !token) return;

// //     if (socket.current) {
// //       socket.current.disconnect();
// //     }

// //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// //       auth: { token },
// //       query: { bargainId },
// //       transports: ['websocket'],
// //       reconnection: true,
// //       reconnectionAttempts: 5,
// //       reconnectionDelay: 1000,
// //     });

// //     // Connection events
// //     socket.current.on('connect', () => {
// //       setConnectionStatus("connected");
// //       socket.current.emit('joinBargain', { bargainId });
// //     });

// //     socket.current.on('connect_error', (err) => {
// //       setConnectionStatus("error");
// //       console.error("Connection error:", err);
// //     });

// //     socket.current.on('disconnect', () => {
// //       setConnectionStatus("disconnected");
// //     });

// //     // Application events
// //     socket.current.on('priceUpdate', (data) => {
// //       setCurrentPrice(data.newPrice);
// //       addSystemMessage(`Price updated to ₹${data.newPrice}/kg`);
// //       setWaitingForResponse(false);
// //     });

// //     socket.current.on('bargainStatusUpdate', (status) => {
// //       setBargainStatus(status);
// //       addSystemMessage(status === 'accepted' ? "🎉 Bargain accepted!" : "❌ Bargain rejected");
// //       setWaitingForResponse(false);
// //     });

// //     socket.current.on('newMessage', (message) => {
// //       setMessages(prev => [...prev, message]);
// //       if (message.sender_type === 'consumer') {
// //         setWaitingForResponse(false);
// //       }
// //     });

// //     socket.current.on('typing', (typing) => {
// //       setIsTyping(typing);
// //     });

// //     return () => {
// //       if (socket.current) {
// //         socket.current.disconnect();
// //       }
// //     };
// //   }, [bargainId, token]);

// //   // Initialize on mount
// //   useEffect(() => {
// //     fetchBargainData();
// //     initializeSocketConnection();
// //   }, [fetchBargainData, initializeSocketConnection]);

// //   // Auto-scroll to bottom
// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   // Helper functions
// //   const addSystemMessage = (content) => {
// //     setMessages(prev => [...prev, {
// //       content,
// //       sender_type: "system",
// //       timestamp: new Date().toISOString()
// //     }]);
// //   };

// //   const handleSendMessage = () => {
// //     if (!newMessage.trim() || !socket.current?.connected) return;

// //     const message = {
// //       content: newMessage,
// //       sender_type: "farmer",
// //       timestamp: new Date().toISOString()
// //     };

// //     socket.current.emit('bargainMessage', {
// //       bargain_id: bargainId,
// //       message,
// //       recipientType: "consumer",
// //       recipientId: consumerDetails.id,
// //     });

// //     setMessages(prev => [...prev, message]);
// //     setNewMessage('');
// //   };

// //   const handleMakeOffer = (price) => {
// //     if (!socket.current?.connected) return;

// //     const messageContent = `💰 Offering ₹${price}/kg`;
// //     addSystemMessage(messageContent);
// //     setCurrentPrice(price);
// //     setWaitingForResponse(true);

// //     socket.current.emit('priceOffer', {
// //       price,
// //       productId: product?.product_id,
// //       quantity
// //     });

// //     socket.current.emit('bargainMessage', {
// //       bargain_id: bargainId,
// //       message: {
// //         content: messageContent,
// //         sender_type: "farmer",
// //         timestamp: new Date().toISOString()
// //       },
// //       recipientType: "consumer",
// //       recipientId: consumerDetails.id,
// //     });
// //   };

// //   const handleBargainResponse = (response) => {
// //     if (!socket.current?.connected) return;

// //     const messageContent = response ? "🎉 Accepted offer!" : "❌ Declined offer";
// //     addSystemMessage(messageContent);
// //     setWaitingForResponse(true);

// //     socket.current.emit('bargainResponse', {
// //       response,
// //       bargainId
// //     });

// //     socket.current.emit('bargainMessage', {
// //       bargain_id: bargainId,
// //       message: {
// //         content: messageContent,
// //         sender_type: "farmer",
// //         timestamp: new Date().toISOString()
// //       },
// //       recipientType: "consumer",
// //       recipientId: consumerDetails.id,
// //     });
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
// //         <h3>Error Loading Chat</h3>
// //         <p>{error}</p>
// //         <button onClick={() => window.location.reload()}>Retry</button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="chat-window-container">
// //       <div className="chat-header">
// //         <button className="back-button" onClick={() => navigate(-1)}>
// //           &larr; Back
// //         </button>
// //         <div className="header-info">
// //           <h2>
// //             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerDetails.name || "Consumer"}
// //           </h2>
// //           <div className="product-details">
// //             {product && (
// //               <>
// //                 <span>{product.produce_name} ({quantity}kg)</span>
// //                 <span>Base: ₹{basePrice}/kg</span>
// //               </>
// //             )}
// //             <span className={`connection-status ${connectionStatus}`}>
// //               {connectionStatus}
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="chat-messages">
// //         {messages.length === 0 ? (
// //           <div className="no-messages">
// //             <p>Start the conversation with the consumer</p>
// //           </div>
// //         ) : (
// //           messages.map((msg, index) => (
// //             <div 
// //               key={`msg-${index}`} 
// //               className={`message ${msg.sender_type}`}
// //             >
// //               <div className="message-content">
// //                 {msg.content}
// //               </div>
// //               <div className="message-meta">
// //                 <span className="sender">
// //                   {msg.sender_type === 'farmer' ? 'You' : 
// //                    msg.sender_type === 'consumer' ? consumerDetails.name : 'System'}
// //                 </span>
// //                 <span className="timestamp">
// //                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                 </span>
// //               </div>
// //             </div>
// //           ))
// //         )}
// //         {isTyping && (
// //           <div className="typing-indicator">
// //             <div className="typing-dots">
// //               <div></div>
// //               <div></div>
// //               <div></div>
// //             </div>
// //             <span>{consumerDetails.name || 'Consumer'} is typing...</span>
// //           </div>
// //         )}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       <div className="price-display">
// //         <div className="price-item">
// //           <span>Current Price:</span>
// //           <span>₹{currentPrice}/kg</span>
// //         </div>
// //         <div className="price-item">
// //           <span>Total:</span>
// //           <span>₹{(quantity * currentPrice).toFixed(2)}</span>
// //         </div>
// //         {bargainStatus === 'accepted' && (
// //           <div className="status-accepted">
// //             <FontAwesomeIcon icon={faCheckCircle} /> Accepted
// //           </div>
// //         )}
// //         {bargainStatus === 'rejected' && (
// //           <div className="status-rejected">
// //             <FontAwesomeIcon icon={faTimesCircle} /> Rejected
// //           </div>
// //         )}
// //       </div>

// //       <div className="message-input">
// //         <input
// //           type="text"
// //           value={newMessage}
// //           onChange={(e) => {
// //             setNewMessage(e.target.value);
// //             socket.current?.emit('typing', e.target.value.length > 0);
// //           }}
// //           placeholder="Type your message..."
// //           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
// //         />
// //         <button onClick={handleSendMessage}>
// //           <FontAwesomeIcon icon={faPaperPlane} />
// //         </button>
// //       </div>

// //       {bargainStatus === 'pending' && (
// //         <div className="bargain-controls">
// //           <div className="price-buttons">
// //             <button 
// //               onClick={() => handleMakeOffer(currentPrice + 1)}
// //               disabled={waitingForResponse}
// //             >
// //               <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + 1}
// //             </button>
// //             <button 
// //               onClick={() => handleMakeOffer(Math.max(1, currentPrice - 1))}
// //               disabled={waitingForResponse || currentPrice <= 1}
// //             >
// //               <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 1}
// //             </button>
// //           </div>
// //           <div className="action-buttons">
// //             <button 
// //               onClick={() => handleBargainResponse(true)}
// //               disabled={waitingForResponse}
// //             >
// //               <FontAwesomeIcon icon={faHandshake} /> Accept
// //             </button>
// //             <button 
// //               onClick={() => handleBargainResponse(false)}
// //               disabled={waitingForResponse}
// //             >
// //               <FontAwesomeIcon icon={faTimesCircle} /> Reject
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {waitingForResponse && (
// //         <div className="waiting-indicator">
// //           <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
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
//   faArrowDown,
//   faCheckCircle,
//   faTimesCircle,
//   faHandshake,
//   faPaperPlane
// } from '@fortawesome/free-solid-svg-icons';
// import './FarmerChatWindow.css';

// const FarmerChatWindow = () => {
//   const navigate = useNavigate();
//   const { bargainId } = useParams();
//   const { token } = useAuth();
//   const socket = useRef(null);
//   const messagesEndRef = useRef(null);

//   // State management
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [basePrice, setBasePrice] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [bargainStatus, setBargainStatus] = useState('pending');
//   const [waitingForResponse, setWaitingForResponse] = useState(false);
//   const [product, setProduct] = useState(null);
//   const [consumerDetails, setConsumerDetails] = useState({});
//   const [quantity, setQuantity] = useState(0);
//   const [newMessage, setNewMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch bargain data from both tables
//   const fetchBargainData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       if (!bargainId || !token) {
//         throw new Error("Missing bargain ID or authentication token");
//       }

//       // First fetch the bargain session
//       const sessionResponse = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );

//       if (!sessionResponse.ok) {
//         const errorText = await sessionResponse.text();
//         throw new Error(`Failed to fetch bargain session: ${errorText || sessionResponse.status}`);
//       }

//       const sessionData = await sessionResponse.json();
//       if (!sessionData || !sessionData.session) {
//         throw new Error("No session data received from server");
//       }

//       // Then fetch the product details if available
//       let productData = { product: null };
//       if (sessionData.session.product_id) {
//         const productResponse = await fetch(
//           `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/product`,
//           {
//             headers: {
//               'Authorization': `Bearer ${token}`,
//             },
//           }
//         );

//         if (productResponse.ok) {
//           productData = await productResponse.json();
//         }
//       }

//       // Combine the data
//       const combinedData = {
//         ...sessionData.session,
//         product: productData.product || null,
//         messages: sessionData.session.messages || []
//       };

//       // Set all state from the combined data
//       setMessages(combinedData.messages);
//       setCurrentPrice(combinedData.current_price || 0);
//       setBasePrice(combinedData.product?.price_per_kg || 0);
//       setProduct(combinedData.product);
//       setConsumerDetails(combinedData.consumer || {});
//       setQuantity(combinedData.quantity || 0);
//       setBargainStatus(combinedData.status || 'pending');

//       // Add initial product message if needed
//       if (!combinedData.messages.some(msg => msg.content.includes('selected')) && combinedData.product) {
//         const productMessage = {
//           content: `🛒 ${combinedData.consumer?.name || 'Consumer'} selected ${combinedData.product.produce_name} (${combinedData.quantity}kg) at ₹${combinedData.product.price_per_kg}/kg`,
//           sender_type: "system",
//           timestamp: new Date().toISOString()
//         };
//         setMessages(prev => [...prev, productMessage]);
//       }

//       return combinedData;
//     } catch (error) {
//       console.error("Error loading bargain data:", error);
//       setError(error.message);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }, [bargainId, token]);

//   // WebSocket connection management
//   const initializeSocketConnection = useCallback(() => {
//     if (!bargainId || !token) {
//       console.error("Missing bargainId or token for WebSocket connection");
//       return;
//     }
  
//     if (socket.current) {
//       socket.current.disconnect();
//       socket.current = null;
//     }
  
//     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
//       auth: { token },
//       query: { bargainId },
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       extraHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
    
//     // Connection events
//     socket.current.on('connect', () => {
//       console.log("Socket connected");
//       setConnectionStatus("connected");
//       socket.current.emit('joinBargain', { bargainId });
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
//       addSystemMessage(`Consumer updated price to ₹${data.newPrice}/kg`);
//       setWaitingForResponse(false);
//     });
  
//     socket.current.on('bargainStatusUpdate', (status) => {
//       setBargainStatus(status);
//       if (status === 'accepted') {
//         addSystemMessage("🎉 You accepted the offer!");
//       } else if (status === 'rejected') {
//         addSystemMessage("❌ You declined the offer");
//       }
//       setWaitingForResponse(false);
//     });
  
//     socket.current.on('newMessage', (message) => {
//       setMessages(prev => [...prev, message]);
//       if (message.sender_type === 'consumer') {
//         setWaitingForResponse(false);
//       }
//     });

//     socket.current.on('typing', (isTyping) => {
//       setIsTyping(isTyping);
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

//   // Initialize socket connection on mount
//   useEffect(() => {
//     fetchBargainData().then(() => {
//       initializeSocketConnection();
//     });
    
//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [initializeSocketConnection, fetchBargainData]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

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

//   // Handle sending a message
//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !socket.current?.connected) return;

//     const message = {
//       content: newMessage,
//       sender_type: "farmer",
//       timestamp: new Date().toISOString()
//     };

//     socket.current.emit('bargainMessage', {
//       bargain_id: bargainId,
//       message,
//       recipientType: "consumer",
//       recipientId: consumerDetails.id,
//     });

//     setMessages(prev => [...prev, message]);
//     setNewMessage('');
//   };

//   // Handle price offer
//   const handleMakeOffer = (price) => {
//     if (!socket.current?.connected) return;

//     const messageContent = `💰 I'm offering ₹${price}/kg`;
//     addSystemMessage(messageContent);
//     setCurrentPrice(price);
//     setWaitingForResponse(true);
    
//     socket.current.emit('priceOffer', {
//       price,
//       productId: product?.product_id,
//       quantity
//     });

//     socket.current.emit("bargainMessage", {
//       bargain_id: bargainId,
//       message: {
//         content: messageContent,
//         sender_type: "farmer",
//         timestamp: new Date().toISOString()
//       },
//       recipientType: "consumer",
//       recipientId: consumerDetails.id,
//     });
//   };

//   // Handle accept/reject
//   const handleBargainResponse = (response) => {
//     if (!socket.current?.connected) return;

//     const messageContent = response ? "🎉 I accept this offer!" : "❌ I decline this offer";
//     addSystemMessage(messageContent);
//     setWaitingForResponse(true);
    
//     socket.current.emit('bargainResponse', {
//       response,
//       bargainId
//     });

//     socket.current.emit("bargainMessage", {
//       bargain_id: bargainId,
//       message: {
//         content: messageContent,
//         sender_type: "farmer",
//         timestamp: new Date().toISOString()
//       },
//       recipientType: "consumer",
//       recipientId: consumerDetails.id,
//     });
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain session...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <h3>Error Loading Chat</h3>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <div className="chat-window-container">
//       {/* Chat Header */}
//       <div className="chat-header">
//         <button className="back-button" onClick={() => navigate(-1)}>
//           &larr; Back
//         </button>
//         <div className="header-info">
//           <h2>
//             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerDetails.name || "Consumer"}
//           </h2>
//           <div className="product-details">
//             {product && (
//               <>
//                 <span>{product.produce_name} ({quantity}kg)</span>
//                 <span>Base: ₹{basePrice}/kg</span>
//               </>
//             )}
//             <span className={`connection-status ${connectionStatus}`}>
//               {connectionStatus}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <div className="no-messages">
//             <p>Waiting for consumer to initiate bargain...</p>
//           </div>
//         ) : (
//           messages.map((msg, index) => (
//             <div 
//               key={`msg-${index}`} 
//               className={`message ${
//                 msg.sender_type === 'farmer' ? 'sent' : 
//                 msg.sender_type === 'system' ? 'system' : 'received'
//               }`}
//             >
//               <div className="message-content">
//                 {msg.content}
//               </div>
//               <div className="message-meta">
//                 <span className="sender">
//                   {msg.sender_type === 'farmer' ? 'You' : 
//                    msg.sender_type === 'consumer' ? consumerDetails.name : 'System'}
//                 </span>
//                 <span className="timestamp">
//                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </span>
//               </div>
//             </div>
//           ))
//         )}
//         {isTyping && (
//           <div className="typing-indicator">
//             <div className="typing-dots">
//               <div></div>
//               <div></div>
//               <div></div>
//             </div>
//             <span>{consumerDetails.name || 'Consumer'} is typing...</span>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Price Display */}
//       <div className="price-display">
//         <div className="price-item">
//           <span className="price-label">Current Price:</span>
//           <span className="price-value">₹{currentPrice}/kg</span>
//         </div>
//         <div className="price-item">
//           <span className="price-label">Total:</span>
//           <span className="price-value">₹{(quantity * currentPrice).toFixed(2)}</span>
//         </div>
//         {bargainStatus === 'accepted' && (
//           <div className="status-accepted">
//             <FontAwesomeIcon icon={faCheckCircle} /> Accepted
//           </div>
//         )}
//         {bargainStatus === 'rejected' && (
//           <div className="status-rejected">
//             <FontAwesomeIcon icon={faTimesCircle} /> Rejected
//           </div>
//         )}
//       </div>

//       {/* Message Input */}
//       <div className="message-input">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => {
//             setNewMessage(e.target.value);
//             socket.current?.emit('typing', e.target.value.length > 0);
//           }}
//           placeholder="Type your message..."
//           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//         />
//         <button onClick={handleSendMessage}>
//           <FontAwesomeIcon icon={faPaperPlane} />
//         </button>
//       </div>

//       {/* Bargain Controls */}
//       {bargainStatus === 'pending' && (
//         <div className="bargain-controls">
//           <div className="price-buttons">
//             <button 
//               className="price-up"
//               onClick={() => handleMakeOffer(currentPrice + 1)}
//               disabled={waitingForResponse}
//             >
//               <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + 1}
//             </button>
//             <button 
//               className="price-down"
//               onClick={() => handleMakeOffer(Math.max(1, currentPrice - 1))}
//               disabled={waitingForResponse || currentPrice <= 1}
//             >
//               <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 1}
//             </button>
//           </div>
//           <div className="action-buttons">
//             <button 
//               className="accept-button"
//               onClick={() => handleBargainResponse(true)}
//               disabled={waitingForResponse}
//             >
//               <FontAwesomeIcon icon={faHandshake} /> Accept
//             </button>
//             <button 
//               className="reject-button"
//               onClick={() => handleBargainResponse(false)}
//               disabled={waitingForResponse}
//             >
//               <FontAwesomeIcon icon={faTimesCircle} /> Reject
//             </button>
//           </div>
//         </div>
//       )}

//       {waitingForResponse && (
//         <div className="waiting-indicator">
//           <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
//         </div>
//       )}
//     </div>
//   );
// };

// export default FarmerChatWindow;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../../context/AuthContext";
import { io } from 'socket.io-client';
import {
  faSpinner,
  faRupeeSign,
  faArrowUp,
  faArrowDown,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './ConsumerChatWindow.css';

const FarmerChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token } = useAuth();
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [bargainStatus, setBargainStatus] = useState('pending');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [error, setError] = useState(null);

  // Generate price suggestions
  const generatePriceSuggestions = useCallback((basePrice) => {
    return [
      { amount: -2, price: basePrice - 2, label: "Counter Offer" },
      { amount: -1, price: basePrice - 1, label: "Small Decrease" },
      { amount: 1, price: basePrice + 1, label: "Small Increase" },
      { amount: 2, price: basePrice + 2, label: "Counter Offer" }
    ].filter(suggestion => suggestion.price > 0);
  }, []);

  // Add system messages
  const addSystemMessage = (content) => {
    setMessages(prev => [
      ...prev,
      {
        content,
        sender_type: "system",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Fetch messages from database
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    }
  };

  // Save message to database
  const sendMessageToDb = async (messageData) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save message');
      }

      return await response.json();
    } catch (err) {
      console.error('Error saving message:', err);
      throw err;
    }
  };

  // Fetch bargain data
  const fetchBargainData = async () => {
    try {
      if (!bargainId || !token) {
        throw new Error("Missing bargain ID or authentication token");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch bargain data");
      }

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        setSelectedProduct(product);
        setCurrentPrice(product.current_offer || product.price_per_kg);
        setQuantity(product.quantity || 1);
        
        // Generate initial price suggestions
        const suggestions = generatePriceSuggestions(product.current_offer || product.price_per_kg);
        setPriceSuggestions(suggestions);
      }
      
      if (data.consumer) {
        setSelectedConsumer(data.consumer);
      }
      
      setBargainStatus(data.status || 'pending');
      
    } catch (error) {
      setError(error.message || "Failed to load bargain data");
    }
  };

  // Initialize socket connection
  const initializeSocketConnection = useCallback(() => {
    if (!bargainId || !token) return;

    if (socket.current) {
      socket.current.disconnect();
    }

    socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
      auth: { token },
      query: { bargainId },
      transports: ['websocket'],
    });

    // Connection events
    socket.current.on('connect', () => {
      console.log("Socket connected");
      setConnectionStatus("connected");
    });

    socket.current.on('connect_error', (err) => {
      console.error("Connection error:", err.message);
      setConnectionStatus("error");
    });

    socket.current.on('disconnect', (reason) => {
      console.log("Socket disconnected:", reason);
      setConnectionStatus("disconnected");
    });

    // Application events
    socket.current.on('priceUpdate', (data) => {
      setCurrentPrice(data.newPrice);
      addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
      setWaitingForResponse(false);
    });

    socket.current.on('bargainStatusUpdate', (status) => {
      setBargainStatus(status);
      if (status === 'accepted') {
        addSystemMessage("🎉 Consumer accepted your offer!");
      } else if (status === 'rejected') {
        addSystemMessage("❌ Consumer declined your offer");
      }
      setWaitingForResponse(false);
    });

    socket.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.current.on('error', (error) => {
      console.error("Socket error:", error);
      setError(error.message);
    });
  }, [bargainId, token]);

  // Initialize chat (fetch data and connect socket)
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        await fetchBargainData();
        await fetchMessages();
        initializeSocketConnection();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [initializeSocketConnection]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePriceSelection = async (price) => {
    const messageContent = `💰 Counter offered ₹${price}/kg`;
    
    try {
      // Save to database first
      const messageData = {
        bargain_id: bargainId,
        bsp_id: selectedProduct.bsp_id,
        sender_type: "farmer",
        sender_id: selectedConsumer.consumer_id,
        content: messageContent,
        price_offer: price
      };

      const savedMessage = await sendMessageToDb(messageData);

      // Update local state
      setCurrentPrice(price);
      setWaitingForResponse(true);
      setMessages(prev => [...prev, savedMessage]);

      // Emit socket event
      if (socket.current && socket.current.connected) {
        socket.current.emit("bargainMessage", {
          bargain_id: bargainId,
          message: {
            content: messageContent,
            sender_type: "farmer",
            timestamp: new Date().toISOString()
          },
          recipientType: "consumer",
          recipientId: selectedConsumer.consumer_id,
        });

        socket.current.emit('priceOffer', {
          price,
          productId: selectedProduct.product_id,
          quantity: quantity
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAccept = async () => {
    const messageContent = "✅ You accepted the offer";
    
    try {
      // Save to database
      const messageData = {
        bargain_id: bargainId,
        bsp_id: selectedProduct.bsp_id,
        sender_type: "farmer",
        sender_id: selectedConsumer.consumer_id,
        content: messageContent
      };

      await sendMessageToDb(messageData);

      // Update local state
      addSystemMessage(messageContent);
      setBargainStatus('accepted');

      // Emit socket events
      if (socket.current && socket.current.connected) {
        socket.current.emit("bargainStatusUpdate", {
          bargainId,
          status: 'accepted'
        });
        
        socket.current.emit("bargainMessage", {
          bargain_id: bargainId,
          message: {
            content: messageContent,
            sender_type: "farmer",
            timestamp: new Date().toISOString()
          },
          recipientType: "consumer",
          recipientId: selectedConsumer.consumer_id,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async () => {
    const messageContent = "❌ You rejected the offer";
    
    try {
      // Save to database
      const messageData = {
        bargain_id: bargainId,
        bsp_id: selectedProduct.bsp_id,
        sender_type: "farmer",
        sender_id: selectedConsumer.consumer_id,
        content: messageContent
      };

      await sendMessageToDb(messageData);

      // Update local state
      addSystemMessage(messageContent);
      setBargainStatus('rejected');

      // Emit socket events
      if (socket.current && socket.current.connected) {
        socket.current.emit("bargainStatusUpdate", {
          bargainId,
          status: 'rejected'
        });
        
        socket.current.emit("bargainMessage", {
          bargain_id: bargainId,
          message: {
            content: messageContent,
            sender_type: "farmer",
            timestamp: new Date().toISOString()
          },
          recipientType: "consumer",
          recipientId: selectedConsumer.consumer_id,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Bargain</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/farmer-dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bargain-chat-container">
      {selectedProduct && selectedConsumer && (
        <div className="chat-interface">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="header-top">
              <h2>
                <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.consumer_name}
              </h2>
              <span className={`connection-status ${connectionStatus}`}>
                {connectionStatus.toUpperCase()}
              </span>
            </div>
            
            <div className="product-info">
              <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
              <p><strong>Quantity:</strong> {quantity}kg</p>
              <div className="price-display">
                <span className="current-price">
                  <strong>Current:</strong> ₹{currentPrice}/kg
                </span>
                <span className="base-price">
                  <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
                </span>
                <span className="total-price">
                  <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
                </span>
              </div>
              {bargainStatus === 'accepted' && (
                <p className="status-accepted">
                  <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
                </p>
              )}
              {bargainStatus === 'rejected' && (
                <p className="status-rejected">
                  <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
                </p>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Waiting for consumer's offer...</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={`msg-${index}`} 
                  className={`message ${msg.sender_type}`}
                >
                  <div className="message-content">
                    {msg.content}
                  </div>
                  <div className="message-meta">
                    <span className="sender">
                      {msg.sender_type === 'farmer' ? 'You' : 
                       msg.sender_type === 'consumer' ? selectedConsumer.consumer_name : 'System'}
                    </span>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Controls */}
          <div className="chat-controls">
            {bargainStatus === 'pending' && priceSuggestions.length > 0 && (
              <div className="price-suggestions">
                <h4>Respond to Offer:</h4>
                <div className="suggestion-buttons">
                  {priceSuggestions.map((suggestion, index) => (
                    <button
                      key={`price-${index}`}
                      onClick={() => handlePriceSelection(suggestion.price)}
                      className={`suggestion-btn ${suggestion.amount < 0 ? 'decrease' : 'increase'}`}
                      disabled={waitingForResponse}
                    >
                      <div className="price-change">
                        {suggestion.amount < 0 ? (
                          <FontAwesomeIcon icon={faArrowDown} />
                        ) : (
                          <FontAwesomeIcon icon={faArrowUp} />
                        )}
                        ₹{suggestion.price}
                      </div>
                      <div className="price-label">{suggestion.label}</div>
                    </button>
                  ))}
                </div>
                
                <div className="action-buttons">
                  <button 
                    onClick={handleAccept}
                    className="accept-btn"
                    disabled={waitingForResponse}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
                  </button>
                  <button 
                    onClick={handleReject}
                    className="reject-btn"
                    disabled={waitingForResponse}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
                  </button>
                </div>
              </div>
            )}

            {waitingForResponse && (
              <div className="waiting-indicator">
                <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
              </div>
            )}

            {bargainStatus === 'accepted' && (
              <div className="accepted-actions">
                <button 
                  className="primary-action"
                  onClick={() => navigate('/farmer/orders')}
                >
                  View Order Details
                </button>
                <button 
                  className="secondary-action"
                  onClick={() => navigate('/farmer-dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>
            )}

            {bargainStatus === 'rejected' && (
              <div className="rejected-actions">
                <button 
                  className="secondary-action"
                  onClick={() => navigate('/farmer-dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerChatWindow;