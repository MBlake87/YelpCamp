const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("connected")
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));


app.get("/", (req, res) => {
    res.render("home");
})

app.listen(3000, () => {
    console.log("serving on port 3000");
})


