const jwt = require("jsonwebtoken");
const {collections} = require("../config/dbConnection");
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');

/**
 * Middleware for JWT token verification.
 * This middleware verifies the presence and validity of the JWT token in the Authorization header of HTTP requests.
 * If the token is valid, the token payload is decoded and stored in the req (request) object of Express,
 * making it available for use in subsequent route handlers.
 * If the token is not present or not valid, an authentication error (401 Unauthorized) is returned.
 *
 * @param {Object} req - Express request (req) object
 * @param {Object} res - Express response (res) object
 * @param {Function} next - Next middleware function in the route handling chain
 */
dotenv.config()
const verifyToken = asyncHandler(async(req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({message: "Token not provided"});
    }

    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = await collections?.users?.findOne({ _codUser: decoded.id });
    if (!req.user) {
        return res.status(401).json({message: "Invalid token"});
    }

    if (req.method === "POST") {
        // Controllo del tipo di utente
        if (req.user._type !== "Admin") {
            return res.status(401).json({ message: "Only admin users can perform this action" });
        }
    }
    next();
} )

module.exports = {verifyToken};