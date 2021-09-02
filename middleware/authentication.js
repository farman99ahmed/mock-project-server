require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('x-access-token');
        if (!token) {
            return res.status(403).json({
                error: "Access denied. Token is required."
            })
        } else {
            const decoded = jwt.verify(token, process.env.APP_KEY);
            const user = await User.findOne({email: decoded.email}).select('email');
            if (user){
                req.user = user;
                next();
            } else {
                return res.status(403).json({
                    error: "Access denied. User is invalid."
                })
            }
        }
    } catch (error) {
        res.status(401).json({
            error: error.message
        });
    }
}

module.exports = authenticate;