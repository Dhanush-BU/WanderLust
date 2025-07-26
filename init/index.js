const mongoose=require("mongoose");
let { data } = require("./data.js");
const Listing=require("../models/listing.js");



main()
    .then(()=>{
        console.log("connect to DB");
    })
    .catch((err)=>{
        console.log(err);
    })

async function main(){
    await mongoose.connect("mongodb://localhost:27017/wanderlust");
}
const initDB=async()=>{
    await Listing.deleteMany({});
    data=data.map((obj)=>({...obj,owner:"6882701c22df5518a6f4f0cc"}));
    await Listing.insertMany(data);
    console.log("data was initialized");
}
initDB();
