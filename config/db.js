const mongoose=require('mongoose');
require("dotenv").config({path:"./config/.env"});

function connect(){
    mongoose.connect( process.env.DB_STRING , {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>console.log('Connected to MongoDB')) // no callbacks used now, instead use promise or async await
    .catch(err=>console.error('Could not connect to MongoDB',err));
}


module.exports=connect;