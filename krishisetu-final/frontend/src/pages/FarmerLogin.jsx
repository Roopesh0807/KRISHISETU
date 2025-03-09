import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogReg.css";

const FarmerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/farmerlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Login Successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/farmer-dashboard"), 1000);
      } else {
        alert(`⚠️ Login Failed: ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error connecting to server. Please try again later.");
    }
  };

  return (
    <div className="log-container">
      <main className="auth-container">
        <div className="auth-card">
          <h2>FARMER LOGIN</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or Phone:</label>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Enter email or phone"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-button">Login</button>
          </form>
          <p>
            </p>
            <p>
            Don't have an account?{" "}
            <button onClick={() => navigate("/farmer-register")} className="link-button">
              Register here
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default FarmerLogin;