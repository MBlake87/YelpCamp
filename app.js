const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");
const { join } = require("path");
const { Router } = require("express");
const campgrounds = require("./routes/campgrounds.js");
const reviews = require("./routes/reviews.js");
const session = require("express-session")

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("connected")
});

const sessionConfig = {
    secret: "thisisasecret",
    resave: false,
    saveUninitialized: true

}
app.use(session(sessionConfig));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "Views"));
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.render("home");
})

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews)

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, } = err;
    if (!err.message)
        err.message = "Something Went Wrong"

    res.status(statusCode).render("error", { err })
})

app.listen(3000, () => {
    console.log("serving on port 3000");
})




