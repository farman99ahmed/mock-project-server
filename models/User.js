const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    }
    }, {
        timestamps: true
    });

module.exports = mongoose.model('User', userSchema)