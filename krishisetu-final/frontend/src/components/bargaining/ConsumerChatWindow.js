// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useAuth } from "../../context/AuthContext";
// import { io } from 'socket.io-client';
// import {
//   faSpinner,
//   faRupeeSign,
//   faArrowDown,
//   faTimes,
//   faDoorOpen,
//   faHandshake,
//   faCheckCircle,
//   faTimesCircle,
//   faHome,
//   faClipboardList,
//   faShoppingCart,
//   faLeaf,
//   faUserTie,
//   faWeightHanging,
//   faPercentage
// } from '@fortawesome/free-solid-svg-icons';
// import './ConsumerChatWindow.css';

// const BargainChatWindow = () => {
//   const navigate = useNavigate();
//   const { bargainId } = useParams();
//   const { token, consumer } = useAuth();
//   const location = useLocation();
//   const socket = useRef(null);
//   const messagesEndRef = useRef(null);
//   const reconnectAttempts = useRef(0);
//   const { 
//     farmer: initialFarmer, 
//     product: initialProduct,
//     currentPrice: initialPrice,
//     originalPrice
//   } = location.state || {};

//   // State management
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [bargainStatus, setBargainStatus] = useState('pending');
//   const [waitingForResponse, setWaitingForResponse] = useState(false);
//   const [selectedFarmer] = useState(initialFarmer || null);
//   const [quantity, setQuantity] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
//   const [selectedQuantity, setSelectedQuantity] = useState(initialProduct?.minimum_quantity || '10');
//   const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
//   const [priceSuggestions, setPriceSuggestions] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const [hasFarmerCounterOffer, setHasFarmerCounterOffer] = useState(false);
//   const [isBargainComplete, setIsBargainComplete] = useState(false);
//   const [bargainResult, setBargainResult] = useState(null);
//   const [freezeUI, setFreezeUI] = useState(false);

//   // Generate price suggestions based on base price
//   const generatePriceSuggestions = useCallback((basePrice) => {
//     const numericPrice = parseFloat(basePrice);
//     if (isNaN(numericPrice)) return [];

//     const suggestions = [];
//     const numberOfSuggestions = 10;
    
//     // Generate 10 suggestions below the base price
//     for (let i = 1; i <= numberOfSuggestions; i++) {
//       const price = numericPrice - i;
//       if (price > 0) { // Ensure price doesn't go below 1
//         const reduction = i;
//         suggestions.push({
//           amount: -reduction,
//           price: price,
//           label: `₹${price} (₹${reduction} less)`
//         });
//       }
//     }

//     return suggestions.sort((a, b) => a.price - b.price);
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

//       const data = await response.json();
    
//       const formattedMessages = data.map(msg => ({
//         ...msg,
//         content: msg.message_content,
//         timestamp: msg.created_at
//       }));
      
//       setMessages(formattedMessages);
//     } catch (err) {
//       console.error('Error fetching messages:', err);
//     }
//   };

//   const addToCart = async (product, price, quantity, bargainId) => {
//     if (!selectedFarmer || !consumer?.consumer_id) {
//       console.error('Farmer or consumer data is missing');
//       return;
//     }
  
//     try {
//       const total_price = price * quantity;
  
//       const payload = {
//         bargain_id: bargainId,
//         ...(product?.product_id && { product_id: product.product_id }),
//         product_name: product?.produce_name,
//         product_category: product?.produce_type,
//         price_per_kg: price,
//         quantity,
//         total_price,
//         farmer_id: selectedFarmer?.farmer_id,
//         consumer_id: consumer.consumer_id
//       };
  
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );
  
//       const responseText = await response.text();
//       let responseData;
  
//       try {
//         responseData = JSON.parse(responseText);
//       } catch {
//         throw new Error("Unexpected server response");
//       }
  
//       if (!response.ok) {
//         throw new Error(responseData.error || "Failed to add to cart");
//       }
  
//       return responseData;
  
//     } catch (err) {
//       console.error("💥 Error adding to cart:", err.message);
//       throw err;
//     }
//   };

//   // ✅ FIX: unified listener for bargainMessage
//   useEffect(() => {
//     if (!socket.current) return;

//     const handleNewMessage = (data) => {
//       const message = {
//         ...data,
//         content: data.message_content || data.content,
//         sender_role: data.sender_role || 'farmer',
//         timestamp: data.created_at || new Date().toISOString()
//       };

//       setMessages(prev => [...prev, message]);
      
//       if (message.sender_role === 'farmer' && 
//           (message.message_type === 'counter_offer' || 
//            message.content.includes('Counter offer'))) {
        
//         const price = message.price_suggestion || 
//                      parseFloat(message.content.match(/₹(\d+)/)?.[1]) || 
//                      currentPrice;
        
//         setCurrentPrice(price);
//         setHasFarmerCounterOffer(true);
//         setWaitingForResponse(false);
        
//         // Generate suggestions based on farmer's counter offer price
//         const suggestions = generatePriceSuggestions(price);
//         setPriceSuggestions(suggestions);
//       }
//     };

//     socket.current.on('bargainMessage', handleNewMessage);
//     return () => socket.current?.off('bargainMessage', handleNewMessage);
//   }, [currentPrice, generatePriceSuggestions]);

//   // const initializeSocketConnection = useCallback(() => {
//   //   if (!bargainId || !token) {
//   //     console.error("Cannot initialize socket: missing bargainId or token");
//   //     setConnectionStatus("disconnected");
//   //     return;
//   //   }

//   //   if (socket.current) {
//   //     socket.current.removeAllListeners();
//   //     socket.current.disconnect();
//   //     socket.current = null;
//   //   }

