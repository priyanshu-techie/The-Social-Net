const mongoose =require('mongoose');

const commentSchema= new mongoose.Schema({
    comment:{
        type:String,
        required:true
    },
    // id of post where the comment has been made
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    // person who made the comment
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now 
    },
    likes:{
        type:Number,
        default:0
    } 
})

module.exports= mongoose.model('Comments',commentSchema);