const users = [];

// state = ['Host', 'Waiting', 'Ready', 'Alive', 'Died']

//Join user
function userJoin(
  id,
  username,
  role,
  room,
  state,
  killed,
  saved,
  checked,
  voted_num,
  checked_num,
  protected_num,
  voted_werewolf_num
) {
  const user = {
    id,
    username,
    role,
    room,
    state,
    killed,
    saved,
    checked,
    voted_num,
    checked_num,
    protected_num,
    voted_werewolf_num,
    isActive: true,
  };

  users.push(user);

  return user;
}

//Join room
function joinRoom(id, room) {
  const user = users.find((user) => user.id === id);
  user.room = room;
  return user;
}

//Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

//Get all users
function getAllUsers() {
  return users;
}

//User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

//Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  joinRoom,
  getCurrentUser,
  getAllUsers,
  userLeave,
  getRoomUsers,
};