//   //   const socketOptions = {
//   //     auth: { token },
//   //     query: { bargainId },
//   //     transports: ['websocket', 'polling'],
//   //     reconnection: true,
//   //     reconnectionAttempts: 5,
//   //     reconnectionDelay: 1000,
//   //     reconnectionDelayMax: 10000,
//   //     timeout: 20000,
//   //     secure: process.env.NODE_ENV === 'production',
//   //     rejectUnauthorized: false,
//   //     extraHeaders: {
//   //       Authorization: `Bearer ${token}`
//   //     }
//   //   };

//   //   console.log("Initializing socket connection...");
//   //   socket.current = io(
//   //     process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
//   //     socketOptions
//   //   );

//   //   socket.current.on('connect', () => {
//   //     console.log("Socket connected successfully");
//   //     setConnectionStatus("connected");
//   //     reconnectAttempts.current = 0;
//   //   });

//   //   socket.current.on('connect_error', (error) => {
//   //     console.error('Socket connection error:', error);
//   //     setConnectionStatus("error");
//   //   });

//   //   socket.current.on('disconnect', (reason) => {
//   //     console.log('Socket disconnected:', reason);
//   //     setConnectionStatus("disconnected");
      
//   //     // Attempt reconnection for certain disconnect reasons
//   //     if (reason === 'io server disconnect' || reason === 'transport close') {
//   //       setTimeout(() => {
//   //         if (reconnectAttempts.current < 5) {
//   //           reconnectAttempts.current += 1;
//   //           socket.current.connect();
//   //         }
//   //       }, 1000);
//   //     }
//   //   });

//   //   socket.current.on('bargainStatusUpdate', (data = {}) => {
//   //     const { status, currentPrice } = data;

//   //     // Only react to final states
//   //     if (!['accepted', 'rejected'].includes(status)) return;

//   //     setBargainStatus(status);
//   //     setCurrentPrice(currentPrice);
//   //     setIsBargainComplete(true);
//   //     setFreezeUI(true);
//   //     setWaitingForResponse(false);
//   //     setHasFarmerCounterOffer(false);
//   //     setShowPriceSuggestions(false);

//   //     // ✅ store result
//   //     setBargainResult(status);

//   //     // ✅ add system message
//   //     setMessages(prev => [
//   //       ...prev,
//   //       {
//   //         content:
//   //           status === 'accepted'
//   //             ? `🎉 Bargain accepted at ₹${currentPrice}/kg`
//   //             : `❌ Bargain rejected`,
//   //         sender_type: 'system',
//   //         timestamp: new Date().toISOString(),
//   //       }
//   //     ]);
//   //   });

//   //   // ✅ FIX: use only bargainMessage everywhere
//   //   socket.current.on('bargainMessage', (message) => {
//   //     if (message?.message_id || message?.message_content) {
//   //       setMessages(prev => [...prev, {
//   //         ...message,
//   //         content: message.message_content || message.content,
//   //         timestamp: message.created_at || new Date().toISOString()
//   //       }]);
//   //     }
//   //   });

//   //   return () => {
//   //     if (socket.current) {
//   //       socket.current.disconnect();
//   //     }
//   //   };
//   // }, [bargainId, token, generatePriceSuggestions]);


//   const initializeSocketConnection = useCallback(() => {
//   if (!bargainId || !token) {
//     console.error("Cannot initialize socket: missing bargainId or token");
//     setConnectionStatus("disconnected");
//     return;
//   }

//   if (socket.current) {
//     socket.current.removeAllListeners();
//     socket.current.disconnect();
//     socket.current = null;
//   }

//   // Use the SAME socket options as the farmer side
//   const socketOptions = {
//     auth: { 
//       token,
//       bargainId 
//     },
//     query: { 
//       bargainId,
//       userType: 'consumer'  // Changed from 'farmer' to 'consumer'
//     },
//     transports: ['websocket', 'polling'],
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 10000,
//     timeout: 20000,
//     secure: process.env.NODE_ENV === 'production',
//     rejectUnauthorized: false,
//     extraHeaders: {
//       Authorization: `Bearer ${token}`
//     }
//   };

//   console.log("Initializing consumer socket with options:", socketOptions);

//   socket.current = io(
//     process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
//     socketOptions
//   );

//   socket.current.on('connect', () => {
//     console.log("Consumer socket connected with ID:", socket.current?.id);
//     setConnectionStatus("connected");
//     reconnectAttempts.current = 0;
//   });

//   socket.current.on('connect_error', (err) => {
//     console.error("Consumer socket connection error:", err);
//     setConnectionStatus("error");
    
//     // Exponential backoff reconnection (same as farmer)
//     const maxAttempts = 5;
//     if (reconnectAttempts.current < maxAttempts) {
//       const delay = Math.min(30000, Math.pow(2, reconnectAttempts.current) * 1000);
//       reconnectAttempts.current += 1;
//       console.log(`Consumer reconnecting attempt ${reconnectAttempts.current} in ${delay}ms`);
//       setTimeout(() => initializeSocketConnection(), delay);
//     }
//   });

//   socket.current.on('disconnect', (reason) => {
//     console.log("Consumer socket disconnected:", reason);
//     setConnectionStatus("disconnected");
    
//     if (reason === "io server disconnect") {
//       setTimeout(() => initializeSocketConnection(), 1000);
//     }
//   });

//   // Keep your existing message handlers...
//   socket.current.on('bargainMessage', (message) => {
//     if (message?.message_id || message?.message_content) {
//       setMessages(prev => [...prev, {
//         ...message,
//         content: message.message_content || message.content,
//         timestamp: message.created_at || new Date().toISOString()
//       }]);
//     }
//   });

//   socket.current.on('bargainStatusUpdate', (data = {}) => {
//     const { status, currentPrice } = data;

//     if (!['accepted', 'rejected'].includes(status)) return;

//     setBargainStatus(status);
//     setCurrentPrice(currentPrice);
//     setIsBargainComplete(true);
//     setFreezeUI(true);
//     setWaitingForResponse(false);
//     setHasFarmerCounterOffer(false);
//     setShowPriceSuggestions(false);

//     setBargainResult(status);

