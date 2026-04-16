// 1. IMPORT REQUIRED PACKAGES / MODULES
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
console.log(process.env.KEY)

const express = require("express");           // Web framework for Node.js
const mongoose = require("mongoose");         // MongoDB ODM
const path = require("path");                 // Handle file paths
const methodOverride = require("method-override"); // Allows PUT & DELETE in forms
const ejsMate = require("ejs-mate");          // Layout engine for EJS
const flash = require("connect-flash");       // Flash messages (success/error)
const session = require("express-session");   // Session management
const MongoStore = require('connect-mongo');
const cookieParser = require("cookie-parser");// Parse cookies

// Passport Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");

// User Model
const User = require("./models/user.js");

// 2. CREATE EXPRESS APP

const app = express();
const port = 8080;

// 3. SESSION CONFIGURATION
// Used for login sessions and authentication persistence

const dbUrl = process.env.ATLASDB_URL;


const store =  MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter:24*3600,
});
store.on("error", (err)=>{
    console.log("Error in Mongo session store", err)
})

const sessionOptions = {
    store,
    secret: "hack",        // Secret key used to sign session ID cookie
    resave: false,         // Do not save session if nothing changed
    saveUninitialized: true, // Save uninitialized sessions
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // Protects cookie from client-side JS access
    },
};

// 4. MIDDLEWARE SETUP

// Allows PUT and DELETE requests via query ?_method=PUT
app.use(methodOverride("_method"));

// Parse JSON request body
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser("secretcode"));

// Enable session middleware
app.use(session(sessionOptions));

// Enable flash messages
app.use(flash());


// 5. TEMPLATE ENGINE SETUP

// Use EJS-Mate layout engine
app.engine('ejs', ejsMate);

// Set view engine to EJS
app.set("view engine", "ejs");

// Set views folder path
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// 7. PASSPORT AUTHENTICATION SETUP
// Handles login, sessions, and user serialization

// Initialize Passport
app.use(passport.initialize());

// Enable persistent login sessions
app.use(passport.session());

// Use Local Strategy for authentication
passport.use(new LocalStrategy(User.authenticate()));

// Serialize user into session
passport.serializeUser(User.serializeUser());

// Deserialize user from session
passport.deserializeUser(User.deserializeUser());

// 6. GLOBAL FLASH MESSAGE MIDDLEWARE
// Makes flash messages available in all templates

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// 8. ROUTES IMPORT
// Separate route files for better project structure

const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');
const user = require('./routes/user.js');

// 10. DATABASE CONNECTION (MONGODB)


main()
    .then(() => {
        console.log("MongoDB connected Successfully....");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

// 13. MAIN APPLICATION ROUTES

app.use('/listings', listings);
app.use('/listings', reviews);
app.use('/', user);

// 14. START SERVER

app.listen(port, () => {
    console.log(`Server is live on http://localhost:${port}/listings`);
});