const socket = io();

const $roomName = document.querySelector('#roomName');

const $roomSelect = document.querySelector('#roomSelect');

const selectTemplate = document.querySelector('#select-template').innerHTML;

$roomSelect.addEventListener('change', (e) => {
	console.log(e.currentTarget);
	$roomName.value = e.currentTarget.value;
});

socket.on('home', (rooms) => {
	const html = Mustache.render(selectTemplate, {
		rooms: rooms.rooms,
	});
	$roomSelect.insertAdjacentHTML('beforeend', html);
});
