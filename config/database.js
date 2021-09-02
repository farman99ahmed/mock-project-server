require('dotenv').config();
const mongoose = require('mongoose');

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database");
    } catch (error) {
        console.error("DB connection failed: ", error.message);
    }
};

module.exports = connection;