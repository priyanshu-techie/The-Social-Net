const crypto=require('crypto');

async function genPassword(plainTextPassword){
    // salt is random data added to the hash to make it more random
                     //👇👇 gives out a buffer (similar to what we get when we read a file from node.js) and that should be converted to hex
    const salt=crypto.randomBytes(32).toString('hex');
    const generatedHash=crypto.pbkdf2Sync(plainTextPassword,salt,10000,64,'sha512').toString('hex');
    return{
        salt:salt,
        hash:generatedHash
    }
    
    //   pbkdf2Sync(password, salt, iterations, keylen, digest): Buffer , hence needed to be converted to hex
    
    //   const key = pbkdf2Sync('secret', 'salt', 100000, 64, 'sha512');  // sha512-SECURE HASH ALGORITHM
    //   console.log(key.toString('hex'));  
    
    // '3745e48...08d59ae'
}

function validatePassword(password,salt,hash){
    const checkHash=crypto.pbkdf2Sync(password,salt,10000,64,'sha512').toString('hex');
    return checkHash===hash;
}


module.exports={
    validatePassword,
    genPassword
}
