const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const listingSchema= new Schema({
    title:{
        type: String,
        required: true,
    },
    description:String,
    image: {
       type: String,
       default:"https://neilpatel.com/wp-content/uploads/2019/08/google.jpg",
       set: (v)=>v===""?"https://neilpatel.com/wp-content/uploads/2019/08/google.jpg":v,
    },
    price:Number,
    location:String,
    country: String,
});
const Listing= mongoose.model("Listing", listingSchema);
module.exports= Listing;