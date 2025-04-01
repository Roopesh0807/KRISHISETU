// websocket.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const sessions = new Map();

wss.on('connection', (ws, req) => {
  const sessionId = req.url.split('/').pop();
  
  sessions.set(sessionId, ws);

  ws.on('close', () => {
    sessions.delete(sessionId);
  });
});

function notifyUser(sessionId, message) {
  const ws = sessions.get(sessionId);
  if (ws) ws.send(JSON.stringify(message));
}

module.exports = { notifyUser };