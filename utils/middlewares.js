function ensureAuth(req,res, next){
    if(req.isAuthenticated()){
        next();
    }
    else
        res.redirect('/login');

}

function setCacheControl(req, res, next) {
    // this is to not store any cache so that the user cant go back after logout
    res.setHeader('Cache-Control', 'no-store');
    next();
}

module.exports={
    ensureAuth,
    setCacheControl
};