// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // import { useAuth } from "../../context/AuthContext";
// // // import { io } from 'socket.io-client';
// // // import {
// // //   faSpinner,
// // //   faRupeeSign,
// // //   faArrowUp,
// // //   faExclamationTriangle,
// // //   faCheckCircle,
// // //   faTimesCircle,
// // //   faSyncAlt
// // // } from '@fortawesome/free-solid-svg-icons';
// // // import './ConsumerChatWindow.css';

// // // const FarmerChatWindow = () => {
// // //   const navigate = useNavigate();
// // //   const { bargainId } = useParams();
// // //   const { token } = useAuth();
// // //   const socket = useRef(null);
// // //   const messagesEndRef = useRef(null);

// // //   const [messages, setMessages] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [currentPrice, setCurrentPrice] = useState(0);
// // //   const [connectionStatus, setConnectionStatus] = useState("disconnected");
// // //   const [bargainStatus, setBargainStatus] = useState('pending');
// // //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// // //   const [selectedConsumer, setSelectedConsumer] = useState(null);
// // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // //   const [quantity, setQuantity] = useState(0);
// // //   const [priceSuggestions, setPriceSuggestions] = useState([]);
// // //   const [error, setError] = useState(null);

// // //   // Generate 6 increasing price suggestions from consumer's price
// // //   const generatePriceSuggestions = useCallback((basePrice) => {
// // //     return Array.from({ length: 6 }, (_, i) => ({
// // //       amount: i + 1,
// // //       price: basePrice + (i + 1),
// // //       label: `Offer ₹${basePrice + (i + 1)}/kg`
// // //     }));
// // //   }, []);

// // //   // Add system messages
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

// // //   // Fetch messages from database
// // //   const fetchMessages = async () => {
// // //     try {
// // //       const response = await fetch(
// // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
// // //         {
// // //           headers: {
// // //             'Authorization': `Bearer ${token}`,
// // //           },
// // //         }
// // //       );

// // //       if (!response.ok) {
// // //         throw new Error('Failed to fetch messages');
// // //       }

// // //       const data = await response.json();
// // //       setMessages(data);
// // //     } catch (err) {
// // //       console.error('Error fetching messages:', err);
// // //       setError(err.message);
// // //     }
// // //   };

// // //   // Save message to database
// // //   const sendMessageToDb = async (messageData) => {
// // //     try {
// // //       const response = await fetch(
// // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/messages`,
// // //         {
// // //           method: 'POST',
// // //           headers: {
// // //             'Content-Type': 'application/json',
// // //             'Authorization': `Bearer ${token}`,
// // //           },
// // //           body: JSON.stringify(messageData),
// // //         }
// // //       );

// // //       if (!response.ok) {
// // //         throw new Error('Failed to save message');
// // //       }

// // //       return await response.json();
// // //     } catch (err) {
// // //       console.error('Error saving message:', err);
// // //       throw err;
// // //     }
// // //   };

// // //   // Fetch bargain data
// // //   // const fetchBargainData = async () => {
// // //   //   try {
// // //   //     if (!bargainId || !token) {
// // //   //       throw new Error("Missing bargain ID or authentication token");
// // //   //     }

// // //   //     const response = await fetch(
// // //   //       `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// // //   //       {
// // //   //         headers: {
// // //   //           'Authorization': `Bearer ${token}`,
// // //   //         },
// // //   //       }
// // //   //     );

// // //   //     if (!response.ok) {
// // //   //       throw new Error(`Server error: ${response.status}`);
// // //   //     }

// // //   //     const data = await response.json();

// // //   //     if (!data.success) {
// // //   //       throw new Error(data.error || "Failed to fetch bargain data");
// // //   //     }

// // //   //     if (data.products && data.products.length > 0) {
// // //   //       const product = data.products[0];
// // //   //       setSelectedProduct(product);
        
// // //   //       // Use consumer's current offer if available, otherwise use base price
// // //   //       const currentOffer = product.current_offer || product.price_per_kg;
// // //   //       setCurrentPrice(currentOffer);
// // //   //       setQuantity(product.quantity || 1);
        
// // //   //       // Generate price suggestions based on consumer's offer
// // //   //       const suggestions = generatePriceSuggestions(currentOffer);
// // //   //       setPriceSuggestions(suggestions);
// // //   //     }
      
// // //   //     if (data.consumer) {
// // //   //       setSelectedConsumer(data.consumer);
// // //   //     }
      
// // //   //     setBargainStatus(data.status || 'pending');
      
// // //   //   } catch (error) {
// // //   //     setError(error.message || "Failed to load bargain data");
// // //   //   }
// // //   // };
// // //   // Update the fetchBargainData function
// // //   const fetchBargainData = async () => {
// // //     try {
// // //       if (!bargainId || !token) {
// // //         throw new Error("Missing bargain ID or authentication token");
// // //       }
  
// // //       const response = await fetch(
// // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// // //         {
// // //           headers: {
// // //             'Authorization': `Bearer ${token}`,
// // //             'Accept': 'application/json'
// // //           },
// // //           signal: AbortSignal.timeout(8000) // 8 second timeout
// // //         }
// // //       );
  
// // //       // First check if we got any response at all
// // //       if (!response) {
// // //         throw new Error("No response from server");
// // //       }
  
// // //       // Check for empty response before parsing
// // //       const responseText = await response.text();
// // //       if (!responseText.trim()) {
// // //         throw new Error("Server returned empty response");
// // //       }
  
// // //       // Now try to parse the JSON
// // //       let data;
// // //       try {
// // //         data = JSON.parse(responseText);
// // //       } catch (parseError) {
// // //         console.error("Failed to parse response:", responseText);
// // //         throw new Error("Invalid server response format");
// // //       }
  
// // //       // Validate response structure
// // //       if (!data || typeof data !== 'object') {
// // //         throw new Error("Invalid response structure");
// // //       }
  
// // //       // Process successful response
// // //       if (data.products && data.products.length > 0) {
// // //         const product = data.products[0];
// // //         setSelectedProduct(product);
        
// // //         const currentOffer = product.current_offer || product.price_per_kg;
// // //         setCurrentPrice(currentOffer);
// // //         setQuantity(product.quantity || 1);
        
// // //         const suggestions = generatePriceSuggestions(currentOffer);
// // //         setPriceSuggestions(suggestions);
// // //       }
      
// // //       if (data.consumer) {
// // //         setSelectedConsumer(data.consumer);
// // //       }
      
// // //       setBargainStatus(data.status || 'pending');
      
