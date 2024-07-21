const mongoose = require("mongoose");
const  colors = require('colors');
require("dotenv").config();

const connectDB = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database Connected: ${conn.connection.host}`.bgGreen);
  } catch (error) {
    console.log(error);
  }
}
module.exports = connectDB;