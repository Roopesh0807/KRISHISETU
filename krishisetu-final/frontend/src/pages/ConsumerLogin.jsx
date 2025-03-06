import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogReg.css";

const ConsumerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    otp: "",
  });

  // const [isOtpSent, setIsOtpSent] = useState(false);
  // const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to send OTP
  // const sendOtp = async () => {
  //   if (!formData.emailOrPhone) {
  //     alert("Please enter your Email or Phone number!");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("http://localhost:5000/api/send-otp", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ identifier: formData.emailOrPhone }),
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       alert("✅ OTP sent successfully!");
  //       setIsOtpSent(true);
  //     } else {
  //       alert(`⚠️ Error: ${data.message}`);
  //     }
  //   } catch (error) {
  //     alert("❌ Error connecting to server. Please try again later.");
  //   }
  // };

  // Function to verify OTP
  // const verifyOtp = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/verify-otp", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ identifier: formData.emailOrPhone, otp: formData.otp }),
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       alert("✅ OTP verified successfully!");
  //       setIsVerified(true);
  //     } else {
  //       alert("⚠️ Invalid OTP. Please try again.");
  //     }
  //   } catch (error) {
  //     alert("❌ Error verifying OTP.");
  //   }
  //  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!isVerified) {
    //   alert("⚠️ Please verify your email or phone number first!");
    //   return;
    // }

    try {
      const response = await fetch("http://localhost:5000/api/consumerlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Login Successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/consumer-dashboard"), 1000);
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
          <h2>CONSUMER LOGIN</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or Phone Number:</label>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Enter your email or phone number"
                onChange={handleChange}
                required
              />
              {/* <button type="button" className="verify-button" onClick={sendOtp}>
                Send OTP
              </button> */}
            </div>

            {/* {isOtpSent && (
              <div className="form-group">
                <label>Enter OTP:</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  onChange={handleChange}
                  required
                />
                <button type="button" className="verify-button" onClick={verifyOtp}>
                  Verify OTP
                </button>
              </div>
            )} */}


            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-button">Login</button>
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
