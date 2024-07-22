const express = require('express');
const isLoggedIn = require('../middlewares/isLoggedIn');
const router = express.Router();
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const { func } = require('joi');

router.get("/",function(req,res){
   res.render("main");
});

router.get("/login",function(req,res){
    let error = req.flash("error");
    let success = req.flash("success");
    res.render("login",{error,success});
 });

 router.get("/register",function(req,res){
    let error = req.flash("error");
    res.render("register",{error});
 });


// router.get("/shop",isLoggedIn,async function(req,res){
//     let products = await productModel.find();
//     let success = req.flash("success");
//     res.render("shop",{products,success});
// })

router.get("/shop", isLoggedIn, async function(req, res) {
    const sortBy = req.query.sortby;
    let products;

    try {
        switch(sortBy) {
            case 'highprice':
                products = await productModel.find().sort({ price: -1 });
                break;
            case 'lowprice':
                products = await productModel.find().sort({ price: 1 });
                break;
            case 'maxdiscount':
                products = await productModel.find().sort({ discount: -1 });
                break;
            default:
                products = await productModel.find();
        }

        let success = req.flash("success");
        res.render("shop", { products, success });
    } catch (error) {
        console.error("Error fetching products:", error);
        req.flash("error", "An error occurred while fetching products");
        res.redirect("/"); 
    }
});

router.get("/addtocart/:productid",isLoggedIn,async function(req,res){
    let user = await userModel.findOne({email: req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success","Added to cart");
    res.redirect("/shop");
})

router.get("/cart", isLoggedIn, async function (req, res) {
    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart");

    let grandCart = { items: {} };
    let totalQuantity = 0;

    user.cart.forEach(item => {
        if (grandCart.items[item._id]) {
            grandCart.items[item._id].quantity += 1;
        } else {
            grandCart.items[item._id] = { item: item, quantity: 1 };
        }
        totalQuantity += 1;
    });

    Object.values(grandCart.items).forEach(cartItem => {
        let item = cartItem.item;
        let originalPrice = Number(item.price);
        let discountPercentage = Number(item.discount) / 100;
        let discountAmount = originalPrice * discountPercentage;
        let discountedPrice = originalPrice - discountAmount;
        let priceAccordingToQunatity = discountedPrice * cartItem.quantity;
        cartItem.totalPrice = priceAccordingToQunatity;
    });

    let finalBill = Object.values(grandCart.items).reduce((total, cartItem) => {
        return total + cartItem.totalPrice;
    }, 0);

    finalBill += 20;
    res.render("cart", { user, finalBill, grandCart, totalQuantity });
});


router.get("/payment",isLoggedIn,async function(req,res){
    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart");

    let grandCart = { items: {} };

    user.cart.forEach(item => {
        if (grandCart.items[item._id]) {
            grandCart.items[item._id].quantity += 1;
        } else {
            grandCart.items[item._id] = { item: item, quantity: 1 };
        }
    });

    Object.values(grandCart.items).forEach(cartItem => {
        let item = cartItem.item;
        let originalPrice = Number(item.price);
        let discountPercentage = Number(item.discount) / 100;
        let discountAmount = originalPrice * discountPercentage;
        let discountedPrice = originalPrice - discountAmount;
        let priceAccordingToQunatity = discountedPrice * cartItem.quantity;
        cartItem.totalPrice = priceAccordingToQunatity;
    });

    let finalBill = Object.values(grandCart.items).reduce((total, cartItem) => {
        return total + cartItem.totalPrice;
    }, 0);

    finalBill += 20;

    res.render("payment", {finalBill});
})

router.get("/paymentsuccess",isLoggedIn,async function(req,res){
    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart");

    let grandCart = { items: {} };

    user.cart.forEach(item => {
        if (grandCart.items[item._id]) {
            grandCart.items[item._id].quantity += 1;
        } else {
            grandCart.items[item._id] = { item: item, quantity: 1 };
        }
    });

    Object.values(grandCart.items).forEach(cartItem => {
        let item = cartItem.item;
        let originalPrice = Number(item.price);
        let discountPercentage = Number(item.discount) / 100;
        let discountAmount = originalPrice * discountPercentage;
        let discountedPrice = originalPrice - discountAmount;
        let priceAccordingToQunatity = discountedPrice * cartItem.quantity;
        cartItem.totalPrice = priceAccordingToQunatity;
    });

    let finalBill = Object.values(grandCart.items).reduce((total, cartItem) => {
        return total + cartItem.totalPrice;
    }, 0);

    finalBill += 20;

    function formatDate(date) {
        const months = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        const day = date.getDate();
        const year = date.getFullYear();
    
        return `${monthName} ${day}, ${year}`;
    }
    
    const today = new Date();
    const formattedDate = formatDate(today);

    function generateRandomId(prefix, length) {
        const randomDigits = Math.random().toString().substr(2, length);
        return `${prefix}${randomDigits}`;
    }
    
    const randomId = generateRandomId('TRX', 9);

    //Empty the cart
    user.cart = [];  
    await user.save();
    
    
  res.render("paymentsuccess",{finalBill,formattedDate,randomId});
})

router.get("/myaccount",isLoggedIn,async function(req,res){
    let user = await userModel.findOne({email: req.user.email});
    res.render("myaccount",{user});
})

router.get("/passwordchange",isLoggedIn,async function(req,res){
    let error = req.flash("error");
    res.render("passwordchange",{error});
})


router.get("/increaseproduct/:productid",isLoggedIn,async function(req,res){
    let user = await userModel.findOne({email: req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    res.redirect("/cart");
})

router.get("/decreaseproduct/:productid",isLoggedIn,async function(req,res){
    let user = await userModel.findOne({email: req.user.email});
    const index = user.cart.indexOf(req.params.productid);
    if (index > -1) {
        user.cart.splice(index, 1);
        await user.save();
    }
    res.redirect("/cart");
})

router.post("/")


module.exports = router; 
