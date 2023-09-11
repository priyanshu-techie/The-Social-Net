const express=require('express');
const router= express.Router();
const PostModel= require('../Models/postSchema');
const Users = require('../Models/userSchemas');
const {ensureAuth, setCacheControl}= require('../utils/middlewares');
const upload = require('../config/multer');
const cloudinary= require('../config/cloudinary')


// prevent unauthorise access and all
router.get('/profile',setCacheControl,ensureAuth,async (req,res)=>{
    let profileInfo = await Users.findById(req.user.id);
    let posts = await PostModel.find({user:req.user.id}).sort({createdAt:'descending'}).lean();
    res.render('profilePage.ejs',{ posts, profileInfo});
})

router.get('/feed',setCacheControl,ensureAuth, async(req,res)=>{
  let posts = await  PostModel.aggregate([{
      $project:{ cloudinaryId:0, _id:0, __v:0 } // i want to get all the data except these values
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
  res.render('feeds.ejs',{posts});
  
})


router.get('/post/:id',setCacheControl,ensureAuth,async(req,res)=>{
  try{
    let postId = req.params.id;
    let post = await PostModel.findById(postId).lean();
    let user = await Users.findById(post.user).lean();

    res.render('individualPost.ejs',{post,name:user.userId,profileImage:user.profilePic});
  }
  catch(err){
    // if the user tries to enter a wrong url for the id part then redirect it to the feed
    console.log("user tried to enter a wrong url for individual post.");
    res.redirect("/user/feed");
  }
})


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

module.exports= router;