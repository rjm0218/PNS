const checkTokenPresence = require('./checkTokenPresence');
const checkTokenRevoked = require('./checkTokenRevoked');
const verifyJwtToken = require('./verifyJwtToken');

module.exports = [checkTokenPresence, checkTokenRevoked, verifyJwtToken];