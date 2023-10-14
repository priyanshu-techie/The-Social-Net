// post the new profile details 
async function checkIncomingImageMidleware(req, res, next) {
    // if received the file then move forward 
    console.log("middleware start ")
    console.log(req.body)
    console.log(req.file)
    console.log('\n\n\n')
    if (req.file){
      return next();
    } 
    else {
      try {
        let user = await Users.findById(req.user.id);
        console.log(user);
        console.log(req.body.newBio);
        console.log(req.body);
        user.bio = req.body.newBio;
        await user.save();
        res.redirect('/user/profile');
      }
      catch (e) {
        let user = await Users.findById(req.user.id);
        console.log(e);
        let err = {
          isError: true,
          msg: "Some error occoured!! Try Again."
        }
        res.render('editProfile.ejs', { user, err });
      }
    }
  }
  async function postProfileDetails(req, res) {
    try {
      let user = await Users.findById(req.user.id);
      // delete prior images 
      await cloudinary.uploader.destroy(user.profilePicID);
      // add new
      const result = await cloudinary.uploader.upload(req.file.path);
  
      // change the bio and pic details
      user.bio = req.body.newBio;
      user.profilePic = result.secure_url;
      user.profilePicID = result.public_id;
  
      await user.save();
      res.redirect('/user/profile');
    }
    catch (e) {
      let user = await Users.findById(req.user.id);
      console.log("error occored while uploading a new profile image", e);
      let err = {
        isError: true,
        msg: "Some error occoured!! Try Again. Note: You can't upload a VIDEO , only .jpeg .jpg .webp .png files allowed. File size should be less than 10MB"
      }
      res.render('editProfile.ejs', { user, err });
    }
  }
  router.post('/edit/profile',express.urlencoded({ extended: true }), express.json(),checkIncomingImageMidleware, upload.single('newProfile'), postProfileDetails)
  