import express from "express";

import {
    getConversationMessages,
    getMyConversations,
    getUnreadMessageCount,
} from "../controllers/messageController.js";

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
    "/conversations",
    getMyConversations
);

router.get(
    "/unread-count",
    getUnreadMessageCount
);

router.get(
    "/conversation/:username",
    getConversationMessages
);

export default router;