// // //     } catch (error) {
// // //       console.error("Bargain data fetch failed:", {
// // //         bargainId,
// // //         error: error.message,
// // //         stack: error.stack
// // //       });
      
// // //       // Special handling for empty responses
// // //       if (error.message.includes("empty") || error.message.includes("Unexpected end")) {
// // //         throw new Error("The bargain session couldn't be loaded. It may have expired or been deleted.");
// // //       }
      
// // //       throw error;
// // //     }
// // //   };


// // //   // Initialize socket connection
// // //   const initializeSocketConnection = useCallback(() => {
// // //     if (!bargainId || !token) return;

// // //     if (socket.current) {
// // //       socket.current.disconnect();
// // //     }

// // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // //       auth: { token },
// // //       query: { bargainId },
// // //       transports: ['websocket'],
// // //     });

// // //     // Connection events
// // //     socket.current.on('connect', () => {
// // //       console.log("Socket connected");
// // //       setConnectionStatus("connected");
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
// // //       addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
// // //       setWaitingForResponse(false);
      
// // //       // Regenerate price suggestions based on consumer's new price
// // //       const newSuggestions = generatePriceSuggestions(data.newPrice);
// // //       setPriceSuggestions(newSuggestions);
// // //     });

// // //     socket.current.on('bargainStatusUpdate', (status) => {
// // //       setBargainStatus(status);
// // //       if (status === 'accepted') {
// // //         addSystemMessage("🎉 Consumer accepted your offer!");
// // //       } else if (status === 'rejected') {
// // //         addSystemMessage("❌ Consumer declined your offer");
// // //       }
// // //       setWaitingForResponse(false);
// // //     });

// // //     // socket.current.on('bargainMessage', (data) => {
// // //     //   console.log("📩 Farmer received:", data);
// // //     //   setMessages(prev => [...prev, data.message]);
// // //     // });
    
// // //     socket.current.on('bargainMessage', (data) => {
// // //       setMessages(prev => [...prev, {
// // //         content: data.message.content,
// // //         sender_type: data.senderType,
// // //         timestamp: data.message.timestamp,
// // //       }]);
// // //     });
    
// // //     socket.current.on('error', (error) => {
// // //       console.error("Socket error:", error);
// // //       setError(error.message);
// // //     });
// // //   }, [bargainId, token, generatePriceSuggestions]);
// // //   const initializeChat = async () => {
// // //     try {
// // //       setLoading(true);
// // //       setError(null);
      
// // //       await fetchBargainData();
// // //       await fetchMessages();
      
// // //       // Only initialize socket if we have valid data
// // //       initializeSocketConnection();
      
// // //     } catch (err) {
// // //       // Differentiate between network errors and business logic errors
// // //       if (err.message.includes("Network") || err.message.includes("Failed to fetch")) {
// // //         setError("Network error: Please check your internet connection");
// // //       } else {
// // //         setError(err.message || "Failed to load bargain session");
// // //       }
      
// // //       // Attempt to reconnect after delay if it's a network error
// // //       if (err.message.includes("Network")) {
// // //         setTimeout(() => {
// // //           initializeChat();
// // //         }, 3000);
// // //       }
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };
// // //   // Auto-scroll to bottom when messages change
// // //   useEffect(() => {
// // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // //   }, [messages]);

// // //   const handlePriceSelection = async (price) => {
// // //     const messageContent = `💰 Counter offered ₹${price}/kg`;
    
// // //     try {
// // //       // Save to database first
// // //       const messageData = {
// // //         bargain_id: bargainId,
// // //         bsp_id: selectedProduct.bsp_id,
// // //         sender_type: "farmer",
// // //         sender_id: selectedConsumer.consumer_id,
// // //         content: messageContent,
// // //         price_offer: price
// // //       };

// // //       const savedMessage = await sendMessageToDb(messageData);

// // //       // Update local state
// // //       setCurrentPrice(price);
// // //       setWaitingForResponse(true);
// // //       setMessages(prev => [...prev, savedMessage]);

// // //       // Emit socket event
// // //       if (socket.current && socket.current.connected) {
// // //         socket.current.emit("bargainMessage", {
// // //           bargain_id: bargainId,
// // //           message: {
// // //             content: messageContent,
// // //             sender_type: "farmer",
// // //             timestamp: new Date().toISOString()
// // //           },
// // //           recipientType: "consumer",
// // //           recipientId: selectedConsumer.consumer_id,
// // //         });

// // //         socket.current.emit('priceOffer', {
// // //           price,
// // //           productId: selectedProduct.product_id,
// // //           quantity: quantity
// // //         });
// // //       }
// // //     } catch (err) {
// // //       setError(err.message);
// // //     }
// // //   };

// // //   const handleAccept = async () => {
// // //     const messageContent = "✅ You accepted the offer";
    
// // //     try {
// // //       // Save to database
// // //       const messageData = {
// // //         bargain_id: bargainId,
// // //         bsp_id: selectedProduct.bsp_id,
// // //         sender_type: "farmer",
// // //         sender_id: selectedConsumer.consumer_id,
// // //         content: messageContent
// // //       };

// // //       await sendMessageToDb(messageData);

// // //       // Update local state
// // //       addSystemMessage(messageContent);
// // //       setBargainStatus('accepted');

// // //       // Emit socket events
// // //       if (socket.current && socket.current.connected) {
// // //         socket.current.emit("bargainStatusUpdate", {
// // //           bargainId,
// // //           status: 'accepted'
// // //         });
        
// // //         socket.current.emit("bargainMessage", {
// // //           bargain_id: bargainId,
// // //           message: {
// // //             content: messageContent,
// // //             sender_type: "farmer",
// // //             timestamp: new Date().toISOString()
// // //           },
// // //           recipientType: "consumer",
// // //           recipientId: selectedConsumer.consumer_id,
// // //         });
// // //       }
// // //     } catch (err) {
// // //       setError(err.message);
// // //     }
// // //   };

// // //   const handleReject = async () => {
// // //     const messageContent = "❌ You rejected the offer";
    
// // //     try {
// // //       // Save to database
// // //       const messageData = {
// // //         bargain_id: bargainId,
// // //         bsp_id: selectedProduct.bsp_id,
// // //         sender_type: "farmer",
// // //         sender_id: selectedConsumer.consumer_id,
// // //         content: messageContent
// // //       };

// // //       await sendMessageToDb(messageData);

// // //       // Update local state
// // //       addSystemMessage(messageContent);
// // //       setBargainStatus('rejected');

