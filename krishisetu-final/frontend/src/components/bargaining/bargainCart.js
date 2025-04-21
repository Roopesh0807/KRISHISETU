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
      <div className="ks-cart-container">
        <div className="ks-cart-card">
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-green-600" />
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ks-cart-container">
        <div className="ks-cart-card">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
              <h3 className="text-red-800 font-medium">{error}</h3>
            </div>
            <button 
              onClick={fetchCart}
              className="ks-btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ks-cart-container">
      <div className="ks-cart-card">
        <div className="ks-cart-header">
          <h2 className="ks-cart-title">
            <FontAwesomeIcon icon={faShoppingCart} className="ks-cart-icon" />
            Your Cart
            {cartItems.length > 0 && (
              <span className="ks-cart-count">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </h2>
          {cartItems.length > 0 
            
          }
        </div>

        {cartItems.length === 0 ? (
          <div className="ks-cart-empty">
            <FontAwesomeIcon icon={faShoppingCart} className="ks-cart-empty-icon" />
            <p className="ks-cart-empty-text">Your cart is empty</p>
            <p className="ks-cart-empty-subtext">Start shopping to add items</p>
          </div>
        ) : (
          <>
            <div className="ks-cart-items-container">
              <div className="ks-cart-items">
                {cartItems.map((item) => (
                  <div 
                    key={`${item.product_name}-${item.price_per_kg}-${item.farmer_id}`}
                    className="ks-cart-item"
                  >
                    
                    <div className="ks-cart-item-details">
                      <div className="ks-cart-item-info">
                        <h3 className="ks-cart-item-name">{item.product_name}</h3>
                        <div className="ks-cart-item-meta">
                          <span className={`ks-product-type ${item.product_category.toLowerCase() === 'organic' ? 'organic' : 'standard'}`}>
                            {item.product_category}
                          </span>
                        </div>
                        <div className="ks-price-container">
                          <span className="ks-price-label">Price:</span>
                          <span className="ks-price-value">₹{item.price_per_kg.toFixed(2)}/kg</span>
                        </div>
                        <div className="ks-price-container">
                          <span className="ks-price-label">Quantity:</span>
                          <span className="ks-price-value">{item.quantity} kg</span>
                        </div>
                        <div className="ks-price-container">
                          <span className="ks-price-label">Farmer ID:</span>
                          <span className="ks-price-value">{item.farmer_id}</span>
                        </div>
                      </div>
                      <div className="ks-price-container">
                        
                          <span className="ks-cart-item-total-label">Total:</span>
                          <span className="ks-cart-item-total">₹{item.total_price.toFixed(2)}</span>
                        </div>
                      
                    </div>
                    <button 
                      onClick={() => removeItem(item.cart_ids)}
                      className="ks-remove-btn"
                      title="Remove item"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="ks-cart-summary">
              <div className="ks-summary-card">
                <h3 className="ks-summary-title">Order Summary</h3>
                <div className="ks-summary-details">
                  <div className="ks-summary-row">
                    <span>Total Items:</span>
                    <span>{totalItems} kg</span>
                  </div>
                  <div className="ks-summary-divider"></div>
                  <div className="ks-summary-row ks-summary-total">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button 
                className="ks-btn-checkout"
                onClick={() => navigate('/bargain-orderpage')}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;