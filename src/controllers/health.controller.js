const healthService = require("../services/health.service");

function getHealth(_req, res) {
    const payload = healthService.getHealthStatus();
    res.status(200).json(payload);
}

module.exports = {
    getHealth,
}