require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        if (!(name && email && password)) {
            res.status(400).json({
                error: "All inputs are required."
            });
        } else {
            if (await User.findOne({
                    email
                })) {
                res.status(400).json({
                    error: "This user already exists."
                })
            } else {
                const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT))
                const encrypted_password = await bcrypt.hash(password, salt)

                const user = await User.create({
                    _id: uuid.v4(),
                    name,
                    email,
                    password: encrypted_password
                });

                res.status(201).json({
                    message: `User ${email} created successfully`,
                });
            }
        }

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        if (!(email && password)) {
            res.status(400).json({
                error: "Email and password is required."
            })
        } else {
            const user = await User.findOne({
                email
            });

            if (user && (await bcrypt.compare(password, user.password))) {
                const token = jwt.sign({
                        _id: user._id,
                        email
                    },
                    process.env.APP_KEY, {
                        expiresIn: "1h",
                    }
                );
                res.status(200).json({
                    token
                });
            } else {
                res.status(400).json({
                    error: "Email or password is incorrect"
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message
        });
    }
});


module.exports = router;