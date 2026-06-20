export const notFoundHandler = (req, res) => {
    res.status(404).json({
        message: "Resource not found",
        requestId: req.id,
    });
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = Number(error.status || error.statusCode) || 500;
    if (status >= 500) {
        console.error(`[${req.id}] ${req.method} ${req.originalUrl}:`, error.message);
    }
    res.status(status).json({
        message: status >= 500 ? "Internal server error" : error.message,
        requestId: req.id,
    });
};