// // //       // Emit socket events
// // //       if (socket.current && socket.current.connected) {
// // //         socket.current.emit("bargainStatusUpdate", {
// // //           bargainId,
// // //           status: 'rejected'
// // //         });
        
// // //         socket.current.emit("bargainMessage", {
// // //           bargain_id: bargainId,
// // //           message: {
// // //             content: messageContent,
// // //             sender_type: "farmer",
// // //             timestamp: new Date().toISOString()
// // //           },
// // //           recipientType: "consumer",
// // //           recipientId: selectedConsumer.consumer_id,
// // //         });
// // //       }
// // //     } catch (err) {
// // //       setError(err.message);
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="loading-container">
// // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // //         <p>Loading bargain session...</p>
// // //       </div>
// // //     );
// // //   }

  
// // // // Replace the error display with this more user-friendly version
// // // if (error) {
// // //   return (
// // //     <div className="error-container">
// // //       <div className="error-header">
// // //         <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
// // //         <h3>Unable to Load Bargain</h3>
// // //       </div>
      
// // //       <div className="error-details">
// // //         <p>{error}</p>
        
// // //         {error.includes("Network") && (
// // //           <div className="reconnecting">
// // //             <FontAwesomeIcon icon={faSpinner} spin />
// // //             <span>Attempting to reconnect...</span>
// // //           </div>
// // //         )}
// // //       </div>
      
// // //       <div className="error-actions">
// // //         <button 
// // //           onClick={() => navigate('/farmer/bargain')}
// // //           className="btn-secondary"
// // //         >
// // //           Back to Bargain List
// // //         </button>
// // //         <button 
// // //           onClick={() => {
// // //             setError(null);
// // //             setLoading(true);
// // //             initializeChat();
// // //           }}
// // //           className="btn-primary"
// // //         >
// // //           <FontAwesomeIcon icon={faSyncAlt} /> Try Again
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // //   return (
// // //     <div className="bargain-chat-container">
// // //       {selectedProduct && selectedConsumer && (
// // //         <div className="chat-interface">
// // //           {/* Chat Header */}
// // //           <div className="chat-header">
// // //             <div className="header-top">
// // //               <h2>
// // //                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.consumer_name}
// // //               </h2>
// // //               <span className={`connection-status ${connectionStatus}`}>
// // //                 {connectionStatus.toUpperCase()}
// // //               </span>
// // //             </div>
            
// // //             <div className="product-info">
// // //               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
// // //               <p><strong>Quantity:</strong> {quantity}kg</p>
// // //               <div className="price-display">
// // //                 <span className="current-price">
// // //                   <strong>Current:</strong> ₹{currentPrice}/kg
// // //                 </span>
// // //                 <span className="base-price">
// // //                   <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
// // //                 </span>
// // //                 <span className="total-price">
// // //                   <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
// // //                 </span>
// // //               </div>
// // //               {bargainStatus === 'accepted' && (
// // //                 <p className="status-accepted">
// // //                   <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
// // //                 </p>
// // //               )}
// // //               {bargainStatus === 'rejected' && (
// // //                 <p className="status-rejected">
// // //                   <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
// // //                 </p>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* Chat Messages */}
// // //           {/* <div className="chat-messages">
// // //             {messages.length === 0 ? (
// // //               <div className="no-messages">
// // //                 <p>No messages yet. Waiting for consumer's offer...</p>
// // //               </div>
// // //             )
            
            
            
// // //             : (
// // //               messages.map((msg, index) => (
// // //                 <div 
// // //                   key={`msg-${index}`} 
// // //                   className={`message ${msg.sender_type}`}
// // //                 >
// // //                   <div className="message-content">
// // //                     {msg.content}
// // //                   </div>
// // //                   <div className="message-meta">
// // //                     <span className="sender">
// // //                       {msg.sender_type === 'farmer' ? 'You' : 
// // //                        msg.sender_type === 'consumer' ? selectedConsumer.consumer_name : 'System'}
// // //                     </span>
// // //                     <span className="timestamp">
// // //                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // //                     </span>
// // //                   </div>
// // //                 </div>
// // //               ))
// // //             )}
// // //             <div ref={messagesEndRef} />
// // //           </div> */}
// // //             <div className="chat-messages">
// // //               {messages.length === 0 ? (
// // //                 <div className="no-messages">
// // //                   <p>No messages yet. Waiting for consumer's offer...</p>
// // //                 </div>
// // //               ) : (
// // //                 messages.map((msg, index) => (
// // //                   <div 
// // //                     key={`msg-${index}`} 
// // //                     className={`message-bubble-wrapper ${msg.sender_type === 'farmer' ? 'sent' : 'received'}`}
// // //                   >
// // //                     <div className="message-bubble">
// // //                       <div className="message-content">{msg.content}</div>
// // //                       <div className="message-meta">
// // //                         <span className="sender">
// // //                           {msg.sender_type === 'farmer' ? 'You' : selectedConsumer?.consumer_name || 'Consumer'}
// // //                         </span>
// // //                         <span className="timestamp">
// // //                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // //                         </span>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 ))
// // //               )}
// // //               <div ref={messagesEndRef} />
// // //             </div>

// // //           {/* Chat Controls */}
// // //           <div className="chat-controls">
// // //             {bargainStatus === 'pending' && priceSuggestions.length > 0 && (
// // //               <div className="price-suggestions">
// // //                 <h4>Make a Counter Offer:</h4>
// // //                 <div className="suggestion-buttons">
// // //                   {priceSuggestions.map((suggestion, index) => (
// // //                     <button
// // //                       key={`price-${index}`}
// // //                       onClick={() => handlePriceSelection(suggestion.price)}
// // //                       className="suggestion-btn increase"
// // //                       disabled={waitingForResponse}
// // //                     >
// // //                       <div className="price-change">
// // //                         <FontAwesomeIcon icon={faArrowUp} />
// // //                         ₹{suggestion.price}
// // //                       </div>
// // //                       <div className="price-label">{suggestion.label}</div>
// // //                     </button>
// // //                   ))}
// // //                 </div>
                
// // //                 <div className="action-buttons">
// // //                   <button 
// // //                     onClick={handleAccept}
// // //                     className="accept-btn"
// // //                     disabled={waitingForResponse}
// // //                   >
// // //                     <FontAwesomeIcon icon={faCheckCircle} /> Accept Consumer's Offer
// // //                   </button>
// // //                   <button 
// // //                     onClick={handleReject}
// // //                     className="reject-btn"
// // //                     disabled={waitingForResponse}
// // //                   >
// // //                     <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             )}

// // //             {waitingForResponse && (
// // //               <div className="waiting-indicator">
// // //                 <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
// // //               </div>
// // //             )}

