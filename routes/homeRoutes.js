const express = require('express');
const router = express.Router();
const PostModel = require('../Models/postSchema');
const Users = require('../Models/userSchemas');
const { ensureAuth, setCacheControl } = require('../utils/middlewares');
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose')
const urlModifier = require('../utils/tools');


// NOTE: aggregation results in an Array (dont try to access the object directly )

// get the profile page of the owner 
router.get('/profile', setCacheControl, ensureAuth, async (req, res) => {
  try {
      // just passing the id as string is not working hence created mognoose objectID 
      let objIdOfCurrUser = new mongoose.Types.ObjectId(req.user.id);
      let profileInfo = await Users.aggregate([
        {$match:{ _id : objIdOfCurrUser }},
        {$lookup:
          {
            from: 'posts',
            localField: '_id',
            foreignField: 'user',
            as: 'posts',
            pipeline:[{$sort:{createdAt:-1}}]
          }
        }
      ])

      console.log(req.user.id);
      // getting the transfromed url for the profile image 
      let newUrl = urlModifier(profileInfo[0].profilePic)
      res.render('profilePage.ejs', { profileInfo, profileId:req.user.id, currUser:req.user.id, newUrl });
    
  } catch (error) {
    console.log(error);
    res.redirect('/user/feed');
  }
})

// get profile page of different users
router.get('/profile/:id', setCacheControl, ensureAuth, async (req, res) => {
  let objIdOfCurrUser = new mongoose.Types.ObjectId(req.params.id);
  let profileInfo = await Users.aggregate([
    {$match:{ _id : objIdOfCurrUser }},
    {$lookup:
      {
        from: 'posts',
        localField: '_id',
        foreignField: 'user',
        as: 'posts',
        pipeline:[{$sort:{createdAt:-1}}]
      }
    }
  ])
  let newUrl = urlModifier(profileInfo[0].profilePic)
  res.render('profilePage.ejs', { profileInfo ,profileId : req.params.id, currUser : req.user.id, newUrl  });
})

// edit your profile
router.get('/edit/profile',async(req,res)=>{
  let user = await Users.findById(req.user.id);
  let err = {isError:false}
  res.render('editProfile.ejs',{user, err});
})

// post the new profile details 
router.post('/edit/profile',upload.single('newProfile'),async(req,res)=>{  // multer automatically handles the situation of no file reacieved
  try{
    let user = await Users.findById(req.user.id);
    // if file has been sent 
    if(req.file){
      // delete prior images 
      await cloudinary.uploader.destroy(user.profilePicID);
      // add new
      const result = await cloudinary.uploader.upload(req.file.path);
      
      // change the bio and pic details
      user.profilePic = result.secure_url;
      user.profilePicID = result.public_id;
    }
    user.bio = req.body.newBio;
  
    await user.save();
    res.redirect('/user/profile');
  }
  catch(e){
    let user = await Users.findById(req.user.id);
    let err;
    // if file has been sent 
    if(req.file){
      console.log("error occored while uploading a new profile image", e);
      err ={
        isError:true,
        msg:"Some error occoured!! Try Again. Note: You can't upload a VIDEO , only .jpeg .jpg .webp .png files allowed. File size should be less than 10MB"
      }
    }
    else{
      console.log(e);
      err ={
        isError:true,
        msg:"Some error occoured!! Try Again."
      }
    }
    res.render('editProfile.ejs',{ user, err });
  }
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
              _id:1
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
  // changing the url to modified 
  posts.forEach(e=>{
    e.postCreator[0].profilePic = urlModifier(e.postCreator[0].profilePic);
  })
  res.render('feeds.ejs', { posts, currUser: req.user.id });

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



module.exports = router;