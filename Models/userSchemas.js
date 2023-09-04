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
    bio:{
        type:String,
        default:"Hey there!! I am using The Social Net."
    },
    profilePic:{
        type:String,
        default:"https://res.cloudinary.com/dubekbvdh/image/upload/v1693814926/blank-profile-picture_zph8ts.jpg"
    },
    profilePicID:{
        type:String,
        default:"blank-profile-picture_zph8ts"
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