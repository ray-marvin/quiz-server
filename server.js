require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/authRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const initializeSocket = require("./src/sockets/gameSocket");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// db connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

// websockets setup
initializeSocket(io);

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
