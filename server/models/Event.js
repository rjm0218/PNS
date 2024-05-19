const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
	pointItems: { type: Array, required: true},
	maxPoints: { type: String, required: true}
});

eventSchema.pre('save', async function(next) {
    next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;