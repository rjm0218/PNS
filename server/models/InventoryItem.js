const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
	quantity: { type: String, required: true},
	box: { type: Boolean, required: true},
	multiplier: { type: String, required: false}
}, {collection: 'users'});

const InventoryItem = mongoose.model('InventoryItem', itemSchema);

module.exports = {InventoryItem, itemSchema};