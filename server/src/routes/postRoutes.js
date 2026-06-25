import express from "express";

import {
    addPostComment,
    createPost,
    deletePost,
    deletePostComment,
    getFeedPosts,
    getGroupPosts,
    togglePostLike,
    updatePost,
} from "../controllers/postController.js";

import {
    validatePostCreation,
    validatePostUpdate,
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
    "/:postId/comments",
    addPostComment
);

router.delete(
    "/:postId/comments/:commentId",
    deletePostComment
);

router.patch(
    "/:postId/like",
    togglePostLike
);

router.patch(
    "/:postId",
    validatePostUpdate,
    updatePost
);

router.delete(
    "/:postId",
    deletePost
);

router.get(
    "/group/:groupId",
    getGroupPosts
);

router.post(
    "/",
    validatePostCreation,
    createPost
);

export default router;