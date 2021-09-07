const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    voter: {
        type: String
    },
    points: {
        type: Number
    }
}, {
    timestamps: true
});

const questionSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    question: {
        type: String
    },
    is_active: {
        type: Boolean
    },
    votes: [voteSchema]
}, {
    timestamps: true
});

const gameSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    title: {
        type: String
    },
    started_by: {
        type: String
    },
    is_active: {
        type: Boolean
    },
    questions: [questionSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);