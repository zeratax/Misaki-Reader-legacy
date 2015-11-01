var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var editSchema = new Schema({
    target: Schema.Types.ObjectId,
    content: [{
        object: String,
        value: String
    }],
    note: { type: String,  trim: true, max: 500 },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    number: Number,
    published: { type: Date },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('edit', editSchema);