//     setMessages(prev => [
//       ...prev,
//       {
//         content:
//           status === 'accepted'
//             ? `🎉 Bargain accepted at ₹${currentPrice}/kg`
//             : `❌ Bargain rejected`,
//         sender_type: 'system',
//         timestamp: new Date().toISOString(),
//       }
//     ]);
//   });

//   // Add error handler like farmer side
//   socket.current.on('error', (error) => {
//     console.error("Consumer socket error:", error);
//     setError(error.message || "WebSocket communication error");
//   });

//   return () => {
//     if (socket.current) {
//       socket.current.disconnect();
//     }
//   };
// }, [bargainId, token, generatePriceSuggestions]);
//   const addSystemMessage = useCallback((content) => {
//     setMessages(prev => [
//       ...prev,
//       {
//         content,
//         sender_type: "system",
//         timestamp: new Date().toISOString()
//       }
//     ]);
//   }, []);

//   useEffect(() => {
//     const initializeChat = async () => {
//       try {
//         setLoading(true);
//         await fetchMessages();
//         initializeSocketConnection();
        
//         // Add initial system message
//         if (selectedProduct) {
//           const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity || quantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
//           addSystemMessage(systemMessageContent);
          
//           // Generate suggestions based on BASE PRICE, not current price
//           const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
//           setPriceSuggestions(suggestions);
//           setShowPriceSuggestions(true);
          
//           // Set initial current price to base price if not already set
//           if (currentPrice === 0) {
//             setCurrentPrice(selectedProduct.price_per_kg);
//           }
//         }
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
//         socket.current = null;
//       }
//     };
//   }, [initializeSocketConnection, selectedProduct, selectedQuantity, quantity, addSystemMessage, generatePriceSuggestions, currentPrice]);

//   // Attempt to reconnect if disconnected unexpectedly
//   // useEffect(() => {
//   //   if (connectionStatus === "disconnected" && !loading) {
//   //     const timeout = setTimeout(() => {
//   //       if (socket.current && !socket.current.connected) {
//   //         console.log("Attempting to reconnect socket...");
//   //         socket.current.connect();
//   //       } else if (!socket.current) {
//   //         console.log("Reinitializing socket connection...");
//   //         initializeSocketConnection();
//   //       }
//   //     }, 2000);
      
//   //     return () => clearTimeout(timeout);
//   //   }
//   // }, [connectionStatus, loading, initializeSocketConnection]);

//   const handlePriceSelection = async (price) => {
//     try {
//       setShowPriceSuggestions(false);
//       setWaitingForResponse(true);
//       setCurrentPrice(price);
      
//       const messageType = hasFarmerCounterOffer ? 'counter_offer' : 'price_offer';
//       const messageContent = `💰 ${hasFarmerCounterOffer ? 'Counter offer' : 'Offered'} ₹${price}/kg for ${selectedQuantity}kg of ${selectedProduct.produce_name}`;
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             sender_role: 'consumer',
//             sender_id: consumer.consumer_id,
//             message_content: messageContent,
//             price_suggestion: price,
//             message_type: messageType
//           })
//         }
//       );

//       if (!response.ok) throw new Error('Failed to save message');

//       const newMessage = await response.json();
//       setMessages(prev => [...prev, newMessage]);
//       setHasFarmerCounterOffer(false);

//       if (socket.current?.connected) {
//         socket.current.emit('bargainMessage', {
//           ...newMessage,
//           bargain_id: bargainId,
//           created_at: new Date().toISOString()
//         });
//       }
//     } catch (err) {
//       setError(err.message);
//       setShowPriceSuggestions(true);
//     }
//   };

//   // Show initial system message and price suggestions when product is selected
//   useEffect(() => {
//     if (selectedProduct && messages.length === 0) {
//       const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
//       addSystemMessage(systemMessageContent);
      
//       // Use the base price (selectedProduct.price_per_kg) instead of currentPrice
//       const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
//       setPriceSuggestions(suggestions);
//       setShowPriceSuggestions(true);
//     }
//   }, [selectedProduct, messages.length, addSystemMessage, generatePriceSuggestions, selectedQuantity]);

//   useEffect(() => {
//     const fetchBargainData = async () => {
//       try {
//         if (!bargainId || !token) return;

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
//         if (!data.success) throw new Error(data.error || "Failed to fetch bargain data");

//         if (data.products && data.products.length > 0) {
//           const product = data.products[0];
//           setCurrentPrice(product.current_offer || product.price_per_kg);
//           setQuantity(product.quantity || 1);
//         }

//         const status = data.status || 'pending';
//         setBargainStatus(status);

//         if (status === 'accepted' || status === 'rejected') {
//           setIsBargainComplete(true);
//           setFreezeUI(true);
//           setBargainResult(status);
//           setShowPriceSuggestions(false);
//           setHasFarmerCounterOffer(false);
//         }
//       } catch (err) {
//         setError(err.message || "Failed to load bargain data");
//       }
//     };
    
//     fetchBargainData();
//   }, [bargainId, token]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleAcceptFarmerOffer = async () => {
//     try {
//       setWaitingForResponse(true);
  
//       // Save acceptance message to database
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             sender_role: 'consumer',
//             sender_id: consumer.consumer_id,
//             message_content: `✅ You accepted the offer at ₹${currentPrice}/kg`,
//             message_type: 'accept',
//             price_suggestion: currentPrice
//           })
//         }
//       );
  
//       if (!response.ok) throw new Error('Failed to save acceptance message');
  
//       const savedMessage = await response.json();
//       setMessages(prev => [...prev, savedMessage]);
  
//       // Emit status update via socket
//       socket.current.emit('updateBargainStatus', {
//         bargainId,
//         status: 'accepted',
//         currentPrice,
//         userId: consumer.consumer_id,
//         userType: 'consumer'
//       });
  
//       // Add to cart after acceptance
//       await addToCart(
//         selectedProduct,
//         currentPrice,
//         selectedQuantity,
//         bargainId
//       );
  
