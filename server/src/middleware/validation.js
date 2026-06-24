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