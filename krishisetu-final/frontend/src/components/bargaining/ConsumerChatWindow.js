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
  faShoppingCart
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
  const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
  const [selectedFarmer] = useState(initialFarmer || null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(selectedProduct?.minimum_quantity || '10');
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasFarmerCounterOffer, setHasFarmerCounterOffer] = useState(false);
  const [isBargainComplete, setIsBargainComplete] = useState(false);
  const [bargainResult, setBargainResult] = useState(null); // 'accepted' or 'rejected'
  const [freezeUI, setFreezeUI] = useState(false);

 // Generate price suggestions based on current price
 const generatePriceSuggestions = useCallback((basePrice) => {
  const numericPrice = parseFloat(basePrice);
  if (isNaN(numericPrice)) return [];

  const suggestions = [];
  const step = 1; // ₹1 increments
  
  // Generate decreasing offers only (no higher offers)
  for (let i = 1; i <= 3; i++) {
    const newPrice = numericPrice - i;
    if (newPrice > 0) { // Only positive prices
      suggestions.push({
        amount: -i,
        price: newPrice,
        label: `₹${newPrice} (₹${i} less)`
      });
    }
  }

  // Include current price as reference
  suggestions.push({
    amount: 0,
    price: numericPrice,
    label: `Current: ₹${numericPrice}`
  });

  return suggestions.sort((a, b) => a.price - b.price);
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

      const data = await response.json();
    
      // Transform data if needed to match your expected format
      const formattedMessages = data.map(msg => ({
        ...msg,
        content: msg.message_content, // Map database field to your component's expected field
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
        // Only include product_id if it exists
        ...(product?.product_id && { product_id: product.product_id }),
        product_name: product?.produce_name,
        product_category: product?.produce_type,
        price_per_kg: price,
        quantity,
        total_price,
        farmer_id: selectedFarmer?.farmer_id,
        consumer_id: consumer.consumer_id
      };
  
      console.log("🔄 Sending to cart API:", payload);
  
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}`,
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
      } catch (jsonErr) {
        console.error("🛑 Response is not valid JSON:", responseText);
        throw new Error("Unexpected server response");
      }
  
      if (!response.ok) {
        console.error("🛑 Backend error:", responseData);
        throw new Error(responseData.error || "Failed to add to cart");
      }
  
      console.log("✅ Product added to cart:", responseData);
      return responseData;
  
    } catch (err) {
      console.error("💥 Error adding to cart:", err.message);
      throw err;
    }
  };

useEffect(() => {
  if (!socket.current) return;

  const handleNewMessage = (data) => {
    console.log('Farmer message received:', data);
    
    const message = {
      ...data,
      content: data.message_content || data.content,
      sender_role: data.sender_role || 'farmer',
      timestamp: data.created_at || new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    
    // Handle farmer's counter offer
    if (message.sender_role === 'farmer' && 
        (message.message_type === 'counter_offer' || 
         message.content.includes('Counter offer'))) {
      
      // Extract the price (priority: price_suggestion > content regex > currentPrice)
      const price = message.price_suggestion || 
                   parseFloat(message.content.match(/₹(\d+)/)?.[1]) || 
                   currentPrice;
      
      console.log('Updating price to:', price);
      
      // Update states
      setCurrentPrice(price);
      setHasFarmerCounterOffer(true);
      setWaitingForResponse(false);  // This hides the waiting indicator
      
      // Generate new suggestions (only lower than current price)
      const suggestions = generatePriceSuggestions(price)
        .filter(s => s.price < price); // Only show lower offers
      setPriceSuggestions(suggestions);
    }
  };

  socket.current.on('bargainMessage', handleNewMessage);
  return () => socket.current?.off('bargainMessage', handleNewMessage);
}, [currentPrice, generatePriceSuggestions]);




// Replace your socket initialization with this updated version
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

  socket.current = io(
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
    socketOptions
  );

  // Connection handlers
  socket.current.on('connect', () => {
    console.log("Socket connected with ID:", socket.current?.id);
    setConnectionStatus("connected");
  });

  socket.current.on('connect_error', (err) => {
    console.error("Socket connection error:", err);
    setConnectionStatus("error");
    
    const maxAttempts = 5;
    if (reconnectAttempts.current < maxAttempts) {
      const delay = Math.min(30000, Math.pow(2, reconnectAttempts.current) * 1000);
      reconnectAttempts.current += 1;
      setTimeout(() => initializeSocketConnection(), delay);
    }
  });

  socket.current.on('disconnect', (reason) => {
    console.log("Socket disconnected:", reason);
    setConnectionStatus("disconnected");
    
    if (reason === "io server disconnect") {
      setTimeout(() => initializeSocketConnection(), 1000);
    }
  });

  // Single unified message handler
  socket.current.on('new_message', (message) => {
    console.log("Received new message:", message);
    if (message?.message_id) {
      setMessages(prev => [...prev, message]);
      
      if (message.sender_role === 'farmer') {
        setWaitingForResponse(false);
        
        if (message.message_type === 'counter_offer') {
          console.log("Processing farmer counter offer");
          setHasFarmerCounterOffer(true);
          setCurrentPrice(message.price_suggestion);
          
          const suggestions = generatePriceSuggestions(message.price_suggestion);
          setPriceSuggestions(suggestions);
          
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  });

// Update the bargainStatusUpdate handler in initializeSocketConnection
// Update the socket initialization in initializeSocketConnection
// socket.current.on('bargainStatusUpdate', (data) => {
//   const { status, currentPrice, initiatedBy } = data;
  
//   // Remove any duplicate handlers for bargainStatusUpdate
  
//   // Consumer's perspective
//   if (initiatedBy === 'consumer') {
//     // Consumer initiated this action
//     if (status === 'accepted') {
//       addSystemMessage(`✅ You accepted the offer at ₹${currentPrice}/kg`);
//     } else if (status === 'rejected') {
//       addSystemMessage(`❌ You rejected the offer at ₹${currentPrice}/kg`);
//     }
//   } else {
//     // Farmer initiated this action
//     if (status === 'accepted') {
//       addSystemMessage(`🎉 ${selectedFarmer.farmer_name} accepted your offer at ₹${currentPrice}/kg`);
//     } else if (status === 'rejected') {
//       addSystemMessage(`😞 ${selectedFarmer.farmer_name} rejected your offer`);
//     }
//   }
  
//   setBargainStatus(status);
//   setCurrentPrice(currentPrice);
//   setWaitingForResponse(false);
// });
// Inside initializeSocketConnection
// socket.current.on('bargainStatusUpdate', async (data) => {
//   const { status, currentPrice, initiatedBy } = data;
  
//   // Handle accepted status
//   if (status === 'accepted') {
//     try {
//       if (initiatedBy === 'farmer') {
//         // Farmer accepted consumer's offer - add to cart
//         await addToCart(selectedProduct, currentPrice, selectedQuantity);
//         addSystemMessage(`🎉 ${selectedFarmer.farmer_name} accepted your offer at ₹${currentPrice}/kg`);
//       } else {
//         // Consumer accepted farmer's offer (already handled in handleAcceptFarmerOffer)
//         addSystemMessage(`✅ You accepted the offer at ₹${currentPrice}/kg`);
//       }
      
//       // Update UI state for acceptance
//       setIsBargainComplete(true);
//       setBargainResult('accepted');
//     } catch (err) {
//       addSystemMessage(`⚠️ Failed to add to cart: ${err.message}`);
//     }
//   }
  
//   // Handle rejected status
//   if (status === 'rejected') {
//     if (initiatedBy === 'farmer') {
//       addSystemMessage(`😞 ${selectedFarmer.farmer_name} rejected your offer`);
//     } else {
//       addSystemMessage(`❌ You rejected the offer at ₹${currentPrice}/kg`);
//     }
    
//     // Update UI state for rejection
//     setIsBargainComplete(true);
//     setBargainResult('rejected');
//   }

//   // Common state updates
//   setBargainStatus(status);
//   setCurrentPrice(currentPrice);
//   setWaitingForResponse(false);
//   setShowPriceSuggestions(false);
//   setHasFarmerCounterOffer(false);
// });
socket.current.on('bargainStatusUpdate', async (data) => {
  const { status, currentPrice, initiatedBy } = data;

  // Handle accepted status
  if (status === 'accepted') {
    try {
      if (initiatedBy === 'farmer') {
        // Farmer accepted consumer's offer - add to cart
        await addToCart(
          selectedProduct,
          currentPrice,
          selectedQuantity,
          bargainId,
          selectedFarmer,
          token,
          consumer.consumer_id
        );

        addSystemMessage(`🎉 ${selectedFarmer.farmer_name} accepted your offer at ₹${currentPrice}/kg`);
      } else {
        // Consumer accepted farmer's offer (already handled in handleAcceptFarmerOffer)
        addSystemMessage(`✅ You accepted the offer at ₹${currentPrice}/kg`);
      }

      // Update UI state for acceptance
      setIsBargainComplete(true);
      setBargainResult('accepted');
    } catch (err) {
      addSystemMessage(`⚠️ Failed to add to cart: ${err.message}`);
    }
  }

  // Handle rejected status
  if (status === 'rejected') {
    if (initiatedBy === 'farmer') {
      addSystemMessage(`😞 ${selectedFarmer.farmer_name} rejected your offer`);
    } else {
      addSystemMessage(`❌ You rejected the offer at ₹${currentPrice}/kg`);
    }

    // Update UI state for rejection
    setIsBargainComplete(true);
    setBargainResult('rejected');
  }

  // Common state updates
  setBargainStatus(status);
  setCurrentPrice(currentPrice);
  setWaitingForResponse(false);
  setShowPriceSuggestions(false);
  setHasFarmerCounterOffer(false);
});

socket.current.on('priceUpdate', (data) => {
  if (data?.newPrice) {
    setCurrentPrice(data.newPrice);
    addSystemMessage(`Price updated to ₹${data.newPrice}/kg`);
    
    if (data.from === 'farmer') {
      setHasFarmerCounterOffer(true);
      setWaitingForResponse(false);
    }
  }
});
  // Error handling
  socket.current.on('error', (error) => {
    console.error("Socket error:", error);
    setError(error.message || "WebSocket communication error");
  });

  return () => {
    if (socket.current) {
      socket.current.disconnect();
    }
  };
}, [bargainId, token, generatePriceSuggestions]);

// Add this useEffect to debug state changes
useEffect(() => {
  console.log("Messages updated:", messages);
}, [messages]);

useEffect(() => {
  console.log("Current price updated:", currentPrice);
}, [currentPrice]);

useEffect(() => {
  console.log("Farmer counter offer status:", hasFarmerCounterOffer);
}, [hasFarmerCounterOffer]);

  // Helper function to add system messages
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

// Show initial system message and price suggestions when product is selected
useEffect(() => {
  if (selectedProduct && !isBargainPopupOpen && messages.length === 0) {
    const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
    addSystemMessage(systemMessageContent);
    
    const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
    setPriceSuggestions(suggestions);
    setShowPriceSuggestions(true);
  }
}, [selectedProduct, isBargainPopupOpen, messages.length, addSystemMessage, generatePriceSuggestions, selectedQuantity]);

 // Fetch bargain data
 useEffect(() => {
  const fetchBargainData = async () => {
    try {
      if (!bargainId || !token) {
        throw new Error("Missing bargain ID or authentication token");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get('content-type');
      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = JSON.parse(rawText);

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch bargain data");
      }

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        setSelectedProduct(product);
        setCurrentPrice(product.current_offer || product.price_per_kg);
        setQuantity(product.quantity || 1);
        setSelectedQuantity(product.minimum_quantity || product.quantity || '10');
      }
      
      setBargainStatus(data.status || 'pending');
      
    } catch (error) {
      setError(error.message || "Failed to load bargain data");
    }
  };

  if (!initialProduct) {
    fetchBargainData();
  }
}, [bargainId, token, initialProduct]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBargainConfirm = async () => {
    if (!selectedProduct) {
      setError("Please select a product first");
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
  
      // 1. Create bargain session
      const bargainResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/create-bargain`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            farmer_id: selectedFarmer.farmer_id
          })
        }
      );
  
      if (!bargainResponse.ok) {
        throw new Error(await bargainResponse.text() || 'Failed to create bargain session');
      }
  
      const bargainData = await bargainResponse.json();
  
      // 2. Add product to bargain
      const productResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/add-bargain-product`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bargain_id: bargainData.bargainId,
            product_id: selectedProduct.product_id,
            quantity: parseFloat(selectedQuantity) || 10
          })
        }
      );
  
      if (!productResponse.ok) {
        throw new Error(await productResponse.text() || 'Product addition failed');
      }
  
      const productData = await productResponse.json();
  
      // 3. Save SYSTEM MESSAGE to database
      const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
      const systemMessageResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/bargain/${bargainData.bargainId}/system-message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message_content: systemMessageContent,
            message_type: 'system'
          })
        }
      );
  
      if (!systemMessageResponse.ok) {
        throw new Error('Failed to save system message');
      }
  
      const systemMessage = await systemMessageResponse.json();
  
      // 4. Generate and show price suggestions
      const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
      setPriceSuggestions(suggestions);
      setShowPriceSuggestions(true);
  
      // 5. Close popup and navigate
      setIsBargainPopupOpen(false);
      navigate(`/bargain/${bargainData.bargainId}`, {
        state: {
          product: {
            ...selectedProduct,
            price_per_kg: productData.price_per_kg,
            quantity: productData.quantity
          },
          farmer: selectedFarmer,
          currentPrice: productData.price_per_kg,
          bargainId: bargainData.bargainId,
          originalPrice: productData.price_per_kg
        }
      });
  
    } catch (err) {
      console.error('Bargain initiation error:', err);
      setError(err.message || "Failed to start bargaining");
    } finally {
      setIsLoading(false);
    }
  };
 // Update handlePriceSelection to handle counter offers
const handlePriceSelection = async (price) => {
  try {
    setShowPriceSuggestions(false);
    setWaitingForResponse(true);
    setCurrentPrice(price);
    
    const messageType = hasFarmerCounterOffer ? 'counter_offer' : 'price_offer';
  // Update your handlePriceSelection function:
const messageContent = `💰 ${hasFarmerCounterOffer ? 'Counter offer' : 'Offered'} ₹${price}/kg for ${selectedQuantity}kg of ${selectedProduct.produce_name}`;
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
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
          message_type: messageType
        })
      }
    );

    if (!response.ok) throw new Error('Failed to save message');

    const newMessage = await response.json();
    setMessages(prev => [...prev, newMessage]);
    setHasFarmerCounterOffer(false);

    if (socket.current?.connected) {
      socket.current.emit('priceOffer', {
        bargainId,
        message: newMessage,
        newPrice: price
      });
    }
  } catch (err) {
    console.error('Error handling price selection:', err);
    setError(err.message);
    setShowPriceSuggestions(true);
  }
};



  // // Update handleAcceptFarmerOffer and handleRejectFarmerOffer
  // const handleAcceptFarmerOffer = async () => {
  //   try {
  //     setWaitingForResponse(true);
      
  //     // First check if cart has items from other farmers
  //     const cartCheckResponse = await fetch(
  //       `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/check`,
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //         },
  //       }
  //     );
  
  //     const cartCheckData = await cartCheckResponse.json();
      
  //     if (cartCheckData.hasItems && cartCheckData.farmerId !== selectedFarmer.farmer_id) {
  //       throw new Error('You have items from another farmer in your cart. Please complete that order first.');
  //     }
  
  //     // Save acceptance to database
  //     const response = await fetch(
  //       `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           sender_role: 'consumer',
  //           sender_id: consumer.consumer_id,
  //           message_content: `✅ You accepted the offer at ₹${currentPrice}/kg`,
  //           message_type: 'accept',
  //           price_suggestion: currentPrice
  //         })
  //       }
  //     );
  
  //     if (!response.ok) throw new Error('Failed to save acceptance message');
  
  //     const savedMessage = await response.json();
  //     setMessages(prev => [...prev, savedMessage]);
      
  //     // Emit socket event
  //     socket.current.emit('updateBargainStatus', {
  //       bargainId,
  //       status: 'accepted',
  //       currentPrice,
  //       userId: consumer.consumer_id,
  //       userType: 'consumer'
  //     });
  
  //     // ADD TO CART
  //     await addToCart(selectedProduct, currentPrice, selectedQuantity);
      
  //     setBargainStatus('accepted');
  //     setIsBargainComplete(true);
  //     setBargainResult('accepted');
  //     setShowPriceSuggestions(false);
  //     setHasFarmerCounterOffer(false);
  //   } catch (err) {
  //     setError(err.message);
  //     setWaitingForResponse(false);
  //   }
  // };
  const handleAcceptFarmerOffer = async () => {
    try {
      setWaitingForResponse(true);
  
      // Save acceptance message to database
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
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
  
      // Emit status update via socket
      socket.current.emit('updateBargainStatus', {
        bargainId,
        status: 'accepted',
        currentPrice,
        userId: consumer.consumer_id,
        userType: 'consumer'
      });
  
      // Add to cart after acceptance
      await addToCart(
        selectedProduct,
        currentPrice,
        selectedQuantity,
        bargainId,
        selectedFarmer,
        token,
        consumer.consumer_id
      );
  
      setBargainStatus('accepted');
      setIsBargainComplete(true);
      setBargainResult('accepted');
      setShowPriceSuggestions(false);
      setHasFarmerCounterOffer(false);
      setFreezeUI(true);
  
    } catch (err) {
      console.error('Error accepting offer:', err);
      setError(err.message);
      setWaitingForResponse(false);
    }
  };
  
  const handleRejectFarmerOffer = async () => {
    try {
      setWaitingForResponse(true);
      
      // Save rejection to database first
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
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
      
      // Then emit socket event
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
    } catch (err) {
      setError(err.message);
      setWaitingForResponse(false);
    }
  };

  

  // Add these at the bottom of your component
