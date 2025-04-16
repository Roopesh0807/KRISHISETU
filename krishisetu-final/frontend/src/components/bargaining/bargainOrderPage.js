// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faSpinner, 
//   faShoppingCart, 
//   faMapMarkerAlt,
//   faCreditCard,
//   faMoneyBillWave,
//   faExclamationTriangle,
//   faTruck
// } from '@fortawesome/free-solid-svg-icons';
// import "./bargainCart.css";

// const OrderPage = () => {
//   const { consumer, token } = useAuth();
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [totalItems, setTotalItems] = useState(0);
//   const [grandTotal, setGrandTotal] = useState(0);
//   const [deliveryCharge, setDeliveryCharge] = useState(0);
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('cash');

//   // Calculate delivery charges
//   const calculateDeliveryCharge = (totalKg) => {
//     const baseCharge = 100;
//     const additionalCharge = totalKg > 10 ? (totalKg - 10) * 5 : 0;
//     return baseCharge + additionalCharge;
//   };

//   const processCartItems = (items) => {
//     if (!Array.isArray(items)) {
//       throw new Error('Invalid cart data: expected array');
//     }

//     const itemMap = new Map();
//     let itemCount = 0;
//     let runningTotal = 0;

//     items.forEach(item => {
//       const productName = item.product_name?.trim() || 'Unknown Product';
//       const price = Number(item.price_per_kg) || 0;
//       const quantity = Number(item.quantity) || 0;
//       const total = Number(item.total_price) || price * quantity;
//       const key = `${productName}-${price}-${item.farmer_id}`;

//       if (itemMap.has(key)) {
//         const existing = itemMap.get(key);
//         const newQuantity = existing.quantity + quantity;
//         const newTotal = existing.total_price + total;
        
//         itemMap.set(key, {
//           ...existing,
//           quantity: newQuantity,
//           total_price: newTotal,
//           bargain_ids: [...existing.bargain_ids, item.bargain_id || ''],
//           cart_ids: [...existing.cart_ids, item.cart_id || '']
//         });
//       } else {
//         itemMap.set(key, {
//           farmer_id: item.farmer_id || '',
//           product_name: productName,
//           product_category: item.product_category?.trim() || 'Uncategorized',
//           price_per_kg: price,
//           quantity: quantity,
//           total_price: total,
//           bargain_ids: [item.bargain_id || ''],
//           cart_ids: [item.cart_id || '']
//         });
//       }

//       itemCount += quantity;
//       runningTotal += total;
//     });

//     setTotalItems(itemCount);
//     setGrandTotal(runningTotal);
//     setDeliveryCharge(calculateDeliveryCharge(itemCount));
//     return Array.from(itemMap.values());
//   };

//   const fetchCart = async () => {
//     if (!consumer?.consumer_id || !token) {
//       setError('Please login to view your cart');
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
      
//       // Fetch cart items
//       const cartResponse = await axios.get(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}`,
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );
      
//       // Fetch addresses
//       const addressResponse = await axios.get(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/address/${consumer.consumer_id}`,
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );

//       const receivedData = Array.isArray(cartResponse.data) 
//         ? cartResponse.data 
//         : cartResponse.data?.data || [];

//       const processedItems = processCartItems(receivedData);
//       setCartItems(processedItems);
//       setAddresses(addressResponse.data?.addresses || []);
      
//       if (addressResponse.data?.addresses?.length > 0) {
//         setSelectedAddress(addressResponse.data.addresses[0].id);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError(error.response?.data?.message || error.message || 'Failed to load data');
//       setCartItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const placeOrder = async () => {
//     if (!selectedAddress) {
//       setError('Please select a delivery address');
//       return;
//     }

//     try {
//       const orderData = {
//         consumer_id: consumer.consumer_id,
//         address_id: selectedAddress,
//         payment_method: paymentMethod,
//         items: cartItems.map(item => ({
//           product_name: item.product_name,
//           product_category: item.product_category,
//           price_per_kg: item.price_per_kg,
//           quantity: item.quantity,
//           farmer_id: item.farmer_id,
//           bargain_ids: item.bargain_ids
//         })),
//         delivery_charge: deliveryCharge,
//         total_amount: grandTotal + deliveryCharge
//       };

//       const response = await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/orders`,
//         orderData,
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         alert('Order placed successfully!');
//         // Optionally redirect to order confirmation page
//       }
//     } catch (error) {
//       console.error('Error placing order:', error);
//       setError(error.response?.data?.message || 'Failed to place order');
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, [consumer?.consumer_id, token]);

