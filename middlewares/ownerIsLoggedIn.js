const jwt = require("jsonwebtoken");
const userModel = require('../models/user-model');
const ownersModel = require("../models/owners-model");

module.exports = async function(req,res,next){
    if(!req.cookies.token){
        req.flash("error","You need to login first");
        return res.redirect("/owners/login");
    }

    try{
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let owner = await ownersModel
        .findOne({email: decoded.email})
        //all will be selected but password field will not be selected
        .select("-password");
        req.owner = owner;
        next();
    }
    catch(err){
        req.flash("error","something went wrong");
        res.redirect("/owners/login");
    }
};