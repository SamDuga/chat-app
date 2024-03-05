const _ = require('lodash');

const users = [];

const addUser = ({ id, username, room }) => {
	// clean
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	// validate
	if (!username || !room) {
		return {
			error: 'Username and room require',
		};
	}
	// check existing
	const existing = users.find((x) => x.username === username && x.room === room);

	if (existing) {
		return {
			error: 'Username already in use',
		};
	}

	// store user
	const user = { id, username, room };
	users.push(user);
	return { user };
};

const removeUser = (id) => {
	// clone old
	const clonedUsers = _.cloneDeep(users);

	// find index
	const existingIndex = clonedUsers.findIndex((x) => x.id === id);

	// no match, error
	if (existingIndex < 0) {
		return {
			error: `No user found for id: ${id}. Could not remove.`,
		};
	}

	// remove, return removed user
	const user = users.splice(existingIndex, 1)[0];

	return { user };
};

const getUser = (id) => {
	return users.find((x) => x.id === id);
};

const getUsersInRoom = (room) => {
	return users.filter((x) => x.room === room);
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
};
