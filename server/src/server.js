import "dotenv/config";

import http from "node:http";

import { Server } from "socket.io";

import app from "./app.js";
import connectDatabase from "./config/database.js";

import {
    configureChatSocket,
} from "./sockets/chatSocket.js";

const port = Number.parseInt(
    process.env.PORT || "5000",
    10
);

const startServer = async () => {
    try {
        await connectDatabase();

        // We create an HTTP server separately because Socket.io
        const httpServer = http.createServer(app);

        const io = new Server(httpServer, {
            cors: {
                origin:
                    process.env.CLIENT_URL ||
                    "http://localhost:3000",

                methods: [
                    "GET",
                    "POST",
                ],

                credentials: true,
            },
        });

        configureChatSocket(io);``

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