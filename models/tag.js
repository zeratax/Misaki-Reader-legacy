var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Comments = require('../models/comment');

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
    description: { type: String,  trim: true  },
    note: { type: String,  trim: true  },
    comments: [Comments],
    user: { type: String, default: 'Anon' },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('tag', tagSchema);