import express from "express";

import {
    createPost,
    getFeedPosts,
} from "../controllers/postController.js";

import {
    validatePostCreation,
} from "../middleware/validation.js";

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
    "/feed",
    getFeedPosts
);

router.post(
    "/",
    validatePostCreation,
    createPost
);

export default router;