//   if (loading) {
//     return (
//       <div className="text-center py-12">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
//         <p className="mt-4 text-gray-600">Loading your order details...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex items-center">
//             <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
//             <h3 className="text-red-800 font-medium">{error}</h3>
//           </div>
//           <button 
//             onClick={fetchCart}
//             className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bargain-order-container max-w-6xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Order Summary</h1>
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column - Delivery and Payment */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Delivery Address Section */}
//           <div className="bargain-order-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 mr-2" />
//               Delivery Address
//             </h2>
            
//             {addresses.length > 0 ? (
//               <div className="space-y-4">
//                 <select
//                   className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   value={selectedAddress}
//                   onChange={(e) => setSelectedAddress(e.target.value)}
//                 >
//                   {addresses.map(address => (
//                     <option key={address.id} value={address.id}>
//                       {address.address_line1}, {address.city}, {address.state} - {address.pincode}
//                     </option>
//                   ))}
//                 </select>
//                 <button className="text-green-600 hover:text-green-800 text-sm font-medium">
//                   + Add New Address
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center py-4">
//                 <p className="text-gray-500 mb-4">No addresses found</p>
//                 <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
//                   Add Delivery Address
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Payment Method Section */}
//           <div className="bargain-order-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 mr-2" />
//               Payment Method
//             </h2>
            
//             <div className="space-y-3">
//               <div 
//                 className={`p-4 border rounded-md cursor-pointer ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
//                 onClick={() => setPaymentMethod('cash')}
//               >
//                 <div className="flex items-center">
//                   <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 mr-3" />
//                   <div>
//                     <h3 className="font-medium">Cash on Delivery</h3>
//                     <p className="text-sm text-gray-500">Pay when you receive your order</p>
//                   </div>
//                 </div>
//               </div>
              
//               <div 
//                 className={`p-4 border rounded-md cursor-pointer ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
//                 onClick={() => setPaymentMethod('online')}
//               >
//                 <div className="flex items-center">
//                   <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 mr-3" />
//                   <div>
//                     <h3 className="font-medium">Online Payment</h3>
//                     <p className="text-sm text-gray-500">Pay securely with UPI, Card, or Net Banking</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Delivery Information */}
//           <div className="bargain-order-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <FontAwesomeIcon icon={faTruck} className="text-orange-500 mr-2" />
//               Delivery Information
//             </h2>
            
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Total Weight:</span>
//                 <span className="font-medium">{totalItems} kg</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Delivery Charges:</span>
//                 <span className="font-medium">₹{deliveryCharge.toFixed(2)}</span>
//               </div>
//               <div className="text-sm text-gray-500">
//                 {totalItems > 10 ? (
//                   <span>₹100 for first 10kg + ₹5/kg for additional {totalItems - 10}kg</span>
//                 ) : (
//                   <span>Flat ₹100 for up to 10kg</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Order Summary */}
//         <div className="bargain-order-summary bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit sticky top-4">
//           <h2 className="text-xl font-semibold mb-4">Your Order</h2>
          
//           <div className="space-y-4 mb-6">
//             {cartItems.map((item) => (
//               <div key={`${item.product_name}-${item.price_per_kg}-${item.farmer_id}`} className="flex justify-between">
//                 <div>
//                   <h3 className="font-medium">{item.product_name}</h3>
//                   <p className="text-sm text-gray-500">{item.quantity} kg × ₹{item.price_per_kg.toFixed(2)}</p>
//                 </div>
//                 <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
//               </div>
//             ))}
//           </div>

//           <div className="border-t border-gray-200 pt-4 space-y-3">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Subtotal:</span>
//               <span className="font-medium">₹{grandTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Delivery:</span>
//               <span className="font-medium">₹{deliveryCharge.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between text-lg font-bold pt-2">
//               <span>Total:</span>
//               <span>₹{(grandTotal + deliveryCharge).toFixed(2)}</span>
//             </div>
//           </div>

//           <button 
//             className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
//             onClick={placeOrder}
//           >
//             Place Order
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faShoppingCart, 
  faMapMarkerAlt,
  faCreditCard,
  faMoneyBillWave,
  faExclamationTriangle,
  faTruck,
  faUser,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import "./bargainCart.css";

