import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import "./Navbar1.css";
import ContactUsPage from "./ScrollSection.js"; // Import the scrollsection.js (or about.js) component
import ContactUs from "./Contact.js"; // Import the contact.js component

const Home = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true); // Control cursor visibility
  const fullText = "WEELCOME TO KRISHISETU"; // Corrected spelling

  useEffect(() => {
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setText((prev) => prev + fullText.charAt(index));
        index+=1;
      } else {
        clearInterval(typingInterval);
        setShowCursor(false); // Hide cursor after typing is complete
      }
    }, 150); // Typing speed (adjust as needed)

    return () => clearInterval(typingInterval);
  }, [fullText]); // Add fullText as a dependency

  return (
    <div>
      {/* Home Section */}
      <section id="home" className="hero-section">
        <div className="hero-text">
          <h1>
            {text}
            {showCursor && <span className="cursor">|</span>} {/* Blinking cursor */}
          </h1>
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