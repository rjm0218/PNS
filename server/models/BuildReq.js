const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const reqSchema = new mongoose.Schema({
	_id: {type: mongoose.Types.ObjectId},
    requirements: { type: Array, required: true}
}, {collection: 'BuildingReq'});

const BuildReq = mongoose.model('BuildReq', reqSchema);

module.exports = BuildReq;
