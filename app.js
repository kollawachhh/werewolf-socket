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
  /* getRoomUsers, */
} = require("./utils/users");
const formatMessage = require("./utils/messages.js");
const {
  getRoom,
  createRoom,
  joinRoom,
  changeRoomState,
  leaveRoom,
  getRoomUsers,
  changeUserState,
} = require("./utils/room.js");

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("login", ({ username, room }) => {
    userJoin(socket.id, username, room, "Waiting");
    //
  });

  socket.on("getCurrentUser", () => {
    const user = getCurrentUser(socket.id);
    socket.emit("currentUser", user);
  });

  //Create room
  socket.on("createRoom", (maxPlayer) => {
    const user = getCurrentUser(socket.id);
    const roomCode = createRoom(user, maxPlayer);
    socket.join(roomCode);
    user.room = roomCode;
    user.state = "Host";
    socket.emit("roomCreated", roomCode);
  });

  //Join room
  socket.on("joinRoom", (roomCode) => {
    const user = getCurrentUser(socket.id);
    const room = joinRoom(user, roomCode);
    socket.join(room);
    if (room != false) {
      user.room = room;
    }
    socket.emit("roomJoined", room);
  });

  //Fetch user in room
  socket.on("getRoomUsers", (roomId) => {
    const users = getRoomUsers(roomId);
    console.log("room id: ", roomId);
    io.to(roomId).emit("roomUsers", users);
  });

  //Get room
  socket.on("getRoom", (roomId) => {
    const room = getRoom(roomId);
    socket.emit("thisRoom", room);
  });

  //Change room state
  socket.on("changeRoomState", (roomId) => {
    const room = changeRoomState(roomId);
    io.to(roomId).emit("updateRoomState", room);
  });

  //Change user state
  socket.on("playerStatus", ({ roomId, status }) => {
    const room = changeUserState(socket.id, status, roomId);
    io.to(roomId).emit("roomUsers", room.users);
  });

  //Leave room
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    const users = getRoomUsers(roomId);
    leaveRoom(socket.id, roomId);
    console.log("Current members: ", users);
    io.to(roomId).emit("roomUsers", users);
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
    const user = userLeave(socket.id);
  });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
