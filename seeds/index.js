const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedhelpers")

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("connected")
});


const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: "63c6684497c4150257ccf95d",
            title: `${sample(descriptors)}, ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro deserunt corrupti at voluptatem rerum neque, voluptates consequuntur ipsam iste mollitia cum sint, placeat commodi similique illum iusto voluptas ullam obcaecati.",
            price: price,
            images: [{
                filename: 'YelpCamp/zpmmdovivbi2l0mwe2hu',
                url: 'https://res.cloudinary.com/dqbfvqe95/image/upload/v1674638823/YelpCamp/zpmmdovivbi2l0mwe2hu.jpg',

            },
            {
                filename: 'YelpCamp/ewfl1k7pmaqpymfze7aq',
                url: 'https://res.cloudinary.com/dqbfvqe95/image/upload/v1674638826/YelpCamp/ewfl1k7pmaqpymfze7aq.jpg',

            }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

