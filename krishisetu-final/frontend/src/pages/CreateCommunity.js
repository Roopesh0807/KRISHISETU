import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import { useAuth } from '../context/AuthContext';
import "../styles/CreateCommunity.css";

function CreateCommunity() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
   const { consumer } = useAuth();

   
  const consumerId = localStorage.getItem("consumerId");

  const handleCreate = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!name || !password || !consumerId) {
      setError("All fields are required!");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("http://localhost:5000/api/community/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
           'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({ name, password, consumerId }),
       
      });

      const data = await response.json();
      if (response.ok) {
        navigate("/community-details", { 
          state: { 
            showInstructions: true, 
            communityId: data.id,
            communityName: name
          } 
        });
      } else {
        setError(data.error || "Error creating community");
      }
    } catch (error) {
      console.error("Error creating community:", error);
      setError("An error occurred while creating the community.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="ks-create-root">
      <Navbar3 />
      
      <div className="ks-create-main">
        <div className="ks-form-panel">
          <div className="ks-form-header">
            <h1>
              <span className="ks-accent-text">Create</span> Community
            </h1>
            <p className="ks-form-description">
              Establish a new local network for farmers and consumers
            </p>
          </div>

          <div className="ks-form-content">
            <div className="ks-input-group">
              <label>Community Name</label>
              <div className="ks-input-wrapper">
                <i className="fas fa-users ks-input-icon"></i>
                <input
                  type="text"
                  placeholder="e.g. Green Valley Collective"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="ks-input-group">
              <label>Password</label>
              <div className="ks-input-wrapper">
                <i className="fas fa-lock ks-input-icon"></i>
                <input
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="ks-input-group">
              <label>Confirm Password</label>
              <div className="ks-input-wrapper">
                <i className="fas fa-lock ks-input-icon"></i>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="ks-error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <button 
              onClick={handleCreate}
              disabled={isCreating}
              className="ks-submit-btn"
            >
              {isCreating ? (
                <>
                  <i className="fas fa-spinner ks-spin"></i> Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-leaf"></i> Create Community
                </>
              )}
            </button>
          </div>

          <div className="ks-form-footer">
            <p>Already have a community? <span onClick={() => navigate('/join-community')}>Join now</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCommunity;