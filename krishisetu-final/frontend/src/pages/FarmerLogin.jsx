import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./LogReg.css";

const FarmerLogin = () => {
  const navigate = useNavigate();
  const { loginFarmer } = useContext(AuthContext);
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.emailOrPhone || !formData.password) {
        throw new Error("Please fill in all fields");
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/farmerlogin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
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
      
      if (!payload.farmer_id || !payload.exp) {
        throw new Error("Invalid token payload");
      }

      if (payload.exp * 1000 < Date.now()) {
        throw new Error("Session expired. Please login again");
      }

      const farmerData = {
        token: data.token,
        farmer_id: data.farmer_id || payload.farmer_id,
        full_name: data.full_name || payload.full_name || "",
        email: data.email || payload.email || "",
        phone_number: data.phone_number || payload.phone_number || "",
        first_name: data.first_name || payload.first_name || "",
        last_name: data.last_name || payload.last_name || "",
      };

      console.log("✅ Logged-in farmer:", farmerData);

      loginFarmer(farmerData);
      // Update these lines to match your local storage
      localStorage.setItem("farmerID", data.farmer_id);
      localStorage.setItem("farmerName", data.full_name);
      localStorage.setItem("auth", JSON.stringify({
        token: data.token,
        farmer_id: data.farmer_id,
        expiresAt: payload.exp * 1000,
      }));

      navigate("/farmer-dashboard", {
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
          <h2>FARMER LOGIN</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or Phone:</label>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Enter email or phone"
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
                placeholder="Enter password"
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
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
                onClick={() => navigate("/farmer-register")}
                className="link-button"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerLogin;