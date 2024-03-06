const rooms = [];

const addRoom = (name) => {
	name = name.trim().toLowerCase();

	if (!name) {
		return {
			error: 'Room name must be provided',
		};
	}

	const existing = rooms.find((x) => x.name === name);

	if (existing) {
		return {
			error: `Room with name "${name}" already exists`,
		};
	}

	const room = { roomName: name };

	rooms.push(room);
	return { room };
};

const removeRoom = (roomName) => {
	const existingIndex = rooms.findIndex((x) => x.roomName === roomName);

	// no match, error
	if (existingIndex < 0) {
		return {
			error: `No room found for name: ${name}. Could not remove.`,
		};
	}

	// remove, return removed user
	const room = rooms.splice(existingIndex, 1)[0];

	return { room };
};

const getRooms = () => {
	return rooms;
};

const roomExists = (roomName) => {
	return rooms.includes((x) => x.roomName === roomName);
};

module.exports = {
	addRoom,
	removeRoom,
	getRooms,
	roomExists,
};
