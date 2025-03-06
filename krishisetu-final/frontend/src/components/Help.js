// src/components/ContactUs.js
import React, { useState } from "react";
import { submitContactForm } from "../services/contactApi"; // Import the API function
import "./styles.css";


const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await submitContactForm(formData); // Call the API
      alert(response.message || "Message sent successfully!");

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>Address: Krishisetu, Opp. to Hotel Empire, Anand Rao Circle, Bengaluru - 560009</p>
      <p>Contact: 9110823741</p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required></textarea>
        </div>
        <button type="submit">SUBMIT</button>
      </form>
      <div className="social-icons">
        <p>FOLLOW US ON</p>
        <span>📷</span> <span>📘</span> <span>🐦</span>
      </div>
    </div>
  );
};

export default ContactUs;
