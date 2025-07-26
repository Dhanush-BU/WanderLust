const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {listingSchema}=require("../schema.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");


//Reviews
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//Review Delete
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;