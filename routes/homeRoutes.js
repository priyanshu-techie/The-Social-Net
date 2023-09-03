const express=require('express');
const router= express.Router();
const PostModel= require('../Models/postSchema');
const {ensureAuth, setCacheControl}= require('../utils/middlewares');
const upload = require('../config/multer');
const cloudinary= require('../config/cloudinary')


// prevent unauthorise access and all
router.get('/profile',setCacheControl,ensureAuth,(req,res)=>{
    res.render('profilePage.ejs');
})
router.get('/feed',setCacheControl,ensureAuth,(req,res)=>{
    res.render('feeds.ejs');
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