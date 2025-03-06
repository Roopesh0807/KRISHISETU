import React, { useState } from "react";
import "./../styles/Bargain.css";

const Bargain = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "Farmer" }]);
      setInput("");
    }
  };

  return (
    <div className="bargain">
      <h2>Bargain Chat</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === "Farmer" ? "farmer-msg" : "buyer-msg"}>
            {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Enter your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Bargain;
