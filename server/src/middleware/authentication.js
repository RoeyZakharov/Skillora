import "dotenv/config";

import {
    applicationDefault,
    getApps,
    initializeApp,
} from "firebase-admin/app";

import {
    getAuth,
} from "firebase-admin/auth";

const firebaseAdminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
              credential: applicationDefault(),
          });

const firebaseAuth =
    getAuth(firebaseAdminApp);

export const authentication = async (
    req,
    res,
    next
) => {
    try {
        const authorizationHeader =
            req.headers.authorization;

        if (
            !authorizationHeader ||
            !authorizationHeader.startsWith(
                "Bearer "
            )
        ) {
            const error = new Error(
                "Authentication token is missing"
            );

            error.statusCode = 401;

            return next(error);
        }

        const idToken =
            authorizationHeader
                .substring(7)
                .trim();

        if (!idToken) {
            const error = new Error(
                "Authentication token is empty"
            );

            error.statusCode = 401;

            return next(error);
        }

        const decodedToken =
            await firebaseAuth.verifyIdToken(
                idToken
            );

        req.firebaseUser = decodedToken;

        return next();
    } catch (firebaseError) {
    console.error("Firebase authentication failed:", {
        code:
            firebaseError.code ||
            firebaseError.errorInfo?.code ||
            "unknown",
        message:
            firebaseError.message ||
            firebaseError.errorInfo?.message ||
            "Unknown Firebase error",
    });

    const error = new Error(
        "Invalid or expired authentication token"
    );

    error.statusCode = 401;

    return next(error);
    }
};