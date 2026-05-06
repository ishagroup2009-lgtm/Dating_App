// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const connectDB = require("./db");
// const Message = require("./models/Message");

// const app = express();
// connectDB();
// app.use(cors());
// app.use(express.json());

// // 🔥 TEST API
// app.get("/", (req, res) => {
//     res.json({
//         status: true,
//         message: "Chat server is running 🚀",
//     });
// });

// // 🔥 OPTIONAL: users check API
// app.get("/users", (req, res) => {
//     res.json({
//         onlineUsers: Object.keys(users),
//     });
// });

// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: { origin: "*" },
// });

// let users = {}; // userId -> socketId

// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // 🔹 user join
//     socket.on("join", (userId) => {
//         users[userId] = socket.id;
//         console.log("User joined:", userId);
//     });

//     // 🔹 send message
//     // socket.on("sendMessage", ({ senderId, receiverId, message }) => {
//     //     const receiverSocket = users[receiverId];

//     //     if (receiverSocket) {
//     //         io.to(receiverSocket).emit("receiveMessage", {
//     //             senderId,
//     //             message,
//     //         });
//     //     }
//     // });

//     socket.on("sendMessage", async ({ senderId, receiverId, message }) => {

//         try {

//             // ✅ SAVE MESSAGE
//             const newMessage = await Message.create({
//                 senderId,
//                 receiverId,
//                 message,
//             });

//             // ✅ receiver socket
//             const receiverSocket = users[receiverId];

//             // ✅ realtime send
//             if (receiverSocket) {
//                 io.to(receiverSocket).emit("receiveMessage", newMessage);
//             }

//             // ✅ sender ko bhi bhejo
//             socket.emit("messageSent", newMessage);

//         } catch (error) {
//             console.log(error);
//         }

//     });

//     // 🔹 disconnect
//     socket.on("disconnect", () => {
//         console.log("User disconnected");

//         for (let userId in users) {
//             if (users[userId] === socket.id) {
//                 delete users[userId];
//             }
//         }
//     });
// });

// // server.listen(3000, () => {
// //     console.log("🚀 Chat server running on port 3000");
// // });

// const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./db");
const Message = require("./models/Message");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());


// 🔥 TEST API
app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "Chat server is running 🚀",
    });
});


// 🔥 USERS API
app.get("/users", (req, res) => {
    res.json({
        onlineUsers: Object.keys(users),
    });
});


// 🔥 GET ALL MESSAGES
app.get("/messages/:senderId/:receiverId", async (req, res) => {

    try {

        const { senderId, receiverId } = req.params;

        const messages = await Message.find({
            $or: [
                {
                    senderId,
                    receiverId,
                },
                {
                    senderId: receiverId,
                    receiverId: senderId,
                },
            ],
        }).sort({ createdAt: 1 });

        res.json({
            status: true,
            data: messages,
        });

    } catch (error) {

        res.status(500).json({
            status: false,
            message: error.message,
        });

    }

});


const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
});


let users = {}; // userId -> socketId


io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // 🔹 USER JOIN
    socket.on("join", (userId) => {

        users[userId] = socket.id;

        console.log("User joined:", userId);

    });


    // 🔹 SEND MESSAGE
    // socket.on("sendMessage", async ({ senderId, receiverId, message }) => {

    //     try {

    //         // ✅ SAVE MESSAGE
    //         const newMessage = await Message.create({
    //             senderId,
    //             receiverId,
    //             message,
    //         });

    //         // ✅ RECEIVER SOCKET
    //         const receiverSocket = users[receiverId];

    //         // ✅ REALTIME SEND
    //         if (receiverSocket) {

    //             io.to(receiverSocket).emit(
    //                 "receiveMessage",
    //                 newMessage
    //             );

    //         }

    //         // ✅ SENDER ALSO RECEIVE
    //         socket.emit("messageSent", newMessage);

    //     } catch (error) {

    //         console.log("Send Message Error:", error);

    //     }

    // });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {

        console.log("MESSAGE EVENT HIT");

        try {

            const newMessage = await Message.create({
                senderId,
                receiverId,
                message,
            });

            console.log("MESSAGE SAVED:", newMessage);

            const receiverSocket = users[receiverId];

            if (receiverSocket) {

                io.to(receiverSocket).emit(
                    "receiveMessage",
                    newMessage
                );

            }

            socket.emit("messageSent", newMessage);

        } catch (error) {

            console.log("SAVE ERROR:", error);

        }

    });


    // 🔹 DISCONNECT
    socket.on("disconnect", () => {

        console.log("User disconnected");

        for (let userId in users) {

            if (users[userId] === socket.id) {

                delete users[userId];

            }

        }

    });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});