//       setBargainStatus('accepted');
//       setIsBargainComplete(true);
//       setBargainResult('accepted');
//       setShowPriceSuggestions(false);
//       setHasFarmerCounterOffer(false);
//       setFreezeUI(true);
  
//     } catch (err) {
//       console.error('Error accepting offer:', err);
//       setError(err.message);
//       setWaitingForResponse(false);
//     }
//   };
  
//   const handleRejectFarmerOffer = async () => {
//     try {
//       setWaitingForResponse(true);
      
//       // Save rejection to database first
//       const response = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             sender_role: 'consumer',
//             sender_id: consumer.consumer_id,
//             message_content: `❌ You rejected the offer at ₹${currentPrice}/kg`,
//             message_type: 'reject',
//             price_suggestion: currentPrice
//           })
//         }
//       );
  
//       if (!response.ok) throw new Error('Failed to save rejection message');
  
//       const savedMessage = await response.json();
//       setMessages(prev => [...prev, savedMessage]);
      
//       // Then emit socket event
//       socket.current.emit('updateBargainStatus', {
//         bargainId,
//         status: 'rejected',
//         currentPrice,
//         userId: consumer.consumer_id,
//         userType: 'consumer'
//       });
  
//       setBargainStatus('rejected');
//       setIsBargainComplete(true);
//       setBargainResult('rejected');
//       setShowPriceSuggestions(false);
//       setHasFarmerCounterOffer(false);
//     } catch (err) {
//       setError(err.message);
//       setWaitingForResponse(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="krishi-bargain-loading">
//         <div className="krishi-loading-content">
//           <FontAwesomeIcon icon={faSpinner} spin size="2x" className="krishi-spinner" />
//            <p className="krishi-loading-text">Loading bargain session...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!selectedProduct || !selectedFarmer) {
//     return (
//       <div className="krishi-bargain-loading">
//         <div className="krishi-loading-content">
//           <FontAwesomeIcon icon={faTimesCircle} size="2x" />
//           <p className="krishi-loading-text">Missing product or farmer information</p>
//           <button onClick={() => navigate('/consumer-dashboard')} className="krishi-action-btn">
//             Return to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="krishi-bargain-container">
//       {/* Chat Interface */}
//       {selectedProduct && (
//         <div className="krishi-chat-interface">
//           {/* Chat Header - Moved exit button inside the header */}
//           <div className="krishi-chat-header">
//             <div className="krishi-chat-header-top">
//               <div className="krishi-chat-title">
//                 <FontAwesomeIcon icon={faRupeeSign} />
//                 <h2>Bargaining with {selectedFarmer?.farmer_name}</h2>
//               </div>
//               <div className="krishi-header-controls">
//                 <span className={`krishi-connection-status krishi-status-${connectionStatus}`}>
//                   {connectionStatus.toUpperCase()}
//                 </span>
//                 <button 
//                   onClick={() => navigate('/consumer-dashboard')} 
//                   className="krishi-exit-btn"
//                   title="Exit Chat"
//                 >
//                   <FontAwesomeIcon icon={faDoorOpen} />
//                   <span>Exit</span>
//                 </button>
//               </div>
//             </div>
//             <div className="krishi-chat-product-info">
//               <div className="krishi-product-row">
//                 <span className="krishi-product-label">Product:</span>
//                 <span className="krishi-product-value">{selectedProduct.produce_name}</span>
//               </div>
//               <div className="krishi-product-row">
//                 <span className="krishi-product-label">Quantity:</span>
//                 <span className="krishi-product-value">{selectedQuantity || quantity}kg</span>
//               </div>
//               <div className="krishi-price-info">
//                 <div className="krishi-price-item">
//                   <span className="krishi-price-label">Current:</span>
//                   <span className="krishi-price-value">₹{currentPrice}/kg</span>
//                 </div>
//                 <div className="krishi-price-item">
//                   <span className="krishi-price-label">Base:</span>
//                   <span className="krishi-price-value">₹{selectedProduct.price_per_kg}/kg</span>
//                 </div>
//                 <div className="krishi-price-item krishi-price-total">
//                   <span className="krishi-price-label">Total:</span>
//                   <span className="krishi-price-value">₹{(selectedQuantity * currentPrice).toFixed(2)}</span>
//                 </div>
//               </div>
//               {bargainStatus === 'accepted' && (
//                 <div className="krishi-status-message krishi-status-accepted">
//                   <FontAwesomeIcon icon={faCheckCircle} />
//                   <span>Offer Accepted!</span>
//                 </div>
//               )}
//               {bargainStatus === 'rejected' && (
//                 <div className="krishi-status-message krishi-status-rejected">
//                   <FontAwesomeIcon icon={faTimesCircle} />
//                   <span>Offer Declined</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Chat Messages */}
//           <div className="krishi-messages-container">
//             {messages.length === 0 ? (
//               <div className="krishi-no-messages">
//                 <p>No messages yet. Start the negotiation!</p>
//               </div>
//             ) : (
//               messages.map((msg, index) => {
//                 const messageType = msg.sender_role === 'consumer' ? 'consumer' :
//                                   msg.sender_role === 'farmer' ? 'farmer' : 'system';

