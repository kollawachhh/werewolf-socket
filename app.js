const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const formatMessage = require("./utils/messages.js");
const { createRoom, joinRoom } = require("./utils/room.js");

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("login", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    // socket.join(user.room);
  });

  socket.on("getCurrentUser", () => {
    const user = getCurrentUser(socket.id);
    socket.emit("currentUser", user);
  });

  //Create room
  socket.on("createRoom", (maxPlayer) => {
    const user = getCurrentUser(socket.id);
    const room = createRoom(user, maxPlayer);
    socket.join(room);
    socket.emit("roomCreated", room);
  });

  //Join room
  socket.on("joinRoom", (roomCode) => {
    const user = getCurrentUser(socket.id);
    const room = joinRoom(user, roomCode);
    socket.join(room);
    socket.emit("roomJoined", room);
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
    const user = userLeave(socket.id);
  });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
