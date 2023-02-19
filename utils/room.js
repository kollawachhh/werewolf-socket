const rooms = [];

// roomState = ['Waiting', 'In-game']

function getRoom(roomCode) {
  return rooms.find((room) => room.code === roomCode);
}

function getAllRooms() {
  return console.log("rooms: ", rooms);
}

function createRoom(user, maxPlayer) {
  const users = [];
  const room = {
    code: 0,
    host: {},
    users: users,
    roomState: "",
    maxPlayer: 0,
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
  const roomIndex = rooms.findIndex(room => room.code == roomCode);
  console.log(roomIndex);
  if (roomIndex != -1) {
    rooms[roomIndex].users.push(user);
    console.log("Room id: ", rooms[roomIndex].code);
    getAllRooms();
    return rooms[roomIndex].code;
  }
  else {
    return false;
  }
}

//Change user state
function changeRoomState(code) {
  const room = rooms.find((room) => room.code == code);
  room.roomState = 'In-game';
  return room;
}

module.exports = {
  getRoom,
  getAllRooms,
  createRoom,
  joinRoom,
  changeRoomState,
};
