var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    title: {
        english: { type: String, required: true, trim: true, unique: true },
        japanese: { type: String, required: true, trim: true, unique: true },
        alternative: { type: String, trim: true }
    },
    properties: {
        status: { type: String, default: 'pending', enum: ['pending', 'published'] },
        rating: [{
            user: { type: Schema.Types.ObjectId, ref: 'user'},
            vote: { type: Number, min: -1, max: 1},
            _id: false
            }],
        type : { type: String, required: true },
        related : { type: Schema.Types.ObjectId, ref: 'gallery' },
        description: { type: String,  trim: true, max: 500 }
    },
    note: { type: String,  trim: true, max: 500 },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    slug: String,
    published: { type: Date },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('tag', tagSchema);