// // //             {bargainStatus === 'accepted' && (
// // //               <div className="accepted-actions">
// // //                 <button 
// // //                   className="primary-action"
// // //                   onClick={() => navigate('/farmer/orders')}
// // //                 >
// // //                   View Order Details
// // //                 </button>
// // //                 <button 
// // //                   className="secondary-action"
// // //                   onClick={() => navigate('/farmer-dashboard')}
// // //                 >
// // //                   Back to Dashboard
// // //                 </button>
// // //               </div>
// // //             )}

// // //             {bargainStatus === 'rejected' && (
// // //               <div className="rejected-actions">
// // //                 <button 
// // //                   className="secondary-action"
// // //                   onClick={() => navigate('/farmer-dashboard')}
// // //                 >
// // //                   Back to Dashboard
// // //                 </button>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default FarmerChatWindow;

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
// //   faDoorOpen,
// //   faHandshake,
// //   faCheckCircle,
// //   faTimesCircle
// // } from '@fortawesome/free-solid-svg-icons';
// // import './FarmerChatWindow.css';

// // const FarmerChatWindow = () => {
// //   const navigate = useNavigate();
// //   const { bargainId } = useParams();
// //   const { token, farmer } = useAuth();
// //   const location = useLocation();
// //   const socket = useRef(null);
// //   const messagesEndRef = useRef(null);
// //   const reconnectAttempts = useRef(0);

// //   // State management
// //   const [messages, setMessages] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentPrice, setCurrentPrice] = useState(0);
// //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// //   const [bargainStatus, setBargainStatus] = useState('pending');
// //   const [waitingForResponse, setWaitingForResponse] = useState(false);
// //   const [quantity, setQuantity] = useState(0);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [consumerData, setConsumerData] = useState(null);
// //   const [productData, setProductData] = useState(null);
// //   const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
// //   const [priceSuggestions, setPriceSuggestions] = useState([]);
// //   const [isTyping, setIsTyping] = useState(false);

// //   // Generate price suggestions for farmers (increasing prices)
// //   const generatePriceSuggestions = useCallback((basePrice) => {
// //     const suggestions = [];
    
// //     // Generate 6 suggestions, each ₹1 more than the previous
// //     for (let i = 1; i <= 6; i++) {
// //       const newPrice = basePrice + i;
// //       suggestions.push({
// //         amount: i,
// //         price: newPrice,
// //         label: `₹${newPrice} (₹${i} more)`
// //       });
// //     }
  
// //     return suggestions;
// //   }, []);

// //   // Fetch messages from database
// //   const fetchMessages = async () => {
// //     try {
// //       if (!bargainId || !token) {
// //         throw new Error("Missing required parameters");
// //       }

// //       const response = await fetch(
// //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
// //         {
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }

// //       const data = await response.json();
// //       setMessages(data);
// //     } catch (err) {
// //       console.error('Error fetching messages:', err);
// //       setError(err.message);
// //     }
// //   };

// //   // WebSocket connection management
// //   const initializeSocketConnection = useCallback(() => {
// //     if (!bargainId || !token) {
// //       console.error("Missing required parameters for WebSocket connection");
// //       return;
// //     }
  
// //     if (socket.current) {
// //       socket.current.disconnect();
// //       socket.current = null;
// //     }
  
// //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// //       auth: {
// //         token: token
// //       },
// //       query: { bargainId },
// //       transports: ['websocket'],
// //       reconnectionAttempts: 5,
// //       reconnectionDelay: 1000,
// //       reconnectionDelayMax: 5000
// //     });
    
// //     // Connection events
// //     socket.current.on('connect', () => {
// //       console.log("Socket connected");
// //       setConnectionStatus("connected");
// //       reconnectAttempts.current = 0;
// //     });
  
// //     socket.current.on('connect_error', (err) => {
// //       console.error("Connection error:", err.message);
// //       setConnectionStatus("error");
      
// //       const maxAttempts = 5;
// //       if (reconnectAttempts.current < maxAttempts) {
// //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// //         reconnectAttempts.current += 1;
// //         setTimeout(() => initializeSocketConnection(), delay);
// //       }
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
// //         addSystemMessage("🎉 You accepted the offer!");
// //       } else if (status === 'rejected') {
// //         addSystemMessage("❌ You rejected the offer");
// //       }
// //       setWaitingForResponse(false);
// //     });
  
// //     socket.current.on('newMessage', (message) => {
// //       setMessages(prev => [...prev, message]);
// //       if (message.sender_type === 'consumer') {
// //         setWaitingForResponse(false);
// //       }
// //     });

// //     socket.current.on('typing', (isTyping) => {
// //       setIsTyping(isTyping);
// //     });
  
// //     socket.current.on('priceSuggestions', ({ suggestions }) => {
// //       setPriceSuggestions(suggestions);
// //       setShowPriceSuggestions(true);
// //     });
  
// //     socket.current.on('error', (error) => {
// //       console.error("Socket error:", error);
// //       setError(error.message);
// //     });
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

// //   // Fetch bargain data
// //   const fetchBargainData = useCallback(async () => {
// //     try {
// //       if (!bargainId || !token) {
// //         throw new Error("Missing bargain ID or authentication token");
// //       }
  
// //       const response = await fetch(
// //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
// //         {
// //           method: 'GET',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'Authorization': `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }

// //       const data = await response.json();
  
// //       if (!data.success) {
// //         throw new Error(data.error || "Failed to fetch bargain data");
// //       }
  
// //       // Set initial data from the response
// //       setConsumerData({
// //         consumer_id: data.consumer_id,
// //         consumer_name: data.consumer_name
// //       });
      
// //       setProductData({
// //         product_id: data.product_id,
// //         produce_name: data.product_name || "Unknown Product",
// //         price_per_kg: data.initial_price || 0
// //       });
      
// //       setCurrentPrice(data.current_price || 0);
// //       setQuantity(data.quantity || 0);
// //       setBargainStatus(data.status || 'pending');
      
// //     } catch (error) {
// //       console.error("Error fetching bargain data:", error);
// //       setError(error.message || "Failed to load bargain data");
// //     }
// //   }, [bargainId, token]);

// //   // Initialize socket connection and fetch data on mount
// //   useEffect(() => {
// //     const initializeChat = async () => {
// //       try {
// //         setLoading(true);
// //         await fetchBargainData();
// //         await fetchMessages();
// //         initializeSocketConnection();
// //       } catch (err) {
// //         console.error("Chat initialization error:", err);
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
// //   }, [fetchBargainData, initializeSocketConnection]);

