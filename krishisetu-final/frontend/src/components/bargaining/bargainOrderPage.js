import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faMapMarkerAlt,
  faCreditCard,
  faMoneyBillWave,
  faExclamationTriangle,
  faTruck
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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

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

  const fetchCart = async () => {
    if (!consumer?.consumer_id || !token) {
      setError('Please login to view your cart');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch cart items
      const cartResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Fetch addresses
      const addressResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/address/${consumer.consumer_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const receivedData = Array.isArray(cartResponse.data) 
        ? cartResponse.data 
        : cartResponse.data?.data || [];

      const processedItems = processCartItems(receivedData);
      setCartItems(processedItems);
      setAddresses(addressResponse.data?.addresses || []);
      
      if (addressResponse.data?.addresses?.length > 0) {
        setSelectedAddress(addressResponse.data.addresses[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load data');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    try {
      const orderData = {
        consumer_id: consumer.consumer_id,
        address_id: selectedAddress,
        payment_method: paymentMethod,
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
        alert('Order placed successfully!');
        // Optionally redirect to order confirmation page
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
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

  if (error) {
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
            
            {addresses.length > 0 ? (
              <div className="space-y-4">
                <select
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                >
                  {addresses.map(address => (
                    <option key={address.id} value={address.id}>
                      {address.address_line1}, {address.city}, {address.state} - {address.pincode}
                    </option>
                  ))}
                </select>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  + Add New Address
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No addresses found</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
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
              <div 
                className={`p-4 border rounded-md cursor-pointer ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-md cursor-pointer ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setPaymentMethod('online')}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Online Payment</h3>
                    <p className="text-sm text-gray-500">Pay securely with UPI, Card, or Net Banking</p>
                  </div>
                </div>
              </div>
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
            onClick={placeOrder}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;