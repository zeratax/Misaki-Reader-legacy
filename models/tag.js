var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    title: [{
        english: { type: String, required: true, trim: true, unique: true },
        japanese: { type: String, required: true, trim: true, unique: true },
        alternative: { type: String, trim: true }
    }],
    properties: [{
        status: { type: String, required: true },
        type: { type: String, required: true },
        rating: {
            upvotes: Number,
            downvotes: Number
            },
        favorites: Number,
        used: Number
    }],
    related : { type: Schema.ObjectId, ref: 'gallery' },
    description: { type: String,  trim: true  },
    note: { type: String,  trim: true  },
    comments: { type: Schema.ObjectId, ref: 'comment' },
    user: { type: Schema.ObjectId, ref: 'user', default: 'Anon' },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('tag', tagSchema);