// //   // Auto-scroll to bottom when messages change
// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   const handlePriceSelection = (price) => {
// //     const messageContent = `💰 Counter offered ₹${price}/kg`;
    
// //     addSystemMessage(messageContent);
// //     setCurrentPrice(price);
// //     setShowPriceSuggestions(false);
// //     setWaitingForResponse(true);

// //     if (socket.current && socket.current.connected) {
// //       socket.current.emit('priceOffer', {
// //         price,
// //         productId: productData?.product_id,
// //         quantity: quantity
// //       });
// //     }
// //   };

// //   const handleAcceptOffer = () => {
// //     if (socket.current && socket.current.connected) {
// //       socket.current.emit('bargainDecision', {
// //         bargainId,
// //         decision: 'accept'
// //       });
// //       setBargainStatus('accepted');
// //       addSystemMessage("✅ You accepted the offer!");
// //     }
// //   };

// //   const handleRejectOffer = () => {
// //     if (socket.current && socket.current.connected) {
// //       socket.current.emit('bargainDecision', {
// //         bargainId,
// //         decision: 'reject'
// //       });
// //       setBargainStatus('rejected');
// //       addSystemMessage("❌ You rejected the offer");
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
// //         <h3>Error Loading Chat</h3>
// //         <p>{error}</p>
// //         <button onClick={() => navigate('/farmer-dashboard')}>
// //           Back to Dashboard
// //         </button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bargain-chat-container">
// //       {/* Chat Interface */}
// //       {productData && (
// //         <div className="chat-interface animate__animated animate__fadeIn">
// //           <button 
// //             onClick={() => navigate('/farmer-dashboard')} 
// //             className="unique-close-btn"
// //             title="Exit Chat"
// //           >
// //             <FontAwesomeIcon icon={faDoorOpen} />
// //             <span>Exit</span>
// //           </button>
          
// //           {/* Chat Header */}
// //           <div className="chat-header">
// //             <div className="header-top">
// //               <h2>
// //                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerData?.consumer_name}
// //               </h2>
// //               <span className={`connection-status ${connectionStatus}`}>
// //                 {connectionStatus.toUpperCase()}
// //               </span>
// //             </div>
            
// //             <div className="product-info">
// //               <p><strong>Product:</strong> {productData?.produce_name}</p>
// //               <p><strong>Quantity:</strong> {quantity}kg</p>
// //               <div className="price-display">
// //                 <span className="current-price">
// //                   <strong>Current:</strong> ₹{currentPrice}/kg
// //                 </span>
// //                 <span className="base-price">
// //                   <strong>Your Price:</strong> ₹{productData?.price_per_kg}/kg
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
// //                   className={`message ${msg.sender_type} animate__animated animate__fadeIn`}
// //                   style={{ animationDelay: `${index * 0.1}s` }}
// //                 >
// //                   <div className="message-content">
// //                     {msg.content}
// //                   </div>
// //                   <div className="message-meta">
// //                     <span className="sender">
// //                       {msg.sender_type === 'farmer' ? 'You' : 
// //                        msg.sender_type === 'consumer' ? consumerData?.consumer_name : 'System'}
// //                     </span>
// //                     <span className="timestamp">
// //                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                     </span>
// //                   </div>
// //                 </div>
// //               ))
// //             )}
// //             {isTyping && (
// //               <div className="typing-indicator">
// //                 <div className="typing-dots">
// //                   <div></div>
// //                   <div></div>
// //                   <div></div>
// //                 </div>
// //                 <span>{consumerData?.consumer_name} is typing...</span>
// //               </div>
// //             )}
// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* Chat Controls */}
// //           <div className="chat-controls">
// //             {showPriceSuggestions && (
// //               <div className="price-suggestions animate__animated animate__fadeInUp">
// //                 <h4>Counter Offer:</h4>
// //                 <div className="suggestion-buttons">
// //                   {priceSuggestions.map((suggestion, index) => (
// //                     <button
// //                       key={`price-${index}`}
// //                       onClick={() => handlePriceSelection(suggestion.price)}
// //                       className={`suggestion-btn ${suggestion.amount > 0 ? 'increase' : 'decrease'}`}
// //                       disabled={waitingForResponse}
// //                     >
// //                       <div className="price-change">
// //                         {suggestion.amount > 0 ? (
// //                           <FontAwesomeIcon icon={faArrowUp} />
// //                         ) : (
// //                           <FontAwesomeIcon icon={faArrowDown} />
// //                         )}
// //                         ₹{suggestion.price}
// //                       </div>
// //                       <div className="price-label">{suggestion.label}</div>
// //                     </button>
// //                   ))}
// //                 </div>
// //                 <div className="decision-buttons">
// //                   <button 
// //                     onClick={handleAcceptOffer}
// //                     className="accept-btn"
// //                     disabled={waitingForResponse}
// //                   >
// //                     <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
// //                   </button>
// //                   <button 
// //                     onClick={handleRejectOffer}
// //                     className="reject-btn"
// //                     disabled={waitingForResponse}
// //                   >
// //                     <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
// //                   </button>
// //                 </div>
// //               </div>
// //             )}

// //             {waitingForResponse && (
// //               <div className="waiting-indicator animate__animated animate__pulse animate__infinite">
// //                 <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer...
// //               </div>
// //             )}

// //             {bargainStatus === 'accepted' && (
// //               <div className="accepted-actions animate__animated animate__fadeIn">
// //                 <button 
// //                   className="primary-action animate__animated animate__pulse"
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
// //               <div className="rejected-actions animate__animated animate__fadeIn">
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
//   faDoorOpen,
//   faHandshake,
//   faCheckCircle,
//   faTimesCircle
// } from '@fortawesome/free-solid-svg-icons';
// import './FarmerChatWindow.css';

// const FarmerChatWindow = () => {
//   const navigate = useNavigate();
//   const { bargainId } = useParams();
//   const { token, farmer } = useAuth();
//   const location = useLocation();
//   const socket = useRef(null);
//   const messagesEndRef = useRef(null);
//   const reconnectAttempts = useRef(0);

//   // Extract initial state from location
//   const { 
//     consumer: initialConsumer,
//     product: initialProduct
//   } = location.state || {};

//   // State management
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [bargainStatus, setBargainStatus] = useState('pending');
//   const [waitingForResponse, setWaitingForResponse] = useState(false);
//   const [selectedConsumer] = useState(initialConsumer || null);
//   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
//   const [quantity, setQuantity] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
//   const [priceSuggestions, setPriceSuggestions] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const [originalPrice, setOriginalPrice] = useState(0);

