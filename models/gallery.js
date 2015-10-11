var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallerySchema = new Schema({
    english: String,
    japanese: String,
    artist: String,
    circle: String,
    parody: String,
    scanlator: String,
    convention: String,
    category: String,
    compilation: String,
    description: String,
    rating: Number,
    favorites: Number,
    comments: [{ body: String, date: Date }],
    uploader: {type: String, default: 'Anon'},
    uploaded_at: {type: Date, default: Date.now}
});


module.exports = mongoose.model('gallery', gallerySchema);