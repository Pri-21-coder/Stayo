if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}
const express= require("express");
const app= express();
const mongoose= require("mongoose");

const path=require("path");
const methodOverride= require("method-override");
const ejsmate= require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session= require("express-session");
const flash= require("connect-flash");
const listings= require("./routes/listings.js");
const reviews=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");
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
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));
//can check session working or not inspect- application- cookies and check
const sessionOptions= {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now()+7*60*60*24*3,
        maxAge:1000*60*60*24*3,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser=req.user;
    next();
});

//we use this flash using routes so before routes we use flash
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",userRouter);
/*app.get("/testlisting",async(req,res)=>{
    let sampleListing= new Listing({
        title: "My New Villa",
        description: "By the beach",
        price: 1200,
        location: "Calangute, Goa",
        country:  "India",
    });
    await sampleListing.save();
    console.log("Sample was saved");
    res.send("Successful testing");
});*/
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong!"}= err;
    res.status(statusCode).render("error.ejs",{message});
    //res.send("Something went wrong!");
    //res.status(statusCode).send(message);
});
app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});

