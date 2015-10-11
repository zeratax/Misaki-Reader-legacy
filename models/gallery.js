var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Comments = require('../models/comment');

var gallerySchema = new Schema({
    title: [{
        english: { type: String, trim: true, unique: true },
        japanese: { type: String, trim: true, unique: true },
        alternative: { type: String, trim: true }
    }],
    properties: [{
        status: { type: String },
        artist: { type: String },
        circle: String,
        parody: String,
        scanlator: String,
        convention: String,
        category: String,
        compilation: String,
        pages: Number,
        rating: {
            upvotes: Number,
            downvotes: Number
            },
        favorites: Number
    }],
    description: { type: String, max: 2000, trim: true },
    note: { type: String,  trim: true  },
    tags: [{ 
        body: String, 
        rating: {
            upvotes: Number,
            downvotes: Number
            },  
        user: { type: String, default: 'Anon' }, 
        date: { type: Date, default: Date.now } 
    }],
    comments: [Comments],
    user: { type: String, default: 'Anon' },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('gallery', gallerySchema);