// import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import "./LogReg.css";

// const ConsumerLogin = () => {
//   const navigate = useNavigate();
//   const { loginConsumer } = useContext(AuthContext);

//   const [formData, setFormData] = useState({
//     emailOrPhone: "",
//     password: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
  
//     try {
//       const response = await fetch("http://localhost:5000/api/consumerlogin", {
//         method: "POST",
//         credentials: "include", // ✅ Important for session persistence
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
  
//       const data = await response.json();
//       console.log("🔹 Full API Response:", data);
  
//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }
  

//       // Verify token structure
//       const payload = JSON.parse(atob(data.token.split('.')[1]));
//       if (!payload.consumer_id) {
//         localStorage.clear();
//         throw new Error("Invalid token format");
//       }
//       let fullName = payload.name || "";

//     // 4. If name not in token, try localStorage/sessionStorage
//     if (!fullName) {
//       fullName = localStorage.getItem("consumer_name") || 
//                 sessionStorage.getItem("consumer_name") 
//     }

     
//       localStorage.setItem("token", data.token);
//       sessionStorage.setItem("consumer_id", payload.consumer_id);
//     sessionStorage.setItem("consumer_name", fullName);
//       localStorage.setItem("consumer", JSON.stringify(data.consumer));
//       loginConsumer(data.consumer);
  
//       console.log("Stored consumer:", {
//         name: fullName,
//         id: data.consumer.consumer_id
//       });
//       navigate("/consumer-dashboard");
  
