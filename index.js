const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing  = require("./models/listing");
const Review = require("./models/review.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const WrapAsync = require("./utilis/wrapAsync");
const ExpressError = require("./utilis/ExpressError");
const schemaVal = require("./Schema.js"); 
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("ejs",ejsMate); //layouts
app.use(express.static(path.join(__dirname,"./public")))
main().then(res =>{
    console.log("connection successfull");
}).catch(err => {
    console.log(err);
})


async function main() {
    await mongoose.connect("mongodb+srv://krush884:54cvar8mtf@krushcluster.hmxy5.mongodb.net/majorProject");
}

const validateListing = (req,res,next) =>{
    let {error} = schemaVal.validate({listing : req.body});
        if(error){
            throw new ExpressError(400,error);
        }
        else{
            next();
        }
}

app.get("/", function(req,res){
    res.send("Server working properly")
})


app.get("/allListings", WrapAsync( async function(req,res){
    let listing = await Listing.find();
    res.render("./listing/index.ejs", {listing} );
}))

app.get("/allListings/ListyourHome", (req, res) => {
    res.render("./listing/create.ejs");
})

app.get("/allListings/:id", WrapAsync(async function(req,res){
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if (!listing) {
    return res.status(404).send("Listing not found");
    }
    res.render("./listing/show.ejs", { listing });
}))

app.get("/allListings/:id/edit", WrapAsync( async function (req,res){
        let id = req.params.id;
        let listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("./listing/edit.ejs", { listing });
}))

//reviews
app.post("/allListings/:id/reviews", WrapAsync(async function(req, res) {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    let newReview = new Review(req.body.review);
    Listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();

    res.redirect(`/allListings/${listing._id}`);
}));


app.post("/allListings", validateListing, WrapAsync (async (req, res,next) => {
        let newListing = new Listing(req.body);
        await newListing.save();
        console.log("Created Listing:", newListing);
        res.redirect("/allListings/" + newListing._id);
}));

app.put("/allListings/:id", WrapAsync(async function (req, res) {
    let id = req.params.id;
    let listing = await Listing.findById(id);  // Get the existing listing
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    let { title, price, location, country, image, description } = req.body;
        // Preserve the existing image if no new image is provided
        await Listing.findByIdAndUpdate(id,{
            title: title,
            price:  price,
            location: location,
            country: country,
            "image.url":image,
            description:description
        },{new:true})
        res.redirect("/allListings/" + id);
}));

app.delete("/allListings/:id", WrapAsync( async function (req,res) {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/allListings");
}));

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"something went wrong")
)})

app.use((err,req,res,next)=>{
    let {statusCode,message} = err;
    res.render("./listing/error.ejs",{message});
})

app.listen(3000);