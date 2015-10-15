var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({ 
    body: { type: String, max: 2000, trim: true }, 
    status: { type: String, required: true },
    rating: [{
            upvotes: Number,
            downvotes: Number
            }],
    user: { type: Schema.Types.ObjectId, ref: 'user', default: 'Anon' },     
    date: { type: Date, default: Date.now } 
});


module.exports = mongoose.model('comment', commentSchema);