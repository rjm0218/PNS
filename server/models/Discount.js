const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
	heroes: [
		{ 
		name: {type: String, required: false},
		data: {type: Array, required: false}
		}
	],
	buildGear: [
		{
		level: {type: String, required: false},
		data: {type: Array, required: false}
		}
	],
	researchGear: [
		{
		level: {type: String, required: false},
		data: {type: Array, required: false}
		}
	],

}, {collection: 'discounts'});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
