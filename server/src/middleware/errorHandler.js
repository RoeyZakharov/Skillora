export const notFound = (req, res, next) => {
    const error = new Error(
        `Route not found: ${req.method} ${req.originalUrl}`
    );

    error.statusCode = 404;

    next(error);
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    let statusCode =
        Number(error.statusCode || error.status) || 500;

    let message =
        error.message || "Internal server error";

    if (statusCode < 400 || statusCode > 599) {
        statusCode = 500;
    }

    // Mongoose schema validation error
    if (error.name === "ValidationError") {
        statusCode = 400;

        message = Object.values(error.errors)
            .map((validationError) => validationError.message)
            .join(", ");
    }

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
        statusCode = 400;
        message = `Invalid value for field: ${error.path}`;
    }

    // MongoDB duplicate-key error
    if (error.code === 11000) {
        statusCode = 409;

        const duplicatedFields = Object.keys(
            error.keyValue || {}
        ).join(", ");

        message = duplicatedFields
            ? `Duplicate value for: ${duplicatedFields}`
            : "A record with this value already exists";
    }

    if (statusCode >= 500) {
        console.error(
            `[${req.method}] ${req.originalUrl}`,
            error
        );
    } else {
        console.warn(
            `[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`
        );
    }

    const response = {
        success: false,
        message,
    };

    if (process.env.NODE_ENV !== "production") {
        response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
};