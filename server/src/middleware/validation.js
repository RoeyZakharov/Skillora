const usernamePattern =
    /^[a-z0-9_.]+$/;

const profileArrayFields = [
    "interests",
    "skillsOffered",
    "skillsWanted",
];

const normalizeStringArray = (values) => {
    return [
        ...new Set(
            values
                .filter(
                    (value) =>
                        typeof value ===
                        "string"
                )
                .map((value) =>
                    value
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        ),
    ];
};

const validateProfileArrays = (
    body,
    errors
) => {
    for (const field of profileArrayFields) {
        if (!(field in body)) {
            continue;
        }

        if (!Array.isArray(body[field])) {
            errors.push(
                `${field} must be an array`
            );

            continue;
        }

        body[field] =
            normalizeStringArray(
                body[field]
            );

        if (body[field].length > 20) {
            errors.push(
                `${field} cannot contain more than 20 values`
            );
        }
    }
};

export const validateUserRegistration = (
    req,
    res,
    next
) => {
    const errors = [];

    const username =
        req.body.username
            ?.trim()
            .toLowerCase();

    const displayName =
        req.body.displayName?.trim();

    if (
        !username ||
        username.length < 3 ||
        username.length > 30
    ) {
        errors.push(
            "Username must contain between 3 and 30 characters"
        );
    } else if (
        !usernamePattern.test(username)
    ) {
        errors.push(
            "Username may contain letters, numbers, underscores and dots only"
        );
    }

    if (
        !displayName ||
        displayName.length < 2 ||
        displayName.length > 60
    ) {
        errors.push(
            "Display name must contain between 2 and 60 characters"
        );
    }

    validateProfileArrays(
        req.body,
        errors
    );

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message:
                "User registration validation failed",
            errors,
        });
    }

    req.body.username = username;
    req.body.displayName = displayName;
    req.body.bio =
        req.body.bio?.trim() || "";
    req.body.city =
        req.body.city?.trim() || "";
    req.body.avatarUrl =
        req.body.avatarUrl?.trim() || "";

    return next();
};

export const validateUserUpdate = (
    req,
    res,
    next
) => {
    const allowedFields = [
        "displayName",
        "bio",
        "city",
        "interests",
        "skillsOffered",
        "skillsWanted",
        "avatarUrl",
    ];

    const receivedFields =
        Object.keys(req.body);

    const invalidFields =
        receivedFields.filter(
            (field) =>
                !allowedFields.includes(field)
        );

    if (invalidFields.length > 0) {
        return res.status(400).json({
            success: false,
            message:
                `Fields cannot be updated: ${invalidFields.join(", ")}`,
        });
    }

    if (receivedFields.length === 0) {
        return res.status(400).json({
            success: false,
            message:
                "At least one profile field must be provided",
        });
    }

    const errors = [];

    if ("displayName" in req.body) {
        req.body.displayName =
            req.body.displayName?.trim();

        if (
            !req.body.displayName ||
            req.body.displayName.length < 2 ||
            req.body.displayName.length >
                60
        ) {
            errors.push(
                "Display name must contain between 2 and 60 characters"
            );
        }
    }

    if ("bio" in req.body) {
        req.body.bio =
            req.body.bio?.trim() || "";

        if (req.body.bio.length > 500) {
            errors.push(
                "Bio cannot contain more than 500 characters"
            );
        }
    }

    if ("city" in req.body) {
        req.body.city =
            req.body.city?.trim() || "";

        if (req.body.city.length > 80) {
            errors.push(
                "City cannot contain more than 80 characters"
            );
        }
    }

    validateProfileArrays(
        req.body,
        errors
    );

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message:
                "User update validation failed",
            errors,
        });
    }

    return next();
};

