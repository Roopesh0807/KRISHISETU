import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css"; // Ensure CSS is properly imported

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // List of keywords related to farming, agriculture, e-commerce, and greetings
  const allowedKeywords = [
    // Farming & Agriculture
    "farm", "farmer", "agriculture", "crop", "harvest", "fertilizer", "soil",
    "pesticide", "weather", "yield", "seeds", "organic", "irrigation", "drought",
    "livestock", "dairy", "farming techniques", "climate", "storage",
    "supply chain", "pesticide safety", "seasonal farming", "best farming practices",

    // E-commerce & Consumer Queries (KrishiSetu Platform)
    "buy", "sell", "market price", "order", "delivery", "payment", "price",
    "transaction", "discount", "refund", "customer support", "return policy",
    "shipping", "product quality", "fresh produce", "supply chain", "packaging",
    "KrishiSetu", "seller", "buyer", "farmer marketplace",

    // Greetings & Common Queries
    "hello", "hi", "good morning", "good evening", "good night", "how are you",
    "thank you", "bye", "welcome", "help", "support", "assistance",
    "customer care", "farmer support", "contact", "FAQ", "how does it work",
    "KrishiSetu help"
  ];

  // Function to check if the question is relevant
  const isRelevantQuestion = (text) => {
    return allowedKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword)
    );
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage = { sender: "user", text: inputText };
    setMessages([...messages, userMessage]);
    setInputText("");

    // Check if the question is relevant
    if (!isRelevantQuestion(inputText)) {
      const errorMessage = {
        sender: "bot",
        text: "I'm sorry, but I am only trained to assist with farming, agriculture, consumer-related topics, and KrishiSetu platform support.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      return;
    }

    try {
      const apiKey = 'AIzaSyAuQIXWdgyQOYvSrzxWoVJy1tsPyJnpkG8';
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: inputText }] }],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const botMessage = {
        sender: "bot",
        text:
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm sorry, I couldn't generate a response.",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response from Gemini API:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I am unable to respond. Please try again later.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div>
      {/* Floating Chat Icon */}
      <button className="chatbot-icon" onClick={toggleChatbot}>
        💬
      </button>

      {/* Chat Window (Only visible when isOpen is true) */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>KrishiBot</h3>
            <button onClick={toggleChatbot} className="close-btn">✖</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about farming, e-commerce, or KrishiSetu support..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
