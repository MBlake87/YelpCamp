const express = require("express");
const Router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware")
const Campground = require("../models/campground");
const ExpressError = require('../utils/ExpressError');
const reviews = require("../controllers/reviews")



Router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

Router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

module.exports = Router;

