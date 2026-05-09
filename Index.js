
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const connectDB = require("./db");
// const Message = require("./models/Message");
// fs.ensureDirSync("uploads");
// const multer = require("multer");
// const path = require("path");
// const multer = require("multer");
// const app = express();

// const fs = require("fs-extra");

// fs.ensureDirSync("uploads");

// const storage = multer.diskStorage({

//     destination: (req, file, cb) => {
//         cb(null, "uploads/");
//     },

//     filename: (req, file, cb) => {
//         cb(
//             null,
//             Date.now() + path.extname(file.originalname)
//         );
//     },

// });

// connectDB();

// app.use(cors());
// app.use(express.json());

// const storage = multer.diskStorage({

//     destination: (req, file, cb) => {
//         cb(null, "uploads/");
//     },

//     filename: (req, file, cb) => {
//         cb(
//             null,
//             Date.now() + path.extname(file.originalname)
//         );
//     },

// });

// const upload = multer({ storage });

// app.use("/uploads", express.static("uploads"));

// app.post(
//     "/upload-image",
//     upload.single("image"),
//     (req, res) => {

//         res.json({
//             status: true,
//             imageUrl:
//                 `https://dating-app-cmwi.onrender.com/uploads/${req.file.filename}`,
//         });

//     }
// );


// // 🔥 TEST API
// app.get("/", (req, res) => {
//     res.json({
//         status: true,
//         message: "Chat server is running 🚀",
//     });
// });


// // 🔥 USERS API
// app.get("/users", (req, res) => {
//     res.json({
//         onlineUsers: Object.keys(users),
//     });
// });


// // 🔥 GET ALL MESSAGES
// app.get("/messages/:senderId/:receiverId", async (req, res) => {

//     try {

//         const { senderId, receiverId } = req.params;

//         const messages = await Message.find({
//             $or: [
//                 {
//                     senderId,
//                     receiverId,
//                 },
//                 {
//                     senderId: receiverId,
//                     receiverId: senderId,
//                 },
//             ],
//         }).sort({ createdAt: 1 });

//         res.json({
//             status: true,
//             data: messages,
//         });

//     } catch (error) {

//         res.status(500).json({
//             status: false,
//             message: error.message,
//         });

//     }

// });


// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: { origin: "*" },
// });


// let users = {}; // userId -> socketId


// io.on("connection", (socket) => {

//     console.log("User connected:", socket.id);

//     // 🔹 USER JOIN
//     socket.on("join", (userId) => {

//         users[userId] = socket.id;

//         console.log("User joined:", userId);

//     });




//     // socket.on("sendMessage", async ({ senderId, receiverId, message }) => {

//     //     console.log("MESSAGE EVENT HIT");

//     //     try {

//     //         const newMessage = await Message.create({
//     //             senderId,
//     //             receiverId,
//     //             message,
//     //         });

//     //         console.log("MESSAGE SAVED:", newMessage);

//     //         const receiverSocket = users[receiverId];

//     //         if (receiverSocket) {

//     //             io.to(receiverSocket).emit(
//     //                 "receiveMessage",
//     //                 newMessage
//     //             );

//     //         }

//     //         socket.emit("messageSent", newMessage);

//     //     } catch (error) {

//     //         console.log("SAVE ERROR:", error);

//     //     }

//     // });






//     socket.on(
//         "sendMessage",
//         async ({
//             senderId,
//             receiverId,
//             message,
//             image,
//         }) => {

//             try {

//                 const newMessage = await Message.create({
//                     senderId,
//                     receiverId,
//                     message,
//                     image,
//                 });

//                 const receiverSocket = users[receiverId];

//                 if (receiverSocket) {

//                     io.to(receiverSocket).emit(
//                         "receiveMessage",
//                         newMessage
//                     );

//                 }

//                 socket.emit("messageSent", newMessage);

//             } catch (error) {

//                 console.log("SAVE ERROR:", error);

//             }

//         }
//     );




//     // 🔹 DISCONNECT
//     socket.on("disconnect", () => {