const normalizeGroupTags = (tags) => {
    return [
        ...new Set(
            tags
                .filter(
                    (tag) =>
                        typeof tag === "string"
                )
                .map((tag) =>
                    tag
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        ),
    ];
};

export const validateGroupCreation = (
    req,
    res,
    next
) => {
    const errors = [];

    const name =
        req.body.name?.trim();

    const description =
        req.body.description?.trim();

    const category =
        req.body.category
            ?.trim()
            .toLowerCase();

    const city =
        req.body.city?.trim() || "";

    const privacy =
        req.body.privacy || "public";

    if (
        !name ||
        name.length < 3 ||
        name.length > 80
    ) {
        errors.push(
            "Group name must contain between 3 and 80 characters"
        );
    }

    if (
        !description ||
        description.length < 10 ||
        description.length > 1000
    ) {
        errors.push(
            "Description must contain between 10 and 1000 characters"
        );
    }

    if (
        !category ||
        category.length < 2 ||
        category.length > 50
    ) {
        errors.push(
            "Category must contain between 2 and 50 characters"
        );
    }

    if (city.length > 80) {
        errors.push(
            "City cannot contain more than 80 characters"
        );
    }

    if (
        typeof req.body.isOnline !==
        "boolean"
    ) {
        errors.push(
            "isOnline must be true or false"
        );
    }

    if (
        !["public", "private"].includes(
            privacy
        )
    ) {
        errors.push(
            "Privacy must be public or private"
        );
    }

    if (
        req.body.tags !== undefined &&
        !Array.isArray(req.body.tags)
    ) {
        errors.push(
            "Tags must be an array"
        );
    }

    const tags = Array.isArray(
        req.body.tags
    )
        ? normalizeGroupTags(
              req.body.tags
          )
        : [];

    if (tags.length > 10) {
        errors.push(
            "A group cannot contain more than 10 tags"
        );
    }

    if (
        tags.some(
            (tag) => tag.length > 40
        )
    ) {
        errors.push(
            "Each tag must contain no more than 40 characters"
        );
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message:
                "Group validation failed",
            errors,
        });
    }

    req.body.name = name;
    req.body.description =
        description;
    req.body.category = category;
    req.body.city = city;
    req.body.privacy = privacy;
    req.body.tags = tags;

    return next();
};

export const validateGroupUpdate = (
    req,
    res,
    next
) => {
    const allowedFields = [
        "name",
        "description",
        "category",
        "city",
        "isOnline",
        "privacy",
        "tags",
    ];

    const receivedFields =
        Object.keys(req.body);

    if (receivedFields.length === 0) {
        return res.status(400).json({
            success: false,
            message:
                "At least one group field must be provided",
        });
    }

    const invalidFields =
        receivedFields.filter(
            (field) =>
                !allowedFields.includes(field)
        );

    if (invalidFields.length > 0) {
        return res.status(400).json({
            success: false,
            message:
                `Fields cannot be updated: ${invalidFields.join(", ")}`,
        });
    }

    const errors = [];

    if ("name" in req.body) {
        req.body.name =
            req.body.name?.trim();

        if (
            !req.body.name ||
            req.body.name.length < 3 ||
            req.body.name.length > 80
        ) {
            errors.push(
                "Group name must contain between 3 and 80 characters"
            );
        }
    }

    if ("description" in req.body) {
        req.body.description =
            req.body.description?.trim();

        if (
            !req.body.description ||
            req.body.description.length < 10 ||
            req.body.description.length >
                1000
        ) {
            errors.push(
                "Description must contain between 10 and 1000 characters"
            );
        }
    }

    if ("category" in req.body) {
        req.body.category =
            req.body.category
                ?.trim()
                .toLowerCase();

        if (
            !req.body.category ||
            req.body.category.length < 2 ||
            req.body.category.length > 50
        ) {
            errors.push(
                "Category must contain between 2 and 50 characters"
            );
        }
    }

    if ("city" in req.body) {
        req.body.city =
            req.body.city?.trim() || "";

        if (req.body.city.length > 80) {
            errors.push(
                "City cannot contain more than 80 characters"
            );
        }
    }

    if (
        "isOnline" in req.body &&
        typeof req.body.isOnline !== "boolean"
    ) {
        errors.push(
            "isOnline must be true or false"
        );
    }

    if ("privacy" in req.body) {
        if (
            ![
                "public",
                "private",
            ].includes(req.body.privacy)
        ) {
            errors.push(
                "Privacy must be public or private"
            );
        }
    }

    if ("tags" in req.body) {
        if (!Array.isArray(req.body.tags)) {
            errors.push(
                "Tags must be an array"
            );
        } else {
            req.body.tags = [
                ...new Set(
                    req.body.tags
                        .filter(
                            (tag) =>
                                typeof tag ===
                                "string"
                        )
                        .map((tag) =>
                            tag
                                .trim()
                                .toLowerCase()
                        )
                        .filter(Boolean)
                ),
            ];

            if (req.body.tags.length > 10) {
                errors.push(
                    "A group cannot contain more than 10 tags"
                );
            }

            if (
                req.body.tags.some(
                    (tag) => tag.length > 40
                )
            ) {
                errors.push(
                    "Each tag must contain no more than 40 characters"
                );
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message:
                "Group update validation failed",
            errors,
        });
    }

    return next();
};

export const validateMembershipDecision = (
    req,
    res,
    next
) => {
    const { decision } = req.body;

    if (
        ![
            "approve",
            "reject",
        ].includes(decision)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Decision must be approve or reject",
        });
    }

    return next();
};

export const validateGroupInvitation = (
    req,
    res,
    next
) => {
    const username =
        typeof req.body.username ===
        "string"
            ? req.body.username.trim()
            : "";

    if (!username) {
        return res.status(400).json({
            success: false,
            message:
                "A username is required",
        });
    }

    req.body.username = username;

    return next();
};