const OrderPage = () => {
  const { consumer, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [consumerProfile, setConsumerProfile] = useState({});
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newAddress, setNewAddress] = useState({
    pincode: "",
    city: "",
    state: "",
    street: "",
    landmark: "",
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Fetch address details from pincode API
  const fetchAddressDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setNewAddress(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State
        }));
      } else {
        setError("Invalid Pincode");
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
      setError("Failed to fetch address details. Please try again.");
    }
  };

  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setNewAddress(prev => ({ ...prev, pincode }));
    if (pincode.length === 6) fetchAddressDetails(pincode);
  };

  // Calculate delivery charges
  const calculateDeliveryCharge = (totalKg) => {
    const baseCharge = 100;
    const additionalCharge = totalKg > 10 ? (totalKg - 10) * 5 : 0;
    return baseCharge + additionalCharge;
  };

  const processCartItems = (items) => {
    if (!Array.isArray(items)) {
      throw new Error('Invalid cart data: expected array');
    }

    const itemMap = new Map();
    let itemCount = 0;
    let runningTotal = 0;

    items.forEach(item => {
      const productName = item.product_name?.trim() || 'Unknown Product';
      const price = Number(item.price_per_kg) || 0;
      const quantity = Number(item.quantity) || 0;
      const total = Number(item.total_price) || price * quantity;
      const key = `${productName}-${price}-${item.farmer_id}`;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        const newQuantity = existing.quantity + quantity;
        const newTotal = existing.total_price + total;
        
        itemMap.set(key, {
          ...existing,
          quantity: newQuantity,
          total_price: newTotal,
          bargain_ids: [...existing.bargain_ids, item.bargain_id || ''],
          cart_ids: [...existing.cart_ids, item.cart_id || '']
        });
      } else {
        itemMap.set(key, {
          farmer_id: item.farmer_id || '',
          product_name: productName,
          product_category: item.product_category?.trim() || 'Uncategorized',
          price_per_kg: price,
          quantity: quantity,
          total_price: total,
          bargain_ids: [item.bargain_id || ''],
          cart_ids: [item.cart_id || '']
        });
      }

      itemCount += quantity;
      runningTotal += total;
    });

    setTotalItems(itemCount);
    setGrandTotal(runningTotal);
    setDeliveryCharge(calculateDeliveryCharge(itemCount));
    return Array.from(itemMap.values());
  };

  const fetchConsumerProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/consumerprofile/${consumer.consumer_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const data = response.data;
      setConsumerProfile(data);
      
      if (data.address) {
        parseAddress(data.address);
      }
    } catch (error) {
      console.error("Error fetching consumer profile:", error);
      setConsumerProfile({
        consumer_id: consumer.consumer_id,
        name: "",
        mobile_number: "",
        email: "",
        address: ""
      });
    }
  };

  const parseAddress = (address) => {
    try {
      if (!address) {
        throw new Error("Address is empty");
      }
  
      // Initialize with default values
      const parsedAddress = {
        street: "",
        landmark: "",
        city: "",
        state: "",
        pincode: ""
      };
  
      // Split by commas and clean up whitespace
      const parts = address.split(',').map(part => part.trim()).filter(part => part);
  
      // Try to extract pincode (last part)
      const lastPart = parts[parts.length - 1];
      const pincodeMatch = lastPart.match(/\b\d{6}\b/); // Look for 6-digit pincode
      if (pincodeMatch) {
        parsedAddress.pincode = pincodeMatch[0];
        parts[parts.length - 1] = lastPart.replace(pincodeMatch[0], '').trim();
      }
  
      // Try to extract state (before pincode)
      const stateMatch = lastPart.match(/[a-zA-Z\s]+/);
      if (stateMatch) {
        parsedAddress.state = stateMatch[0].trim();
      }
  
      // Assign remaining parts
      if (parts.length >= 1) parsedAddress.street = parts[0];
      if (parts.length >= 2) parsedAddress.landmark = parts[1];
      if (parts.length >= 3) parsedAddress.city = parts[2];
  
      // Fallback if we couldn't parse properly
      if (!parsedAddress.city && parsedAddress.state) {
        parsedAddress.city = parsedAddress.state;
      }
  
      setNewAddress(parsedAddress);
      return parsedAddress;
    } catch (error) {
      console.error("Error parsing address:", error);
      setNewAddress({
        pincode: "",
        city: "",
        state: "",
        street: "",
        landmark: "",
      });
      return null;
    }
  };

  const handleModifyAddress = () => {
    if (consumerProfile?.address) {
      const parsed = parseAddress(consumerProfile.address);
      if (!parsed) {
        setNewAddress({
          pincode: "",
          city: "",
          state: "",
          street: "",
          landmark: "",
        });
      }
    } else {
      setNewAddress({
        pincode: "",
        city: "",
        state: "",
        street: "",
        landmark: "",
      });
    }
    setShowAddressPopup(true);
  };

  const handleAddAddress = async () => {
    try {
      if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        alert("Please fill all required address fields (Street, City, State, and Pincode)");
        return;
      }
  
      const fullAddress = [
        newAddress.street,
        newAddress.landmark,
        newAddress.city,
        `${newAddress.state} - ${newAddress.pincode}`
      ].filter(Boolean).join(', ');
  
      const payload = {
        consumer_id: consumerProfile.consumer_id,
        street: newAddress.street,
        landmark: newAddress.landmark || "",
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        address: fullAddress
      };
  
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/update-address`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        setConsumerProfile(prev => ({
          ...prev,
          address: fullAddress
        }));
        
        setShowAddressPopup(false);
        alert("Address updated successfully!");
      } else {
        throw new Error(response.data.error || "Failed to update address");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const fetchCart = async () => {
    if (!consumer?.consumer_id || !token) {
      setError('Please login to view your cart');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const cartResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const receivedData = Array.isArray(cartResponse.data) 
        ? cartResponse.data 
        : cartResponse.data?.data || [];

      const processedItems = processCartItems(receivedData);
      setCartItems(processedItems);
      
      await fetchConsumerProfile();
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load data');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!consumerProfile?.address) {
      setError('Please add a delivery address');
      return;
    }

    try {
      const finalAmount = grandTotal + deliveryCharge;
      if (finalAmount <= 0) {
        alert("Invalid order amount.");
        return;
      }

      // Prepare product names and quantities using backend field names
    const produce_name = cartItems.map(item => item.product_name).join(", ");
    const quantity = cartItems.reduce((total, item) => total + item.quantity, 0);

      // First create the order in your database
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/place-order`,
        {
          consumer_id: consumer.consumer_id,
        name: consumerProfile.name,
        mobile_number: consumerProfile.mobile_number,
        email: consumerProfile.email,
        produce_name, // Using backend field name
        quantity,    // Using backend field name
        amount: finalAmount,
        address: consumerProfile.address,
        pincode: newAddress.pincode,
        payment_method: 'razorpay',
        payment_status: 'Pending',
        items: cartItems.map(item => ({
          produce_name: item.product_name, // Alias here
          product_category: item.product_category,
          price_per_kg: item.price_per_kg,
          quantity: item.quantity,
          farmer_id: item.farmer_id,
          bargain_ids: item.bargain_ids
        })),
        delivery_charge: deliveryCharge,
        notes: {
          cart_items: JSON.stringify(cartItems),
          consumer_id: consumer.consumer_id,
        }
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

      const orderResult = orderResponse.data;
      
      if (!orderResult.success || !orderResult.order_id) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      // Create Razorpay order
      const razorpayResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/razorpay/create-order`,
        { 
          amount: finalAmount , // Convert to paise
          order_id: orderResult.order_id,
          notes: {
            internal_order_id: orderResult.order_id,
            consumer_id: consumer.consumer_id
          }
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const razorpayData = razorpayResponse.data;

      if (!razorpayData.order) {
        throw new Error(razorpayData.error || "Payment gateway error");
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_VLCfnymiyd6HGf',
        amount: razorpayData.order.amount,
        currency: razorpayData.order.currency,
        order_id: razorpayData.order.id,
        name: 'KrishiSetu',
        description: 'Farm Fresh Products',
        image: '', // Add your logo URL here
        handler: async (response) => {
          try {
            // Verify payment
            const verificationResponse = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/razorpay/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderResult.order_id,
                amount: razorpayData.order.amount
              },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const verificationData = verificationResponse.data;
            
            if (!verificationData.success) {
              throw new Error(verificationData.error || 'Payment verification failed');
            }

            // Payment successful
            setShowSuccessPopup(true);
            localStorage.removeItem(`cart_${consumer.consumer_id}`);
            setTimeout(() => window.location.href = "/consumer-dashboard", 3000);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert(`Payment verification failed: ${error.message}`);
          }
        },
        prefill: {
          name: consumerProfile?.name || '',
          email: consumerProfile?.email || '',
          contact: consumerProfile?.mobile_number || ''
        },
        theme: {
          color: '#3399cc',
          hide_topbar: true
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  const placeOrder = async () => {
    if (!consumerProfile?.address) {
      setError('Please add a delivery address');
      return;
    }

    try {
      const orderData = {
        consumer_id: consumer.consumer_id,
        name: consumerProfile.name,
        mobile_number: consumerProfile.mobile_number,
        email: consumerProfile.email,
        address: consumerProfile.address,
        pincode: newAddress.pincode,
        payment_method: 'cash',
        payment_status: 'Pending',
        items: cartItems.map(item => ({
          product_name: item.product_name,
          product_category: item.product_category,
          price_per_kg: item.price_per_kg,
          quantity: item.quantity,
          farmer_id: item.farmer_id,
          bargain_ids: item.bargain_ids
        })),
        delivery_charge: deliveryCharge,
        total_amount: grandTotal + deliveryCharge
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/orders`,
        orderData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowSuccessPopup(true);
        localStorage.removeItem(`cart_${consumer.consumer_id}`);
        setTimeout(() => window.location.href = "/consumer-dashboard", 3000);
      } else {
        throw new Error(response.data.error || "Failed to place order");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'online') {
      handleRazorpayPayment();
    } else {
      placeOrder();
    }
  };

  useEffect(() => {
    fetchCart();
  }, [consumer?.consumer_id, token]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
        <p className="mt-4 text-gray-600">Loading your order details...</p>
      </div>
    );
  }

  if (error && !showAddressPopup) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">{error}</h3>
          </div>
          <button 
            onClick={fetchCart}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const SuccessPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="text-green-500 text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">Order Placed Successfully!</h3>
        <p className="text-gray-600 mb-6">Thank you for your order. {paymentMethod === 'online' ? 'Your payment has been processed successfully.' : 'Your order will be delivered soon.'}</p>
        <p className="text-gray-500 text-sm">You will be redirected shortly...</p>
      </div>
    </div>
  );

  return (
    <div className="bargain-order-container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Summary</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Delivery and Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <div className="bargain-order-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 mr-2" />
              Delivery Address
            </h2>
            
            {consumerProfile?.address ? (
              <div className="space-y-4">
                <div className="p-4 border border-gray-300 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 text-gray-500">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div>
                      <h3 className="font-medium">{consumerProfile?.name || "Loading..."}</h3>
                      <p className="text-gray-600">{consumerProfile?.mobile_number || "Loading..."}</p>
                      <p className="mt-1">{consumerProfile.address}</p>
                    </div>
                  </div>
                </div>
                <button 
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                  onClick={handleModifyAddress}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                  {consumerProfile?.address ? "Update Address" : "Add Address"}
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No address found</p>
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setShowAddressPopup(true)}
                >
                  Add Delivery Address
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="bargain-order-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 mr-2" />
              Payment Method
            </h2>
            
            <div className="space-y-3">
              <label className="block">
                <div 
                  className={`p-4 border rounded-md cursor-pointer ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="mr-3"
                    />
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Cash on Delivery</h3>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="block">
                <div 
                  className={`p-4 border rounded-md cursor-pointer ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="mr-3"
                    />
                    <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Online Payment</h3>
                      <p className="text-sm text-gray-500">Pay securely with UPI, Card, or Net Banking</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bargain-order-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faTruck} className="text-orange-500 mr-2" />
              Delivery Information
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Weight:</span>
                <span className="font-medium">{totalItems} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges:</span>
                <span className="font-medium">₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500">
                {totalItems > 10 ? (
                  <span>₹100 for first 10kg + ₹5/kg for additional {totalItems - 10}kg</span>
                ) : (
                  <span>Flat ₹100 for up to 10kg</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bargain-order-summary bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Your Order</h2>
          
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={`${item.product_name}-${item.price_per_kg}-${item.farmer_id}`} className="flex justify-between">
                <div>
                  <h3 className="font-medium">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">{item.quantity} kg × ₹{item.price_per_kg.toFixed(2)}</p>
                </div>
                <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery:</span>
              <span className="font-medium">₹{deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total:</span>
              <span>₹{(grandTotal + deliveryCharge).toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            onClick={handlePlaceOrder}
            disabled={!consumerProfile?.address}
          >
            {paymentMethod === 'online' ? `Pay ₹${(grandTotal + deliveryCharge).toFixed(2)}` : 'Place Order (Cash on Delivery)'}
          </button>
        </div>
      </div>

      {/* Address Popup */}
      {showAddressPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {consumerProfile?.address ? "Update Address" : "Add New Address"}
            </h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Pincode Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={newAddress.pincode}
                  onChange={handlePincodeChange}
                  maxLength="6"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* City Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input 
                  type="text" 
                  placeholder="City" 
                  value={newAddress.city} 
                  readOnly 
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              
              {/* State Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input 
                  type="text" 
                  placeholder="State" 
                  value={newAddress.state} 
                  readOnly 
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              
              {/* Street Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  placeholder="House no, Building, Street"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Landmark Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Nearby landmark"
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowAddressPopup(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleAddAddress}
              >
                {consumerProfile?.address ? "Update Address" : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default OrderPage;