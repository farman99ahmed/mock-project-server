require('dotenv').config();
const express = require('express');
const uuid = require('uuid');
const authenticate = require('../middleware/authentication');
const User = require('../models/User');
const Game = require('../models/Game');
const pusher = require('../config/pusher');
const router = express.Router();

router.post('/new', authenticate, async (req, res) => {
    try {
        const {
            started_by,
            title
        } = req.body;

        if (!(started_by && title)) {
            res.status(400).json({
                error: "All inputs are required."
            });
        } else {
            if (await User.findOne({
                    _id: started_by
                })) {
                const game = await Game.create({
                    _id: uuid.v4(),
                    started_by,
                    title,
                    is_active: true
                });

                res.status(201).json({
                    message: "Game started successfully",
                    _id: game._id,
                });
            } else {
                res.status(400).json({
                    error: "Invalid User"
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/question', authenticate, async (req, res) => {
    try {
        const {
            gameId,
            question
        } = req.body;
        const game = await Game.findOne({
            _id: gameId
        });
        game.questions.push({
            _id: uuid.v4(),
            question,
            is_active: true
        })
        await game.save();
        await pusher.trigger('game', 'vote', {
            success: true
        });
        res.status(201).json({
            message: "Question updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


router.post('/vote', async (req, res) => {
    try {
        const {
            gameId,
            questionId,
            voter,
            points
        } = req.body;

        if (!(gameId && questionId && voter && points)) {
            res.status(400).json({
                error: "All inputs are required."
            });
        } else {
            const game = await Game.findOne({
                _id: gameId
            });
            const question = await game.questions.id(questionId);

            const hasUserAlreadyVoted = question.votes.some(obj => obj.voter === voter);

            if(hasUserAlreadyVoted) {
                const userVoteObjIndex = question.votes.findIndex((obj => obj.voter === voter));
                question.votes[userVoteObjIndex].points = points;
            } else {
                question.votes.push({
                    _id: uuid.v4(),
                    voter,
                    points
                });
            }

            await game.save();
            await pusher.trigger('game', 'vote', {
                success: true
            });
            res.status(201).json({
                message: "Vote updated successfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/question/active', authenticate, async (req, res) => {
    try {
        const {
            gameId,
            questionId
        } = req.body;

        if (!(gameId && questionId)) {
            res.status(400).json({
                error: "All inputs are required."
            });
        } else {
            const game = await Game.findById(gameId);
            game.active_question = questionId;
            await game.save();
            await pusher.trigger('game', 'vote', {
                success: true
            });
            res.status(201).json({
                message: "Success"
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/toggle', authenticate, async (req, res) => {
    try {
        const {
            gameId
        } = req.body;
        const game = await Game.findById(gameId);
        game.is_active = !(game.is_active);
        await game.save();
        await pusher.trigger('game', 'vote', {
            success: true
        });
        res.status(201).json({
            message: (game.is_active ? "Game activated" : "Game deactivated")
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/question/toggle', authenticate, async (req, res) => {
    try {
        const {
            gameId,
            questionId
        } = req.body;
        const game = await Game.findOne({
            _id: gameId
        });
        const question = await game.questions.id(questionId);
        question.is_active = !(question.is_active);
        await game.save();
        await pusher.trigger('game', 'vote', {
            success: true
        });
        res.status(201).json({
            message: (game.is_active ? "Question activated" : "Question deactivated")
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const user = req.user;
        const games = await Game.find({
            started_by: user._id
        }).select('title is_active createdAt').sort();

        res.status(201).json({
            games
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const game = await Game.findOne({
            _id
        });
        res.status(201).json({
            game
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.get('/check/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const game = await Game.findOne({
            _id
        });
        res.status(200).send(game ? true : false);
    } catch (error) {
        res.status(500).send(false);
    }
})

module.exports = router;