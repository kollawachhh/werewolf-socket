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

io.on("connection", (socket) => {
  socket.on("login", (username, room) => {
    const user = userJoin(socket.id, username, room);
    // socket.join(user.room);
    console.log(user);
  });

  socket.on("getCurrentUser", () => {
    const user = getCurrentUser(socket.id);
    console.log(socket.id);
    console.log(user);
    socket.emit("currentUser", user);
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("botName", `${user.username} has left the chat`)
      );

      //Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
