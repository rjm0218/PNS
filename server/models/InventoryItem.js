const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
	quantity: { type: String, required: true},
	box: { type: Boolean, required: true},
	multiplier: { type: String, required: false}
}, {collection: 'users'});

itemSchema.pre('save', async function(next) {
    next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;