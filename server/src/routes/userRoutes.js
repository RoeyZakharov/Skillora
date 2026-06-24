import {
    Router,
} from "express";

import {
    deleteCurrentUser,
    getCurrentUser,
    getUserByUsername,
    listUsers,
    registerUser,
    searchUsers,
    updateCurrentUser,
} from "../controllers/userController.js";

import {
    authentication,
} from "../middleware/authentication.js";

import {
    validateUserRegistration,
    validateUserUpdate,
} from "../middleware/validation.js";

const router = Router();

router.post(
    "/register",
    authentication,
    validateUserRegistration,
    registerUser
);

router.get(
    "/me",
    authentication,
    getCurrentUser
);

router.patch(
    "/me",
    authentication,
    validateUserUpdate,
    updateCurrentUser
);

router.delete(
    "/me",
    authentication,
    deleteCurrentUser
);

router.get(
    "/search",
    authentication,
    searchUsers
);

router.get(
    "/",
    authentication,
    listUsers
);

router.get(
    "/:username",
    authentication,
    getUserByUsername
);

export default router;