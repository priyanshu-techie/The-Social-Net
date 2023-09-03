const express=require('express');
const router= express.Router();
const Users= require('../Models/userSchemas');
const {ensureAuth, setCacheControl}= require('../utils/middlewares');


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

// router.post('/addNewPost',(req,res)=>{
    
// })

module.exports= router;