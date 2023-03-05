const rooms = [];
let count = 1;

// roomState = ['Waiting', 'In-game']

function getRoom(roomCode) {
  return rooms.find((room) => room.code === roomCode);
}

//Get room users
function getRoomUsers(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  return room.users;
}

//Change room state
function createRoom(user, maxPlayer) {
  const users = [];
  const room = {
    code: 0,
    host: {},
    users: users,
    roomState: "",
    maxPlayer: 0,
    stat: {
      day: "1",
      period: "Day",
      phase: "",
      description: "",
      secDescription: "",
    },
  };
  room.code = Math.floor(Math.random() * 900000);
  room.host = user;
  room.users.push(user);
  room.roomState = "waiting";
  room.maxPlayer = maxPlayer;
  rooms.push(room);
  console.log("Room id: ", room.code + ", created by: " + room.host.username);
  return room.code;
}

//Join room
function joinRoom(user, roomCode) {
  const roomIndex = rooms.findIndex((room) => room.code == roomCode);
  console.log(roomIndex);
  if (roomIndex != -1) {
    rooms[roomIndex].users.push(user);
    console.log("Room id: ", rooms[roomIndex].code);
    return rooms[roomIndex].code;
  } else {
    return false;
  }
}

//User leave room
function leaveRoom(userId, roomCode) {
  const roomIndex = rooms.findIndex((room) => room.code == roomCode);
  console.log(roomIndex);
  if (roomIndex != -1) {
    const userIndex = rooms[roomIndex].users.findIndex(
      (user) => user.id == userId
    );
    rooms[roomIndex].users.splice(userIndex, 1);
    console.log("Room id: ", rooms[roomIndex].code);
    return rooms[roomIndex].code;
  } else {
    return false;
  }
}

//Change user state
function changeUserState(userId, newState, roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  room.users.forEach((user) => {
    if (user.id === userId) {
      user.state = newState;
    }
  });
  return room;
}

//Action user
function actionUser(targetId, action, roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  room.users.forEach((user) => {
    if (user.id === targetId) {
      if (action === "killed" && user.saved === false) {
        user.killed = true;
        user.state = "Eliminated";
      } else if (action === "saved") {
        user.saved = true;
        user.killed = false;
        user.state = "Alive";
      } else if (action === "checked") user.checked = true;
      else if (action === "voted") user.voted_num += 1;
    }
  });
  return room;
}

//Voted result
function votedResult(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  let maxVoted = Math.max(...room.users.map((user) => user.voted_num));
  let maxUserVotedId = "";
  let count = 0;
  room.users.forEach((u) => {
    if (u.voted_num === maxVoted) {
      count += 1;
      maxUserVotedId = u.id;
    }
  });
  if (count > 1) {
    return;
  } else {
    room.users.forEach((u) => {
      if (u.id === maxUserVotedId) {
        u.state = "Eliminated";
        u.killed = true;
      }
    });
  }
}

//Change room state
function changeRoomState(code, newState) {
  const room = rooms.find((room) => room.code == code);
  room.roomState = newState;
  return room;
}

//Change user state when start
function changeUserStateWhenStart(roomCode) {
  console.log(count);
  const room = rooms.find((r) => r.code === roomCode);
  room.roomState = "In-game";
  const roles = randomRoles(room.users.length);
  for (let i = 0; i < room.users.length; i -= -1) {
    room.users[i].role = roles[i];
    room.users[i].state = "Alive";
  }
  count = count + 1;
  return room;
}

//User active
function userActive(userId, roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  room.users.forEach((user) => {
    if (user.id === userId) {
      if (user.isActive) {
        user.isActive = false;
      } else {
        user.isActive = true;
      }
      console.log(user.isActive);
    }
  });
  return room;
}

//Random roles
function randomRoles(amount) {
  // < 7 players: 1 wolf, 1 seer, 1 guard
  console.log(count);
  const roles = ["werewolf", "seer", "guard"];
  if (amount >= 7) {
    // >= 7 players: 2 wolf, 1 seer, 1 guard
    roles.push("werewolf");
  }
  for (let i = 0; i < amount - roles.length; i -= -1) {
    roles.push("villager");
  }
  roles.sort(() => Math.random() - 0.5);
  console.log("random: ", roles);
  return roles;
}

//Change stat phase
function changeStatPhase(phase, roomCode) {
  let room = rooms.find((r) => r.code === roomCode);
  room.stat.phase = phase;
  if (phase === "meeting") {
    room.stat.description = "Meeting";
    room.stat.secDescription = "Discuss who you think is the werewolf";
  } else if (phase === "voting") {
    room.stat.description = "Voting";
    room.stat.secDescription = "Vote for who you think is the werewolf";
  } else if (phase === "wolf") {
    room.stat.description = "Werewolf";
    room.stat.secDescription = "Choose who you want to eliminate";
  } else if (phase === "seer") {
    room.stat.description = "Seer";
    room.stat.secDescription = "Choose who you want to check";
  } else if (phase === "guard") {
    room.stat.description = "Guard";
    room.stat.secDescription = "Choose who you want to save";
  }
  return room;
}

//Change day
function changeDay(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  room.stat.day = String(parseInt(room.stat.day) + 1);
}

//Change period
function changePeriod(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  if (room.stat.period === "Day") {
    room.stat.period = "Night";
  } else {
    room.users.forEach((user) => {
      user.saved = false;
      user.voted_num = 0;
      user.isActive = true;
    });
    room.stat.period = "Day";
  }
}

//Game over
function gameOver(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  let villager = 0;
  let werewolf = 0;
  room.users.forEach((user) => {
    if (user.role === "werewolf") {
      werewolf += 1;
    } else {
      villager += 1;
    }
  });
  if (werewolf >= villager) {
    room.stat.description = "Werewolf Win";
    room.stat.secDescription = "";
    return true;
  } else if (werewolf === 0) {
    room.stat.description = "Villager Win";
    room.stat.secDescription = "";
    return true;
  }
  return false;
}

//Move to lobby
function moveToLobby(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  room.roomState = "Waiting";
  room.users.forEach((user) => {
    user.state = "Waiting";
    user.killed = false;
    user.saved = false;
    user.checked = false;
    user.voted_num = 0;
    user.role = "";
    user.isActive = true;
  });
  return room;
}

module.exports = {
  getRoom,
  createRoom,
  joinRoom,
  changeRoomState,
  actionUser,
  leaveRoom,
  getRoomUsers,
  changeUserState,
  changeUserStateWhenStart,
  changeStatPhase,
  changeDay,
  changePeriod,
  userActive,
  gameOver,
  moveToLobby,
  votedResult,
};
