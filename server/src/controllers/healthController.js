import mongoose from "mongoose";

const databaseStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
};

export const getHealth = (req, res) => {
    const databaseState = mongoose.connection.readyState;
    const databaseConnected = databaseState === 1;

    return res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        message: databaseConnected
            ? "Skillora server is running"
            : "Skillora server is running, but MongoDB is not connected",
        data: {
            server: "running",
            database:
                databaseStates[databaseState] || "unknown",
            databaseName:
                mongoose.connection.name || null,
            environment:
                process.env.NODE_ENV || "development",
            timestamp: new Date().toISOString(),
        },
    });
};