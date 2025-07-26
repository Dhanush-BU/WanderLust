const mongoose = require("mongoose");
const { Schema } = mongoose;

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    url:String,
    filename: String,
    
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
    type:Schema.Types.ObjectId,
    ref:"Review",
  }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
