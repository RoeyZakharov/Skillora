import { io } from "socket.io-client";

import {
    auth,
} from "../config/firebase";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL;

let socket = null;

export const connectSocket = async () => {
    if (!SOCKET_URL) {
        throw new Error(
            "Socket server URL is not configured"
        );
    }

    const firebaseUser =
        auth.currentUser;

    if (!firebaseUser) {
        throw new Error(
            "You must be signed in to use chat"
        );
    }

    const idToken =
        await firebaseUser.getIdToken();

    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            withCredentials: true,
        });
    }

    socket.auth = {
        token: idToken,
    };

    if (socket.connected) {
        return socket;
    }

    return new Promise(
        (resolve, reject) => {
            const handleConnect = () => {
                cleanup();
                resolve(socket);
            };

            const handleConnectError = (
                error
            ) => {
                cleanup();
                reject(error);
            };

            const cleanup = () => {
                socket.off(
                    "connect",
                    handleConnect
                );

                socket.off(
                    "connect_error",
                    handleConnectError
                );
            };

            socket.once(
                "connect",
                handleConnect
            );

            socket.once(
                "connect_error",
                handleConnectError
            );

            socket.connect();
        }
    );
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (!socket) {
        return;
    }

    socket.disconnect();
    socket = null;
};