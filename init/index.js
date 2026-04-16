require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("connected to DB");
    initDB(); 
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: new mongoose.Types.ObjectId("69aebed5f7afb59dbe8d35e5"),
    }));

    await Listing.insertMany(initData.data);
    console.log("data was initialized");
  } catch (err) {
    console.log(err);
  }
};