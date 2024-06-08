const mongoose = require('mongoose');

// Define schemas
const gearSchema = new mongoose.Schema({
	name: {required: true, type: 'string'},
	level: {required: true, type: 'string'}
});

const boostSchema = new mongoose.Schema({
	name: {required: true, type: 'string'},
	value: { required: true, type: 'string' }
});

const heroSchema = new mongoose.Schema({
	name: {required: true, type: 'string'},
	plus: { required: true, type: 'string' },
	level: {required: true, type: 'string'}
});


module.exports = {gearSchema, boostSchema, heroSchema};