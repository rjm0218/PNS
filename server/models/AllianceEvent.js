const mongoose = require('mongoose');

const allEventSchema = new mongoose.Schema({
	index: {type: Number, required: false},
	alliance_name: { type: String, required: true},
    events: { type: Array, required: false},
}, {collection: 'AllianceEvents'});


const AllianceEvent = mongoose.model('AllianceEvent', allEventSchema);

module.exports = AllianceEvent;