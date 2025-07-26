const axios = require('axios');
const Listing=require("../models/listing");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");


module.exports.index = async (req, res) => {
    const { q } = req.query;   
    let allListings;
    if (q && q.trim() !== "") {
        allListings = await Listing.find({
            $or: [
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs", { allListings, search: q });
};


module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let coordinates = [77.5946, 12.9716]; // default to Bengaluru
    try {
        const response = await axios.get("https://api.radar.io/v1/geocode/forward", {
            headers: {
                Authorization: process.env.RADAR_SECRET_KEY // Use your live secret key from .env
            },
            params: {
                query: listing.location
            }
        });
        if (response.data.addresses && response.data.addresses.length > 0) {
            coordinates = [
                response.data.addresses[0].longitude,
                response.data.addresses[0].latitude
            ];
        }
    } catch (e) {
        console.error("Radar geocode failed:", e.message);
    }

    res.render("listings/show.ejs", { listing, coordinates, radarPk: process.env.RADAR_PUBLISHABLE_KEY });
};
module.exports.createListing=async (req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const result=listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError (400, result.error);
    }
        let {title,description,image,price,country,location}=req.body;
        const newListing = new Listing({
            title,
            description,
            image,
            price:Number(price),
            country,
            location
        });
        newListing.owner=req.user._id;
        newListing.image={url,filename};
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");

};
module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    listing.title = req.body.title;
    listing.description = req.body.description;
    listing.price = Number(req.body.price);
    listing.location = req.body.location;
    listing.country = req.body.country;

    if (req.file) {
        listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};