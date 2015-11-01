var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: { type: String, default: 'Anon', max: 15, trim: true },
    mail: { type: String, required: true, trim: true, unique: true },
    image: String,
    role: { type: String, default: 'user' },
    favoriteg: [{
        gallery: { type: Schema.Types.ObjectId, ref: 'gallery' },
        date: { type: Date, default: Date.now },
        _id: false
    }],
    favoritet: [{
        tag: { type: Schema.Types.ObjectId, ref: 'tag' },
        date: { type: Date, default: Date.now },
        _id: false
    }],
    bookmarks: [{
        gallery: { type: Schema.Types.ObjectId, ref: 'gallery' },
        date: { type: Date, default: Date.now },
        _id: false
    }],
    viewed: [{
        gallery: { type: Schema.Types.ObjectId, ref: 'gallery' },
        page: Number,
        finished: Boolean,
        date: { type: Date, default: Date.now }
    }],
    hidden: Boolean,
    points: { 
        uploads: { type: Number, default: 0 },
        tags: { type: Number, default: 0 },
        comments: { type: Number, default: 0 }
    },
    number: Number,
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('user', userSchema);