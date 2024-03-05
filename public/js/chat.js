const socket = io();

// elements
const $messageForm = document.querySelector('#messageForm');
const $chatInput = $messageForm.querySelector('input');
const $sendButton = $messageForm.querySelector('button');

const $locationButton = document.querySelector('#sendLocation');

const $messagesDisplay = document.querySelector('#messagesDisplay');

const $sidebar = document.querySelector('#sidebar');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoscroll = () => {
	// latest message
	const $latestMessage = $messagesDisplay.lastElementChild;

	// get message hieght
	const botMargin = parseInt(getComputedStyle($latestMessage).marginBottom);
	const latestMessageHeight = $latestMessage.offsetHeight + botMargin;

	// container visible area
	const visibleHeight = $messagesDisplay.offsetHeight;

	// container height
	const containerHeight = $messagesDisplay.scrollHeight;

	// current scroll height
	const scrollOffset = $messagesDisplay.scrollTop + visibleHeight;

	if (containerHeight - latestMessageHeight <= scrollOffset) {
		$messagesDisplay.scrollTop = $messagesDisplay.scrollHeight;
	}
};

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();

	$sendButton.setAttribute('disabled', 'disabled');

	socket.emit('sendMessage', $chatInput.value, (error) => {
		if (error) return console.log(error);
		$sendButton.removeAttribute('disabled');
		$chatInput.value = '';
		$chatInput.focus();
	});
});

$locationButton.addEventListener('click', (e) => {
	if (!navigator.geolocation) return alert('Geolocation not supported by browser');

	$locationButton.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			'sendLocation',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			(error) => {
				if (error) return console.log(error);
				console.log('Location shared!');
				$locationButton.removeAttribute('disabled');
			},
		);
	});
});

// register handlers

socket.on('update', (message) => {
	console.log(message.text);
});

socket.on('locationMessage', (location) => {
	const html = Mustache.render(locationTemplate, {
		url: location.url,
		sender: location.sender,
		timestamp: moment(location.createdAt).format('h:mm a'),
	});
	$messagesDisplay.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('messageUpdated', (message) => {
	const html = Mustache.render(messageTemplate, {
		message: message.text,
		sender: message.sender,
		timestamp: moment(message.createdAt).format('h:mm a'),
	});
	$messagesDisplay.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({ room, users }) => {
	console.log('users: ', users);
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	$sidebar.innerHTML = html;
});

// join a room
socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});