useEffect(() => {
  console.log('Current price state:', currentPrice);
}, [currentPrice]);

useEffect(() => {
  console.log('Price suggestions:', priceSuggestions);
}, [priceSuggestions]);

useEffect(() => {
  console.log('Has farmer counter offer:', hasFarmerCounterOffer);
}, [hasFarmerCounterOffer]);

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain session...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bargain-chat-container">
//       {/* Bargain Initiation Popup */}
//       {isBargainPopupOpen && selectedFarmer && (
//   <div className="bargain-popup-overlay">
//     <div className="bargain-popup-container">
//       <div className="bargain-popup-content">
//         {/* Popup Header */}
//         <div className="popup-header">
//           <h3>
//             <FontAwesomeIcon icon={faHandshake} /> Initiate Bargain with {selectedFarmer.farmer_name}
//           </h3>
//           <button 
//             onClick={() => navigate(-1)} 
//             className="popup-close-btn"
//             aria-label="Close popup"
//           >
//             <FontAwesomeIcon icon={faTimes} />
//           </button>
//         </div>

//         {/* Product Selection */}
//         <div className="popup-section">
//           <label className="popup-label">Select Product</label>
//           <select
//             className="popup-select"
//             value={selectedProduct?.produce_name || ''}
//             onChange={(e) => {
//               const product = selectedFarmer.products.find(
//                 p => p.produce_name === e.target.value
//               );
//               setSelectedProduct(product || null);
//               if (product) {
//                 setCurrentPrice(product.price_per_kg);
//                 setSelectedQuantity('10');
//               }
//             }}
//           >
//             <option value="">-- Select a product --</option>
//             {selectedFarmer.products?.map(product => (
//               <option 
//                 key={product.product_id} 
//                 value={product.produce_name}
//                 data-price={product.price_per_kg}
//               >
//                 {product.produce_name} (₹{product.price_per_kg}/kg)
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Product Details */}
//         {selectedProduct && (
//           <>
//             <div className="popup-section product-details">
//               <div className="detail-row">
//                 <span className="detail-label">Category:</span>
//                 <span className="detail-value">{selectedProduct.produce_type}</span>
//               </div>
//               <div className="detail-row">
//                 <span className="detail-label">Availability:</span>
//                 <span className="detail-value">{selectedProduct.availability} kg</span>
//               </div>
//             </div>

