const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review")


const ImageSchema = new Schema({
    filename: String,
    url: String
})

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})

const opts = { toJSON: { virtuals: true } }

const CampGroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"

        }],

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, opts);

CampGroundSchema.virtual("properties.popupMarkup").get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})

CampGroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        }
        )
    }
})

module.exports = mongoose.model("Campground", CampGroundSchema);