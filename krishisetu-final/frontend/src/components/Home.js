import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import "./Navbar1.css";
import ContactUsPage from "./ScrollSection.js";
import ContactUs from "./Contact.js";

const Home = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "WEELCOME TO KRISHISETU";

  useEffect(() => {
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setText((prev) => prev + fullText.charAt(index));
        index += 1;
      } else {
        clearInterval(typingInterval);
        setShowCursor(false);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, [fullText]);

  return (
    <div className="ks-home-container">
      {/* Home Section */}
      <section id="home" className="ks-hero-section">
        <div className="ks-hero-content">
          <h1 className="ks-hero-title">
            {text}
            {showCursor && <span className="ks-type-cursor">|</span>}
          </h1>
          <p className="ks-hero-subtitle">Revolutionizing the Farm-to-table journey</p>
          <button className="ks-hero-btn" onClick={() => navigate("/LoginPage")}>
            Log in
          </button>
        </div>
      </section>

      {/* Scroll Section (About Us) */}
      <section id="about" className="ks-about-section">
        <ContactUsPage />
      </section>

      {/* Contact Section */}
      <section id="contact" className="ks-contact-section">
        <ContactUs />
      </section>
    </div>
  );
};

export default Home;