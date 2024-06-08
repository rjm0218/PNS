const allEventSchema = {
	title: {required: true, type: 'string'},
	index: { required: true, type: 'number' },
	duration: { required: false, type: 'Object' },
	rrule: { required: false, type: 'Object' }
};

module.exports = allEventSchema;