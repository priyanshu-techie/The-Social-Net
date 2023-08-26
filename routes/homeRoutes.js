const express=require('express');
const router= express.Router();
const validator = require('validator');
// the user model 
const Users= require('../config/userSchemas');
// generate password function to get the hash to save the password 
const { genPassword,validatePassword }=require('../utils/passportUtils');
const passport =require('../config/passport')

router.get('/',(req,res)=>{
    res.render('index.ejs');
})
router.get('/login',(req,res)=>{
    res.render('login.ejs')
})
router.get('/signup',(req,res)=>{
    res.render('signup.ejs',{err:false})
})
// prevent unauthorise access and all
router.get('/protected',(req,res)=>{
    res.render('protected');
})
router.get('/profile',(req,res)=>{
    res.render('profilePage.ejs');
})

const beforLoginMiddleware=async (req,res,next)=>{
    try{

        // this converts the email in correct format, ex= with lowercase without spaces,etc
        req.body.email = validator.default.normalizeEmail(req.body.email, { gmail_remove_dots: false })

        // i could also have used res.render instead of flash, but lets learn something new 
        const user=await Users.find({ email:req.body.email });
        //if user not found
        if(!user.length){
            req.flash('errors',"Email incorrect, or user doesn't exists");
            return res.redirect('/login');
        }
        const passwordCorrect=await validatePassword(req.body.password,user[0].salt,user[0].hash);
        // if password incorrect
        if(!passwordCorrect){
            req.flash('errors',"Password incorrect!");
            return res.redirect('/login');
        }

        next();
    }
    catch(e){
        console.log(e);
        res.redirect('/login');
    }
}

router.post('/login',beforLoginMiddleware,passport.authenticate('local', {
    successRedirect: '/protected',
    failureRedirect: '/login'
}))

router.post('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if (err)  return next(err); 
        res.redirect('/');
      });
})

router.post('/signup',async (req,res)=>{
    // check if user already exist
    // check if pass and confrmPass match
    // chcek if [pass length correct]
    // if everything correct then create a user in the database and forwared to the protected page

    try{
        //if pass!=cnfrmpass
        if(req.body.password!==req.body.confirmPassword){
            return res.render('signup',{err:true,msg:"Password and Confirm Password do not match!"})
        }

        // if password length less that 8 chars
        if(!validator.default.isLength(req.body.password,{min:8})){
            return res.render('signup',{err:true,msg:"Password must be minimum 8 characters!"});
        }

        // this converts the email in correct format, ex= with lowercase without spaces,etc
        req.body.email = validator.default.normalizeEmail(req.body.email, { gmail_remove_dots: false });

        // if(user already exist)
        const user=await Users.find({email:req.body.email});
        if(user.length!=0){
            return res.render('signup',{err:true,msg:"User already exists! Try another email or Login if have an account. "})
        }
        // if everything is fine then save the data in the database and redirect to the protected page 
        const passDetails=await genPassword(req.body.password);
        const newUser=await Users.collection.insertOne(
            {
                userId : req.body.userId,
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                email : req.body.email,
                salt : passDetails.salt,
                hash : passDetails.hash
            }
        );
        // passport functionality
        // longin method is added to the req object my passport 
        // if creates a user session and abstracts all these things for us
        req.login(newUser, function(err) {
            if (err) { return next(err); }
            res.redirect('/protected');
          });
    }
    catch(e){
        res.render('signup',{err:true,msg:"Some error occoured!!"})
        console.log(e);
    }
})


module.exports = router;