//     } catch (error) {
//       console.error("❌ Login Error:", error);
//       alert(error.message.includes("credentials") 
//         ? "Invalid email/phone or password" 
//         : error.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="log-container">
//       <main className="auth-container">
//         <div className="auth-card">
//           <h2>CONSUMER LOGIN</h2>
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Email or Phone Number:</label>
//               <input
//                 type="text"
//                 name="emailOrPhone"
//                 placeholder="Enter your email or phone number"
//                 value={formData.emailOrPhone}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label>Password:</label>
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <button type="submit" className="auth-button" disabled={loading}>
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           <p>
//             Don't have an account?{" "}
//             <button onClick={() => navigate("/consumer-register")} className="link-button">
//               Register here
//             </button>
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default ConsumerLogin;import React, { useState, useContext } from "react";
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");
  
  //   try {
  //     const response = await fetch("http://localhost:5000/api/consumerlogin", {
  //       method: "POST",
  //       credentials: "include",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         emailOrPhone: formData.emailOrPhone,
  //         password: formData.password
  //       }),
  //     });
  
  //     const data = await response.json();
  //     console.log("API Response:", data);

  //     if (!response.ok) {
  //       throw new Error(data.message || "Login failed");
  //     }
  
  //     if (!data.token) {
  //       throw new Error("No authentication token received");
  //     }
  
  //     const payload = JSON.parse(atob(data.token.split('.')[1]));
      
  //     if (!payload.consumer_id) {
  //       throw new Error("Invalid token format - missing consumer ID");
  //     }
  
  //     const consumerData = {
  //       token: data.token,
  //       consumer_id: payload.consumer_id,
  //       email: data.email || payload.email || "",
  //       phone_number: data.phone_number || payload.phone_number || "",
  //       first_name: data.first_name || payload.first_name || "",
  //       last_name: data.last_name || payload.last_name || "",
  //     };
  
  //     localStorage.setItem("consumer", JSON.stringify(consumerData));
  //     localStorage.setItem("consumerId", consumerData.consumer_id);
  //     localStorage.setItem("userEmail", consumerData.email);
  //     localStorage.setItem("userName", `${consumerData.first_name} ${consumerData.last_name}`);
  
  //     loginConsumer(consumerData);
  
  //     alert("✅ Login Successful! Redirecting...");
  //     setTimeout(() => navigate("/consumer-dashboard"), 1000);
  
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     setError(
  //       error.message.includes("credentials") 
  //         ? "Invalid email/phone or password" 
  //         : error.message
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  
  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");
  
  //   try {
  //     // Input validation
  //     if (!formData.emailOrPhone || !formData.password) {
  //       throw new Error("Please fill in all fields");
  //     }
  
  //     const response = await fetch("http://localhost:5000/api/consumerlogin", {
  //       method: "POST",
  //       credentials: "include", // For session cookies
  //       headers: { 
  //         "Content-Type": "application/json",
  //         "Accept": "application/json"
  //       },
  //       body: JSON.stringify({
  //         emailOrPhone: formData.emailOrPhone.trim(),
  //         password: formData.password
  //       }),
  //     });
  
  //     const data = await response.json();
  
  //     if (!response.ok) {
  //       // Handle different HTTP error statuses
  //       if (response.status === 401) {
  //         throw new Error("Invalid credentials");
  //       } else if (response.status === 400) {
  //         throw new Error(data.message || "Validation error");
  //       } else {
  //         throw new Error(data.message || `Login failed (${response.status})`);
  //       }
  //     }
  
  //     // Token validation
  //     if (!data?.token) {
  //       throw new Error("Authentication token missing in response");
  //     }
  
  //     // Verify token structure
  //     let payload;
  //     try {
  //       payload = JSON.parse(atob(data.token.split('.')[1]));
  //     } catch (parseError) {
  //       throw new Error("Invalid token format");
  //     }
  
  //     // Required fields check
  //     if (!payload.consumer_id || !payload.exp) {
  //       throw new Error("Invalid token payload");
  //     }
  
  //     // Check token expiration
  //     if (payload.exp * 1000 < Date.now()) {
  //       throw new Error("Session expired. Please login again");
  //     }
  
  //     // // Prepare consumer data
  //     // const consumerData = {
  //     //   token: data.token,
  //     //   consumer_id: payload.consumer_id,
  //     //   email: payload.email || "",
  //     //   phone_number: payload.phone_number || "",
  //     //   name: payload.name || `${payload.first_name || ""} ${payload.last_name || ""}`.trim(),
  //     //   // Add any other necessary fields from payload
  //     // };
  //     const consumerData = {
  //       token: data.token,
  //       consumer_id: payload.consumer_id,
  //       email: payload.email || data.email || "",
  //       phone_number: payload.phone_number || data.phone_number || "",
  //       first_name: payload.first_name || data.first_name || "",
  //       last_name: payload.last_name || data.last_name || "",
  //       full_name: payload.full_name || 
  //                 `${payload.first_name || data.first_name || ""} ${payload.last_name || data.last_name || ""}`.trim(),
  //       ...data // include any additional fields
  //     };
  
  //     // Store authentication data
  //     localStorage.setItem("auth", JSON.stringify({
  //       token: data.token,
  //       consumer_id: payload.consumer_id,
  //       expiresAt: payload.exp * 1000 // Convert to milliseconds
  //     }));
  
  //     // Update context/auth state
  //     loginConsumer(consumerData);
  
  //     // Successful login handling
  //     console.log("Login successful for consumer:", payload.consumer_id);
  //     navigate("/consumer-dashboard", { 
  //       replace: true,
  //       state: { from: location.state?.from || "/" }
  //     });
  
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     setError(
  //       error.message.includes("credentials") || 
  //       error.message.includes("Invalid") ||
  //       error.message.includes("expired")
  //         ? error.message
  //         : "Login failed. Please try again later"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      if (!formData.emailOrPhone || !formData.password) {
        throw new Error("Please fill in all fields");
      }
  
      const response = await fetch("http://localhost:5000/api/consumerlogin", {
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

            <div className="form-group remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
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
                onClick={() => navigate("/consumer-register")} 
                className="link-button"
              >
                Register here
              </button>
            </p>
            <button 
              onClick={() => navigate("/forgot-password")} 
              className="link-button"
            >
              Forgot password?
            </button>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsumerLogin;