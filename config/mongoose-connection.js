const mongoose = require('mongoose');
const config = require('config');

const dbgr = require("debug")("development:mongoose");

mongoose
.connect(`mongodb+srv://vedantghumade363:uXqHC9vedQtOpaHm@test-cluster-1.rz4i1e7.mongodb.net/?retryWrites=true&w=majority&appName=test-cluster-1`)
.then(function(){
    dbgr("connected to database");
})
.catch(function(err){
    dbgr(err);
})

module.exports = mongoose.connection;