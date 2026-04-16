const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js")
const upload = multer({storage});

// Home
router.get("/home", listingController.home);

// Index
router.get("/", wrapAsync(listingController.index));

// Create with image upload
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image][url]"),
  wrapAsync(listingController.create)
);

// New
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show
router.get("/:id", wrapAsync(listingController.show));

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

// Update
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image][url]"), wrapAsync(listingController.update));

// Delete
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroy));

module.exports = router;