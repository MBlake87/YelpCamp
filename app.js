if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


const helmet = require("helmet")
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const localPassport = require("passport-local");
const campgroundRoutes = require("./routes/campgrounds.js");
const reviewRoutes = require("./routes/reviews.js");
const User = require("./models/user");
const userRoutes = require("./routes/users")
const mongoSanitize = require("express-mongo-sanitize");

const MongoStore = require("connect-mongo")

const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp"

mongoose.set("strictQuery", false);
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("connected")
});

const secret = process.env.SECRET || "thisisasecret"
const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on("error", function (e) {
    console.log("Store Error", e)
})

const sessionConfig = {
    store,
    secret: secret,
    name: "yelp",
    resave: false,
    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        // secure: true
    }

}
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/YOUR_CLOUDINARY_ACCOUNT/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/YOUR_CLOUDINARY_ACCOUNT/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/YOUR_CLOUDINARY_ACCOUNT/"
];
const fontSrcUrls = ["https://res.cloudinary.com/YOUR_CLOUDINARY_ACCOUNT/"];

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dqbfvqe95/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/"
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
                mediaSrc: ["https://res.cloudinary.com/dlzez5yga/"],
                childSrc: ["blob:"]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);


app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session())
app.use(mongoSanitize({
    replaceWith: '_'
}))

passport.use(new localPassport(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "Views"));
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")))


app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error")
    next();
})


app.get("/", (req, res) => {
    res.render("home");
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes)

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




