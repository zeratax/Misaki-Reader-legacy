var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallerySchema = new Schema({
    title: {
        english: { type: String, unique :true, trim: true, max: 50 },
        japanese: { type: String, unique :true, trim: true, max: 50  },
        alternative: [{ type: String, trim: true, max: 50  }]
    },
    properties: {
        status: { type: String, default: 'edit', enum: ['edit', 'pending', 'published', 'rejected', 'deleted'] },
        chapters: [{
            name: String,
            page: Number,
            _id: false
        }],
        pages: { type: Number, min: 5, max: 400 },
        views: Number,
        description: { type: String, max: 1000, trim: true }
    },
    note: { type: String,  trim: true, max: 500   },
    tags: [{ 
        tag: { type: Schema.Types.ObjectId, ref: 'tag' },
        user: { type: Schema.Types.ObjectId, ref: 'user' }, 
        date: { type: Date, default: Date.now },
    }],
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true},
    number: Number,
    published: { type: Date },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('gallery', gallerySchema);