const mongoose=require('mongoose');

function connect(){
    mongoose.connect('mongodb+srv://Priyanshu_Agrawal:pass123456@cluster0.zj4gcnz.mongodb.net/the_social_net', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>console.log('Connected to MongoDB')) // no callbacks used now, instead use promise or async await
    .catch(err=>console.error('Could not connect to MongoDB',err));
}


module.exports=connect;