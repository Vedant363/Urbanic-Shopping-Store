const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    image: {
        type: Buffer,
        default: ""
    },
    fullname: {
       type: String,
       trim: true
    },
    email: String,
    password: String,
    cart:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    }],
    orders: {
         type: Array,
         default: []
    },
    contact: Number,
    picture: String
})

module.exports = mongoose.model("user", userSchema);