//             {/* Quantity Selection */}
//             <div className="popup-section">
//               <label className="popup-label">Quantity (kg)</label>
//               <div className="quantity-input-container">
//                 <input
//                   type="number"
//                   className="popup-input"
//                   min={selectedProduct?.minimum_quantity || 10} 
//                   max={selectedProduct.availability}
//                   value={selectedQuantity}
//                   onChange={(e) => {
//                     const minQty = selectedProduct.minimum_quantity || 10;
//                     const val = Math.min(
//                       selectedProduct?.availability || 0,
//                       Math.max(minQty, e.target.value ? parseFloat(e.target.value) : minQty)
//                     );
//                     setSelectedQuantity(val);
//                   }}
//                   placeholder="Enter quantity"
//                 />
//                 <div className="quantity-range">
//                   <span>Min: {selectedProduct.minimum_quantity || 10} kg</span>
//                   <span>Max: {selectedProduct.availability} kg</span>
//                 </div>
//               </div>
//             </div>

//             {/* Price Display */}
//             <div className="price-summary">
//               <div className="price-row">
//                 <span>Unit Price:</span>
//                 <span>₹{selectedProduct.price_per_kg}/kg</span>
//               </div>
//               <div className="price-row total">
//                 <span>Total Price:</span>
//                 <span>
//                   ₹{(selectedProduct.price_per_kg * (parseFloat(selectedQuantity) || 0).toFixed(2))}
//                 </span>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="popup-error">
//             <FontAwesomeIcon icon={faTimesCircle} />
//             <span>{error.includes('JSON') ? 'Server error' : error}</span>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="popup-actions">
//           <button
//             onClick={() => navigate(-1)}
//             className="popup-cancel-btn"
//           >
//             Cancel
//           </button>
       
