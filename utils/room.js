const rooms = [];

// roomState = ['Waiting', 'In-game']

function getRoom(roomCode) {
  return rooms.find((room) => room.code === roomCode);
}

//Get room users
function getRoomUsers(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  console.log(room);
  if (room == undefined) return false;
  return room.users;
}

//Change room state
function createRoom(user, setting) {
  const users = [];
  const room = {
    code: 0,
    host: {},
    users: users,
    roomState: "",
    stat: {
      day: "1",
      period: "Day",
      phase: "",
      description: "",
      secDescription: "",
    },
    setting: {
      maxPlayer: 0,
      meetingTime: 10,
      voteTime: 10,
      seerTime: 10,
      guardTime: 10,
      werewolfTime: 10,
    },
  };
  room.code = Math.floor(Math.random() * 900000);
  room.host = user;
  room.users.push(user);
  room.roomState = "waiting";
  room.setting.maxPlayer = setting.maxPlayer;
  room.setting.meetingTime = setting.meetingTime;
  room.setting.voteTime = setting.voteTime;
  room.setting.seerTime = setting.seerTime;
  room.setting.guardTime = setting.guardTime;
  room.setting.werewolfTime = setting.werewolfTime;
  rooms.push(room);
  console.log("Room id: ", room.code + ", created by: " + room.host.username);
  return room.code;
}

