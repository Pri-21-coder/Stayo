require('dotenv').config();
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mongoose= require("mongoose");
const initData= require("./data.js");
const Listing= require("../models/listing.js");
// Initialize Mapbox Geocoding Client
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
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
const initDB = async () => {
  // Clear existing data
  await Listing.deleteMany({});

  // Add a default owner to each listing
  let sampleListings = initData.data.map((obj) => ({
    ...obj,
    owner: "68cace5b4cb5fa6de1e23ad2" // Replace with a valid owner ID
  }));

  // Loop through each listing to geocode and save
  for (let listing of sampleListings) {
    // 1. Geocode the location
    let response = await geocodingClient
      .forwardGeocode({
        query: listing.location,
        limit: 1,
      })
      .send();

    // 2. Add the geometry data to the listing object
    listing.geometry = response.body.features[0].geometry;

    // 3. Save the individual listing
    const newListing = new Listing(listing);
    await newListing.save();
  }

  console.log("Data was initialized with geocoding!");
};

initDB();