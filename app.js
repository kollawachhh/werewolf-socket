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
  getAllUsers,
  userLeave,
  getRoomUsers,
  changeUserState,
} = require("./utils/users");
const formatMessage = require("./utils/messages.js");
const {
  getRoom,
  getAllRooms,
  createRoom,
  joinRoom,
  changeRoomState,
} = require("./utils/room.js");

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("login", ({ username, room }) => {
    const user = userJoin(socket.id, username, room, "Waiting");
    // socket.join(user.room);
  });

  socket.on("getCurrentUser", () => {
    const user = getCurrentUser(socket.id);
    socket.emit("currentUser", user);
  });

  //Create room
  socket.on("createRoom", (maxPlayer) => {
    const user = getCurrentUser(socket.id);
    const roomCode = createRoom(user, maxPlayer);
    user.room = roomCode;
    user.state = "Host";
    console.log(user);
    console.log(getAllRooms());
    socket.emit("roomCreated", roomCode);
  });

  //Join room
  socket.on("joinRoom", (roomCode) => {
    console.log(roomCode);
    const user = getCurrentUser(socket.id);
    const room = joinRoom(user, roomCode);
    if (room != false) {
      user.room = room;
      console.log(user);
    }
    socket.emit("roomJoined", room);
  });

  //Fetch user in room
  socket.on("getRoomUsers", (roomId) => {
    const users = getRoomUsers(roomId);
    socket.emit("roomUsers", users);
  });

  //Get room
  socket.on("getRoom", (roomId) => {
    const room = getRoom(roomId);
    socket.emit("thisRoom", room);
  });

  //Change user state
  socket.on("changeUserState", (id, newState) => {
    const users = changeUserState(id, newState);
    socket.emit("updateUserState", users);
  });

  //Change room state
  socket.on("changeRoomState", (code) => {
    const room = changeRoomState(code);
    room.users = getAllUsers();
    socket.emit("updateRoomState", room);
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
    const user = userLeave(socket.id);
  });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
