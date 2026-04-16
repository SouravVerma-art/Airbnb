const Listing = require("../models/listing");
const mongoose = require("mongoose");

// Home
module.exports.home = (req, res) => {
    res.send("Home Page");
};

// Index — supports ?search=&category=
module.exports.index = async (req, res) => {
    const { search, category } = req.query;
    let filter = {};

    if (category && category !== "all") {
        filter.category = category.toLowerCase();
    }

    if (search && search.trim() !== "") {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { description: regex },
        ];
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings, search: search || "", category: category || "all" });
};

// New Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show
module.exports.show = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID!");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing Does Not Exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// Create
module.exports.create = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// Edit
module.exports.edit = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID!");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing Does Not Exist!");
        return res.redirect("/listings");
    }

    listing.image.url = listing.image.url.replace("/upload/", "/upload/h_100,w_250/");
    res.render("listings/edit.ejs", { listing });
};

// Update
module.exports.update = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID!");
        return res.redirect("/listings");
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
};

// Delete
module.exports.destroy = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID!");
        return res.redirect("/listings");
    }

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
};
