const rooms = [];

function createRoom(user, maxPlayer) {
  const users = [];
  const room = {
    code: 0,
    host: {},
    users: users,
    statusRoom: "",
    maxPlayer: 0,
  };
  room.code = Math.floor(Math.random() * 900000);
  room.host = user;
  room.users.push(user);
  room.statusRoom = "waiting";
  room.maxPlayer = maxPlayer;
  rooms.push(room);
  console.log("Room id: ", room.code + ", created by: " + room.host.username);
  return room.code;
}

function joinRoom(user, roomCode) {
  const roomIndex = rooms.findIndex((room) => room.code === roomCode);
  if (roomIndex !== -1) {
    rooms[roomIndex].users.push(user);
    เดะมาไปตลาด;
    console.log("Room id: ", rooms[roomIndex].code);
    return rooms[roomIndex].code;
  }
}

module.exports = {
  createRoom,
  joinRoom,
};
