var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallerySchema = new Schema({
    title: [{
        english: { type: String, trim: true, unique: true },
        japanese: { type: String, trim: true, unique: true },
        alternative: { type: String, trim: true }
    }],
    properties: [{
        status: [{
            access: String,
            owner: { type: Schema.Types.ObjectId, ref: 'user'},
        }],
        chapters: [{
            name: String,
            page: Number
        }],
        pages: String,
        views: String,
        rating: {
            upvotes: Number,
            downvotes: Number
            },
        favorites: Number
    }],
    description: { type: String, max: 2000, trim: true },
    note: { type: String,  trim: true  },
    tags: [{ 
        tag: { type: Schema.Types.ObjectId, ref: 'tag' },
        rating: {
            upvotes: Number,
            downvotes: Number
            },  
        user: { type: String, default: 'Anon' }, 
        date: { type: Date, default: Date.now } 
    }],
    comments: { type: Schema.Types.ObjectId, ref: 'comment' },
    user: { type: Schema.Types.ObjectId, ref: 'user'},
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('gallery', gallerySchema);