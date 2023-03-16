const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});
const { userJoin, getCurrentUser, userLeave } = require("./utils/users");
const formatMessage = require("./utils/messages.js");
const {
  getRoom,
  createRoom,
  joinRoom,
  changeRoomState,
  actionUser,
  leaveRoom,
  getRoomUsers,
  changeUserState,
  changeUserStateWhenStart,
  beginGame,
  changeStatPhase,
  changeDay,
  changePeriod,
  userActive,
  gameOver,
  gameResult,
  moveToLobby,
  votedResult,
} = require("./utils/room.js");

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("login", ({ username, room }) => {
    userJoin(
      socket.id,
      username,
      "",
      room,
      "Waiting",
      false,
      false,
      false,
      0,
      0,
      0,
      0
    );
  });

  socket.on("getCurrentUser", () => {
    const user = getCurrentUser(socket.id);
    socket.emit("currentUser", user);
  });

  //Create room
  socket.on("createRoom", (setting) => {
    const user = getCurrentUser(socket.id);
    const roomCode = createRoom(user, setting);
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
    const room = changeRoomState(roomId, "In-game");
    io.to(roomId).emit("updateRoomState", room);
  });

  //Change user state
  socket.on("playerStatus", ({ roomId, status }) => {
    const room = changeUserState(socket.id, status, roomId);
    io.to(roomId).emit("roomUsers", room.users);
  });

  //Player action
  socket.on("playerAction", ({ targetId, roomId, action }) => {
    userActive(socket.id, roomId);
    actionUser(targetId, action, roomId, socket.id);
    if (action === "saved" || action === "checked") {
      socket.emit("roomUsers", getRoomUsers(roomId));
      socket.emit("updateUser");
    } else {
      socket.emit("currentUser", getCurrentUser(socket.id));
    }
  });

  //Leave room
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    const users = getRoomUsers(roomId);
    leaveRoom(socket.id, roomId);
    console.log("Current members: ", users);
    io.to(roomId).emit("roomUsers", users);
  });

  //Listen for chat Message
  socket.on("chatMessage", ({ msg, roomId }) => {
    const user = getCurrentUser(socket.id);

    io.to(roomId).emit("message", formatMessage(user.username, msg));
  });

  //Listen for werewolf Message
  socket.on("chatMessageWerewolf", ({ msg, roomId }) => {
    const user = getCurrentUser(socket.id);

    io.to(roomId).emit("werewolfMessage", formatMessage(user.username, msg));
  });

  socket.on("beginGame", (roomId) => {
    const room = getRoom(roomId);
    let time = 6;
    if (room.host.id === socket.id) {
      const timer = setInterval(() => {
        time--;
        let r = beginGame(roomId, time);
        io.to(roomId).emit("count", r.stat);
        if (time === 0) {
          clearInterval(timer);
          startTimer("meeting", roomId);
        }
      }, 1000);
    }
  });

  socket.on("startGame", (roomId) => {
    const room = getRoom(roomId);
    const user = getCurrentUser(socket.id);
    if (room.host.username === user.username) {
      io.to(roomId).emit("gamePrepared", changeUserStateWhenStart(roomId));
    }
  });

  socket.on("startTimer", (roomId) => {
    const room = getRoom(roomId);
    const user = getCurrentUser(socket.id);
    if (room.host.username === user.username) {
      startTimer("meeting", roomId);
    }
  });

  function startTimer(phase, roomId) {
    const room = changeStatPhase(phase, roomId);
    let time = 10;
    if (phase === "meeting") time = room.setting.meetingTime;
    else if (phase === "voting") time = room.setting.voteTime;
    else if (phase === "seer") time = room.setting.seerTime;
    else if (phase === "guard") time = room.setting.guardTime;
    else if (phase === "wolf") time = room.setting.werewolfTime;
    io.to(roomId).emit("currentPhase", room.stat);
    const timer = setInterval(() => {
      time--;
      io.to(roomId).emit("timer", time);
      if (time === 0) {
        clearInterval(timer);
        if (phase === "meeting" && room.stat.day === "1") {
          changePeriod(roomId);
          startTimer("seer", roomId);
        } else if (phase === "meeting" && room.stat.day !== "1")
          startTimer("voting", roomId);
        else if (phase === "voting") {
          const killed = votedResult(roomId);
          changePeriod(roomId);
          if (killed) {
            io.to(roomId).emit("playerKilled");
          }
          io.to(roomId).emit("roomUsers", getRoomUsers(roomId));
          io.to(roomId).emit("updateUser");
          if (gameOver(roomId)) {
            startTimer("end", roomId);
            return;
          }
          startTimer("seer", roomId);
        } else if (phase === "seer") startTimer("guard", roomId);
        else if (phase === "guard") startTimer("wolf", roomId);
        else if (phase === "wolf") {
          const killed = votedResult(roomId);
          changeDay(roomId);
          changePeriod(roomId);
          if (killed) {
            io.to(roomId).emit("playerKilled");
          }
          io.to(roomId).emit("roomUsers", getRoomUsers(roomId));
          io.to(roomId).emit("updateUser");
          if (gameOver(roomId)) {
            startTimer("end", roomId);
            return;
          }
          startTimer("meeting", roomId);
        } else if (phase === "end") {
          // moveToLobby(roomId);
          io.to(roomId).emit("gameOver", getRoom(roomId));
        }
      }
    }, 1000);
  }

  socket.on("gameResult", (roomId) => {
    const room = getRoom(roomId);
    let time = 20;
    if (room.host.id === socket.id) {
      io.to(roomId).emit("result", gameResult(roomId));
      const timer = setInterval(() => {
        time--;
        io.to(roomId).emit("count", time);
        if (time === 0) {
          clearInterval(timer);
          moveToLobby(roomId);
          io.to(roomId).emit("moveToLobby", getRoom(roomId));
        }
      }, 1000);
    }
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = getCurrentUser(socket.id);
    if (user !== undefined) {
      console.log("Client disconnected: " + user.username + ": " + user.id);
      userLeave(socket.id);

      if (user.room) {
        leaveRoom(socket.id, user.room);
        io.to(user.room).emit("roomUsers", getRoomUsers(user.room));
      }
      return;
    }
    console.log("Client disconnected: " + socket.id);
  });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
