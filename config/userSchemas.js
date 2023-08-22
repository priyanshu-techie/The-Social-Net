const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    userId:{
        type:String,
        Required:true
    },
    firstName:{
        type:String,
        Required:true
    },
    lastName:{
        type:String,
        Required:true
    },
    email:{
        type:String,
        Required:true
    },
    salt:{
        type:String,
        Required:true
    },
    hash:{
        type:String,
        Required:true
    }
})


module.exports=mongoose.model('Users',userSchema);