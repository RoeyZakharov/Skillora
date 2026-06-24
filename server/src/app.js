import "dotenv/config";

import express from "express";
import cors from "cors";

import healthRoutes from "./routes/healthRoutes.js";
import {
    errorHandler,
    notFound,
} from "./middleware/errorHandler.js";

import userRoutes from "./routes/userRoutes.js";

const app = express();

const clientUrl =
    process.env.CLIENT_URL || "http://localhost:3000";

// Do not expose the Express header.
app.disable("x-powered-by");

// Allow the React client to communicate with the server.
app.use(
    cors({
        origin: clientUrl,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// Parse JSON request bodies.
app.use(
    express.json({
        limit: "1mb",
    })
);

// Parse form request bodies.
app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb",
    })
);

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);

// Ignore automatic browser favicon requests.
app.get("/favicon.ico", (req, res) => {
    return res.status(204).end();
});

// Handle unknown routes.
app.use(notFound);

// Error handler must be the final middleware.
app.use(errorHandler);

export default app;