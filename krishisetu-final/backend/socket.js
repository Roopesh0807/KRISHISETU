const { Server } = require("socket.io");
const { queryDatabase } = require("./config/db");

let io;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Joining a bargain room
        socket.on("joinRoom", async ({ room_id }) => {
            socket.join(`bargain_${room_id}`);
            console.log(`User joined bargain room: ${room_id}`);

            // Fetch existing messages for the room
            const messages = await queryDatabase("SELECT * FROM bargain_messages WHERE room_id = ?", [room_id]);
            socket.emit("loadMessages", messages);
        });

        // Sending a message
        socket.on("sendMessage", async (messageData) => {
            const { room_id, sender_id, message_type, message_text, price_offer } = messageData;

            // Insert message into DB
            await queryDatabase(
                "INSERT INTO bargain_messages (room_id, sender_id, message_type, message_text, price_offer) VALUES (?, ?, ?, ?, ?)",
                [room_id, sender_id, message_type, message_text, price_offer]
            );

            // Broadcast message to the room
            io.to(`bargain_${room_id}`).emit("receiveMessage", messageData);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
}

module.exports = { initializeSocket };
