const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { auth } = require("../config/env");


const SALT_ROUNDS = 10;

function validateCredentials({ email, password }) {
    if (!email || !password) {
        const error = new Error("Email and password are required!");
        error.statusCode = 400;
        throw error;
    }
}

async function register({ email, password }) {
    validateCredentials({ email, password });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error("Email is already registered!");
        error.statusCode = 409;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
        email,
        password: hashedPassword,
    });

    return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
    };
}

async function login({ email, password }) {
    validateCredentials({ email, password });

    const user = await User.findOne({ where: { email } });
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, auth.jwtSecret, {
        expiresIn: auth.jwtExpiresIn,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}

module.exports = {
    register,
    login,
};