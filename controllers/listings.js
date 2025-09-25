const Listing=require("../models/listing");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const maptoken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: maptoken});
module.exports.index=async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}
module.exports.renderNewForm=(req,res)=>{
    //console.log(req.user);
    res.render("listings/new.ejs");
}
module.exports.showListings=async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author", // Populate the author field on each review
        },
    })
    .populate("owner");

    if(!listing){
        req.flash("error", "Listing you requested for does not exist!!");
        return res.redirect("/listings");
    }
    //console.log(listing);
    res.render("listings/show.ejs",{listing,mapToken:process.env.MAP_TOKEN});
}
module.exports.createListing=async(req,res)=>{
        let response= await geocodingClient
        .forwardGeocode({
            //query: "New Delhi, India",
            query: req.body.listing.location,
            limit: 1,
        })
        .send();
        //res.send("done!");
        let url=req.file.path;
        let filename=req.file.filename;
        //console.log(url,"..",filename);
        /*if(!req.body.listing){
            throw new ExpressError(400,"Send valid data for listing");
        }*/
        //let {title, description, image, price, country, location}=req.body;
        //let listing=req.body.listing;
        const newlisting=new Listing(req.body.listing);
        //console.log(req.user);
        newlisting.owner=req.user._id;
        newlisting.image={url,filename};
        newlisting.geometry=response.body.features[0].geometry;
        let savedListing=await newlisting.save();
        req.flash("success", "New Listing Created!");
        //console.log(newlisting);
        res.redirect("/listings");
    
}
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!!");
        return res.redirect("/listings");
    }
    let originalImageUrl= listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing=async(req,res)=>{
    let {id}= req.params;
    let listing=await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file!="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}
module.exports.destroyListing=async(req,res)=>{
    let {id}= req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
}
// controllers/listings.js

// controllers/listings.js

module.exports.index = async (req, res) => {
  const { category, q } = req.query;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ];
  }

  const allListings = await Listing.find(filter);

  // **THE FIX:** If no listings are found, just flash a message.
  // Do NOT redirect. The page will render with an empty `allListings` array.
  if (allListings.length === 0 && (q || category)) {
    req.flash("error", "No listings found that match your search!");
  }

  // Always render the index page.
  res.render("listings/index.ejs", { allListings });
};