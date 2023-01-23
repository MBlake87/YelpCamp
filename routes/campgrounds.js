const express = require("express");
const Router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas.js");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")




Router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds });
})

Router.get("/new", isLoggedIn, (req, res) => {

    res.render("campgrounds/new");
})

Router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save()
    req.flash("success", "Successfully created new campground!")
    res.redirect(`/campgrounds/${campground._id}`);

}))

Router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews", populate: { path: "author" }
    }).populate("author")
    if (!campground) {
        req.flash("error", "Campground was not found!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground })
}));

Router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
}))

Router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Successfully edited campground!")
    res.redirect(`/campgrounds/${campground._id}`);
}))

Router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!")
    res.redirect("/campgrounds/");
}))

module.exports = Router;