//         console.log("User disconnected");

//         for (let userId in users) {

//             if (users[userId] === socket.id) {

//                 delete users[userId];

//             }

//         }

//     });

// });


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

const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const admin = require("firebase-admin");
const app = express();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
connectDB();
const {
  RtcTokenBuilder,
  RtcRole,
} = require("agora-token");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());


// 👇 uploads folder auto create
fs.ensureDirSync("uploads");


// 👇 multer storage
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );

  },

});

const upload = multer({ storage });


// 👇 static folder
app.use(
  "/uploads",
  express.static("uploads")
);


// 👇 upload api
app.post(
  "/upload-image",
  upload.single("image"),
  async (req, res) => {

    try {

      console.log("FILE", req.file);

      if (!req.file) {

        return res.status(400).json({
          status: false,
          message: "No file uploaded",
        });

      }

      res.json({
        status: true,

        imageUrl:
          `https://dating-app-cmwi.onrender.com/uploads/${req.file.filename}`,
      });

    } catch (error) {

      console.log(
        "UPLOAD API ERROR",
        error
      );

      res.status(500).json({
        status: false,
        message: error.message,
      });

    }

  }
);


app.post(
  "/generate-agora-token",

  async (req, res) => {

    try {

      const { channelName, uid } = req.body;

      // 👇 agora credentials
      const appId =
        "5585e4187e7c42a38f304f4c1bfae791";

      const appCertificate =
        "dd5d6d53050743c0bb675621453d9d7f";

      const role =
        RtcRole.PUBLISHER;

      // 👇 token expiry
      const expirationTimeInSeconds =
        3600;

      const currentTimestamp =
        Math.floor(Date.now() / 1000);

      const privilegeExpiredTs =
        currentTimestamp +
        expirationTimeInSeconds;

      // 👇 token generate
      const token =
        RtcTokenBuilder.buildTokenWithUid(
          appId,
          appCertificate,
          channelName,
          Number(uid),
          role,
          privilegeExpiredTs
        );

      res.json({
        status: true,
        token,
        channelName,
        uid,
      });

    } catch (error) {

      console.log(
        "AGORA TOKEN ERROR",
        error
      );

      res.status(500).json({
        status: false,
        message: error.message,
      });

    }

  }
);


app.post(
  "/send-notification",
  async (req, res) => {

    try {

      const {
        token,
        title,
        body,
      } = req.body;

      const message = {

        notification: {
          title,
          body,
        },

        token,
      };

      const response =
        await admin
          .messaging()
          .send(message);

      res.json({
        status: true,
        response,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        status: false,
        message: error.message,
      });

    }

  }
);


// 🔥 TEST API
app.get("/", (req, res) => {

  res.json({
    status: true,
    message: "Chat server is running 🚀",
  });

});


const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});


let users = {};


