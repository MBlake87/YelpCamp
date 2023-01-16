const express = require("express");
const Router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas.js");

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

Router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds });
})

Router.get("/new", (req, res) => {
    res.render("campgrounds/new");
})

Router.post("/", validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`);

}))

Router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    res.render("campgrounds/show", { campground })
}))

Router.get("/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
}))

Router.put("/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

Router.delete("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds/");
}))

module.exports = Router;