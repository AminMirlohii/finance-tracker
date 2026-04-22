const analyticsService = require("../services/analytics.service");

async function getSummary(req, res, next) {
    try {
        const summary = await analyticsService.getSummaryForUser(req.user.id);
        res.status(200).json({ summary });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSummary,
};