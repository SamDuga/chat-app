const path = require('path');
const http = require('http');
const express = require('express');
const hbs = require('hbs');
const socketio = require('socket.io');
const Filter = require('bad-words');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates/views'));
hbs.registerPartials(path.join(__dirname, '../templates/partials'));

// static files
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
	console.log('New connection to web socket');

	// join room
	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		// welcome message
		socket.emit('messageUpdated', generateMessage(`Welcome to chat app, ${user.username}!`));

		// new user notification
		socket.broadcast.to(room).emit('messageUpdated', generateMessage(`${user.username} has joined the chat!`));

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});

		callback();
	});

	// chat handling
	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id);

		if (user) {
			const filter = new Filter();

			if (filter.isProfane(message)) {
				return callback('No naughty words allowed!');
			}

			io.to(user.room).emit('messageUpdated', generateMessage(message, user.username));
			callback();
		}
	});

	// sharing location
	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				'locationMessage',
				generateLocationMessage(
					`https://www.google.com/maps/search/?api=1&query=
				${encodeURIComponent(`${location.latitude},${location.longitude}`)}
				`,
					user.username,
				),
			);

			callback();
		}
	});

	// disconnect
	socket.on('disconnect', () => {
		const { user, error } = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('messageUpdated', generateMessage(`${user.username} has left the chat`));
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

app.get('*', (req, res) => {
	res.render('error', {
		title: '404',
		message: 'Page not found',
		name: 'Sam Duga',
	});
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
