var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    title: {
        english: { type: String, required: true, trim: true, unique: true, max: 50 },
        japanese: { type: String, required: true, trim: true, unique: true, max: 50 },
        alternative: [{ type: String, trim: true, max: 50 }]
    },
    properties: {
        status: { type: String, default: 'pending', enum: ['edit', 'pending', 'published', 'rejected', 'deleted'] },
        type : { type: String, required: true, enum: ['Category', 'Artist', 'Circle', 'Scanlator', 'Parody', 'Character', 'Content', 'Collection']  },
        related : [ { type: Schema.Types.ObjectId, ref: 'gallery' } ],
        description: { type: String,  trim: true, max: 500 }
    },
    note: { type: String,  trim: true, max: 500 },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    number: Number,
    published: { type: Date },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('tag', tagSchema);