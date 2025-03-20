import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ✅ Import AuthContext
import "./LogReg.css";

const ConsumerLogin = () => {
  const navigate = useNavigate();
  const { loginConsumer } = useContext(AuthContext); // ✅ Use AuthContext

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [loading] = useState(false); // ✅ Prevent multiple clicks

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:5000/api/consumerlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });
    
  
      const data = await response.json();
      console.log("API Response:", data);
  
      if (data.success) {
        console.log("✅ Logged in Consumer:", data.consumer);
  
        localStorage.setItem("consumer", JSON.stringify(data.consumer));
        loginConsumer(data.consumer);
  
        alert("✅ Login Successful! Redirecting...");
        setTimeout(() => navigate("/consumer-dashboard"), 1000);
      } else {
        alert(`⚠️ Login Failed: ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error connecting to server.");
    }
  };
  
  return (
    <div className="log-container">
      <main className="auth-container">
        <div className="auth-card">
          <h2>CONSUMER LOGIN</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or Phone Number:</label>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Enter your email or phone number"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p>
            Don't have an account?{" "}
            <button onClick={() => navigate("/consumer-register")} className="link-button">
              Register here
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ConsumerLogin;
