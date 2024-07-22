const userModel = require('../models/user-model');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {generateToken} = require('../utils/generateToken');

module.exports.registerUser = async function(req,res){
    try{
        let {fullname,email,password} = req.body;
        
        let findUser = await userModel.findOne({email: email});
        if (findUser) {
            req.flash("error", "You already have an account, please login!");
            return res.redirect('/login'); // or wherever you want to redirect
          }
        else{
            if(fullname.trim()==="" || email.trim()==="" || password.trim()===""){
                req.flash("error","Fields cannot be kept empty!!")
                res.redirect("/register");
            }
            else{
               bcrypt.genSalt(10, function(err,salt){
                bcrypt.hash(password,salt,async function(err,hash){
                    if(err){return res.send(err.message);}
                    else{
                    let createdUser = await userModel.create({
                        fullname,
                        email,
                        password: hash
                    });
    
                    let token = generateToken(createdUser);
                    res.cookie("token",token);
                    res.redirect("/login");
                    }
                });
               });
            }
        }

    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("/register");
    }
};


module.exports.loginUser = async function(req,res){
    let {email,password} = req.body;
    let user = await userModel.findOne({email: email});
    if(user){
        bcrypt.compare(password,user.password,function(err,result){
            if(result){
                let token = generateToken(user);
                res.cookie("token",token);
                res.redirect("/shop");
            }
            else{
                req.flash("error","Email or password incorrect!");
                return res.redirect("/login");
            }
        });
    }
    else{
        req.flash("error","Email or password incorrect!");
        return res.redirect("/login");
    }
}

module.exports.logout = function(req,res){
    res.cookie("token","");
    res.redirect("/");
}