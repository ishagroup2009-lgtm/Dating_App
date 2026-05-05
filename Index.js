const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 TEST API
app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "Chat server is running 🚀",
    });
});

// 🔥 OPTIONAL: users check API
app.get("/users", (req, res) => {
    res.json({
        onlineUsers: Object.keys(users),
    });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
});

let users = {}; // userId -> socketId

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 🔹 user join
    socket.on("join", (userId) => {
        users[userId] = socket.id;
        console.log("User joined:", userId);
    });

    // 🔹 send message
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        const receiverSocket = users[receiverId];

        if (receiverSocket) {
            io.to(receiverSocket).emit("receiveMessage", {
                senderId,
                message,
            });
        }
    });

    // 🔹 disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected");

        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
            }
        }
    });
});

// server.listen(3000, () => {
//     console.log("🚀 Chat server running on port 3000");
// });

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});