//   // Generate price suggestions based on current price
//   const generatePriceSuggestions = useCallback((basePrice) => {
//     const suggestions = [];
    
//     // Generate 6 suggestions, each ₹1 more than the previous
//     for (let i = 1; i <= 6; i++) {
//       const newPrice = basePrice + i;
//       suggestions.push({
//         amount: i,
//         price: newPrice,
//         label: `₹${newPrice} (₹${i} more)`
//       });
//     }
  
//     return suggestions;
//   }, []);

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

//   // WebSocket connection management
//   const initializeSocketConnection = useCallback(() => {
//     if (!bargainId || !token) {
//       console.error("Cannot initialize socket: missing bargainId or token");
//       setConnectionStatus("disconnected");
//       return;
//     }
  
//     // Clear any existing socket connection
//     if (socket.current) {
//       socket.current.removeAllListeners();
//       socket.current.disconnect();
//       socket.current = null;
//     }
  
//     // Configure socket options
//     const socketOptions = {
//       auth: { token },
//       query: { bargainId },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 10000,
//       timeout: 20000,
//       secure: process.env.NODE_ENV === 'production',
//       rejectUnauthorized: false,
//       extraHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     };
  
//     console.log("Initializing socket with options:", socketOptions);
  
//     // Create new socket connection
//     socket.current = io(
//       process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
//       socketOptions
//     );
  
//     // Connection established
//     socket.current.on('connect', () => {
//       console.log("Socket connected with ID:", socket.current?.id);
//       setConnectionStatus("connected");
//     });
  
//     // Connection error
//     socket.current.on('connect_error', (err) => {
//       console.error("Socket connection error:", err);
//       setConnectionStatus("error");
      
//       // Exponential backoff reconnection
//       const maxAttempts = 5;
//       if (reconnectAttempts.current < maxAttempts) {
//         const delay = Math.min(30000, Math.pow(2, reconnectAttempts.current) * 1000);
//         reconnectAttempts.current += 1;
//         console.log(`Reconnecting attempt ${reconnectAttempts.current} in ${delay}ms`);
//         setTimeout(() => initializeSocketConnection(), delay);
//       }
//     });
  
//     // Connection closed
//     socket.current.on('disconnect', (reason) => {
//       console.log("Socket disconnected:", reason);
//       setConnectionStatus("disconnected");
      
//       if (reason === "io server disconnect") {
//         console.log("Attempting immediate reconnect");
//         setTimeout(() => initializeSocketConnection(), 1000);
//       }
//     });
  
//     // Price update from consumer
//     socket.current.on('priceUpdate', (data) => {
//       if (data?.newPrice) {
//         setCurrentPrice(data.newPrice);
//         addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
//         setWaitingForResponse(false);
        
//         // Generate new suggestions based on the consumer's offer
//         const suggestions = generatePriceSuggestions(data.newPrice);
//         setPriceSuggestions(suggestions);
//         setShowPriceSuggestions(true);
//       } else {
//         console.error("Invalid priceUpdate data:", data);
//       }
//     });
  
//     // Bargain status update
//     socket.current.on('bargainStatusUpdate', (status) => {
//       const validStatuses = ['pending', 'accepted', 'rejected'];
//       if (validStatuses.includes(status)) {
//         setBargainStatus(status);
//         if (status === 'accepted') {
//           addSystemMessage("🎉 You accepted the consumer's offer!");
//         } else if (status === 'rejected') {
//           addSystemMessage("❌ You declined the consumer's offer");
//         }
//         setWaitingForResponse(false);
//       } else {
//         console.error("Invalid bargain status:", status);
//       }
//     });
  
//     // New chat message
//     socket.current.on('newMessage', (message) => {
//       if (message?.content && message?.sender_type) {
//         setMessages(prev => [...prev, message]);
//         if (message.sender_type === 'consumer') {
//           setWaitingForResponse(false);
//         }
//       } else {
//         console.error("Invalid message format:", message);
//       }
//     });
  
//     // Typing indicator
//     socket.current.on('typing', (isTyping) => {
//       setIsTyping(Boolean(isTyping));
//     });
  
//     // Error handling
//     socket.current.on('error', (error) => {
//       console.error("Socket error:", error);
//       setError(error.message || "WebSocket communication error");
//     });
  
//     // Cleanup function for useEffect
//     return () => {
//       if (socket.current) {
//         console.log("Cleaning up socket connection");
//         socket.current.removeAllListeners();
//         socket.current.disconnect();
//       }
//     };
//   }, [bargainId, token, generatePriceSuggestions]);

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

//   // Initialize socket connection and fetch messages on mount
//   useEffect(() => {
//     const initializeChat = async () => {
//       try {
//         setLoading(true);
//         await fetchMessages();
//         initializeSocketConnection();
//       } catch (err) {
//         setError(err.message);
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

//   // Fetch bargain data
//   useEffect(() => {
//     const fetchBargainData = async () => {
//       try {
//         if (!bargainId || !token) {
//           throw new Error("Missing bargain ID or authentication token");
//         }
  
//         const response = await fetch(
//           `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
//           {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${token}`,
//             },
//           }
//         );
  
//         const data = await response.json();
  
//         if (!response.ok) {
//           throw new Error(data.error || "Failed to fetch bargain data");
//         }
  
//         if (data.products && data.products.length > 0) {
//           const product = data.products[0];
//           setSelectedProduct(product);
//           setCurrentPrice(product.current_offer || product.price_per_kg);
//           setQuantity(product.quantity || 1);
//           setOriginalPrice(product.price_per_kg);
//         }
        
//         setBargainStatus(data.status || 'pending');
        
//       } catch (error) {
//         setError(error.message || "Failed to load bargain data");
//       }
//     };
  
//     fetchBargainData();
//   }, [bargainId, token]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Handle price selection (farmer's counter offer)
//   const handlePriceSelection = (price) => {
//     const messageContent = `💰 Counter offered ₹${price}/kg`;
    
//     addSystemMessage(messageContent);
//     setCurrentPrice(price);
//     setShowPriceSuggestions(false);
//     setWaitingForResponse(true);

//     if (socket.current && socket.current.connected) {
//       socket.current.emit('priceOffer', {
//         price,
//         productId: selectedProduct.product_id,
//         quantity: quantity
//       });
//     }
//   };

//   // Handle bargain status change (accept/reject)
//   const handleBargainStatus = (status) => {
//     if (socket.current && socket.current.connected) {
//       socket.current.emit('updateBargainStatus', {
//         bargainId,
//         status
//       });
      
