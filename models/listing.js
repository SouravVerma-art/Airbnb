const mongoose = require("mongoose");
const Review = require("./review.js")

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://jayvas.com/wp-content/uploads/2020/11/airbnb-real-estate-company.jpg"
        }
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    location: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: String,
        enum: ["trending", "rooms", "mountains", "lake", "beach", "forest", "arctic", "camping", "city", "castles", "pools"],
        default: "trending"
    }
}, { timestamps: true });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;