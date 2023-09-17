const express=require('express');
const router= express.Router();
const PostModel= require('../Models/postSchema');
const Users = require('../Models/userSchemas');
const {ensureAuth, setCacheControl}= require('../utils/middlewares');
const upload = require('../config/multer');
const cloudinary= require('../config/cloudinary');


// get the profile page
router.get('/profile',setCacheControl,ensureAuth,async (req,res)=>{
    let profileInfo = await Users.findById(req.user.id);
    let posts = await PostModel.find({user:req.user.id}).sort({createdAt:'descending'}).lean();
    res.render('profilePage.ejs',{ posts, profileInfo});
})
// get the feed 
router.get('/feed',setCacheControl,ensureAuth, async(req,res)=>{
  let posts = await  PostModel.aggregate([{
      $project:{ cloudinaryId:0, __v:0 } // i want to get all the data except these values
    },
    // sort the items in desending 
    {
      $sort:{ "createdAt": -1}
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
  res.render('feeds.ejs',{ posts, currUser:req.user.id });
  
})

// get individual post 
router.get('/post/:id',setCacheControl,ensureAuth,async(req,res)=>{
  try{
    let postId = req.params.id;
    let post = await PostModel.findById(postId).lean();
    let user = await Users.findById(post.user).lean();

    res.render('individualPost.ejs',{post,name:user.userId,profileImage:user.profilePic,currUser:req.user.id});
  }
  catch(err){
    // if the user tries to enter a wrong url for the id part then redirect it to the feed
    console.log("user tried to enter a wrong url for individual post.");
    res.redirect("/user/feed");
  }
})

// page to upload a new post
router.get('/newpost',setCacheControl,ensureAuth,(req,res)=>{
    res.render('newPost.ejs');
})


// adding new post 
router.post('/addNewPost', upload.single("newPost"), async (req,res)=>{
    try {
        // Upload image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // creating new user
        await PostModel.create({
          image:result.secure_url,
          cloudinaryId: result.public_id,
          caption:req.body.caption,
          user:req.user.id
        })
        console.log("Post has been added!");
        res.redirect("/user/profile");

      } catch (err) {
        req.flash('errors',"Some error occoured. Try again !");
        return res.redirect('/user/newpost');
      }
})

// like the post
router.put('/likePost/:id',async(req,res)=>{
  try{
    await PostModel.findByIdAndUpdate(req.params.id,{
      $inc:{likes:1}, // adding liked by whome 
      $push:{likedBy: req.user.id}
    })
    res.status(200).send("post liked");
  }
  catch(e){
    console.error(e);
    // ?? doubtful if this is a correct way
    res.status(500).send("some error occoured");
  }
})

// remove the like from the post 
router.put('/unLikePost/:id',async(req,res)=>{
  try{
    await PostModel.findByIdAndUpdate(req.params.id,{
      $inc:{likes:-1},
      $pull:{likedBy: req.user.id}
    })
    res.status(200).send("post like removed");
  }
  catch(e){
    console.error(e);
    // ?? doubtful if this is a correct way
    res.status(500).send("some error occoured")
  }
})

module.exports= router;