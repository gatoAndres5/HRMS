// to use mongoDB
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://ec2-3-16-163-141.us-east-2.compute.amazonaws.com/authen", { useNewUrlParser: true, useUnifiedTopology:true });

module.exports = mongoose;