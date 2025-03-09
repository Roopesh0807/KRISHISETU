import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import "./Navbar1.css";
import ContactUsPage from "./ScrollSection.js"; // Import the scrollsection.js (or about.js) component
import ContactUs from "./Contact.js"; // Import the contact.js component

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Home Section */}
      <section id="home" className="hero-section">
        <div className="hero-text">
          <h1>WELCOME TO KRISHISETU</h1>
          <p>Revolutionizing the Farm-to-table journey</p>
          <button className="login-btn" onClick={() => navigate("/LoginPage")}>
            Log in
          </button>
        </div>
      </section>

      {/* Scroll Section (About Us) */}
      <section id="about">
        <ContactUsPage />
      </section>

      {/* Contact Section */}
      <section id="contact">
        <ContactUs />
      </section>
    </div>
  );
};

export default Home;