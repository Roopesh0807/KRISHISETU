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

// export default ConsumerLogin;
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./LogReg.css";

const ConsumerLogin = () => {
  const navigate = useNavigate();
  const { loginConsumer } = useContext(AuthContext);

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
<<<<<<< HEAD
    setLoading(true);
    setError("");
  
=======

>>>>>>> d46bb94e03c449675e53d15e27842cafd1815b28
    try {
      const response = await fetch("http://localhost:5000/api/consumerlogin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
=======
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        console.log("✅ Logged in Consumer:", data.consumer);

        // Store the consumer object in localStorage
        localStorage.setItem("consumer", JSON.stringify(data.consumer));

        // Store the consumerId in localStorage
        localStorage.setItem("consumerId", data.consumer.consumer_id); // ✅ Store consumerId

        // Call the loginConsumer function from AuthContext
        loginConsumer(data.consumer);

        alert("✅ Login Successful! Redirecting...");
        setTimeout(() => navigate("/consumer-dashboard"), 1000);
      } else {
        alert(`⚠️ Login Failed: ${data.message}`);
>>>>>>> d46bb94e03c449675e53d15e27842cafd1815b28
      }

      // Verify token exists
      if (!data.token) {
        throw new Error("No authentication token received");
      }

      // Extract payload from token
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      
      // Validate token structure
      if (!payload.consumer_id) {
        throw new Error("Invalid token format - missing consumer ID");
      }

      // Prepare consumer data for context
      const consumerData = {
        token: data.token,
        consumer_id: payload.consumer_id,
        email: data.consumer?.email,
        phone_number: data.consumer?.phone_number
      };

      // Call AuthContext login function
      loginConsumer(consumerData, formData.rememberMe);
      
      // Redirect to dashboard
      navigate("/consumer-dashboard");
  
    } catch (error) {
      console.error("Login Error:", error);
      setError(
        error.message.includes("credentials") 
          ? "Invalid email/phone or password" 
          : error.message
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
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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