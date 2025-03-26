function log(message) {
	let datetime = new Date().toISOString();
	console.log(datetime + "	" + message);
}

module.exports = log;