//Join room
function joinRoom(user, roomCode) {
  const roomIndex = rooms.findIndex((room) => room.code == roomCode);
  if (roomIndex != -1) {
    if (rooms[roomIndex].users.length != rooms[roomIndex].maxPlayer) {
      rooms[roomIndex].users.push(user);
      console.log("Room id: ", rooms[roomIndex].code);
      return rooms[roomIndex].code;
    } else {
      return "full";
    }
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
    if (rooms[roomIndex].users.length == 0) {
      rooms.splice(roomIndex, 1);
      return false;
    }
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
function actionUser(targetId, action, roomCode, userId) {
  const room = rooms.find((r) => r.code === roomCode);
  room.users.forEach((user) => {
    if (user.id === targetId) {
      if (action === "saved") {
        user.saved = true;
        user.killed = false;
        user.state = "Alive";
      } else if (action === "checked") {
        user.checked = true;
        if (user.role === "werewolf") {
          room.users.forEach((u) => {
            if (u.id === userId) {
              u.checked_num += 1;
            }
          });
        }
      } else if (action === "voted") {
        user.voted_num += 1;
        if (user.role === "werewolf") {
          room.users.forEach((u) => {
            if (u.id === userId) {
              u.voted_werewolf_num += 1;
            }
          });
        }
      } else if (action === "killed" && !user.saved) {
        user.voted_num += 1;
      } else if (action === "killed" && user.saved) {
        room.users.forEach((u) => {
          if (u.role === "guard") {
            u.protected_num += 1;
          }
        });
      }
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
    return false;
  } else {
    room.users.forEach((u) => {
      if (u.id === maxUserVotedId) {
        u.state = "Eliminated";
        u.killed = true;
        console.log("user: " + u.username + " is killed");
        return true;
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
  const room = rooms.find((r) => r.code === roomCode);
  if (room.host.role == "") {
    room.roomState = "In-game";
    const roles = randomRoles(room.users.length);
    for (let i = 0; i < room.users.length; i -= -1) {
      room.users[i].role = roles[i];
      room.users[i].state = "Alive";
    }
  }
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
    }
  });
  return room;
}

//Random roles
function randomRoles(amount) {
  const roles = ["werewolf", "seer", "guard"];
  // < 7 players: 1 wolf, 1 seer, 1 guard
  if (amount >= 7) {
    // >= 7 players: 2 wolf, 1 seer, 1 guard
    roles.push("werewolf");
  }
  for (let i = 0; i < amount - roles.length; i -= 0) {
    roles.push("villager");
  }
  roles.sort(() => Math.random() - 0.5);
  console.log("random: ", roles);
  return roles;
}

//begin game
function beginGame(roomCode, time) {
  const room = rooms.find((r) => r.code === roomCode);
  if (time > 2) {
    room.stat.description = `${String(time - 2)}`;
    room.stat.secDescription = "";
  } else {
    room.stat.description = "Start";
    room.stat.secDescription = "";
  }
  return room;
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
    room.users.forEach((user) => {
      user.saved = false;
      user.voted_num = 0;
      user.isActive = true;
    });
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
    if (user.role === "werewolf" && user.state === "Alive") {
      werewolf += 1;
    } else if (user.role !== "werewolf" && user.state === "Alive") {
      villager += 1;
    }
  });
  console.log("werewolf: " + werewolf);
  console.log("villager: " + villager);
  if (werewolf >= villager) {
    room.stat.description = "Werewolf Win";
    room.stat.secDescription = "";
    console.log("Werewolf win");
    return true;
  } else if (werewolf === 0) {
    room.stat.description = "Villager Win";
    room.stat.secDescription = "";
    console.log("Villger win");
    return true;
  }
  console.log(false);
  return false;
}

//game result
function gameResult(roomId) {
  const room = rooms.find((r) => r.code === roomId);
  let result = {
    seer: null,
    checked_num: 0,
    guard: null,
    protected_num: 0,
    voted_werewolf: [],
    voted_werewolf_num: 0,
    eliminatedSeer: null,
    eliminateGuard: null,
    eliminatedWerewolf: [],
    eliminatedWerewolf_num: 0,
    remainWerewolf: [],
    remainWerewolf_num: 0,
  };
  let voted_werewolf_num = Math.max(
    ...room.users.map((user) => user.voted_werewolf_num)
  );
  room.users.forEach((user) => {
    if (user.role === "seer") {
      result.seer = user.username;
      result.checked_num = user.checked_num;
      if (user.state === "Alive") {
        result.eliminatedSeer = false;
      } else {
        result.eliminatedSeer = true;
      }
    } else if (user.role === "guard") {
      result.guard = user.username;
      result.protected_num = user.protected_num;
      if (user.state === "Alive") {
        result.eliminateGuard = false;
      } else {
        result.eliminateGuard = true;
      }
    } else if (user.role === "werewolf") {
      if (user.state === "Alive") {
        result.remainWerewolf.push(user.username);
        result.remainWerewolf_num += 1;
      } else {
        result.eliminatedWerewolf.push(user.username);
        result.eliminatedWerewolf_num += 1;
      }
    }
    if (user.voted_werewolf_num === voted_werewolf_num) {
      result.voted_werewolf.push(user.username);
      result.voted_werewolf_num = voted_werewolf_num;
    }
  });
  return result;
}

//Move to lobby
function moveToLobby(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  room.roomState = "Waiting";
  (room.stat = {
    day: "1",
    period: "Day",
    phase: "",
    description: "",
    secDescription: "",
  }),
    room.users.forEach((user) => {
      if (room.host.id === user.id) {
        user.state = "Host";
      } else {
        user.state = "Waiting";
      }
      user.role = "";
      user.killed = false;
      user.saved = false;
      user.checked = false;
      user.voted_num = 0;
      user.checked_num = 0;
      user.protected_num = 0;
      user.voted_werewolf_num = 0;
      user.isActive = true;
    });
  return room;
}

//Change user access
function changeUserAccess(userId, newState, roomCode) {
  const room = rooms.find((r) => r.code === roomCode);

  if (room.host.id == userId) {
    room.host.isAccessMic = true;
  }

  room.users.forEach((user) => {
    if (user.id === userId) {
      user.isAccessMic = newState;
    }
  });
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
  beginGame,
  changeStatPhase,
  changeDay,
  changePeriod,
  userActive,
  gameOver,
  moveToLobby,
  gameResult,
  votedResult,
  changeUserAccess,
};
