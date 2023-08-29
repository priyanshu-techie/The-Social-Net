function ensureAuth(req,res, next){
    if(req.isAuthenticated()){
        next();
    }
    else
        res.redirect('/login');

}

module.exports=ensureAuth;