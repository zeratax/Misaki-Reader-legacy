var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: { type: String, default: 'Anon' max: 15, trim: true },
    mail: { type: String, required: true, trim: true, unique: true },
    image: String,
    role: { type: String, default: user
    favoriteg: [{
        gallery: { type: Schema.Types.ObjectId, ref: 'gallery' },
        date: { type: Date, default: Date.now }
    }],
    favoritet: [{
        tag: { type: Schema.Types.ObjectId, ref: 'tag' },
        date: { type: Date, default: Date.now }
    }],
    bookmarks: [{
        gallery: { type: Schema.Types.ObjectId, ref: 'gallery' },
        date: { type: Date, default: Date.now }
    }],
    hidden: Boolean,
    points: [{ 
        uploads: Number, 
        tags: Number,
        comments: Number
    }],
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('user', userSchema);