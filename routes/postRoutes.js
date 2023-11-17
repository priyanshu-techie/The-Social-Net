const express = require('express');
const router = express.Router();
const PostModel = require('../Models/postSchema');
const Users = require('../Models/userSchemas');
const Comments = require('../Models/commentSchema');
const { ensureAuth, setCacheControl } = require('../utils/middlewares');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose')




// get individual post 
router.get('/:id', setCacheControl, ensureAuth, async (req, res) => {
    try {
      // in the id section i wanted to put object id, i cant put the id as just a string, 
      // hence i first created an object id and then put it in the $match operator
      let postId = new mongoose.Types.ObjectId(req.params.id); 
      let post = await PostModel.aggregate([ // get the post by id
      {$match:{_id:postId}},
      // get the user who made the post 
      {$lookup:{
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "postCreator",
          pipeline: [{$project:{userId: 1,profilePic: 1,_id:1}}]
        }},
      //get the comments
      {$lookup:{
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
          pipeline: [{$project:{postId: 0,createdAt:0,__v:0}},
            // sort according to first which made at first 
            {$sort:{createdAt:1}},
            // in the comment array elems add the feild having comment details
            {$lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "commenterDetails",
                pipeline: [{$project: {userId: 1,profilePic: 1,_id:1}}]
              }}
            ]
        },
      },
    ])
      
    res.render('individualPost.ejs', { post:post[0], comments:post[0].comments, currUser: req.user.id}); // since aggregation output is an array of documents and since i have used get element by id, hence i have only a single element
    }
    catch (err) {
      // if the user tries to enter a wrong url for the id part then redirect it to the feed
      console.log("user might have tried to enter a wrong url for individual post.");
      console.log("err msg: "+ err);
      res.redirect("/user/feed");
    }
  })
  


  // like the post
router.put('/likeIt/:id', async (req, res) => {
    try {
      await PostModel.findByIdAndUpdate(req.params.id, {
        $inc: { likes: 1 }, // adding liked by whome 
        $push: { likedBy: req.user.id }
      })
      res.status(200).send("post liked");
    }
    catch (e) {
      console.error(e);
      // ?? doubtful if this is a correct way
      res.status(500).send("some error occoured");
    }
  })
  
  // remove the like from the post 
  router.put('/unlikeIt/:id', async (req, res) => {
    try {
      await PostModel.findByIdAndUpdate(req.params.id, {
        $inc: { likes: -1 },
        $pull: { likedBy: req.user.id }
      })
      res.status(200).send("post like removed");
    }
    catch (e) {
      console.error(e);
      // ?? doubtful if this is a correct way
      res.status(500).send("some error occoured")
    }
  })
  
  // delete post
  router.delete('/deleteIt/:id', async (req, res) => {
    let postId = req.params.id;
    try {
      let post = await PostModel.findById(postId);
      if(post.user!==req.user){
        res.status(400).send('not allowed to delete a post you dont own');
        return;
      }
      await cloudinary.uploader.destroy(post.cloudinaryId);
      await PostModel.findByIdAndDelete(postId);
      // delete all the comments of the post 
      await Comments.deleteMany({postId:postId})
      res.status(200).send("post deleted");
    } catch (e) {
      console.log(e);
    }
  })
  
  router.post('/comment', async (req, res) => {
    try {
      let newComment = await Comments.create({
        comment: req.body.comment,
        postId: req.body.postId,
        userId: req.user.id
      })
      console.log("comment added");
  
      res.status(200).json({commId : newComment.id});
    }
    catch (e) { console.log(e) }
  })
  
  // route to get data of guy who made the comment ( i was initially going to the route /post/getCommDetai which was resulting in hitting of the endpoint /post/:id and hence i was getting error )
  
  router.get('/comment/getCommenterDetails',async(req,res)=>{
    const userDetails =await Users.findById(req.user.id).lean(); 
    res.json({id:req.user.id,userId:userDetails.userId, profilePic: userDetails.profilePic })
  })
  

  // like a comment 
  router.put('/comment/likeComment/:id',async(req,res)=>{
    
    try {
      await Comments.findByIdAndUpdate(req.params.id, {
        $inc:{likes:1}
      })
      res.status(200).send("comment liked");
    }
    catch (e) {
      console.error(e);
      // ?? doubtful if this is a correct way
      res.status(500).send("some error occoured");
    }
  
  })

  // unlike a comment
  router.put('/comment/unLikeComment/:id',async(req,res)=>{
    
    try {
      await Comments.findByIdAndUpdate(req.params.id, {
        $inc:{likes:-1}
      })
      res.status(200).send("comment unLiked");
    }
    catch (e) {
      console.error(e);
      // ?? doubtful if this is a correct way
      res.status(500).send("some error occoured");
    }
  
  })

  router.delete('/comment/deleteComment/:commId',async(req,res)=>{
    try {
      await Comments.findByIdAndDelete(req.params.commId);
      res.status(200).send('deleted successfully');
    } catch (error) {
      console.log(error);
    }
  })


  module.exports = router;