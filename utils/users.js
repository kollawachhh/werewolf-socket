const users = [];

// state = ['Host', 'Waiting', 'Ready', 'Alive', 'Died']

//Join user
function userJoin(id, username, room, state) {
  const user = { id, username, room, state };

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
  console.log("users: ", users);
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
    users.splice(index, 1)[0];
    return console.log("users: ", users);
  }
}

//Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

//Change user state
function changeUserState(id, newState) {
  users.forEach(user => {
    if (user.id === id) {
      user.state = newState;
    }
  });
  return users;
}

module.exports = {
  userJoin,
  joinRoom,
  getCurrentUser,
  getAllUsers,
  userLeave,
  getRoomUsers,
  changeUserState,
};