//                 return (
//                   <div key={`msg-${index}`} className={`krishi-message krishi-message-${messageType}`}>
//                     <div className="krishi-message-content">
//                       {messageType === 'system' && <span className="krishi-system-label">System: </span>}
//                       {msg.content || msg.message_content}
//                     </div>
//                     <div className="krishi-message-meta">
//                       <span className="krishi-message-sender">
//                         {messageType === 'consumer' ? 'You' : 
//                         messageType === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
//                       </span>
//                       <span className="krishi-message-time">
//                         {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], {
//                           hour: '2-digit', 
//                           minute: '2-digit'
//                         })}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//             {isTyping && (
//               <div className="krishi-typing-indicator">
//                 <div className="krishi-typing-dots">
//                   <div></div>
//                   <div></div>
//                   <div></div>
//                 </div>
//                 <span>{selectedFarmer?.farmer_name} is typing...</span>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Chat Controls */}
//           <div className="krishi-chat-controls">
//             {isBargainComplete ? (
//               // FINAL STATE: only show result + navigation
//               <div className="krishi-result-actions">
//                 {bargainResult === 'accepted' ? (
//                   <>
//                     <div className="krishi-result-success">
//                       <FontAwesomeIcon icon={faCheckCircle} />
//                       <h3>Bargain Accepted at ₹{currentPrice}/kg</h3>
//                     </div>
//                     <div className="krishi-action-buttons">
//                       <button onClick={() => navigate('/consumer-dashboard')} className="krishi-action-btn krishi-btn-dashboard">
//                         <FontAwesomeIcon icon={faHome} />
//                         <span>Dashboard</span>
//                       </button>
//                       <button onClick={() => navigate('/consumer-orders')} className="krishi-action-btn krishi-btn-orders">
//                         <FontAwesomeIcon icon={faClipboardList} />
//                         <span>Orders</span>
//                       </button>
//                       <button onClick={() => navigate('/bargain-cart')} className="krishi-action-btn krishi-btn-cart">
//                         <FontAwesomeIcon icon={faShoppingCart} />
//                         <span>View Cart</span>
//                       </button>
//                       <button 
//                         onClick={() => navigate('/consumer-dashboard')} 
//                         className="krishi-action-btn krishi-btn-bargain"
//                       >
//                         <FontAwesomeIcon icon={faHandshake} />
//                         <span>Bargain Again</span>
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="krishi-result-rejected">
//                       <FontAwesomeIcon icon={faTimesCircle} />
//                       <h3>Bargain Rejected</h3>
//                     </div>
//                     <div className="krishi-action-buttons">
//                       <button onClick={() => navigate('/consumer-dashboard')} className="krishi-action-btn krishi-btn-dashboard">
//                         <FontAwesomeIcon icon={faHome} />
//                         <span>Dashboard</span>
//                       </button>
//                       <button onClick={() => navigate('/consumer-orders')} className="krishi-action-btn krishi-btn-orders">
//                         <FontAwesomeIcon icon={faClipboardList} />
//                         <span>Orders</span>
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             ) : (
//               // ACTIVE STATE: normal bargaining flow
//               <>
//                 {/* Farmer's counter offer UI */}
//                 {hasFarmerCounterOffer && (
//                   <div className="krishi-counter-offer">
//                     <div className="krishi-offer-header">
//                       <FontAwesomeIcon icon={faUserTie} />
//                       <h4>Farmer's Offer: ₹{currentPrice}/kg</h4>
//                     </div>
//                     <div className="krishi-offer-actions">
//                       <button 
//                         onClick={handleAcceptFarmerOffer} 
//                         className="krishi-offer-btn krishi-offer-accept"
//                         disabled={freezeUI}
//                       >
//                         <FontAwesomeIcon icon={faCheckCircle} />
//                         <span>Accept</span>
//                       </button>
//                       <button 
//                         onClick={handleRejectFarmerOffer} 
//                         className="krishi-offer-btn krishi-offer-reject"
//                         disabled={freezeUI}
//                       >
//                         <FontAwesomeIcon icon={faTimesCircle} />
//                         <span>Reject</span>
//                       </button>
//                       <button 
//                         onClick={() => {
//                           setShowPriceSuggestions(true);
//                           setHasFarmerCounterOffer(false);
//                         }} 
//                         className="krishi-offer-btn krishi-offer-counter"
//                         disabled={waitingForResponse}
//                       >
//                         <FontAwesomeIcon icon={faHandshake} />
//                         <span>Counter Offer</span>
//                       </button>
//                     </div>
//                   </div>
//                 )}

               
// {showPriceSuggestions && !hasFarmerCounterOffer && !isBargainComplete && (
//   <div className="krishi-price-suggestions">
//     <div className="krishi-suggestion-header">
//       <h4>Make a Counter Offer</h4>
//       <button 
//         onClick={() => setShowPriceSuggestions(false)}
//         className="krishi-close-suggestions"
//         title="Close suggestions"
//       >
//         <FontAwesomeIcon icon={faTimes} />
//       </button>
//     </div>
//     <div className="krishi-suggestion-grid">
//       {priceSuggestions
//         .filter(suggestion => suggestion.price < currentPrice)
//         .map((suggestion, index) => (
//           <button
//             key={`price-${index}`}
//             onClick={() => {
//               // Update current price when suggestion is clicked
//               setCurrentPrice(suggestion.price);
//               handlePriceSelection(suggestion.price);
//             }}
//             className="krishi-suggestion-btn"
//             disabled={waitingForResponse}
//           >
//             <div className="krishi-suggestion-price">
//               <FontAwesomeIcon icon={faArrowDown} />
//               <span>₹{suggestion.price}</span>
//             </div>
//             <div className="krishi-suggestion-label">{suggestion.label}</div>
//           </button>
//         ))}
//     </div>
//   </div>
// )}
//                 {/* Waiting Indicator */}
//                 {waitingForResponse && (
//                   <div className="krishi-waiting-indicator">
//                     <FontAwesomeIcon icon={faSpinner} spin />
//                     <span>Waiting for farmer's response...</span>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BargainChatWindow;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../../context/AuthContext";
import { io } from 'socket.io-client';
import {
  faSpinner,
  faRupeeSign,
  faArrowDown,
  faTimes,
  faDoorOpen,
  faHandshake,
  faCheckCircle,
  faTimesCircle,
  faHome,
  faClipboardList,
  faShoppingCart,
  faLeaf,
  faUserTie,
  faWeightHanging,
  faPercentage
} from '@fortawesome/free-solid-svg-icons';
import './ConsumerChatWindow.css';

const BargainChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token, consumer } = useAuth();
  const location = useLocation();
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const { 
    farmer: initialFarmer, 
    product: initialProduct,
    currentPrice: initialPrice,
    originalPrice
  } = location.state || {};

  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bargainStatus, setBargainStatus] = useState('pending');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [selectedFarmer] = useState(initialFarmer || null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
  const [selectedQuantity, setSelectedQuantity] = useState(initialProduct?.minimum_quantity || '10');
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(true); // Default to true on initial load
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasFarmerCounterOffer, setHasFarmerCounterOffer] = useState(false);
  const [isBargainComplete, setIsBargainComplete] = useState(false);
  const [bargainResult, setBargainResult] = useState(null);
  const [freezeUI, setFreezeUI] = useState(false);

  // Generate price suggestions based on base price
  const generatePriceSuggestions = useCallback((basePrice) => {
    const numericPrice = parseFloat(basePrice);
    if (isNaN(numericPrice)) return [];

    const suggestions = [];
    const numberOfSuggestions = 10;
    
    // Generate 10 suggestions below the base price
    for (let i = 1; i <= numberOfSuggestions; i++) {
      const price = numericPrice - i;
      if (price > 0) { // Ensure price doesn't go below 1
        const reduction = i;
        suggestions.push({
          amount: -reduction,
          price: price,
          label: `₹${price} (₹${reduction} less)`
        });
      }
    }

    return suggestions.sort((a, b) => b.price - a.price); // Sort descending for better UI
  }, []);

  // Fetch messages from database
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/bargain/${bargainId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
    
      const formattedMessages = data.map(msg => ({
        ...msg,
        content: msg.message_content,
        timestamp: msg.created_at
      }));
      
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const addToCart = async (product, price, quantity, bargainId) => {
    if (!selectedFarmer || !consumer?.consumer_id) {
      console.error('Farmer or consumer data is missing');
      return;
    }
  
    try {
      const total_price = price * quantity;
  
      const payload = {
        bargain_id: bargainId,
        ...(product?.product_id && { product_id: product.product_id }),
        product_name: product?.produce_name,
        product_category: product?.produce_type,
        price_per_kg: price,
        quantity,
        total_price,
        farmer_id: selectedFarmer?.farmer_id,
        consumer_id: consumer.consumer_id
      };
  
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/cart/${consumer.consumer_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
  
      const responseText = await response.text();
      let responseData;
  
      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error("Unexpected server response");
      }
  
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add to cart");
      }
  
      return responseData;
  
    } catch (err) {
      console.error("💥 Error adding to cart:", err.message);
      throw err;
    }
  };

  const addSystemMessage = useCallback((content) => {
    setMessages(prev => [
      ...prev,
      {
        content,
        sender_type: "system",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const initializeSocketConnection = useCallback(() => {
    if (!bargainId || !token) {
      console.error("Cannot initialize socket: missing bargainId or token");
      setConnectionStatus("disconnected");
      return;
    }
  
    if (socket.current) {
      socket.current.removeAllListeners();
      socket.current.disconnect();
      socket.current = null;
    }
  
    const socketOptions = {
      auth: { 
        token,
        bargainId 
      },
      query: { 
        bargainId,
        userType: 'consumer'
      },
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
  
    console.log("Initializing consumer socket with options:", socketOptions);
  
    socket.current = io(
      process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
      socketOptions
    );
  
    socket.current.on('connect', () => {
      console.log("Consumer socket connected with ID:", socket.current?.id);
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
    });
  
    socket.current.on('connect_error', (err) => {
      console.error("Consumer socket connection error:", err);
      setConnectionStatus("error");
      
      const maxAttempts = 5;
      if (reconnectAttempts.current < maxAttempts) {
        const delay = Math.min(30000, Math.pow(2, reconnectAttempts.current) * 1000);
        reconnectAttempts.current += 1;
        console.log(`Consumer reconnecting attempt ${reconnectAttempts.current} in ${delay}ms`);
        setTimeout(() => initializeSocketConnection(), delay);
      }
    });
  
    socket.current.on('disconnect', (reason) => {
      console.log("Consumer socket disconnected:", reason);
      setConnectionStatus("disconnected");
      
      if (reason === "io server disconnect") {
        setTimeout(() => initializeSocketConnection(), 1000);
      }
    });
  
    socket.current.on('bargainMessage', (message) => {
      if (message?.message_content) {
        const formattedMessage = {
          ...message,
          content: message.message_content,
          timestamp: message.created_at,
          sender_type: message.sender_role
        };
        
        setMessages(prev => [...prev, formattedMessage]);
        
        if (message.sender_role === 'farmer' && message.price_suggestion) {
          setCurrentPrice(message.price_suggestion);
          setHasFarmerCounterOffer(true); // A farmer's counteroffer is received
          setWaitingForResponse(false);
          setShowPriceSuggestions(false); // Hide suggestions, show buttons
          const suggestions = generatePriceSuggestions(message.price_suggestion);
          setPriceSuggestions(suggestions);
        }
      }
    });
  
    socket.current.on('bargainStatusUpdate', (data = {}) => {
      const { status, currentPrice, initiatedBy } = data;
  
      if (!['accepted', 'rejected'].includes(status)) return;
  
      setBargainStatus(status);
      setCurrentPrice(currentPrice);
      setIsBargainComplete(true);
      setFreezeUI(true);
      setWaitingForResponse(false);
      setHasFarmerCounterOffer(false);
      setShowPriceSuggestions(false);
  
      setBargainResult(status);
  
      addSystemMessage(
        status === 'accepted'
          ? `🎉 Bargain accepted at ₹${currentPrice}/kg`
          : `❌ Bargain rejected`
      );
    });

    socket.current.on('typing', (isTyping) => {
      setIsTyping(Boolean(isTyping));
    });
  
    socket.current.on('error', (error) => {
      console.error("Consumer socket error:", error);
      setError(error.message || "WebSocket communication error");
    });
  
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [bargainId, token, generatePriceSuggestions, addSystemMessage]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        await fetchMessages();
        
        if (!selectedProduct || !selectedFarmer) {
          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/bargain/${bargainId}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          const data = await response.json();
          if (data.consumer && data.product && data.farmer) {
            setSelectedProduct(data.product);
            setCurrentPrice(data.product.current_offer || data.product.price_per_kg);
            setSelectedQuantity(data.product.quantity || 1);
            
            // Initial state: show suggestions and generate them based on the initial price
            setPriceSuggestions(generatePriceSuggestions(data.product.price_per_kg));
            setHasFarmerCounterOffer(false); // No counteroffer from farmer yet
            setShowPriceSuggestions(true);
          }
        } else {
          // If data is already in state, just generate suggestions
          setPriceSuggestions(generatePriceSuggestions(initialPrice || selectedProduct.price_per_kg));
        }
        
        initializeSocketConnection();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (bargainId && token) {
      initializeChat();
    }
    
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [bargainId, token, initializeSocketConnection, selectedProduct, selectedFarmer, initialPrice, generatePriceSuggestions]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePriceSelection = async (price) => {
    try {
      setWaitingForResponse(true);
      setCurrentPrice(price);
      setShowPriceSuggestions(false); // Hide suggestions after selection
      
      const messageContent = `💰 Offered ₹${price}/kg for ${selectedQuantity}kg of ${selectedProduct.produce_name}`;
      
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/bargain/${bargainId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sender_role: 'consumer',
            sender_id: consumer.consumer_id,
            message_content: messageContent,
            price_suggestion: price,
            message_type: 'counter_offer'
          })
        }
      );

      if (!response.ok) throw new Error('Failed to save message');

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setHasFarmerCounterOffer(false);

      if (socket.current?.connected) {
        socket.current.emit('bargainMessage', {
          ...newMessage,
          bargain_id: bargainId,
          created_at: new Date().toISOString()
        });
      }
      setWaitingForResponse(true); // Keep waiting state until farmer replies
    } catch (err) {
      setError(err.message);
      setShowPriceSuggestions(true);
      setWaitingForResponse(false);
    }
  };

  const handleAcceptFarmerOffer = async () => {
    try {
      setWaitingForResponse(true);
  
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL }/api/bargain/${bargainId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sender_role: 'consumer',
            sender_id: consumer.consumer_id,
            message_content: `✅ You accepted the offer at ₹${currentPrice}/kg`,
            message_type: 'accept',
            price_suggestion: currentPrice
          })
        }
      );
  
      if (!response.ok) throw new Error('Failed to save acceptance message');
  
      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]);
  
      socket.current.emit('updateBargainStatus', {
        bargainId,
        status: 'accepted',
        currentPrice,
        userId: consumer.consumer_id,
        userType: 'consumer'
      });
  
      await addToCart(selectedProduct, currentPrice, selectedQuantity, bargainId);
  
      setBargainStatus('accepted');
      setIsBargainComplete(true);
      setBargainResult('accepted');
      setShowPriceSuggestions(false);
      setHasFarmerCounterOffer(false);
      setFreezeUI(true);
      setWaitingForResponse(false);
  
    } catch (err) {
      console.error('Error accepting offer:', err);
      setError(err.message);
      setWaitingForResponse(false);
    }
  };
  
  const handleRejectFarmerOffer = async () => {
    try {
      setWaitingForResponse(true);
      
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/bargain/${bargainId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sender_role: 'consumer',
            sender_id: consumer.consumer_id,
            message_content: `❌ You rejected the offer at ₹${currentPrice}/kg`,
            message_type: 'reject',
            price_suggestion: currentPrice
          })
        }
      );
  
      if (!response.ok) throw new Error('Failed to save rejection message');
  
      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]);
      
      socket.current.emit('updateBargainStatus', {
        bargainId,
        status: 'rejected',
        currentPrice,
        userId: consumer.consumer_id,
        userType: 'consumer'
      });
  
      setBargainStatus('rejected');
      setIsBargainComplete(true);
      setBargainResult('rejected');
      setShowPriceSuggestions(false);
      setHasFarmerCounterOffer(false);
      setWaitingForResponse(false);
    } catch (err) {
      setError(err.message);
      setWaitingForResponse(false);
    }
  };

  const handleCounterOfferClick = () => {
    setShowPriceSuggestions(true);
    setHasFarmerCounterOffer(false);
    setWaitingForResponse(false);
  };

  if (loading) {
    return (
      <div className="krishi-bargain-loading">
        <div className="krishi-loading-content">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="krishi-spinner" />
           <p className="krishi-loading-text">Loading bargain session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="krishi-bargain-loading">
        <div className="krishi-loading-content">
          <FontAwesomeIcon icon={faTimesCircle} size="2x" />
          <p className="krishi-loading-text">Error: {error}</p>
          <button onClick={() => navigate('/consumer-dashboard')} className="krishi-action-btn">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!selectedProduct || !selectedFarmer) {
    return (
      <div className="krishi-bargain-loading">
        <div className="krishi-loading-content">
          <FontAwesomeIcon icon={faTimesCircle} size="2x" />
          <p className="krishi-loading-text">Missing product or farmer information</p>
          <button onClick={() => navigate('/consumer-dashboard')} className="krishi-action-btn">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="krishi-bargain-container">
      {/* Chat Interface */}
      {selectedProduct && (
        <div className="krishi-chat-interface">
          {/* Chat Header */}
          <div className="krishi-chat-header">
            <div className="krishi-chat-header-top">
              <div className="krishi-chat-title">
                <FontAwesomeIcon icon={faRupeeSign} />
                <h2>Bargaining with {selectedFarmer?.farmer_name}</h2>
              </div>
              <div className="krishi-header-controls">
                <span className={`krishi-connection-status krishi-status-${connectionStatus}`}>
                  {connectionStatus.toUpperCase()}
                </span>
                <button 
                  onClick={() => navigate('/consumer-dashboard')} 
                  className="krishi-exit-btn"
                  title="Exit Chat"
                >
                  <FontAwesomeIcon icon={faDoorOpen} />
                  <span>Exit</span>
                </button>
              </div>
            </div>
            <div className="krishi-chat-product-info">
              <div className="krishi-product-row">
                <span className="krishi-product-label">Product:</span>
                <span className="krishi-product-value">{selectedProduct.produce_name}</span>
              </div>
              <div className="krishi-product-row">
                <span className="krishi-product-label">Quantity:</span>
                <span className="krishi-product-value">{selectedQuantity || quantity}kg</span>
              </div>
              <div className="krishi-price-info">
                <div className="krishi-price-item">
                  <span className="krishi-price-label">Current:</span>
                  <span className="krishi-price-value">₹{currentPrice}/kg</span>
                </div>
                <div className="krishi-price-item">
                  <span className="krishi-price-label">Base:</span>
                  <span className="krishi-price-value">₹{selectedProduct.price_per_kg}/kg</span>
                </div>
                <div className="krishi-price-item krishi-price-total">
                  <span className="krishi-price-label">Total:</span>
                  <span className="krishi-price-value">₹{(selectedQuantity * currentPrice).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="krishi-messages-container">
            {messages.length === 0 ? (
              <div className="krishi-no-messages">
                <p>No messages yet. Start the negotiation!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const messageType = msg.sender_role === 'consumer' ? 'consumer' :
                                  msg.sender_role === 'farmer' ? 'farmer' : 'system';

                return (
                  <div key={`msg-${index}`} className={`krishi-message krishi-message-${messageType}`}>
                    <div className="krishi-message-content">
                      {messageType === 'system' && <span className="krishi-system-label">System: </span>}
                      {msg.content || msg.message_content}
                    </div>
                    <div className="krishi-message-meta">
                      <span className="krishi-message-sender">
                        {messageType === 'consumer' ? 'You' : 
                        messageType === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
                      </span>
                      <span className="krishi-message-time">
                        {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="krishi-typing-indicator">
                <div className="krishi-typing-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span>{selectedFarmer?.farmer_name} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Controls */}
          <div className="krishi-chat-controls">
            {bargainStatus === 'pending' ? (
              <>
                {/* Price Suggestions UI - Show initially and when Counter button is clicked */}
                {showPriceSuggestions && (
                  <div className="krishi-price-suggestions">
                    <div className="krishi-suggestion-header">
                      <h4>Choose a Counter Offer:</h4>
                      <button 
                        onClick={() => setShowPriceSuggestions(false)}
                        className="krishi-close-suggestions"
                        title="Close suggestions"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <div className="krishi-suggestion-grid">
                      {priceSuggestions.map((suggestion, index) => (
                        <button
                          key={`price-${index}`}
                          onClick={() => handlePriceSelection(suggestion.price)}
                          className="krishi-suggestion-btn krishi-decrease"
                          disabled={waitingForResponse}
                        >
                          <div className="krishi-suggestion-icon">
                            <FontAwesomeIcon icon={faArrowDown} />
                          </div>
                          <div className="krishi-suggestion-details">
                            <span className="krishi-suggestion-price">₹{suggestion.price}/kg</span>
                            <span className="krishi-suggestion-diff">
                              (₹{Math.abs(suggestion.amount)} less)
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Main Action Buttons (Accept, Reject, Counter) - Show after farmer's reply */}
                {hasFarmerCounterOffer && !showPriceSuggestions && (
                  <div className="krishi-bargain-actions">
                    <div className="krishi-action-buttons">
                      <button
                        onClick={handleAcceptFarmerOffer}
                        className="krishi-action-btn krishi-accept-btn"
                        disabled={!hasFarmerCounterOffer || waitingForResponse}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} /> Accept
                      </button>
                      <button
                        onClick={handleRejectFarmerOffer}
                        className="krishi-action-btn krishi-reject-btn"
                        disabled={!hasFarmerCounterOffer || waitingForResponse}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} /> Decline
                      </button>
                      <button
                        onClick={handleCounterOfferClick}
                        className="krishi-action-btn krishi-counter-btn"
                        disabled={waitingForResponse}
                      >
                        <FontAwesomeIcon icon={faHandshake} /> Counter
                      </button>
                    </div>
                  </div>
                )}
                
                {waitingForResponse && (
                  <div className="krishi-waiting-indicator">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Waiting for farmer's response...</span>
                  </div>
                )}
              </>
            ) : (
              // FINAL STATE: only show result + navigation
              <div className="krishi-result-actions">
                {bargainStatus === 'accepted' ? (
                  <>
                    <div className="krishi-result-success">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <h3>Bargain Accepted at ₹{currentPrice}/kg</h3>
                    </div>
                    <div className="krishi-action-buttons">
                      <button onClick={() => navigate('/consumer-dashboard')} className="krishi-action-btn krishi-btn-dashboard">
                        <FontAwesomeIcon icon={faHome} />
                        <span>Dashboard</span>
                      </button>
                      <button onClick={() => navigate('/consumer-orders')} className="krishi-action-btn krishi-btn-orders">
                        <FontAwesomeIcon icon={faClipboardList} />
                        <span>Orders</span>
                      </button>
                      <button onClick={() => navigate('/bargain-cart')} className="krishi-action-btn krishi-btn-cart">
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span>View Cart</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="krishi-result-rejected">
                      <FontAwesomeIcon icon={faTimesCircle} />
                      <h3>Bargain Rejected</h3>
                    </div>
                    <div className="krishi-action-buttons">
                      <button onClick={() => navigate('/consumer-dashboard')} className="krishi-action-btn krishi-btn-dashboard">
                        <FontAwesomeIcon icon={faHome} />
                        <span>Dashboard</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BargainChatWindow;