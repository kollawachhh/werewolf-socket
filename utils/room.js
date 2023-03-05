const rooms = [];

// roomState = ['Waiting', 'In-game']

function getRoom(roomCode) {
  return rooms.find((room) => room.code === roomCode);
}

//Get room users
function getRoomUsers(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  return room.users;
}

function createRoom(user, maxPlayer) {
  const users = [];
  const room = {
    code: 0,
    host: {},
    users: users,
    roomState: "",
    maxPlayer: 0,
    stat: {
      day: 1,
      period: "Day",
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

function joinRoom(user, roomCode) {
  const roomIndex = rooms.findIndex((room) => room.code == roomCode);
  console.log(roomIndex);
  if (roomIndex != -1) {
    if (rooms[roomIndex].users.length != rooms[roomIndex].maxPlayer) {
      rooms[roomIndex].users.push(user);
      console.log("Room id: ", rooms[roomIndex].code);
      return rooms[roomIndex].code;
    } else {
      return 'full';
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

//Change room state
function changeRoomState(code, newState) {
  const room = rooms.find((room) => room.code == code);
  room.roomState = newState;
  return room;
}

//Change user state when start
function changeUserStateWhenStart(roomCode) {
  const room = rooms.find((r) => r.code === roomCode);
  if (room.host.role == '') {
    room.roomState = "In-game";
    const roles = randomRoles(room.users.length);
    for (let i = 0; i < room.users.length; i-=-1) {
      room.users[i].role = roles[i];
      room.users[i].state = "Alive";
    }
  }
  return room;
}

//Random roles
function randomRoles(amount) {                  // < 7 players: 1 wolf, 1 seer, 1 guard
  const roles = ["werewolf", "seer", "guard"]
  if (amount >= 7 ) {                           // >= 7 players: 2 wolf, 1 seer, 1 guard
    roles.push("werewolf");
  }
  let oldLength = amount - roles.length;
  for (let i = 0; i < oldLength; i-=-1) {
    roles.push("villager");
  }
  roles.sort(() => Math.random() - 0.5);
  console.log("random: ", roles);
  return roles;
}

module.exports = {
  getRoom,
  createRoom,
  joinRoom,
  changeRoomState,
  leaveRoom,
  getRoomUsers,
  changeUserState,
  changeUserStateWhenStart,
};
