import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faShoppingCart, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import "./bargainCart.css";

const CartPage = () => {
  const { consumer, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const navigate = useNavigate();

  const processCartItems = (items) => {
    if (!Array.isArray(items)) {
      throw new Error('Invalid cart data: expected array');
    }

    const itemMap = new Map();
    let itemCount = 0;
    let runningTotal = 0;

    items.forEach(item => {
      // Validate and parse required fields
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
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Handle both direct array and wrapped responses
      const receivedData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];

      const processedItems = processCartItems(receivedData);
      setCartItems(processedItems);
    } catch (error) {
      console.error('Cart fetch error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartIds) => {
    if (!consumer?.consumer_id || !token) {
      setError('Authentication required');
      return;
    }

    try {
      await Promise.all(
        cartIds.map(cartId => 
          axios.delete(
            `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/cart/${consumer.consumer_id}/${cartId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          )
        )
      );
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.response?.data?.message || 'Failed to remove item');
    }
  };

  useEffect(() => {
    fetchCart();
  }, [consumer?.consumer_id, token]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
        <p className="mt-4 text-gray-600">Loading your cart...</p>
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
    <div className="bargain-cart-container max-w-4xl mx-auto px-4 py-8">
      <div className="bargain-cart-header flex justify-between items-center mb-6">
        <h2 className="bargain-cart-title text-2xl font-bold">
          <FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-green-600" />
          Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </h2>
        {cartItems.length > 0 && (
          <button 
            onClick={fetchCart}
            className="bargain-refresh-btn text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bargain-empty-state text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="bargain-empty-text text-gray-500 text-lg">Your cart is empty</p>
          <p className="bargain-empty-subtext text-gray-400 mt-2">Start shopping to add items</p>
        </div>
      ) : (
        <div className="bargain-cart-content space-y-4">
          <div className="bargain-items-grid grid grid-cols-1 gap-4">
            {cartItems.map((item) => (
              <div 
                key={`${item.product_name}-${item.price_per_kg}-${item.farmer_id}`}
                className="bargain-cart-item border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bargain-item-content flex justify-between items-start">
                  <div className="bargain-item-details flex-1">
                    <h3 className="bargain-product-name font-bold text-lg text-gray-800">{item.product_name}</h3>
                    <div className="bargain-details-grid grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="bargain-detail-group">
                        <span className="bargain-detail-label text-gray-500">Category:</span>
                        <span className="bargain-detail-value ml-2 text-gray-700">{item.product_category}</span>
                      </div>
                      <div className="bargain-detail-group">
                        <span className="bargain-detail-label text-gray-500">Farmer ID:</span>
                        <span className="bargain-detail-value ml-2 text-gray-700">{item.farmer_id}</span>
                      </div>
                      <div className="bargain-detail-group">
                        <span className="bargain-detail-label text-gray-500">Price:</span>
                        <span className="bargain-detail-value ml-2 text-gray-700">₹{item.price_per_kg.toFixed(2)}/kg</span>
                      </div>
                      <div className="bargain-detail-group">
                        <span className="bargain-detail-label text-gray-500">Quantity:</span>
                        <span className="bargain-detail-value ml-2 text-gray-700">{item.quantity} kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="bargain-price-section text-right ml-4">
                    <p className="bargain-item-total font-bold text-lg">₹{item.total_price.toFixed(2)}</p>
                    {/* <button 
                      onClick={() => removeItem(item.cart_ids)}
                      className="bargain-remove-btn mt-2 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      title="Remove item"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      Remove
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bargain-summary-card bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
            <div className="bargain-summary-row flex justify-between items-center mb-2">
              <span className="bargain-summary-label text-gray-600">Total Items:</span>
              <span className="bargain-summary-value font-medium">{totalItems} kg</span>
            </div>
            <div className="bargain-summary-row flex justify-between items-center text-lg">
              <span className="bargain-grand-total-label font-semibold">Grand Total:</span>
              <span className="bargain-grand-total-value font-bold text-green-600">₹{grandTotal.toFixed(2)}</span>
            </div>
            <button 
            className="bargain-checkout-btn w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => navigate('/bargain-orderpage')}
            >
            Proceed to Checkout
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;