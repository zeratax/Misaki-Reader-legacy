var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({
    target: Schema.Types.ObjectId,
    vote: { type: Number, min: -1, max: 1},
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('vote', voteSchema);