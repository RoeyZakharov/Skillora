import { Router } from "express";

import {
    createGroup,
    deleteGroup,
    getGroupById,
    getMyGroupInvitations,
    inviteUserToGroup,
    listGroups,
    requestToJoinGroup,
    reviewMembershipRequest,
    searchGroups,
    updateGroup,
} from "../controllers/groupController.js";

import {
    authentication,
} from "../middleware/authentication.js";

import {
    loadGroup,
    requireGroupManager,
    requireSkilloraUser,
    requireApprovedGroupMember,
} from "../middleware/authorization.js";

import {
    validateGroupCreation,
    validateGroupUpdate,
    validateMembershipDecision,
    validateGroupInvitation,
} from "../middleware/validation.js";

const router = Router();

router.use(
    authentication,
    requireSkilloraUser
);

router.post(
    "/",
    validateGroupCreation,
    createGroup
);

router.get(
    "/",
    listGroups
);

router.get(
    "/search",
    searchGroups
);

router.get(
    "/invitations",
    getMyGroupInvitations
);

router.post(
    "/:groupId/invitations",
    loadGroup,
    requireApprovedGroupMember,
    validateGroupInvitation,
    inviteUserToGroup
);

router.post(
    "/:groupId/join",
    requestToJoinGroup
);

router.patch(
    "/:groupId/members/:userId",
    loadGroup,
    requireGroupManager,
    validateMembershipDecision,
    reviewMembershipRequest
);

router.patch(
    "/:groupId",
    loadGroup,
    requireGroupManager,
    validateGroupUpdate,
    updateGroup
);

router.delete(
    "/:groupId",
    loadGroup,
    requireGroupManager,
    deleteGroup
);

router.get(
    "/:groupId",
    getGroupById
);

export default router;