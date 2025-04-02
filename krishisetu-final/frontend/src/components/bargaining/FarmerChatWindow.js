// import React, { useState, useEffect } from "react";
// import "./BargainingChat.css";

// const FarmerChatWindow = ({ bargainId }) => {
//   const [session, setSession] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`);
//         const data = await response.json();
//         setSession(data);
//         setMessages(data.messages || []);
//       } catch (error) {
//         console.error("Error fetching bargain session:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSession();

//     // WebSocket connection
//     const token = localStorage.getItem("token");
//     const ws = new WebSocket(`ws://localhost:5000/ws/bargain/${bargainId}?token=${token}`);
//     setSocket(ws);

//     ws.onopen = () => console.log("✅ WebSocket connected");
//     ws.onmessage = (event) => {
//       const newMessage = JSON.parse(event.data);
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//     };
//     ws.onerror = (error) => console.error("❌ WebSocket error:", error);
//     ws.onclose = () => console.log("🔌 WebSocket disconnected");

//     return () => {
//       ws.close();
//     };
//   }, [bargainId]);

//   const handleRespond = async (accept) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/respond`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ accept }),
//       });
//       const data = await response.json();
//       setSession(data.updatedSession);
//       setMessages([...messages, data.newMessage]);

//       if (socket) {
//         socket.send(JSON.stringify(data.newMessage));
//       }
//     } catch (error) {
//       console.error("Error responding to bargain:", error);
//     }
//   };

//   const handleSubmitOffer = async (price) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/offer`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ price }),
//       });
//       const data = await response.json();
//       setSession(data.updatedSession);
//       setMessages([...messages, data.newMessage]);

//       if (socket) {
//         socket.send(JSON.stringify(data.newMessage));
//       }
//     } catch (error) {
//       console.error("Error submitting offer:", error);
//     }
//   };

//   if (loading) return <div className="loading">Loading bargain session...</div>;
//   if (!session) return <div className="error">Session not found</div>;

//   return (
//     <div className="chat-window">
//       <div className="chat-header">
//         <h3>Bargain with {session.consumer_name}</h3>
//         <p>Product: {session.product_name}</p>
//         <p>Status: {session.status}</p>
//       </div>

//       <div className="chat-messages">
//         {messages.map((msg, i) => (
//           <div key={i} className={`message ${msg.sender}`}>
//             <p>{msg.text}</p>
//             <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
//           </div>
//         ))}
//       </div>

//       {session.status === "requested" && (
//         <div className="bargain-actions">
//           <button onClick={() => handleRespond(true)}>Accept Bargain</button>
//           <button onClick={() => handleRespond(false)}>Reject Bargain</button>
//         </div>
//       )}

//       {session.status === "countered" && (
//         <div className="counter-actions">
//           <h4>Consumer's Offer: ₹{session.current_offer}</h4>
//           <div className="counter-buttons">
//             <button onClick={() => handleSubmitOffer(session.current_offer - 2)}>Counter -₹2</button>
//             <button onClick={() => handleSubmitOffer(session.current_offer + 2)}>Counter +₹2</button>
//             <button onClick={() => handleRespond(true)}>Accept Offer</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FarmerChatWindow;
import React, { useState, useEffect } from "react";
import "./BargainingChat.css";

const FarmerChatWindow = ({ bargainId, socket, consumerId }) => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consumerPrice, setConsumerPrice] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}`);
        const data = await response.json();
        setSession(data);
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching bargain session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    socket.on("consumerSelectedPrice", (data) => {
      setConsumerPrice(data.selectedPrice);
    });

    socket.on("bargainFinalized", (data) => {
      console.log("Bargain finalized at: ₹", data.finalPrice);
    });

    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("consumerSelectedPrice");
      socket.off("bargainFinalized");
      socket.off("newMessage");
    };
  }, [bargainId, socket]);

  const handleRespond = async (accept) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      const data = await response.json();
      setSession(data.updatedSession);
      setMessages([...messages, data.newMessage]);
      socket.emit("newMessage", data.newMessage);
    } catch (error) {
      console.error("Error responding to bargain:", error);
    }
  };

  const handleSubmitOffer = async (price) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const data = await response.json();
      setSession(data.updatedSession);
      setMessages([...messages, data.newMessage]);
      socket.emit("newMessage", data.newMessage);
    } catch (error) {
      console.error("Error submitting offer:", error);
    }
  };

  const handleFarmerResponseToPrice = (response, counterPrice = null) => {
    socket.emit("farmerResponseToPrice", {
      consumerId,
      farmerId: session?.farmer_id, // Ensuring correct farmer ID
      response,
      counterPrice,
    });
  };

  if (loading) return <div className="loading">Loading bargain session...</div>;
  if (!session) return <div className="error">Session not found</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Bargain with {session.consumer_name}</h3>
        <p>Product: {session.product_name}</p>
        <p>Status: {session.status}</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {consumerPrice && (
        <div className="consumer-offer">
          <h4>Consumer's Offer: ₹{consumerPrice}</h4>
          <button onClick={() => handleFarmerResponseToPrice("accepted")}>Accept</button>
          <button onClick={() => handleFarmerResponseToPrice("rejected")}>Reject</button>
          <button onClick={() => handleFarmerResponseToPrice("counter", consumerPrice + 2)}>
            Counter (₹{consumerPrice + 2})
          </button>
        </div>
      )}

      {session.status === "requested" && (
        <div className="bargain-actions">
          <button onClick={() => handleRespond(true)}>Accept Bargain</button>
          <button onClick={() => handleRespond(false)}>Reject Bargain</button>
        </div>
      )}

      {session.status === "countered" && (
        <div className="counter-actions">
          <h4>Consumer's Offer: ₹{session.current_offer}</h4>
          <div className="counter-buttons">
            <button onClick={() => handleSubmitOffer(session.current_offer - 2)}>Counter -₹2</button>
            <button onClick={() => handleSubmitOffer(session.current_offer + 2)}>Counter +₹2</button>
            <button onClick={() => handleRespond(true)}>Accept Offer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerChatWindow;