// const WebSocket = require('ws');
// const jwt = require('jsonwebtoken');

// let wss; // WebSocket server instance
// const clients = new Map(); // Store connected users

// const initializeWebSocket = (server) => {
//     wss = new WebSocket.Server({ server });

//     wss.on('connection', (ws, request) => {
//         const params = new URLSearchParams(request.url.split('?')[1]);
//         const token = params.get('token');

//         if (!token) {
//             ws.close(4001, 'Token required');
//             return;
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             ws.user = decoded;
//             clients.set(ws.user.id, ws); // Store user connection
//         } catch (error) {
//             ws.close(4002, 'Invalid token');
//             return;
//         }

//         console.log(`✅ WebSocket connected for user ${ws.user.id}`);

//         ws.on('message', (message) => {
//             console.log('Received:', message);
//             ws.send(JSON.stringify({ text: 'Message received', timestamp: Date.now() }));
//         });

//         ws.on('close', () => {
//             console.log(`🔌 WebSocket disconnected for user ${ws.user.id}`);
//             clients.delete(ws.user.id);
//         });
//     });

//     console.log('🌐 WebSocket server initialized');
// };

// // Function to send messages to a specific user
// const sendMessageToUser = (userId, message) => {
//     if (clients.has(userId)) {
//         clients.get(userId).send(JSON.stringify(message));
//     }
// };

// module.exports = { initializeWebSocket, sendMessageToUser };
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure environment variables are loaded

const wss = new WebSocket.Server({ noServer: true }); // Attach WebSocket separately

// Store connected clients
const clients = new Map(); // Key: userId, Value: WebSocket instance

wss.on('connection', (ws, req) => {
    try {
        const token = req.headers['sec-websocket-protocol']; // Pass token in headers
        const user = verifyToken(token); // Decode token to get user details

        if (!user) {
            ws.close();
            return;
        }

        const { userId, role } = user; // Extract user ID and role (consumer or farmer)
        clients.set(userId, ws);

        console.log(`${role} connected: ${userId}`);

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'send_price_suggestion') {
                    const { toUserId, price } = data;
                    
                    if (clients.has(toUserId)) {
                        clients.get(toUserId).send(JSON.stringify({
                            type: 'receive_price_suggestion',
                            fromUserId: userId,
                            price,
                        }));
                    }
                }
            } catch (err) {
                console.error("Error processing message:", err);
            }
        });

        ws.on('close', () => {
            console.log(`${role} disconnected: ${userId}`);
            clients.delete(userId);
        });
    } catch (err) {
        console.error("WebSocket connection error:", err);
        ws.close();
    }
});

// Function to verify and decode token
function verifyToken(token) {
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("Invalid token:", err);
        return null;
    }
}

module.exports = wss;
