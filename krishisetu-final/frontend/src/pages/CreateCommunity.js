import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3

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
    <div className="create-community">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      <div className="form-container">
        <h1>Create a New Community</h1>
        <p className="subtitle">Bring people together and start something amazing!</p>
        <input
          type="text"
          placeholder="Community Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleCreate}>Create Community</button>
      </div>
    </div>
  );
}

export default CreateCommunity;