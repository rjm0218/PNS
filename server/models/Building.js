const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
	buildlevels: { type: Array, required: false},
}, {collection: 'Buildings'});

buildingSchema.pre('save', async function(next) {
    next();
});

const Building = mongoose.model('Building', buildingSchema);

module.exports = Building;
