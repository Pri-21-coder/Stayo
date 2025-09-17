const mongoose= require("mongoose");
const initdata= require("./data.js");
const Listing= require("../models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/Airbnb_clone";
main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDB=async()=>{
    await Listing.deleteMany({});
     const newData = initdata.data.map((obj) => ({
        ...obj,
        owner: "68cace5b4cb5fa6de1e23ad2" // Replace with a valid owner ID from your DB
    }));
    await Listing.insertMany(newData);
    console.log("Data was initialized");
};
initDB();