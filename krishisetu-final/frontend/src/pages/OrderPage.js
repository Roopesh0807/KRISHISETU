import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import { useAuth } from '../context/AuthContext';
import "../styles/OrderPageC.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

function OrderPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { consumer } = useAuth();
  const [yourOrders, setYourOrders] = useState([]);
  const [membersOrders, setMembersOrders] = useState([]);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingImages, setLoadingImages] = useState(true);
  const [productImages, setProductImages] = useState({});
  // Freeze status states
  const [freezeStatus, setFreezeStatus] = useState({
    isFrozen: false,
    timeUntilFreeze: 0,
    secondsUntilDelivery: 0
  });
  const [countdown, setCountdown] = useState('');
  const countdownIntervalRef = useRef(null);
  
  // Discount states
  const [discount, setDiscount] = useState({
    memberCount: 0,
    itemCount: 0,
    memberDiscount: 0,
    itemDiscount: 0,
    totalDiscount: 0,
    memberDiscountAmount: 0,
    itemDiscountAmount: 0,
    totalDiscountAmount: 0,
    subtotal: 0
  });

  // Countdown functions
  const startCountdown = (seconds) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    updateCountdownDisplay(seconds);
    countdownIntervalRef.current = setInterval(() => {
      seconds--;
      updateCountdownDisplay(seconds);
      if (seconds <= 0) {
        clearInterval(countdownIntervalRef.current);
        setFreezeStatus(prev => ({ ...prev, isFrozen: true }));
      }
    }, 1000);
  };

  const updateCountdownDisplay = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    setCountdown(`${hours}h ${minutes}m ${secs}s`);
  };

  // Freeze status banner component
  const FreezeStatusBanner = () => {
    if (freezeStatus.isFrozen) {
      return (
        <div className="freeze-banner frozen">
          <strong>COMMUNITY FROZEN:</strong> No order modifications allowed. 
          Delivery coming soon!
        </div>
      );
    } else if (freezeStatus.timeUntilFreeze > 0) {
      return (
        <div className="freeze-banner warning">
          <strong>Community will freeze in:</strong> {countdown}
        </div>
      );
    }
    return null;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch community details
        const communityResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!communityResponse.ok) throw new Error("Failed to fetch community details");
        const communityData = await communityResponse.json();
        setCommunityDetails(communityData.data);

        // 2. First get the member_id for the logged-in consumer
        const memberIdResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        
        if (!memberIdResponse.ok) throw new Error("Failed to fetch member ID");
        const memberIdData = await memberIdResponse.json();

        if (!memberIdData.success || !memberIdData.memberId) {
          throw new Error("User is not a member of this community");
        }
        const memberId = memberIdData.memberId;

        // 3. Fetch logged-in user's orders
        const yourOrdersResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/member/${memberId}/orders`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!yourOrdersResponse.ok) throw new Error("Failed to fetch your orders");
        const yourOrdersData = await yourOrdersResponse.json();
        console.log("Orders data from API:", yourOrdersData); // Add this line
        const processedOrders = (yourOrdersData.orders || []).map(order => ({
          ...order,
          product_name: order.product_name || order.name || 'Unknown Product', // Ensure we always have a product_name
          price: Number(order.price) || 0,
          quantity: Number(order.quantity) || 0,
          total: (Number(order.price) || 0) * (Number(order.quantity) || 0)
        }));
        setYourOrders(processedOrders);

        // 4. Fetch all members' summary (excluding current user)
        const membersSummaryResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/members-summary`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!membersSummaryResponse.ok) throw new Error("Failed to fetch members summary");
        const membersSummaryData = await membersSummaryResponse.json();
        
        // Filter out current user from members list
        const otherMembers = membersSummaryData.filter(member => 
          member.consumer_id !== consumer.consumer_id
        );
        setMembersOrders(otherMembers);

        // 5. Fetch freeze status
        const freezeStatusResponse = await fetch(
          `http://localhost:5000/api/order/${communityId}/freeze-status`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            }
          }
        );
        const freezeStatusData = await freezeStatusResponse.json();
        if (freezeStatusResponse.ok) {
          setFreezeStatus(freezeStatusData);
          if (!freezeStatusData.isFrozen && freezeStatusData.timeUntilFreeze > 0) {
            startCountdown(freezeStatusData.timeUntilFreeze);
          }
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [communityId, consumer]);


  useEffect(() => {
    if (yourOrders.length === 0) {
      setLoadingImages(false);
      return;
    }

    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        const images = {};
        
        for (const item of yourOrders) {
          // If image already exists in order item, use that
          if (item.imageUrl) {
            images[item.product_id] = item.imageUrl;
            continue;
          }

          // Otherwise fetch from Pexels API
          try {
            const response = await fetch(
              `https://api.pexels.com/v1/search?query=${encodeURIComponent(item.product_name)}&per_page=1`,
              {
                headers: {
                  Authorization: 'uONxxczjZM1uaDw2jsGQPV70vtBfQbuyHcKeJ0aaCwsK0xxbo5HDpamR' // Replace with your actual key
                }
              }
            );
            
            if (!response.ok) throw new Error('Image fetch failed');
            
            const data = await response.json();
            images[item.product_id] = data.photos[0]?.src?.medium || '/images/default-produce.jpg';
          } catch (err) {
            console.error(`Error fetching image for ${item.product_name}:`, err);
            images[item.product_id] = '/images/default-produce.jpg';
          }
        }

        setProductImages(images);
      } catch (error) {
        console.error("Error fetching product images:", error);
        setError("Couldn't load product images. Showing placeholders.");
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [yourOrders]);

  const getProductImage = (productId) => {
    if (loadingImages) return '/images/loading-image.jpg';
    return productImages[productId] || '/images/default-produce.jpg';
  };
  // Add this useEffect to listen for order confirmation
useEffect(() => {
  const checkForConfirmedOrder = async () => {
    try {
      const memberIdResponse = await fetch(
        `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
          headers: { 
            'Authorization': `Bearer ${consumer.token}`
          },
        }
      );
      
      if (!memberIdResponse.ok) return;
      const memberIdData = await memberIdResponse.json();
      const memberId = memberIdData.memberId;

      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/member/${memberId}/has-confirmed-order`,
        {
          headers: {
            'Authorization': `Bearer ${consumer.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.hasConfirmedOrder) {
          setYourOrders([]);
        }
      }
    } catch (error) {
      console.error("Error checking confirmed order:", error);
    }
  };

  // Check periodically (every 30 seconds) if order was confirmed
  const interval = setInterval(checkForConfirmedOrder, 30000);
  return () => clearInterval(interval);
}, [communityId, consumer]);
  // Fetch discount when frozen
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const memberIdResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        
        if (!memberIdResponse.ok) throw new Error("Failed to fetch member ID");
        const memberIdData = await memberIdResponse.json();
        const memberId = memberIdData.memberId;

        const response = await fetch(
          `http://localhost:5000/api/community/${communityId}/member/${memberId}/discount`, {
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            }
          }
        );
        const data = await response.json();
        if (response.ok) {
          setDiscount({
            ...data,
            memberDiscountAmount: data.memberDiscountAmount || 0,
            itemDiscountAmount: data.itemDiscountAmount || 0,
            totalDiscountAmount: data.totalDiscountAmount || 0,
            subtotal: data.subtotal || 0
          });
        }
      } catch (error) {
        console.error("Error fetching discount:", error);
      }
    };

    if (freezeStatus.isFrozen) {
      fetchDiscount();
    } else {
      setDiscount({
        memberCount: 0,
        itemCount: 0,
        memberDiscount: 0,
        itemDiscount: 0,
        totalDiscount: 0,
        memberDiscountAmount: 0,
        itemDiscountAmount: 0,
        totalDiscountAmount: 0,
        subtotal: 0
      });
    }
  }, [freezeStatus.isFrozen, communityId, consumer]);

  // Calculate totals
  const yourTotal = yourOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalMembers = membersOrders.length + 1; // +1 for current user
  const confirmedMembers = membersOrders.filter(member => member.status === 'Confirmed').length + 
                         (yourOrders.length > 0 ? 1 : 0);

  // Order management functions
  // const handlePlaceOrder = () => {
  //   navigate(`/orderpage`);
  // };

     // Order management functions
  const handleProceedToPayment = async () => {
    try {
      // Prepare order data for submission
      const orderData = yourOrders.map(order => ({
        product_id: order.product_id,
        product_name: order.product_name,
        price: order.price,
        quantity: order.quantity,
        category: order.category
      }));

      const memberIdResponse = await fetch(
        `http://localhost:5000/api/community/${communityId}/member-by-consumer/${consumer.consumer_id}`, {
          headers: { 
            'Authorization': `Bearer ${consumer.token}`
          },
        }
      );
      
      if (!memberIdResponse.ok) throw new Error("Failed to fetch member ID");
      const memberIdData = await memberIdResponse.json();
      const memberId = memberIdData.memberId;

      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/member/${memberId}/submit-frozen-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${consumer.token}`
          },
          body: JSON.stringify({
            orders: orderData,
            discount: discount
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit frozen order');
      }

      const data = await response.json();
      navigate(`/community/${communityId}/order/${data.orderId}`, {
        state: {
          discountData: discount
        }
      });
    } catch (err) {
      console.error("Error submitting frozen order:", err);
      setError(err.message);
    }
  };

  const handleRemoveOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${communityId}/${orderId}`,
        { 
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${consumer.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error("Failed to delete order");
      
      setYourOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
    } catch (error) {
      console.error("Error removing order:", error);
      alert("Failed to remove order");
    }
  };

  const handleQuantityChange = async (orderId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${communityId}/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${consumer.token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        }
      );
      if (!response.ok) throw new Error("Failed to update quantity");

      setYourOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_id === orderId 
            ? { ...order, quantity: newQuantity, total: order.price * newQuantity } 
            : order
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!communityDetails) return <div className="error">No community data found</div>;

  return (
    <div className="order-page">
      <Navbar3 />
      <FreezeStatusBanner />
      
      <div className="order-header">
        <h1>Order Details - {communityDetails.name || 'Unnamed Community'}</h1>
        <div className="member-counts">
          <span>Total Members: {totalMembers}</span>
          <span>Confirmed Orders: {confirmedMembers}</span>
        </div>
      </div>

      <div className="summary-card">
        <h3>Community Information</h3>
        <div className="community-details">
          <p><strong>Admin:</strong> {communityDetails.admin_name || 'Not specified'}</p>
          <p><strong>Address:</strong> {communityDetails.address || 'Not specified'}</p>
          <p><strong>Delivery Date:</strong> {communityDetails.delivery_date || 'Not specified'}</p>
          <p><strong>Delivery Time:</strong> {communityDetails.delivery_time || 'Not specified'}</p>
        </div>
      </div>

      {/* Your Orders Section */}
      <div className="your-orders-section">
        <h2>Your Orders</h2>
        {loadingImages && (
          <div className="loading-overlay">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Loading product images...</p>
          </div>
        )}
        
        {yourOrders.length > 0 ? (
          <div className="orders-container">
            {yourOrders.map(order => (
              <div key={order.order_id} className="order-item">
                <div className="order-item-img">
                  <img 
                    src={getProductImage(order.product_id)}
                    alt={order.product_name}
                    onError={(e) => {
                      e.target.src = "/images/default-produce.jpg";
                      e.target.onerror = null;
                      e.target.className = "order-item-img default-img";
                    }}
                  />
                </div>
                <div className="order-item-details">
                  <h3>{order.product_name}</h3>
                  <div className="product-meta">
                    <span className="product-type">
                      {order.category} • {order.buy_type === 'organic' ? 'Organic' : 'Standard'}
                    </span>
                  </div>
                  <div className="order-item-meta">
                    <span>Price: ₹{order.price.toFixed(2)}</span>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleQuantityChange(order.order_id, order.quantity - 1)}
                        disabled={order.quantity <= 1 || freezeStatus.isFrozen}
                      >
                        −
                      </button>
                      <span>{order.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(order.order_id, order.quantity + 1)}
                        disabled={freezeStatus.isFrozen}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveOrder(order.order_id)}
                      disabled={freezeStatus.isFrozen}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="order-item-total">
                    Total: ₹{order.total.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
                   <div className="order-summary">
              {freezeStatus.isFrozen && discount.totalDiscount > 0 && (
                <>
                  <div className="summary-row">
                    <span>Community Discount ({discount.memberCount} members):</span>
                    <span>₹{discount.memberDiscountAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Volume Discount ({discount.itemCount} items):</span>
                    <span>₹{discount.itemDiscountAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row discount-total">
                    <span>Total Discount:</span>
                    <span>₹{discount.totalDiscountAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="summary-row total">
                <span>Subtotal:</span>
                <span>₹{yourTotal.toFixed(2)}</span>
              </div>
              {freezeStatus.isFrozen && discount.totalDiscount > 0 && (
                <div className="summary-row final-total">
                  <span>Final Total:</span>
                  <span>₹{(yourTotal - discount.totalDiscountAmount).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <button 
              className="place-order-btn"
              onClick={() => navigate('/consumer-dashboard')}
              disabled={freezeStatus.isFrozen}
            >
              + Place Your First Order
            </button>
          </div>
        )}
      </div>

      {/* Members Orders Section */}
      <div className="members-orders-section">
        <h2>Members Orders</h2>
        <div className="search-section">
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {membersOrders.length > 0 ? (
          <div className="members-grid">
            {membersOrders
              .filter(member => 
                member.member_name && 
                member.member_name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(member => (
                <div key={member.member_id} className="member-card">
                  <h3>{member.member_name}</h3>
                  <div className="member-meta">
                    <span className="status">
                      Status: <span className={member.status === 'Confirmed' ? 'confirmed' : 'pending'}>
                        {member.status}
                      </span>
                    </span>
                    <span className="orders-count">
                      Orders: {member.order_count}
                    </span>
                    {member.payment_method && (
                      <span className="payment-method">
                        Payment: {member.payment_method}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="no-members">No other members have placed orders yet</p>
        )}
      </div>

      <div className="payment-section">
        {!freezeStatus.isFrozen ? (
          <button className="payment-btn disabled" disabled>
            Orders Locked - Delivery Pending
          </button>
        ) : (
          <button className="payment-btn" onClick={handleProceedToPayment}>
            Proceed to Payment
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderPage;