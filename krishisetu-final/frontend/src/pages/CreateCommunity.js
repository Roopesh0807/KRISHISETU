import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
import "../styles/CreateCommunity.css";

function CreateCommunity() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/community/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, adminId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create community");
      }

      const data = await response.json();
      alert("Community created successfully!");
      localStorage.setItem("userId", userId);
      navigate("/community-details", {
        state: { showInstructions: true, communityId: data.id }, // Fix here
      });
    } catch (error) {
      console.error("Error creating community:", error);
      setError(error.message || "An error occurred while creating the community.");
    }
  };

  return (
    <div className="krishi-create-community">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      <div className="krishi-form-container">
        <div className="krishi-form-header">
          <h1>Create a New Community</h1>
          <p className="krishi-subtitle">Bring people together and start something amazing!</p>
        </div>
        <div className="krishi-form-body">
          <div className="krishi-input-group">
            <label htmlFor="name">Community Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter community name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="krishi-input"
            />
          </div>
          <div className="krishi-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="krishi-input"
            />
          </div>
          <div className="krishi-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="krishi-input"
            />
          </div>
          <div className="krishi-input-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="krishi-input"
            />
          </div>
          {error && <p className="krishi-error-message">{error}</p>}
          <button onClick={handleCreate} className="krishi-create-button">
            Create Community
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCommunity;