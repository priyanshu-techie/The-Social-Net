const express=require('express');
const app=express();
const connect =require('./config/db');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const passport=require('./config/passport');
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('express-flash');

app.use(express.static(__dirname+'/public'));

// for accessin req.body
app.use(express.urlencoded({extended:true}))
app.use(express.json());

// using dot env
require("dotenv").config({path:"./config/.env"});

connect();

app.use(flash());
app.set('view engine','ejs');

// settin passport js 
app.use(passport.initialize());

// setting express session

app.use(session({
  secret: "any random secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create( { mongoUrl:'mongodb+srv://Priyanshu_Agrawal:pass123456@cluster0.zj4gcnz.mongodb.net/the_social_net'}),
  cookie:{
    maxAge:1000*3600*24*7 // expires at 7 days 
  }
}));

// setting passport session
app.use(passport.authenticate('session'));



app.use('/',authRoutes);

app.listen(8000,()=>{
    console.log("Server running at http://localhost:8000");
})


// if logged in , dont take to the index, login or signUP