//        <button
//           onClick={handleBargainConfirm}
//           disabled={!selectedProduct || isLoading}
//           className={`bargain-btn ${isLoading ? 'loading' : ''}`}
//         >
//           {isLoading ? (
//             <>
//               <FontAwesomeIcon icon={faSpinner} spin />
//               <span>Connecting...</span>
//             </>
//           ) : (
//             <>
//               <FontAwesomeIcon icon={faHandshake} />
//               <span>Start Bargaining</span>
//             </>
//           )}
//         </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}
//       {/* Chat Interface */}
//       {selectedProduct && !isBargainPopupOpen && (
//         <div className="chat-interface animate__animated animate__fadeIn">

// <button 
//       onClick={() => navigate('/consumer-dashboard')} 
//       className="unique-close-btn"
//       title="Exit Chat"
//     >
//       <FontAwesomeIcon icon={faDoorOpen} />
//       <span>Exit</span>
//     </button>
    
//           {/* Chat Header */}
//           <div className="chat-header">
//             <div className="header-top">
//               <h2>
//                 <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
//               </h2>
//               <span className={`connection-status ${connectionStatus}`}>
//                 {connectionStatus.toUpperCase()}
//               </span>
//             </div>
            
//             <div className="product-info">
//               <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
//               <p><strong>Quantity:</strong> {selectedQuantity || quantity}kg</p>
//               <div className="price-display">
//   <span className="current-price">
//     <strong>Current:</strong> ₹{currentPrice}/kg
//   </span>
//   <span className="base-price">
//     <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
//   </span>
//   <span className="total-price">
//     <strong>Total:</strong> ₹{(selectedQuantity * currentPrice).toFixed(2)}
//   </span>
// </div>
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
//                 <p>No messages yet. Start the negotiation!</p>
//               </div>
//             ) : (
//             // Update your message rendering code to this:
// // In your message rendering component:
// messages.map((msg, index) => {
//   const messageType = msg.sender_role === 'consumer' ? 'consumer' :
//                      msg.sender_role === 'farmer' ? 'farmer' : 'system';

