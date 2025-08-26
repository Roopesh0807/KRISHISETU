// Cart.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faShoppingCart,
  faArrowLeft,
  faTrashAlt,
  faMinus,
  faPlus,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import "./Cart.css";

const CartPage = () => {
  const { cart: krishiCart, setCart: setKrishiCart, removeFromCart, setCartCount, updateQuantity, calculateTotal } = useCart();
  const { consumer, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bargainCart, setBargainCart] = useState([]);
  const [communityCart, setCommunityCart] = useState([]);
  const [activeCart, setActiveCart] = useState('krishi'); // 'krishi', 'bargain', 'community'
  const [loading, setLoading] = useState({ krishi: true, bargain: true, community: true });
  const [error, setError] = useState(null);
  const [productImages, setProductImages] = useState({});

  const processBargainCartItems = (items) => {
    if (!Array.isArray(items)) {
      throw new Error('Invalid bargain cart data: expected array');
    }
    const itemMap = new Map();
    items.forEach(item => {
      const productName = item.product_name?.trim() || 'Unknown Product';
      const price = Number(item.price_per_kg) || 0;
      const quantity = Number(item.quantity) || 0;
      const total = Number(item.total_price) || price * quantity;
      const key = `${productName}-${price}-${item.farmer_id}`;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        itemMap.set(key, {
          ...existing,
          quantity: existing.quantity + quantity,
          total_price: existing.total_price + total,
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
          cart_ids: [item.cart_id || '']
        });
      }
    });
    return Array.from(itemMap.values());
  };

  const fetchCarts = async () => {
    if (!consumer?.consumer_id) {
      setError("Please login to view your cart");
      setLoading({ krishi: false, bargain: false, community: false });
      return;
    }

    // Fetch Krishisetu Cart
    setLoading(prev => ({ ...prev, krishi: true }));
    try {
      const storedCart = localStorage.getItem(`krishiCart_${consumer.consumer_id}`);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setKrishiCart(parsedCart);
          setCartCount(parsedCart.length);
        }
      }
    } catch (err) {
      console.error("Error loading Krishisetu cart:", err);
    } finally {
      setLoading(prev => ({ ...prev, krishi: false }));
    }

    // Fetch Bargain Cart
    setLoading(prev => ({ ...prev, bargain: true }));
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}"}/api/cart/${consumer.consumer_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const receivedData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const processedItems = processBargainCartItems(receivedData);
      setBargainCart(processedItems);
    } catch (err) {
      console.error('Bargain cart fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, bargain: false }));
    }

    // Fetch Community Cart
    setLoading(prev => ({ ...prev, community: true }));
    try {
      // Logic to fetch the community carts. This will be more complex.
      // You'll need to fetch the communities the user is a member of,
      // and then fetch the cart for each community.
      // For now, let's mock it or assume a single community.
      const memberIdResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/member-by-consumer/${consumer.consumer_id}`, {
          headers: { 'Authorization': `Bearer ${consumer.token}` },
        }
      );
      if (!memberIdResponse.ok) {
        console.error("Not a member of any community or failed to fetch.");
        setCommunityCart([]);
        return;
      }
      const memberIdData = await memberIdResponse.json();
      const memberId = memberIdData.memberId;
      const communityId = memberIdData.communityId;

      if (memberId && communityId) {
        const communityOrdersResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/community/${communityId}/member/${memberId}/orders`, {
            headers: { 'Authorization': `Bearer ${consumer.token}` },
          }
        );
        const communityOrdersData = await communityOrdersResponse.json();
        setCommunityCart(communityOrdersData.orders || []);
      }
    } catch (err) {
      console.error("Community cart fetch error:", err);
    } finally {
      setLoading(prev => ({ ...prev, community: false }));
    }
  };

  useEffect(() => {
    fetchCarts();
  }, [consumer?.consumer_id, token]);

  useEffect(() => {
    if (consumer?.consumer_id) {
      localStorage.setItem(`krishiCart_${consumer.consumer_id}`, JSON.stringify(krishiCart));
    }
  }, [krishiCart, consumer]);

  const fetchImagesForCart = async (items) => {
    setLoading(prev => ({ ...prev, images: true }));
    const images = {};
    for (const item of items) {
      const productName = item.product_name || 'default';
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(productName)}&per_page=1`,
          { headers: { Authorization: 'uONxxczjZM1uaDw2jsGQPV70vtBfQbuyHcKeJ0aaCwsK0xxbo5HDpamR' } }
        );
        if (!response.ok) throw new Error('Image fetch failed');
        const data = await response.json();
        images[item.product_id || item.product_name] = data.photos[0]?.src?.medium || '/images/default-produce.jpg';
      } catch (err) {
        images[item.product_id || item.product_name] = '/images/default-produce.jpg';
      }
    }
    setProductImages(prev => ({ ...prev, ...images }));
    setLoading(prev => ({ ...prev, images: false }));
  };

  useEffect(() => {
    let itemsToFetch = [];
    if (activeCart === 'krishi') {
      itemsToFetch = krishiCart;
    } else if (activeCart === 'bargain') {
      itemsToFetch = bargainCart;
    } else {
      itemsToFetch = communityCart;
    }
    fetchImagesForCart(itemsToFetch);
  }, [activeCart, krishiCart, bargainCart, communityCart]);

  const handleProceedToCheckout = () => {
    if (activeCart === 'krishi') {
      if (krishiCart.length === 0) {
        setError("Your Krishisetu cart is empty.");
        return;
      }
      navigate("/orderpage", { state: { cart: krishiCart } });
    } else if (activeCart === 'bargain') {
      if (bargainCart.length === 0) {
        setError("Your Bargaining cart is empty.");
        return;
      }
      navigate("/bargain-orderpage", { state: { cart: bargainCart } });
    } else if (activeCart === 'community') {
      if (communityCart.length === 0) {
        setError("Your Community cart is empty.");
        return;
      }
      navigate("/community-orderpage", { state: { cart: communityCart } });
    }
  };

  const handleAllCartsCheckout = () => {
    if (krishiCart.length === 0 && bargainCart.length === 0 && communityCart.length === 0) {
      setError("All your carts are empty!");
      return;
    }
    navigate("/combined-checkout", { state: { krishiCart, bargainCart, communityCart } });
  };

  const renderCartItems = () => {
    let items;
    let total = 0;
    let removeFn;
    let updateFn;

    if (activeCart === 'krishi') {
      items = krishiCart;
      total = calculateTotal();
      removeFn = removeFromCart;
      updateFn = updateQuantity;
    } else if (activeCart === 'bargain') {
      items = bargainCart;
      total = bargainCart.reduce((sum, item) => sum + item.total_price, 0);
      removeFn = (id) => setBargainCart(prev => prev.filter(item => item.cart_ids[0] !== id));
      updateFn = () => setError("Quantity cannot be updated for bargaining products.");
    } else {
      items = communityCart;
      total = communityCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      removeFn = (id) => setCommunityCart(prev => prev.filter(item => item.order_id !== id));
      updateFn = (id, change) => {
        setCommunityCart(prev => prev.map(item =>
          item.order_id === id ? { ...item, quantity: item.quantity + change } : item
        ));
      };
    }

    if (items.length === 0) {
      return (
        <div className="ks-cart-empty">
          <div className="ks-cart-empty-icon">🌾</div>
          <p className="ks-cart-empty-text">Your {activeCart} cart is empty. Let's harvest some fresh produce!</p>
          <button className="ks-btn-primary" onClick={() => navigate("/consumer-dashboard")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Browse Farm Products
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="ks-cart-items-container">
          {loading.images && (
            <div className="ks-loading-overlay">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>Loading product images...</p>
            </div>
          )}
          <div className="ks-cart-items">
            {items.map((product, index) => (
              <div key={`${product.product_id || product.order_id}-${index}`} className="ks-cart-item">
                <div className="ks-cart-item-img-container">
                  <img
                    src={productImages[product.product_id || product.product_name] || '/images/default-produce.jpg'}
                    alt={product.product_name}
                    className="ks-cart-item-img"
                    onError={(e) => { e.target.src = "/images/default-produce.jpg"; }}
                  />
                  {product.buy_type === "organic" && (
                    <div className="ks-organic-badge">
                      <FontAwesomeIcon icon={faLeaf} /> Organic
                    </div>
                  )}
                </div>
                <div className="ks-cart-item-details">
                  <div className="ks-cart-item-info">
                    <h3 className="ks-cart-item-name">{product.product_name}</h3>
                    <div className="ks-cart-item-meta">
                      <span className={`ks-product-type ${product.buy_type || product.category}`}>
                        {product.buy_type || product.category}
                      </span>
                      <span className="ks-cart-item-category">{product.category || product.product_category}</span>
                    </div>
                  </div>
                  <div className="ks-cart-item-price-section">
                    <div className="ks-price-container">
                      <span className="ks-price-label">Price:</span>
                      <span className="ks-price-value">₹{product.price_1kg || product.price_per_kg || product.price}/kg</span>
                    </div>
                    <div className="ks-cart-item-controls">
                      {activeCart !== 'bargain' && (
                        <div className="ks-quantity-selector">
                          <button
                            className="ks-quantity-btn"
                            onClick={() => updateFn(product.product_id || product.order_id, -1)}
                            disabled={(product.quantity || product.order_quantity) <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="ks-quantity-value">{product.quantity || product.order_quantity} kg</span>
                          <button
                            className="ks-quantity-btn"
                            onClick={() => updateFn(product.product_id || product.order_id, 1)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      )}
                      <div className="ks-cart-item-total-container">
                        <span className="ks-cart-item-total-label">Subtotal:</span>
                        <span className="ks-cart-item-total">₹{(product.price_1kg * product.quantity || product.total_price || (product.price * product.quantity)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="ks-remove-btn"
                  onClick={() => removeFn(product.product_id || product.order_id || product.cart_ids[0])}
                  title="Remove item"
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
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
                <span>Subtotal ({items.length} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="ks-summary-row">
                <span>Delivery Charges</span>
                <span className="ks-free-delivery">FREE</span>
              </div>
              <div className="ks-summary-divider"></div>
              <div className="ks-summary-row ks-summary-total">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="ks-cart-actions">
            <button
              className="ks-btn-continue"
              onClick={() => navigate("/consumer-dashboard")}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
            </button>
            <button
              className="ks-btn-checkout"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </>
    );
  };

  const hasAnyItems = krishiCart.length > 0 || bargainCart.length > 0 || communityCart.length > 0;

  return (
    <div className="ks-cart-container">
      <div className="ks-cart-card">
        <div className="ks-cart-header">
          <h2 className="ks-cart-title">
            <FontAwesomeIcon icon={faShoppingCart} className="ks-cart-icon" />
            Your Carts
          </h2>
          <div className="cart-selector-container">
            <select
              className="cart-selector"
              value={activeCart}
              onChange={(e) => setActiveCart(e.target.value)}
            >
              <option value="krishi">Krishisetu Marketplace</option>
              <option value="bargain">Bargaining Marketplace</option>
              <option value="community">Community Cart</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="ks-cart-error">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{error}</span>
          </div>
        )}

        <div className="ks-cart-content-grid">
          {renderCartItems()}
        </div>

        <div className="ks-all-carts-checkout">
          <button
            className="ks-btn-checkout ks-btn-all-checkout"
            onClick={handleAllCartsCheckout}
            disabled={!hasAnyItems}
          >
            Proceed to Checkout All Carts
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;