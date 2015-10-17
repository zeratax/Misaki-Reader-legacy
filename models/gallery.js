var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallerySchema = new Schema({
    title: {
        english: { type: String, trim: true, unique: true },
        japanese: { type: String, trim: true, unique: true },
        alternative: { type: String, trim: true }
    },
    properties: {
        status: { type: String, default: 'pending' },
        chapters: [{
            name: String,
            page: Number,
            _id: false
        }],
        files: [{ name: String }],
        views: Number,
        rating: {
            upvotes: { type: Number, default: 0 },
            downvotes: { type: Number, default: 0 }
            },
        description: { type: String, max: 2000, trim: true }
    },
    note: { type: String,  trim: true  },
    tags: [{ 
        tag: { type: Schema.Types.ObjectId, ref: 'tag' },
        rating: {
            upvotes: Number,
            downvotes: Number,
            },  
        user: { type: Schema.Types.ObjectId, ref: 'user' }, 
        date: { type: Date, default: Date.now },
    }],
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true},
    slug: String,
    published: { type: Date },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('gallery', gallerySchema);