//   return (
//     <div key={`msg-${index}`} className={`message ${messageType}`}>
//       <div className="message-content">
//         {messageType === 'system' && <span className="system-label">System: </span>}
//         {msg.content || msg.message_content}
//       </div>
//       <div className="message-meta">
//         <span className="sender">
//           {messageType === 'consumer' ? 'You' : 
//            messageType === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
//         </span>
//         <span className="timestamp">
//           {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], {
//             hour: '2-digit', 
//             minute: '2-digit'
//           })}
//         </span>
//       </div>
//     </div>
//   );
// })
//             )}
//             {isTyping && (
//               <div className="typing-indicator">
//                 <div className="typing-dots">
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
//           {/* Chat Controls */}
//           <div className="chat-controls">
//   {/* Show result actions when bargain is complete */}
//   {isBargainComplete ? (
//   <div className="bargain-result-actions">
//     {bargainResult === 'accepted' ? (
//       <>
//         <h3 className="success-message">
//           <FontAwesomeIcon icon={faCheckCircle} /> 
//           Bargain Accepted at ₹{currentPrice}/kg
//         </h3>
//         <div className="action-buttons">
//           <button onClick={() => navigate('/consumer-dashboard')} className="dashboard-btn">
//             <FontAwesomeIcon icon={faHome} /> Dashboard
//           </button>
//           <button onClick={() => navigate('/consumer-orders')} className="orders-btn">
//             <FontAwesomeIcon icon={faClipboardList} /> Orders
//           </button>
//           <button onClick={() => navigate('/bargain-cart')} className="cart-btn">
//             <FontAwesomeIcon icon={faShoppingCart} /> View Cart
//           </button>
//           <button 
//             onClick={() => {
//               setIsBargainComplete(false);
//               setBargainStatus('pending');
//               setShowPriceSuggestions(true);
//             }}
//             className="bargain-again-btn"
//           >
//             <FontAwesomeIcon icon={faHandshake} /> Bargain Again
//           </button>
//         </div>
//       </>
//     ) : (
//       <>
//         <h3 className="reject-message">
//           <FontAwesomeIcon icon={faTimesCircle} /> 
//           Bargain Rejected
//         </h3>
//         <div className="action-buttons">
//           <button onClick={() => navigate('/consumer-dashboard')} className="dashboard-btn">
//             <FontAwesomeIcon icon={faHome} /> Dashboard
//           </button>
//           <button onClick={() => navigate('/consumer-orders')} className="orders-btn">
//             <FontAwesomeIcon icon={faClipboardList} /> Orders
//           </button>
//         </div>
//       </>
//     )}
//   </div>
// ) : (
//     <>
//       {/* Show farmer's counter offer UI when available */}
//       {hasFarmerCounterOffer && (
//         <div className="farmer-counter-options animate__animated animate__fadeInUp">
//           <h4>Farmer's Offer: ₹{currentPrice}/kg</h4>
//           <div className="response-buttons">
//           <button 
//   onClick={handleAcceptFarmerOffer} 
//   className="accept-btn"
//   disabled={freezeUI}
// >
//   <FontAwesomeIcon icon={faCheckCircle} /> Accept
// </button>


