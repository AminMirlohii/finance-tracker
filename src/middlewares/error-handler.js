function notFoundHandler(_req, res) {
    res.status(400).json({
        message: "Route not found",
    });
}

function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        message,
    });
}

module.exports = {
    notFoundHandler,
    errorHandler,
};