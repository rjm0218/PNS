const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema({
	token: {type: String, required: true, unique: true}
});

revokedTokenSchema.pre('save', async function(next) {
    next();
});

const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);

module.exports = RevokedToken;