//             <button 
//               onClick={handleRejectFarmerOffer} 
//               className="reject-btn"
//               disabled={freezeUI}
//             >
//               <FontAwesomeIcon icon={faTimesCircle} /> Reject
//             </button>
//             <button 
//               onClick={() => {
//                 setShowPriceSuggestions(true);
//                 setHasFarmerCounterOffer(false);
//               }} 
//               className="counter-btn"
//               disabled={waitingForResponse}
//             >
//               <FontAwesomeIcon icon={faHandshake} /> Counter Offer
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Show price suggestions when no active counter offer */}
//       {showPriceSuggestions && !hasFarmerCounterOffer && !isBargainComplete && (
//         <div className="price-suggestions">
//           <h4>Make a Counter Offer:</h4>
//           <div className="suggestion-buttons">
//             {priceSuggestions
//               .filter(suggestion => suggestion.price < currentPrice)
//               .map((suggestion, index) => (
//                 <button
//                   key={`price-${index}`}
//                   onClick={() => handlePriceSelection(suggestion.price)}
//                   className="suggestion-btn decrease"
//                   disabled={waitingForResponse}
//                 >
//                   <div className="price-change">
//                     <FontAwesomeIcon icon={faArrowDown} />
//                     ₹{suggestion.price}
//                   </div>
//                   <div className="price-label">{suggestion.label}</div>
//                 </button>
//               ))}
//           </div>
//         </div>
//       )}

//       {/* Waiting indicator */}
//       {waitingForResponse && (
//         <div className="waiting-indicator">
//           <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer...
//         </div>
//       )}
//     </>
//   )}
// </div>

//         </div>
//       )}
      
//     </div>
//   );
// };

// export default BargainChatWindow;

if (loading) {
  return (
    <div className="ccw-loading-container">
      <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      <p>Loading bargain session...</p>
    </div>
  );
}

