const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owners-model");
const ownerIsLoggedIn = require('../middlewares/ownerIsLoggedIn');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {generateToken} = require('../utils/generateToken');


if(process.env.NODE_ENV === "development"){
    router.post("/create",async function(req,res){
        let owners  = await ownerModel.find();
        if(owners.length > 0){
            req.flash("error","You don't have permission to create a new owner");
            return res.redirect("/owners/create");
        }
        
        let {fullname,email,password} = req.body;

        bcrypt.genSalt(10, function(err,salt){
            bcrypt.hash(password,salt,async function(err,hash){
                if(err){return res.send(err.message);}
                else{
                    let createdOwner = await ownerModel.create({
                        fullname,
                        email,
                        password : hash,
                    });
                res.redirect("/owners/create");
                }
            });
           });
 
        req.flash("success","Owner created successfully!!");
        res.redirect("/owners/create");
    })
}

if(process.env.NODE_ENV === "development"){
router.get("/admin",ownerIsLoggedIn,function(req,res){
    let success = req.flash("success");
    res.render("createproducts",{success});
})
}

if(process.env.NODE_ENV === "development"){
    router.get("/create",function(req,res){
        let error = req.flash("error");
        let success = req.flash("success");
        res.render("owner-create",{error,success});
    })
}

if(process.env.NODE_ENV === "development"){
    router.get("/login",function(req,res){
        let error = req.flash("error");
        res.render("owner-login",{error});
    })
}


if(process.env.NODE_ENV === "development"){
    router.post("/login",async function(req,res){
        let {email,password} = req.body;
        let owner = await ownerModel.findOne({email: email});
        if(owner){
            bcrypt.compare(password,owner.password,function(err,result){
                if(result){
                    let token = generateToken(owner);
                    res.cookie("token",token);
                    res.redirect("/owners/admin");
                }
                else{
                    req.flash("error","Email or password incorrect!");
                    return res.redirect("/owners/login");
                }
            });
        }
        else{
            req.flash("error","Email or password incorrect!");
            return res.redirect("/owners/login");
        }
    })
}



module.exports = router;