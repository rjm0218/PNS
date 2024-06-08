const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
	user: { type: String, required: true},
    name: { type: String, required: true, unique: true },
	inventory: { type: Array, required: false},
	boosts: { 
		buildergear: {type: Array, required: false},
		researchgear: {type: Array, required: false},
		heroes: {type: Array, required: false},
		speeds: {type: Array, required: false}
	},
	resources: { type: Array, required: false},
	buildings: { type: Array, required: false}
}, {collection: 'accounts'});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;