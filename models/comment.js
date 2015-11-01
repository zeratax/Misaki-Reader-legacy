var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({ 
	discussion_id: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'published', 'rejected', 'deleted'] },
	parent_id: Schema.Types.ObjectId,
    body: { type: String, max: 2000, trim: true }, 
    number: Number,
    rating: {
            upvotes: { type: Number, default: 0 },
            downvotes: { type: Number, default: 0 }
            },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },     
    date: { type: Date, default: Date.now } 
});


module.exports = mongoose.model('comment', commentSchema);