//       setBargainStatus(status);
//       setShowPriceSuggestions(false);
      
//       if (status === 'accepted') {
//         addSystemMessage(`You accepted the offer at ₹${currentPrice}/kg`);
//       } else {
//         addSystemMessage("You declined the offer");
//       }
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

//   return (
//     <div className="farmer-chat-container">
//       {/* Chat Interface */}
//       {selectedProduct && selectedConsumer && (
//         <div className="chat-interface animate__animated animate__fadeIn">
//           <button 
//             onClick={() => navigate('/farmer-dashboard')} 
//             className="unique-close-btn"
//             title="Exit Chat"
//           >
//             <FontAwesomeIcon icon={faDoorOpen} />
//             <span>Exit</span>
//           </button>
          
//           {/* Chat Header */}
//           <div className="chat-header">
//             <div className="header-top">
//               <h2>
//                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer?.first_name} {selectedConsumer?.last_name}
//               </h2>
//               <span className={`connection-status ${connectionStatus}`}>
//                 {connectionStatus.toUpperCase()}
//               </span>
//             </div>
            
//             <div className="consumer-info">
//               <p><strong>Consumer:</strong> {selectedConsumer.first_name} {selectedConsumer.last_name}</p>
//               <p><strong>Phone:</strong> {selectedConsumer.phone_number}</p>
//               <p><strong>Location:</strong> {selectedConsumer.location || 'Not specified'}</p>
//             </div>
            
//             <div className="product-info">
//               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
//               <p><strong>Quantity:</strong> {quantity}kg</p>
//               <div className="price-display">
//                 <span className="current-price">
//                   <strong>Current Offer:</strong> ₹{currentPrice}/kg
//                 </span>
//                 <span className="base-price">
//                   <strong>Your Price:</strong> ₹{originalPrice}/kg
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
//                 <p>No messages yet. Waiting for consumer...</p>
//               </div>
//             ) : (
//               messages.map((msg, index) => (
//                 <div 
//                   key={`msg-${index}`} 
//                   className={`message ${msg.sender_type} animate__animated animate__fadeIn`}
//                   style={{ animationDelay: `${index * 0.1}s` }}
//                 >
//                   <div className="message-content">
//                     {msg.content}
//                   </div>
//                   <div className="message-meta">
//                     <span className="sender">
//                       {msg.sender_type === 'farmer' ? 'You' : 
//                        msg.sender_type === 'consumer' ? `${selectedConsumer?.first_name} ${selectedConsumer?.last_name}` : 'System'}
//                     </span>
//                     <span className="timestamp">
//                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//             {isTyping && (
//               <div className="typing-indicator">
//                 <div className="typing-dots">
//                   <div></div>
//                   <div></div>
//                   <div></div>
//                 </div>
//                 <span>{selectedConsumer?.first_name} is typing...</span>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Chat Controls */}
//           <div className="chat-controls">
//             {showPriceSuggestions && bargainStatus === 'pending' && (
//               <div className="price-suggestions animate__animated animate__fadeInUp">
//                 <h4>Respond to Offer:</h4>
//                 <div className="suggestion-buttons">
//                   {priceSuggestions.map((suggestion, index) => (
//                     <button
//                       key={`price-${index}`}
//                       onClick={() => handlePriceSelection(suggestion.price)}
//                       className={`suggestion-btn ${suggestion.amount > 0 ? 'increase' : 'decrease'}`}
//                       disabled={waitingForResponse}
//                     >
//                       <div className="price-change">
//                         {suggestion.amount > 0 ? (
//                           <FontAwesomeIcon icon={faArrowUp} />
//                         ) : (
//                           <FontAwesomeIcon icon={faArrowDown} />
//                         )}
//                         ₹{suggestion.price}
//                       </div>
//                       <div className="price-label">{suggestion.label}</div>
//                     </button>
//                   ))}
//                 </div>
                
//                 <div className="action-buttons">
//                   <button 
//                     className="accept-btn"
//                     onClick={() => handleBargainStatus('accepted')}
//                     disabled={waitingForResponse}
//                   >
//                     <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
//                   </button>
//                   <button 
//                     className="reject-btn"
//                     onClick={() => handleBargainStatus('rejected')}
//                     disabled={waitingForResponse}
//                   >
//                     <FontAwesomeIcon icon={faTimesCircle} /> Decline Offer
//                   </button>
//                 </div>
//               </div>
//             )}

//             {waitingForResponse && (
//               <div className="waiting-indicator animate__animated animate__pulse animate__infinite">
//                 <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
//               </div>
//             )}

//             {bargainStatus === 'accepted' && (
//               <div className="accepted-actions animate__animated animate__fadeIn">
//                 <button 
//                   className="primary-action animate__animated animate__pulse"
//                   onClick={() => navigate('/farmer-dashboard')}
//                 >
//                   Back to Dashboard
//                 </button>
//                 <button 
//                   className="secondary-action"
//                   onClick={() => navigate('/farmer-orders')}
//                 >
//                   View Orders
//                 </button>
//               </div>
//             )}

