import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import "./Navbar1.css";
import background from "../assets/background.jpg";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="hero-section">
        <img src={background} alt="Background" className="hero-image" />
        <button className="login-btn" onClick={() => navigate("/LoginPage")}>
          Log in
        </button>
      </div>
    </div>
  );
};

export default Login;