"use client";

import {
    useEffect,
    useState,
} from "react";

import ChatWindow from "../../components/ChatWindow";

import ProtectedPage from "../../components/ProtectedPage";

import {
    connectSocket,
} from "../../services/socketService";

function ChatContent() {
    const [connectionStatus, setConnectionStatus] =
        useState("Connecting...");

    useEffect(() => {
        let activeSocket = null;
        let isCancelled = false;

        const handleConnect = () => {
            setConnectionStatus(
                "Connected"
            );
        };

        const handleDisconnect = () => {
            setConnectionStatus(
                "Disconnected"
            );
        };

        const handleConnectionError = (
            error
        ) => {
            console.error(
                "Socket connection error:",
                error.message
            );

            setConnectionStatus(
                "Connection failed"
            );
        };

        const startConnection =
            async () => {
                try {
                    const socket =
                        await connectSocket();

                    if (isCancelled) {
                        return;
                    }

                    activeSocket = socket;

                    setConnectionStatus(
                        "Connected"
                    );

                    socket.on(
                        "connect",
                        handleConnect
                    );

                    socket.on(
                        "disconnect",
                        handleDisconnect
                    );

                    socket.on(
                        "connect_error",
                        handleConnectionError
                    );
                } catch (error) {
                    if (isCancelled) {
                        return;
                    }

                    console.error(
                        "Could not start chat socket:",
                        error.message
                    );

                    setConnectionStatus(
                        "Connection failed"
                    );
                }
            };

        startConnection();

        return () => {
            isCancelled = true;

            if (activeSocket) {
                activeSocket.off(
                    "connect",
                    handleConnect
                );

                activeSocket.off(
                    "disconnect",
                    handleDisconnect
                );

                activeSocket.off(
                    "connect_error",
                    handleConnectionError
                );
            }
        };
    }, []);

    return (
        <main className="skillora-chat-page">
            <section className="skillora-chat-panel">
                <header className="skillora-chat-header">
                    <div>
                        <h1>Skillora Chat</h1>

                        <p>
                            Send direct messages to
                            other Skillora users.
                        </p>
                    </div>

                    <span
                        className={
                            connectionStatus ===
                            "Connected"
                                ? "skillora-chat-status skillora-chat-status-connected"
                                : "skillora-chat-status"
                        }
                    >
                        {connectionStatus}
                    </span>
                </header>

                {connectionStatus ===
                "Connected" ? (
                    <ChatWindow />
                ) : (
                    <p className="skillora-chat-connection-message">
                        Waiting for the chat
                        connection...
                    </p>
                )}
            </section>
        </main>
    );
}

export default function ChatPage() {
    return (
        <ProtectedPage>
            <ChatContent />
        </ProtectedPage>
    );
}