const generateMessage = (text, sender = 'System') => {
	return {
		text,
		sender,
		createdAt: new Date().getTime(),
	};
};

const generateLocationMessage = (url, sender = 'System') => {
	return {
		url,
		sender,
		createdAt: new Date().getTime(),
	};
};

module.exports = { generateMessage, generateLocationMessage };
