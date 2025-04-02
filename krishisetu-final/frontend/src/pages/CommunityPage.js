import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import "../styles/CommunityPage.css";

function CommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [upcomingOrders, setUpcomingOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [communityRes, membersRes, ordersRes] = await Promise.all([
          fetch(`http://localhost:5000/api/community/${communityId}`),
          fetch(`http://localhost:5000/api/community/${communityId}/members`),
          fetch(`http://localhost:5000/api/community/${communityId}/orders`)
        ]);

        const [communityData, membersData, ordersData] = await Promise.all([
          communityRes.json(),
          membersRes.json(),
          ordersRes.json()
        ]);

        setCommunity(communityData);
        setMembers(membersData);
        setUpcomingOrders(ordersData);
        setIsAdmin(communityData.admin_id === localStorage.getItem("userId"));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/remove-member/${memberId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error(await response.text());

      setMembers(members.filter((member) => member.id !== memberId));
      alert("Member removed successfully!");
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="krishi-commpage-loading">
        <Navbar3 />
        <div className="krishi-commpage-loading-content">
          <div className="krishi-commpage-spinner"></div>
          <p>Loading community details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="krishi-commpage-container">
      <Navbar3 />
      
      <div className="krishi-commpage-content">
        {/* Community Header */}
        <div className="krishi-commpage-header">
          <div className="krishi-commpage-header-content">
            <div className="krishi-commpage-title-wrapper">
              <h1 className="krishi-commpage-title">{community?.name}</h1>
              {isAdmin && (
                <span className="krishi-commpage-admin-badge">
                  <i className="fas fa-crown"></i> Admin
                </span>
              )}
            </div>
            <p className="krishi-commpage-subtitle">Community Dashboard</p>
            
            <div className="krishi-commpage-meta">
              <div className="krishi-commpage-meta-item">
                <i className="fas fa-user-shield"></i>
                <span>Admin: {community?.admin_name}</span>
              </div>
              <div className="krishi-commpage-meta-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{community?.address}</span>
              </div>
              <div className="krishi-commpage-meta-item">
                <i className="fas fa-calendar-day"></i>
                <span>{new Date(community?.delivery_date).toLocaleDateString()} at {community?.delivery_time}</span>
              </div>
            </div>
          </div>
          
          <div className="krishi-commpage-header-actions">
            <button 
              onClick={() => navigate("/order-page")} 
              className="krishi-commpage-action-btn krishi-commpage-action-primary"
            >
              <i className="fas fa-shopping-basket"></i> Place Order
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate(`/community/${communityId}/add-member`)}
                className="krishi-commpage-action-btn krishi-commpage-action-secondary"
              >
                <i className="fas fa-user-plus"></i> Add Member
              </button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="krishi-commpage-tabs">
          <button 
            className={`krishi-commpage-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <i className="fas fa-users"></i> Members ({members.length})
          </button>
          <button 
            className={`krishi-commpage-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-clipboard-list"></i> Upcoming Orders ({upcomingOrders.length})
          </button>
          <button 
            className={`krishi-commpage-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i> Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="krishi-commpage-tab-content">
          {activeTab === 'members' && (
            <>
              <div className="krishi-commpage-search-container">
                <div className="krishi-commpage-search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search members by name..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <div className="krishi-commpage-members-count">
                  {filteredMembers.length} {filteredMembers.length === 1 ? 'Member' : 'Members'}
                </div>
              </div>

              {filteredMembers.length > 0 ? (
                <div className="krishi-commpage-members-grid">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="krishi-commpage-member-card">
                      <div className="krishi-commpage-member-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="krishi-commpage-member-details">
                        <h3>{member.name}</h3>
                        <p><i className="fas fa-phone"></i> {member.phone}</p>
                        <p><i className="fas fa-shopping-basket"></i> {member.order_count || 0} orders</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="krishi-commpage-member-remove"
                        >
                          <i className="fas fa-user-minus"></i> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="krishi-commpage-no-members">
                  <i className="fas fa-users-slash"></i>
                  <p>No members found matching your search</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <div className="krishi-commpage-orders-container">
              {upcomingOrders.length > 0 ? (
                <div className="krishi-commpage-orders-list">
                  {upcomingOrders.map((order) => (
                    <div key={order.id} className="krishi-commpage-order-card">
                      <div className="krishi-commpage-order-header">
                        <h3>{order.member_name}</h3>
                        <span className={`krishi-commpage-order-status ${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="krishi-commpage-order-details">
                        <p><i className="fas fa-box"></i> {order.items.length} items</p>
                        <p><i className="fas fa-rupee-sign"></i> {order.total_amount.toFixed(2)}</p>
                        <p><i className="fas fa-calendar-alt"></i> {new Date(order.delivery_date).toLocaleDateString()}</p>
                      </div>
                      <div className="krishi-commpage-order-actions">
                        <button className="krishi-commpage-order-view">
                          <i className="fas fa-eye"></i> View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="krishi-commpage-no-orders">
                  <i className="fas fa-clipboard"></i>
                  <p>No upcoming orders found</p>
                  <button 
                    onClick={() => navigate("/order-page")} 
                    className="krishi-commpage-action-btn krishi-commpage-action-primary"
                  >
                    <i className="fas fa-shopping-basket"></i> Place First Order
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="krishi-commpage-settings-container">
              {isAdmin ? (
                <div className="krishi-commpage-settings-form">
                  <h3><i className="fas fa-cog"></i> Community Settings</h3>
                  
                  <div className="krishi-commpage-setting-group">
                    <label>Community Name</label>
                    <input type="text" defaultValue={community?.name} />
                  </div>
                  
                  <div className="krishi-commpage-setting-group">
                    <label>Delivery Address</label>
                    <input type="text" defaultValue={community?.address} />
                  </div>
                  
                  <div className="krishi-commpage-datetime-settings">
                    <div className="krishi-commpage-setting-group">
                      <label>Next Delivery Date</label>
                      <input 
                        type="date" 
                        defaultValue={community?.delivery_date} 
                      />
                    </div>
                    <div className="krishi-commpage-setting-group">
                      <label>Delivery Time</label>
                      <input 
                        type="time" 
                        defaultValue={community?.delivery_time} 
                      />
                    </div>
                  </div>
                  
                  <div className="krishi-commpage-settings-actions">
                    <button className="krishi-commpage-action-btn krishi-commpage-action-primary">
                      <i className="fas fa-save"></i> Save Changes
                    </button>
                    <button className="krishi-commpage-action-btn krishi-commpage-action-danger">
                      <i className="fas fa-trash"></i> Delete Community
                    </button>
                  </div>
                </div>
              ) : (
                <div className="krishi-commpage-no-access">
                  <i className="fas fa-lock"></i>
                  <h3>Admin Access Required</h3>
                  <p>Only community administrators can access these settings</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunityPage;