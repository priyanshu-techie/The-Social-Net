const express = require('express');
const router = express.Router();
const PostModel = require('../Models/postSchema');
const Users = require('../Models/userSchemas');
const Comments = require('../Models/commentSchema');
const { ensureAuth, setCacheControl } = require('../utils/middlewares');
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose')


// get the profile page
router.get('/profile', setCacheControl, ensureAuth, async (req, res) => {
  let profileInfo = await Users.findById(req.user.id);
  let posts = await PostModel.find({ user: req.user.id }).sort({ createdAt: 'descending' }).lean();
  res.render('profilePage.ejs', { posts, profileInfo });
})
// get the feed 
router.get('/feed', setCacheControl, ensureAuth, async (req, res) => {
  let posts = await PostModel.aggregate([
    // sort the items in desending 
    {
      $sort: { "createdAt": -1 }
    },
    // using the users document to get the post creator
    {
      $lookup:
      {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "postCreator",
        pipeline: [
          {
            $project: {
              userId: 1,
              profilePic: 1,
            },
          },
        ],
      }
      /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
      */
    }
  ])
  res.render('feeds.ejs', { posts, currUser: req.user.id });

})

// get individual post 
router.get('/post/:id', setCacheControl, ensureAuth, async (req, res) => {
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
        pipeline: [{$project:{userId: 1,profilePic: 1}}]
      }},
    //get the comments
    {$lookup:{
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
        pipeline: [{$project:{postId: 0,createdAt:0,_id:0,__v:0}},
          // sort according to first which made at first 
          {$sort:{createdAt:1}},
          // in the comment array elems add the feild having comment details
          {$lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "commenterDetails",
              pipeline: [{$project: {userId: 1,profilePic: 1}}]
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

// page to upload a new post
router.get('/newpost', setCacheControl, ensureAuth, (req, res) => {
  res.render('newPost.ejs');
})


// adding new post 
router.post('/addNewPost', upload.single("newPost"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // creating new user
    await PostModel.create({
      image: result.secure_url,
      cloudinaryId: result.public_id,
      caption: req.body.caption,
      user: req.user.id
    })
    console.log("Post has been added!");
    res.redirect("/user/profile");

  } catch (err) {
    req.flash('errors', "Some error occoured. Try again !");
    return res.redirect('/user/newpost');
  }
})

// like the post
router.put('/likePost/:id', async (req, res) => {
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
router.put('/unLikePost/:id', async (req, res) => {
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

router.delete('/deletePost/:id', async (req, res) => {
  let postId = req.params.id;
  try {
    let post = await PostModel.findById(postId);
    await cloudinary.uploader.destroy(post.cloudinaryId);
    await PostModel.findByIdAndDelete(postId);
    // delete all the comments of the post 
    await Comments.deleteMany({postId:postId})
    res.status(200).send("post deleted");
  } catch (e) {
    console.log(e);
  }
})

router.post('/post/comment', async (req, res) => {
  try {
    await Comments.create({
      comment: req.body.comment,
      postId: req.body.postId,
      userId: req.user.id
    })
    console.log("comment added");
    res.status(200).send('comment added');
  }
  catch (e) { console.log(e) }
})

// route to get data of guy who made the comment ( i was initially going to the route /post/getCommDetai which was resulting in hitting of the endpoint /post/:id and hence i was getting error )

router.get('/post/comment/getCommenterDetails',async(req,res)=>{
  const userDetails =await Users.findById(req.user.id).lean(); 
  res.json({userId:userDetails.userId, profilePic: userDetails.profilePic })
})

module.exports = router;