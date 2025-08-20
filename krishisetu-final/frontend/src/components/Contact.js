import React, { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import "./styles.css";

const ContactUs = () => {
  const [state, handleSubmit] = useForm("xbldnpvk");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Submit to Formspree
      await handleSubmit(e);
      
      // Save to database
      const response = await axios.post("${process.env.REACT_APP_API_URL}/api/contact", formData);

      console.log("Message saved to database:", response.data);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error:", error.response || error);
      alert(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ks-contact-container">
      <div className="ks-contact-header">
        <h2 className="ks-contact-title">Get in Touch</h2>
        <p className="ks-contact-subtitle">We'd love to hear from you</p>
      </div>

      <div className="ks-contact-content">
        <div className="ks-contact-info">
          <div className="ks-contact-info-item">
            <FaMapMarkerAlt className="ks-contact-icon" />
            <div>
              <h3 className="ks-contact-info-title">Our Address</h3>
              <p className="ks-contact-info-text">
                Krishisetu, Opp. to Hotel Empire, Anand Rao Circle, Bengaluru - 560009
              </p>
            </div>
          </div>

          <div className="ks-contact-info-item">
            <FaPhoneAlt className="ks-contact-icon" />
            <div>
              <h3 className="ks-contact-info-title">Phone Number</h3>
              <p className="ks-contact-info-text">+91 9110823741</p>
            </div>
          </div>

          <div className="ks-contact-info-item">
            <MdEmail className="ks-contact-icon" />
            <div>
              <h3 className="ks-contact-info-title">Email Address</h3>
              <p className="ks-contact-info-text">info@krishisetu.com</p>
            </div>
          </div>

          <div className="ks-contact-social">
            <p className="ks-social-title">Follow Us On</p>
            <div className="ks-social-icons">
              <a href="https://www.facebook.com/krishisetu" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="ks-social-icon" />
              </a>
              <a href="https://www.instagram.com/krishisetu" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="ks-social-icon" />
              </a>
              <a href="https://twitter.com/krishisetu" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="ks-social-icon" />
              </a>
            </div>
          </div>
        </div>

        <form className="ks-contact-form" onSubmit={onSubmit}>
          {submitSuccess && (
            <div className="ks-alert-success">
              Thank you! Your message has been sent successfully.
            </div>
          )}

          <div className="ks-form-group">
            <label className="ks-form-label">Your Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="ks-form-input"
              placeholder="Enter your name"
            />
          </div>

          <div className="ks-form-group">
            <label className="ks-form-label">Email Address*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="ks-form-input"
              placeholder="Enter your email"
            />
            <ValidationError 
              prefix="Email" 
              field="email" 
              errors={state.errors} 
            />
          </div>

          <div className="ks-form-group">
            <label className="ks-form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="ks-form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="ks-form-group">
            <label className="ks-form-label">Your Message*</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="ks-form-textarea"
              placeholder="Enter your message"
              rows="5"
            />
            <ValidationError 
              prefix="Message" 
              field="message" 
              errors={state.errors} 
            />
          </div>

          <button
            type="submit"
            className="ks-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="ks-spinner"></span> Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;