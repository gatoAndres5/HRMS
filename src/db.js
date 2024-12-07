// to use mongoDB
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://ec2-18-117-131-55.us-east-2.compute.amazonaws.com/authen", { useNewUrlParser: true, useUnifiedTopology:true });

module.exports = mongoose;