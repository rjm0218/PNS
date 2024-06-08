const mongoose = require('mongoose');

const allEventsSchema = new mongoose.Schema({
	index: {type: Number, required: false},
	alliance_name: { type: String, required: true},
    events: { type: Array, required: false},
}, {collection: 'AllianceEvents'});


const AllianceEvents = mongoose.model('AllianceEvents', allEventsSchema);

module.exports = AllianceEvents;