//             {bargainStatus === 'rejected' && (
//               <div className="rejected-actions animate__animated animate__fadeIn">
//                 <button 
//                   className="primary-action"
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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../../context/AuthContext";
import { io } from 'socket.io-client';
import {
  faSpinner,
  faRupeeSign,
  faArrowUp,
  faArrowDown,
  faTimes,
  faDoorOpen,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './FarmerChatWindow.css';

const FarmerChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token, farmer } = useAuth();
  const location = useLocation();
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bargainStatus, setBargainStatus] = useState('pending');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(0);

  // Generate price suggestions based on current price (higher prices only)
  const generatePriceSuggestions = useCallback((basePrice) => {
    return [
      { amount: 1, price: basePrice + 1, label: "Small Increase" },
      { amount: 2, price: basePrice + 2, label: "Fair Increase" },
      { amount: 3, price: basePrice + 3, label: "Good Increase" },
      { amount: 5, price: basePrice + 5, label: "Best Offer" }
    ];
  }, []);

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

  // WebSocket connection management
  const initializeSocketConnection = useCallback(() => {
    if (!bargainId || !token) {
      console.error("Cannot initialize socket: missing bargainId or token");
      setConnectionStatus("disconnected");
      return;
    }
  
    // Clear any existing socket connection
    if (socket.current) {
      socket.current.removeAllListeners();
      socket.current.disconnect();
      socket.current = null;
    }
  
    // Configure socket options
    const socketOptions = {
      auth: { token },
      query: { bargainId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      secure: process.env.NODE_ENV === 'production',
      rejectUnauthorized: false,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    };
  
    console.log("Initializing socket with options:", socketOptions);
  
    // Create new socket connection
    socket.current = io(
      process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
      socketOptions
    );
  
    // Connection established
    socket.current.on('connect', () => {
      console.log("Socket connected with ID:", socket.current?.id);
      setConnectionStatus("connected");
    });
  
    // Connection error
    socket.current.on('connect_error', (err) => {
      console.error("Socket connection error:", err);
      setConnectionStatus("error");
      
      // Exponential backoff reconnection
      const maxAttempts = 5;
      if (reconnectAttempts.current < maxAttempts) {
        const delay = Math.min(30000, Math.pow(2, reconnectAttempts.current) * 1000);
        reconnectAttempts.current += 1;
        console.log(`Reconnecting attempt ${reconnectAttempts.current} in ${delay}ms`);
        setTimeout(() => initializeSocketConnection(), delay);
      }
    });
  
    // Connection closed
    socket.current.on('disconnect', (reason) => {
      console.log("Socket disconnected:", reason);
      setConnectionStatus("disconnected");
      
      if (reason === "io server disconnect") {
        console.log("Attempting immediate reconnect");
        setTimeout(() => initializeSocketConnection(), 1000);
      }
    });
  
    // Price update from consumer
    socket.current.on('priceUpdate', (data) => {
      if (data?.newPrice) {
        setCurrentPrice(data.newPrice);
        addSystemMessage(`Consumer offered ₹${data.newPrice}/kg`);
        setWaitingForResponse(false);
        
        // Generate farmer's price suggestions (higher than consumer's offer)
        const suggestions = generatePriceSuggestions(data.newPrice);
        setPriceSuggestions(suggestions);
        setShowPriceSuggestions(true);
      }
    });
  
    // Bargain status update
    socket.current.on('bargainStatusUpdate', (status) => {
      const validStatuses = ['pending', 'accepted', 'rejected'];
      if (validStatuses.includes(status)) {
        setBargainStatus(status);
        if (status === 'accepted') {
          addSystemMessage("🎉 You accepted the offer!");
        } else if (status === 'rejected') {
          addSystemMessage("❌ You declined the offer");
        }
        setShowPriceSuggestions(false);
      }
    });
  
    // New chat message
    socket.current.on('newMessage', (message) => {
      if (message?.content && message?.sender_type) {
        setMessages(prev => [...prev, message]);
      }
    });
  
    // Typing indicator
    socket.current.on('typing', (isTyping) => {
      setIsTyping(Boolean(isTyping));
    });
  
    // Error handling
    socket.current.on('error', (error) => {
      console.error("Socket error:", error);
      setError(error.message || "WebSocket communication error");
    });
  
    // Cleanup function for useEffect
    return () => {
      if (socket.current) {
        console.log("Cleaning up socket connection");
        socket.current.removeAllListeners();
        socket.current.disconnect();
      }
    };
  }, [bargainId, token, generatePriceSuggestions]);

  // Helper function to add system messages
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

  // Initialize socket connection and fetch messages on mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
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

  // Fetch bargain data
  useEffect(() => {
    const fetchBargainData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch bargain data");
        }

        if (data.consumer) {
          setSelectedConsumer(data.consumer);
        }

        if (data.products && data.products.length > 0) {
          const product = data.products[0];
          setSelectedProduct(product);
          setCurrentPrice(product.current_offer || product.price_per_kg);
          setQuantity(product.quantity || 1);
          setOriginalPrice(product.price_per_kg);
        }
        
        setBargainStatus(data.status || 'pending');
        
      } catch (error) {
        setError(error.message || "Failed to load bargain data");
      }
    };
  
    fetchBargainData();
  }, [bargainId, token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle price selection (farmer's counter offer)
  const handlePriceSelection = (price) => {
    const messageContent = `💰 You counter offered ₹${price}/kg`;
    
    addSystemMessage(messageContent);
    setCurrentPrice(price);
    setShowPriceSuggestions(false);
    setWaitingForResponse(true);

    if (socket.current && socket.current.connected) {
      socket.current.emit('priceOffer', {
        price,
        productId: selectedProduct.product_id,
        quantity: quantity
      });
    }
  };

  // Handle bargain status change (accept/reject)
  const handleBargainStatus = (status) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit('updateBargainStatus', {
        bargainId,
        status
      });
      
      setBargainStatus(status);
      setShowPriceSuggestions(false);
      
      if (status === 'accepted') {
        addSystemMessage(`You accepted the offer at ₹${currentPrice}/kg`);
      } else {
        addSystemMessage("You declined the offer");
      }
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

  return (
    <div className="farmer-chat-container">
      {/* Chat Interface */}
      {selectedProduct && selectedConsumer && (
        <div className="chat-interface">
          <button 
            onClick={() => navigate('/farmer-dashboard')} 
            className="close-btn"
            title="Exit Chat"
          >
            <FontAwesomeIcon icon={faDoorOpen} />
            <span>Exit</span>
          </button>
          
          {/* Chat Header */}
          <div className="chat-header">
            <div className="header-top">
              <h2>
                <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.first_name}
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
                  <strong>Current Offer:</strong> ₹{currentPrice}/kg
                </span>
                <span className="original-price">
                  <strong>Your Price:</strong> ₹{originalPrice}/kg
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
            {messages.map((msg, index) => (
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
                     msg.sender_type === 'consumer' ? selectedConsumer.first_name : 'System'}
                  </span>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span>{selectedConsumer.first_name} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Controls */}
          <div className="chat-controls">
            {showPriceSuggestions && bargainStatus === 'pending' && (
              <div className="price-actions">
                <div className="price-suggestions">
                  <h4>Make a Counter Offer:</h4>
                  <div className="suggestion-buttons">
                    {priceSuggestions.map((suggestion, index) => (
                      <button
                        key={`price-${index}`}
                        onClick={() => handlePriceSelection(suggestion.price)}
                        className="suggestion-btn"
                      >
                        <FontAwesomeIcon icon={faArrowUp} />
                        ₹{suggestion.price} ({suggestion.label})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="status-actions">
                  <button 
                    className="accept-btn"
                    onClick={() => handleBargainStatus('accepted')}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleBargainStatus('rejected')}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} /> Reject Offer
                  </button>
                </div>
              </div>
            )}

            {waitingForResponse && (
              <div className="waiting-indicator">
                <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
              </div>
            )}

            {bargainStatus !== 'pending' && (
              <div className="post-status-actions">
                <button 
                  className="dashboard-btn"
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