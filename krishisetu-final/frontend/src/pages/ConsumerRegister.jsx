import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogReg.css";

const ConsumerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("❌ Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/consumerregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Server Response:", data);

      if (data.success) {
        alert(`✅ Registration successful! Your Consumer ID: ${data.consumer_id}`);
        navigate("/consumer-login");
      } else {
        alert(`⚠️ ${data.message || "User already exists!"}`);
      }
    } catch (error) {
      alert("❌ Error connecting to server.");
    }
  };

  return (
    <div className="log-container">
      <main className="auth-container">
        <div className="auth-card">
          <h2>CONSUMER REGISTER</h2>
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

            <button type="submit" className="auth-button">Register</button>
          </form>
          <p></p>
          <p>
            Already have an account?{" "}
            <button onClick={() => navigate("/consumer-login")} className="link-button">
              Login here
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ConsumerRegister;