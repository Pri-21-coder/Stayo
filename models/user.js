const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const passportLocalMongoose= require("passport-local-mongoose");
const userSchema= new Schema({
    email:{
        type:String,
        required: true
    }
    //username and password passportLocalMongoose automatically defined
});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);
//passport-local-mongoose automatically use some instance method
//like setPassword, changePassword and many more no need to
//define separately