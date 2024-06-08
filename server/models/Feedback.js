const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
},{collection: 'Feedback'});

// Feedback model
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = {Feedback, feedbackSchema};