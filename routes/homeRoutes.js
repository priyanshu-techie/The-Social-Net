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
    let postProfileImage=[];
    let postCreator=[];
    let posts = await PostModel.find({}).sort({createdAt:'descending'}).lean();
    // here we are making individual requests to the db for each post, this is inefficient

    // using map as it is returning an array of promises(async function retunrns a resolved promise)
    let promises = posts.map(async (post) => {
      let user = await Users.findById(post.user);
      postProfileImage.push(user.profilePic);
      postCreator.push(user.userId);
    })
    // Creates a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected.
    // this is helping to block
    await Promise.all(promises);

    // async await is not blocking, once the posts are fetched, this line is executed: hence was getting empty arrays
    console.log(postProfileImage,postCreator);
    res.render('feeds.ejs',{posts, postProfileImage, postCreator});
})
router.get('/post',setCacheControl,ensureAuth,(req,res)=>{
    res.render('individualPost.ejs');
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