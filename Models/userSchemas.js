const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    salt:{
        type:String,
        required:true
    },
    hash:{
        type:String,
        required:true
    }
})


module.exports=mongoose.model('Users',userSchema);