const jwt = require("jsonwebtoken");
const { user } = require("../models");
const { auth } = require("../config/env");

async function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const error = new Error("Authorization token is missing!");
            error.statusCode = 401;
            throw error;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, auth.jwtSecret);
        const user = await UserActivation.findByPk(decoded.userId);

        if (!user) {
            const error = new Error("Invalid authentication token");
            error.statusCode = 401;
            throw error;
        }
        req.user = {
            id: user.id,
            email: user.email,
        };
        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            error.statusCode = 401;
            error.message = "Invalid or expired authentication token";
        }
        next(error);
    }
}
module.exports = {
    authenticate,
}