import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import "./LogReg.css";

const ConsumerLogin = () => {
  const navigate = useNavigate();
  const { loginConsumer } = useContext(AuthContext);
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      if (!formData.emailOrPhone || !formData.password) {
        throw new Error("Please fill in all fields");
      }
  
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/consumerlogin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone.trim(),
          password: formData.password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
  
      if (!data?.token) {
        throw new Error("Authentication token missing in response");
      }
  
      // Decode token
      const payload = JSON.parse(atob(data.token.split(".")[1]));
  
      if (!payload.consumer_id || !payload.exp) {
        throw new Error("Invalid token payload");
      }
  
      if (payload.exp * 1000 < Date.now()) {
        throw new Error("Session expired. Please login again");
      }
  
      // Construct consumerData from token and response
      const consumerData = {
        token: data.token,
        consumer_id: data.consumer_id,
        email: data.email || payload.email || "",
        phone_number: data.phone_number || payload.phone_number || "",
        first_name: data.first_name || payload.first_name || "",
        last_name: data.last_name || payload.last_name || "",
        full_name: data.full_name || payload.full_name || "",
      };
  
      console.log("✅ Logged-in consumer:", consumerData);
  
      loginConsumer(consumerData);
      localStorage.setItem("consumer", JSON.stringify(consumerData));
      localStorage.setItem("auth", JSON.stringify({
        token: data.token,
        consumer_id: data.consumer_id,
        expiresAt: payload.exp * 1000,
      }));
      
      // Store consumer-specific data including consumerId
      const userCommunityData = {
          userCommunityId: data.community_id || "COMM-1757765440431-467",
          userEmail: consumerData.email,
          userName: consumerData.full_name || consumerData.first_name,
          consumerId: consumerData.consumer_id
      };
      localStorage.setItem("user", JSON.stringify(userCommunityData));

      navigate("/consumer-dashboard", {
        replace: true,
        state: { from: location.state?.from || "/" },
      });
  
    } catch (error) {
      console.error("Login Error:", error);
      setError(
        error.message.includes("credentials") ||
        error.message.includes("Invalid") ||
        error.message.includes("expired")
          ? error.message
          : "Login failed. Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="log-container">
      <main className="auth-container">
        <div className="auth-card">
          <h2>CONSUMER LOGIN</h2>
          
          {error && <div className="error-message">{error}</div>}

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
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>

            {/* <div className="form-group remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div> */}

            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <button 
                onClick={() => navigate("/consumer-register")} 
                className="link-button"
              >
                Register here
              </button>
            </p>
            {/* <button 
              onClick={() => navigate("/forgot-password")} 
              className="link-button"
            >
              Forgot password?
            </button> */}
            
        </div>
      </div>
    </main>
  </div>
  );
};

export default ConsumerLogin;