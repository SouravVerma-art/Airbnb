const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review.js");
const{isLoggedIn, isReviewAuthor} = require("../middleware.js")


//Review  route
router.post("/:id/reviews",isLoggedIn
    , async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Added!");

    res.redirect(`/listings/${listing._id}`);
})

// Delete review route
router.delete('/:id/reviews/:reviewId',isLoggedIn, isReviewAuthor, wrapAsync(async(req, res)=>{
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted Successfully!")
    res.redirect(`/listings/${id}`)
}));

module.exports = router;