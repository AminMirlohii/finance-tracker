const authService = require("../services/auth.service");

async function register(req, res, next) {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const payload = await authService.login(req, body);
        res.status(200).json(payload);
    } catch (error) {
        next(error);
    }
}

function me(req, res) {
    res.status(200).json({ user: req.user });
}

module.exports = {
    register,
    login,
    me,
};