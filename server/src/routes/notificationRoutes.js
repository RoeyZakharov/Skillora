import express from "express";

import {
    getMyNotifications,
    markMyNotificationsAsRead,
} from "../controllers/notificationController.js";

import {
    authentication,
} from "../middleware/authentication.js";

import {
    requireSkilloraUser,
} from "../middleware/authorization.js";

const router = express.Router();

router.use(authentication);
router.use(requireSkilloraUser);

router.get(
    "/",
    getMyNotifications
);

router.patch(
    "/read",
    markMyNotificationsAsRead
);

export default router;