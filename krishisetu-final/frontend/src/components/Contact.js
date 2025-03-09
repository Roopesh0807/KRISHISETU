import React, { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"; // Import icons
import axios from "axios"; // Import axios for API calls
import "./styles.css";

const ContactUs = () => {
  const [state, handleSubmit] = useForm("xbldnpvk"); // Replace with your Formspree form ID
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable the submit button

    // Submit to Formspree
    await handleSubmit(e);

    if (state.succeeded) {
      try {
        // Submit to backend
        const response = await axios.post("http://localhost:5000/api/contact", formData);
        console.log("Data saved to database:", response.data);

        // Reset form and show success message
        setFormData({ name: "", email: "", phone: "", message: "" });
        alert("Message sent and saved successfully!");
      } catch (error) {
        console.error("Error saving data to database:", error.response || error.message);
        alert("Message sent, but failed to save to database. Please try again.");
      } finally {
        setIsSubmitting(false); // Re-enable the submit button
      }
    } else {
      setIsSubmitting(false); // Re-enable the submit button if Formspree submission fails
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>Address: Krishisetu, Opp. to Hotel Empire, Anand Rao Circle, Bengaluru - 560009</p>
      <p>Contact: 9110823741</p>

      {/* Contact Form */}
      <form className="contact-form" onSubmit={onSubmit}>
        {/* Name Field */}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>

        {/* Phone Field */}
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />
        </div>

        {/* Message Field */}
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Enter your message"
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        {/* Submit Button with Loading Spinner */}
        <button type="submit" disabled={state.submitting || isSubmitting}>
          {isSubmitting ? (
            <>
              Submitting <span className="loading-spinner"></span>
            </>
          ) : (
            "SUBMIT"
          )}
        </button>
      </form>

      {/* Social Media Icons */}
      <div className="social-icons">
        <p>FOLLOW US ON</p>
        <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
          <FaFacebook className="icon" />
        </a>
        <a href="https://www.instagram.com/yourpage" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="icon" />
        </a>
        <a href="https://twitter.com/yourpage" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="icon" />
        </a>
      </div>
    </div>
  );
};

export default ContactUs;