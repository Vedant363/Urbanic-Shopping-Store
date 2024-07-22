const express = require('express');
const router = express.Router();
const {registerUser, loginUser, logout} = require("../controllers/authController")
const upload = require('../config/multer-config');
const userModel = require('../models/user-model');
const isLoggedIn = require('../middlewares/isLoggedIn');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {generateToken} = require('../utils/generateToken');


router.get("/",function(req,res){
    res.send("Hi user");
})

router.post("/register",registerUser);

router.post("/login", loginUser);

router.get("/logout",logout);

router.post("/postimage",upload.single("image"),isLoggedIn,async function(req,res){
    try{
    let user = await userModel.findOne({email: req.user.email});
    user.image = req.file.buffer.toString('base64');
    await user.save();
    res.render("myaccount",{user: user});
}
    catch(err){
        res.send(err.message);
    }
});

router.post("/updateinfo",isLoggedIn,async function(req,res){
    try{
        let {name,email} = req.body;
        let user = await userModel.findOneAndUpdate({email: req.user.email},{fullname: name,email},{new: true});
        await user.save();
        res.cookie("token","");
        res.redirect("/");
    }
    catch(err){
        res.send(err.message);
    }
});

router.post("/passwordchange",isLoggedIn, async function(req,res){
     let {currentPassword, newPassword, confirmPassword} = req.body;
     let user = await userModel.findOne({email: req.user.email});
     if(user){
         bcrypt.compare(currentPassword,user.password,function(err,result){
             if(result){
                if(newPassword.trim() === confirmPassword.trim()){
                    bcrypt.genSalt(10, function(err,salt){
                        bcrypt.hash( confirmPassword,salt,async function(err,hash){
                            if(err){return res.send(err.message);}
                            else{
                            user.password = hash;
                            await user.save();
                            let token = "";
                            res.cookie("token",token);
                            req.flash("success","Password updated login one more time");
                            res.redirect("/login");
                            }
                        });
                       });             
                }
                else{
                    req.flash("error","Confirmed password is not matching with new password!");
                    return res.redirect("/passwordchange");
                }
             }
             else{
                 req.flash("error","Current Password is incorrect!");
                 return res.redirect("/passwordchange");
             }
         });
     }
     else{
         return res.redirect("/login");
     }
})

module.exports = router;