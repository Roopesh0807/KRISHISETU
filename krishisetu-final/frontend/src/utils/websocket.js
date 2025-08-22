// let socket = null;

// export const initializeWebSocket = (bargainId, token, onMessage, onOpen, onError, onClose) => {
//   if (!bargainId || !token) {
//       console.error("❌ Missing bargainId or token for WebSocket");
//       return null;
//   }

//   let ws = new WebSocket(`ws://localhost:5000/ws/bargain/${bargainId}?token=${token}`);

//   ws.onopen = () => {
//       console.log("✅ WebSocket Connected");
//       onOpen?.();
//   };

//   ws.onmessage = (event) => {
//       try {
//           const data = JSON.parse(event.data);
//           console.log("📩 WebSocket Message:", data);
//           onMessage?.(data);
//       } catch (error) {
//           console.error("🚨 Error parsing WebSocket message", error);
//       }
//   };

//   ws.onerror = (error) => {
//       console.error("🚨 WebSocket Error:", error);
//       onError?.(error);
//   };

//   ws.onclose = () => {
//       console.warn("⚠️ WebSocket Disconnected, Reconnecting...");
//       setTimeout(() => initializeWebSocket(bargainId, token, onMessage, onOpen, onError, onClose), 5000); // Reconnect after 5s
//       onClose?.();
//   };

//   return ws;
// };


// export const sendWebSocketMessage = (message) => {
//   if (socket && socket.readyState === WebSocket.OPEN) {
//     socket.send(JSON.stringify(message));
//   } else {
//     console.warn("WebSocket is not open. Message not sent.");
//   }
// };

// export const closeWebSocket = () => {
//   if (socket) {
//     socket.close();
//     socket = null;
//   }
// };
// let socket = null;

// export const initializeWebSocket = (bargainId, token, onMessage, onOpen, onError, onClose) => {
//     if (!bargainId || !token) {
//         console.error("❌ Missing bargainId or token for WebSocket");
//         return null;
//     }

//     socket = new WebSocket(`ws://localhost:5000/ws/bargain/${bargainId}?token=${token}`);

//     socket.onopen = () => {
//         console.log("✅ WebSocket Connected");
//         onOpen?.();
//     };

//     socket.onmessage = (event) => {
//         try {
//             const data = JSON.parse(event.data);
//             console.log("📩 WebSocket Message:", data);
//             onMessage?.(data);
//         } catch (error) {
//             console.error("🚨 Error parsing WebSocket message", error);
//         }
//     };

//     socket.onerror = (error) => {
//         console.error("🚨 WebSocket Error:", error);
//         onError?.(error);
//     };

//     socket.onclose = () => {
//         console.warn("⚠️ WebSocket Disconnected, Reconnecting...");
//         setTimeout(() => initializeWebSocket(bargainId, token, onMessage, onOpen, onError, onClose), 5000);
//         onClose?.();
//     };

//     return socket;
// };

// export const sendWebSocketMessage = (message) => {
//     if (socket && socket.readyState === WebSocket.OPEN) {
//         socket.send(JSON.stringify(message));
//     } else {
//         console.warn("WebSocket is not open. Message not sent.");
//     }
// };

// export const closeWebSocket = () => {
//     if (socket) {
//         socket.close();
//         socket = null;
//     }
// };
import { io } from 'socket.io-client';
const token = localStorage.getItem("token");
console.log("📦 Sending token to socket:", token); 
let socket = null;

export const initializeWebSocket = (
  token,
  bargainId,
  onMessage,
  onConnect,
  onError,
  onDisconnect
) => {
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (!token) {
    console.error("❌ Token is required for WebSocket connection");
    return;
  }

  socket = io(`${process.env.REACT_APP_BACKEND_URL}`, {
    auth: { token },
    query: { bargainId }, // ✅ pass it properly
    reconnection: true,
    reconnectionAttempts: 2,
    timeout: 20000,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO with ID:", socket.id);
    onConnect?.();
  });

  socket.on("bargainMessage", (data) => {
    console.log("📩 Socket.IO Message:", data);
    onMessage?.(data);
  });

  socket.on("connect_error", (err) => {
    console.error("🚨 Connection error:", err.message);
    onError?.(err);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Disconnected from WebSocket:", reason);
    onDisconnect?.(reason);
  });
};


export const sendWebSocketMessage = (message) => {
  if (socket && socket.connected) {
    socket.emit("bargainMessage", message);
  } else {
    console.warn("Socket.IO is not connected. Message not sent.");
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
