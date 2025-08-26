import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogReg.css";

const FarmerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.phone_number.trim()) {
      setError("Phone number is required");
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/farmerregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Registration successful! Your Farmer ID: ${data.farmer_id}`);
        navigate("/farmer-login");
      } else {
        setError(data.message || "User already exists!");
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log-container">
      <main className="auth-container">
        <div className="auth-card">
          <h2>FARMER REGISTER</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name:</label>
                <input type="text" name="first_name" placeholder="Enter first name" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input type="text" name="last_name" placeholder="Enter last name" onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" placeholder="Enter email" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone No:</label>
                <input type="tel" name="phone_number" placeholder="Enter phone number" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password:</label>
                <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input type="password" name="confirm_password" placeholder="Re-enter password" onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <button onClick={() => navigate("/farmer-login")} className="link-button">
              Login here
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default FarmerRegister;