return (
  <div className="ccw-container">
    {/* Bargain Initiation Popup */}
    {isBargainPopupOpen && selectedFarmer && (
      <div className="ccw-popup-overlay">
        <div className="ccw-popup-container">
          <div className="ccw-popup-content">
            {/* Popup Header */}
            <div className="ccw-popup-header">
              <h3>
                <FontAwesomeIcon icon={faHandshake} /> Initiate Bargain with {selectedFarmer.farmer_name}
              </h3>
              <button 
                onClick={() => navigate(-1)} 
                className="ccw-popup-close-btn"
                aria-label="Close popup"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Product Selection */}
            <div className="ccw-popup-section">
              <label className="ccw-popup-label">Select Product</label>
              <select
                className="ccw-popup-select"
                value={selectedProduct?.produce_name || ''}
                onChange={(e) => {
                  const product = selectedFarmer.products.find(
                    p => p.produce_name === e.target.value
                  );
                  setSelectedProduct(product || null);
                  if (product) {
                    setCurrentPrice(product.price_per_kg);
                    setSelectedQuantity('10');
                  }
                }}
              >
                <option value="">-- Select a product --</option>
                {selectedFarmer.products?.map(product => (
                  <option 
                    key={product.product_id} 
                    value={product.produce_name}
                    data-price={product.price_per_kg}
                  >
                    {product.produce_name} (₹{product.price_per_kg}/kg)
                  </option>
                ))}
              </select>
            </div>

            {/* Product Details */}
            {selectedProduct && (
              <>
                <div className="ccw-popup-section ccw-product-details">
                  <div className="ccw-detail-row">
                    <span className="ccw-detail-label">Category:</span>
                    <span className="ccw-detail-value">{selectedProduct.produce_type}</span>
                  </div>
                  <div className="ccw-detail-row">
                    <span className="ccw-detail-label">Availability:</span>
                    <span className="ccw-detail-value">{selectedProduct.availability} kg</span>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="ccw-popup-section">
                  <label className="ccw-popup-label">Quantity (kg)</label>
                  <div className="ccw-quantity-container">
                    <input
                      type="number"
                      className="ccw-popup-input"
                      min={selectedProduct?.minimum_quantity || 10} 
                      max={selectedProduct.availability}
                      value={selectedQuantity}
                      onChange={(e) => {
                        const minQty = selectedProduct.minimum_quantity || 10;
                        const val = Math.min(
                          selectedProduct?.availability || 0,
                          Math.max(minQty, e.target.value ? parseFloat(e.target.value) : minQty)
                        );
                        setSelectedQuantity(val);
                      }}
                      placeholder="Enter quantity"
                    />
                    <div className="ccw-quantity-range">
                      <span>Min: {selectedProduct.minimum_quantity || 10} kg</span>
                      <span>Max: {selectedProduct.availability} kg</span>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="ccw-price-summary">
                  <div className="ccw-price-row">
                    <span>Unit Price:</span>
                    <span>₹{selectedProduct.price_per_kg}/kg</span>
                  </div>
                  <div className="ccw-price-row ccw-total">
                    <span>Total Price:</span>
                    <span>
                      ₹{(selectedProduct.price_per_kg * (parseFloat(selectedQuantity) || 0).toFixed(2))}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="ccw-popup-error">
                <FontAwesomeIcon icon={faTimesCircle} />
                <span>{error.includes('JSON') ? 'Server error' : error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="ccw-popup-actions">
              <button
                onClick={() => navigate(-1)}
                className="ccw-popup-cancel-btn"
              >
                Cancel
              </button>
           
              <button
                onClick={handleBargainConfirm}
                disabled={!selectedProduct || isLoading}
                className={`ccw-bargain-btn ${isLoading ? 'loading' : ''}`}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faHandshake} />
                    <span>Start Bargaining</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Chat Interface */}
    {selectedProduct && !isBargainPopupOpen && (
      <div className="ccw-chat-interface">

        <button 
          onClick={() => navigate('/consumer-dashboard')} 
          className="ccw-exit-btn"
          title="Exit Chat"
        >
          <FontAwesomeIcon icon={faDoorOpen} />
          <span>Exit</span>
        </button>
        
        {/* Chat Header */}
        <div className="ccw-chat-header">
          <div className="ccw-header-top">
            <h2>
              <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
            </h2>
            <span className={`ccw-connection-status ${connectionStatus}`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
          
          <div className="ccw-product-info">
            <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
            <p><strong>Quantity:</strong> {selectedQuantity || quantity}kg</p>
            <div className="ccw-price-display">
              <span className="ccw-current-price">
                <strong>Current:</strong> ₹{currentPrice}/kg
              </span>
              <span className="ccw-base-price">
                <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
              </span>
              <span className="ccw-total-price">
                <strong>Total:</strong> ₹{(selectedQuantity * currentPrice).toFixed(2)}
              </span>
            </div>
            {bargainStatus === 'accepted' && (
              <p className="ccw-status-accepted">
                <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
              </p>
            )}
            {bargainStatus === 'rejected' && (
              <p className="ccw-status-rejected">
                <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
              </p>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="ccw-messages-container">
          {messages.length === 0 ? (
            <div className="ccw-no-messages">
              <p>No messages yet. Start the negotiation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const messageType = msg.sender_role === 'consumer' ? 'consumer' :
                                msg.sender_role === 'farmer' ? 'farmer' : 'system';

              return (
                <div key={`msg-${index}`} className={`ccw-message ${messageType}`}>
                  <div className="ccw-message-content">
                    {messageType === 'system' && <span className="ccw-system-label">System: </span>}
                    {msg.content || msg.message_content}
                  </div>
                  <div className="ccw-message-meta">
                    <span className="ccw-sender">
                      {messageType === 'consumer' ? 'You' : 
                      messageType === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
                    </span>
                    <span className="ccw-timestamp">
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
            <div className="ccw-typing-indicator">
              <div className="ccw-typing-dots">
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
        <div className="ccw-controls-container">
          {/* Show result actions when bargain is complete */}
          {isBargainComplete ? (
            <div className="ccw-result-actions">
              {bargainResult === 'accepted' ? (
                <>
                  <h3 className="ccw-success-message">
                    <FontAwesomeIcon icon={faCheckCircle} /> 
                    Bargain Accepted at ₹{currentPrice}/kg
                  </h3>
                  <div className="ccw-action-buttons">
                    <button onClick={() => navigate('/consumer-dashboard')} className="ccw-dashboard-btn">
                      <FontAwesomeIcon icon={faHome} /> Dashboard
                    </button>
                    <button onClick={() => navigate('/consumer-orders')} className="ccw-orders-btn">
                      <FontAwesomeIcon icon={faClipboardList} /> Orders
                    </button>
                    <button onClick={() => navigate('/bargain-cart')} className="ccw-cart-btn">
                      <FontAwesomeIcon icon={faShoppingCart} /> View Cart
                    </button>
                    <button 
                      onClick={() => {
                        setIsBargainComplete(false);
                        setBargainStatus('pending');
                        setShowPriceSuggestions(true);
                        navigate(`/consumer-dashboard`);
                      }}
                      className="ccw-bargain-again-btn"
                    >
                      <FontAwesomeIcon icon={faHandshake} /> Bargain Again
                    </button>

                  </div>
                </>
              ) : (
                <>
                  <h3 className="ccw-reject-message">
                    <FontAwesomeIcon icon={faTimesCircle} /> 
                    Bargain Rejected
                  </h3>
                  <div className="ccw-action-buttons">
                    <button onClick={() => navigate('/consumer-dashboard')} className="ccw-dashboard-btn">
                      <FontAwesomeIcon icon={faHome} /> Dashboard
                    </button>
                    <button onClick={() => navigate('/consumer-orders')} className="ccw-orders-btn">
                      <FontAwesomeIcon icon={faClipboardList} /> Orders
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Show farmer's counter offer UI when available */}
              {hasFarmerCounterOffer && (
                <div className="ccw-counter-options">
                  <h4>Farmer's Offer: ₹{currentPrice}/kg</h4>
                  <div className="ccw-response-buttons">
                    <button 
                      onClick={handleAcceptFarmerOffer} 
                      className="ccw-accept-btn"
                      disabled={freezeUI}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} /> Accept
                    </button>
                    <button 
                      onClick={handleRejectFarmerOffer} 
                      className="ccw-reject-btn"
                      disabled={freezeUI}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} /> Reject
                    </button>
                    <button 
                      onClick={() => {
                        setShowPriceSuggestions(true);
                        setHasFarmerCounterOffer(false);
                      }} 
                      className="ccw-counter-btn"
                      disabled={waitingForResponse}
                    >
                      <FontAwesomeIcon icon={faHandshake} /> Counter Offer
                    </button>
                  </div>
                </div>
              )}

              {/* Show price suggestions when no active counter offer */}
              {showPriceSuggestions && !hasFarmerCounterOffer && !isBargainComplete && (
  <div className="ccw-price-suggestions">
    <div className="ccw-suggestion-header">
      <h4>Make a Counter Offer:*</h4>
      <button 
        onClick={() => setShowPriceSuggestions(false)}
        className="ccw-close-suggestions"
        title="Close suggestions"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
    <div className="ccw-suggestion-buttons">
      {priceSuggestions
        .filter(suggestion => suggestion.price < currentPrice)
        .map((suggestion, index) => (
          <button
            key={`price-${index}`}
            onClick={() => handlePriceSelection(suggestion.price)}
            className="ccw-suggestion-btn ccw-decrease"
            disabled={waitingForResponse}
          >
            <div className="ccw-price-change">
              <FontAwesomeIcon icon={faArrowDown} />
              ₹{suggestion.price}
            </div>
            <div className="ccw-price-label">{suggestion.label}</div>
          </button>
        ))}
    </div>
  </div>
)}

              {/* Waiting indicator */}
              {waitingForResponse && (
                <div className="ccw-waiting-indicator">
                  <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default BargainChatWindow;