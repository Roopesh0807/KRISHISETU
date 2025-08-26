import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti"; // For celebration effect
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null); // Stores success message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessData(null);
  
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/consumerregister`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Add this if your backend expects it:
         
        },
        // Add if using cookies/sessions:
        // credentials: "include", 
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          confirm_password: formData.confirm_password,
        }),
      });
  
      // First check response status before parsing JSON
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
  
      const data = await response.json();
  
      setSuccessData({
        message: `✅ Registration Successfully Done!,🎉 Welcome to KrishiSetu, ${formData.first_name} ${formData.last_name}!`,
        consumerId: data.consumer_id,
      });
      
      setTimeout(() => navigate("/consumer-login"), 2000);
    } catch (error) {
      console.error("Registration Error:", error);
      setError(error.message || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setSuccessData(null);
  
  //   if (!validateForm()) return;
  
  //   setLoading(true);
  
  //   try {
  //     const response = await fetch("http://localhost:5000/api/consumerregister", {
  //       method: "POST",
  //       credentials: "include", // Important for session-based systems
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Accept": "application/json",
  //       },
  //       body: JSON.stringify({
  //         first_name: formData.first_name.trim(),
  //         last_name: formData.last_name.trim(),
  //         email: formData.email.trim(),
  //         phone_number: formData.phone_number.trim(),
  //         password: formData.password,
  //         confirm_password: formData.confirm_password,
  //       }),
  //     });
  
  //     const data = await response.json();
  
  //     if (!response.ok) {
  //       // Handle known errors
  //       if (response.status === 409) {
  //         throw new Error(data.message || "User already exists");
  //       } else if (response.status === 400) {
  //         throw new Error(data.message || "Validation failed");
  //       } else {
  //         throw new Error(data.message || `Registration failed (${response.status})`);
  //       }
  //     }
  
  //     setSuccessData({
  //       message: `✅ Registration Successful! 🎉 Welcome to KrishiSetu, ${formData.first_name} ${formData.last_name}!`,
  //       consumerId: data.consumer_id,
  //     });
  
  //     // Navigate after delay
  //     setTimeout(() => navigate("/consumer-login"), 3000);
  //   } catch (error) {
  //     console.error("Registration Error:", error);
  //     setError(
  //       error.message.includes("NetworkError") || error.message.includes("fetch")
  //         ? "Server not reachable. Please try again later."
  //         : error.message || "Registration failed"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  return (
    <div className="log-container">
      <main className="auth-container">
        <div className="auth-card">
          <h2>CONSUMER REGISTER</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone No *</label>
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="Enter phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
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

      {/* Success Popup */}
      {successData && (
        <div className="success-popup">
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <div className="popup-content">
            <div className="checkmark-circle">✔️</div>
            <h2>{successData.message}</h2>
            <p>
              <strong>Consumer ID:</strong> {successData.consumerId}
            </p>
            <p>Redirecting to Login Page...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerRegister;
