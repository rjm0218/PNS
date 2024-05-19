const mongoose = require('mongoose');

const eventPtSchema = new mongoose.Schema({
    name: { type: String, required: true },
	pointValue: { type: String, required: true},
});

eventPtSchema.pre('save', async function(next) {
    next();
});

const EventPt = mongoose.model('EventPt', eventPtSchema);

module.exports = EventPt;