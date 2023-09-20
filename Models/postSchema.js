const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  // stores the public url
  image: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
    default:0
  },
  // who liked the post
  likedBy:{
    type:[mongoose.Schema.Types.ObjectId],
    default:[]
  },
  // person that created that post 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true
    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
