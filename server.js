const express=require('express');
const app=express();
const connect =require('./config/db');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const _404route = require('./routes/route404')
const passport=require('./config/passport');
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('express-flash');
const PORT = process.env.PORT || 8000

app.use(express.static('public'));

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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create( { mongoUrl:process.env.DB_STRING}),
  cookie:{
    maxAge:1000*3600*24*7 // expires at 7 days 
  }
}));

// setting passport session
app.use(passport.authenticate('session'));

// it cathes the error of any async operation which doesnt has a catch part
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});

app.use('/',authRoutes);
app.use('/user',homeRoutes);
app.use('*',_404route)

app.listen(PORT,()=>{
    console.log(`Server running at port ${PORT}`);
})