// 🔥 SOCKET
io.on("connection", (socket) => {

  console.log(
    "User connected:",
    socket.id
  );

  // 👇 join
  socket.on("join", (userId) => {

    users[userId] = socket.id;

    console.log(
      "User joined:",
      userId
    );

  });


  // 👇 send message
  socket.on(
    "sendMessage",

    async ({
      senderId,
      receiverId,
      message,
      image,
    }) => {

      try {

        const newMessage =
          await Message.create({

            senderId,
            receiverId,
            message,
            image,

          });

        console.log(
          "MESSAGE SAVED",
          newMessage
        );

        const receiverSocket =
          users[receiverId];

        if (receiverSocket) {

          io.to(receiverSocket).emit(
            "receiveMessage",
            newMessage
          );

        }

        socket.emit(
          "messageSent",
          newMessage
        );

      } catch (error) {

        console.log(
          "SAVE ERROR",
          error
        );

      }

    }
  );

  socket.on(
    "callUser",

    async ({
      callerId,
      receiverId,
      callerName,
      callerToken,
      receiverToken,
      image
    }) => {

      console.log(
        "VOICE CALL FROM:",
        callerId,
        "TO:",
        receiverId
      );

      const receiverSocket =
        users[receiverId];

      // 👇 SOCKET EVENT
      if (receiverSocket) {

        io.to(receiverSocket).emit(
          "incomingCall",
          {
            callerId,
            callerName,
            callerToken,
            image,
          }
        );

      }

      // 👇 FCM PUSH
      try {

        const message = {

          notification: {
            title: "Incoming Voice Call",
            body: `${callerName} is calling you`,
          },

          data: {
            type: "voice_call",
            callerId: String(callerId),
            callerName: String(callerName),
            callerToken: String(callerToken),
            image: String(image),
          },

          token: receiverToken,

        };

        const response =
          await admin
            .messaging()
            .send(message);

        console.log(
          "CALL NOTIFICATION SENT",
          response
        );

      } catch (error) {

        console.log(
          "FCM ERROR",
          error
        );

      }

    }
  );

  socket.on(
    "acceptCall",

    async ({
      callerId,
      receiverId,
      callerToken,
    }) => {

      console.log(
        "CALL ACCEPTED"
      );

      // SOCKET
      const callerSocket =
        users[callerId];

      if (callerSocket) {

        io.to(callerSocket).emit(
          "callAccepted",
          {
            receiverId,
          }
        );

      }

      // FCM
      try {

        const message = {

          notification: {
            title: "Call Accepted",
            body: "User accepted your call",
          },

          data: {
            type: "call_accepted",
            receiverId:
              String(receiverId),
            callerId: String(callerId),
            callerToken: String(callerToken),
          },

          token: callerToken,

        };

        await admin
          .messaging()
          .send(message);

        console.log(
          "ACCEPT PUSH SENT"
        );

      } catch (error) {

        console.log(
          "ACCEPT PUSH ERROR",
          error
        );

      }

    }
  );

  socket.on(
    "rejectCall",

    async ({
      callerId,
      receiverId,
      callerToken,
    }) => {

      console.log(
        "CALL REJECTED"
      );

      // SOCKET
      const callerSocket =
        users[callerId];

      if (callerSocket) {

        io.to(callerSocket).emit(
          "callRejected",
          {
            receiverId,
          }
        );

      }

      // FCM
      try {

        const message = {

          notification: {
            title: "Call Rejected",
            body: "User rejected your call",
          },

          data: {
            type: "call_rejected",
            receiverId:
              String(receiverId),
          },

          token: callerToken,

        };

        await admin
          .messaging()
          .send(message);

        console.log(
          "REJECT PUSH SENT"
        );

      } catch (error) {

        console.log(
          "REJECT PUSH ERROR",
          error
        );

      }

    }
  );

  socket.on(
    "endCall",

    async ({
      callerId,
      receiverId,
      receiverToken,
    }) => {

      console.log(
        "CALL ENDED"
      );

      // SOCKET
      const receiverSocket =
        users[receiverId];

      if (receiverSocket) {

        io.to(receiverSocket).emit(
          "callEnded",
          {
            callerId,
          }
        );

      }

      // FCM
      try {

        const message = {

          notification: {
            title: "Call Ended",
            body: "Call has ended",
          },

          data: {
            type: "call_ended",
            callerId:
              String(callerId),
          },

          token: receiverToken,

        };

        await admin
          .messaging()
          .send(message);

        console.log(
          "END PUSH SENT"
        );

      } catch (error) {

        console.log(
          "END PUSH ERROR",
          error
        );

      }

    }
  );

  // 👇 disconnect
  socket.on("disconnect", () => {

    console.log("User disconnected");

    for (let userId in users) {

      if (
        users[userId] === socket.id
      ) {

        delete users[userId];

      }

    }

  });

});


// 🔥 GET MESSAGES
app.get(
  "/messages/:senderId/:receiverId",

  async (req, res) => {

    try {

      const {
        senderId,
        receiverId,
      } = req.params;

      const messages =
        await Message.find({

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

  }
);


const PORT =
  process.env.PORT || 3000;

server.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});