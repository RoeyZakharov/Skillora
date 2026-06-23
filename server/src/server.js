import "dotenv/config";

import http from "node:http";

import app from "./app.js";
import connectDatabase from "./config/database.js";

const port = Number.parseInt(
    process.env.PORT || "5000",
    10
);

const startServer = async () => {
    try {
        await connectDatabase();

        // We create an HTTP server separately because Socket.io
        // will be attached to this same server later.
        const httpServer = http.createServer(app);

        httpServer.listen(port, () => {
            console.log(
                `Skillora server is running on http://localhost:${port}`
            );

            console.log(
                `Health check: http://localhost:${port}/api/health`
            );
        });
    } catch (error) {
        console.error(
            "Skillora server could not start:",
            error.message
        );

        process.exit(1);
    }
};

startServer();