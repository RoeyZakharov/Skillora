import {
    getAuth,
} from "firebase-admin/auth";

import User from "../models/User.js";

const serializeUser = (
    user,
    includeEmail = false
) => {
    const userObject =
        user.toObject
            ? user.toObject()
            : { ...user };

    delete userObject.__v;
    delete userObject.firebaseUid;

    if (!includeEmail) {
        delete userObject.email;
    }

    return userObject;
};

const escapeRegularExpression = (
    value
) => {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
};

export const registerUser = async (
    req,
    res,
    next
) => {
    try {
        const firebaseUid =
            req.firebaseUser.uid;

        const email =
            req.firebaseUser.email
                ?.trim()
                .toLowerCase();

        if (!email) {
            const error = new Error(
                "The Firebase account does not contain an email address"
            );

            error.statusCode = 400;

            throw error;
        }

        const existingUser =
            await User.findOne({
                firebaseUid,
            });

        if (existingUser) {
            const error = new Error(
                "A Skillora profile already exists for this account"
            );

            error.statusCode = 409;

            throw error;
        }

        const user = await User.create({
            firebaseUid,
            email,
            username: req.body.username,
            displayName:
                req.body.displayName,
            bio: req.body.bio,
            city: req.body.city,
            interests:
                req.body.interests || [],
            skillsOffered:
                req.body.skillsOffered ||
                [],
            skillsWanted:
                req.body.skillsWanted || [],
            avatarUrl:
                req.body.avatarUrl,
        });

        return res.status(201).json({
            success: true,
            message:
                "Skillora user created successfully",
            data: {
                user: serializeUser(
                    user,
                    true
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getCurrentUser = async (
    req,
    res,
    next
) => {
    try {
        const user = await User.findOne({
            firebaseUid:
                req.firebaseUser.uid,
        });

        if (!user) {
            const error = new Error(
                "Skillora user profile was not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return res.status(200).json({
            success: true,
            data: {
                user: serializeUser(
                    user,
                    true
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getUserByUsername = async (
    req,
    res,
    next
) => {
    try {
        const username =
            req.params.username
                .trim()
                .toLowerCase();

        const user = await User.findOne({
            username,
        });

        if (!user) {
            const error = new Error(
                "User was not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return res.status(200).json({
            success: true,
            data: {
                user: serializeUser(user),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const listUsers = async (
    req,
    res,
    next
) => {
    try {
        const users = await User.find()
            .sort({
                username: 1,
            })
            .limit(50);

        return res.status(200).json({
            success: true,
            count: users.length,
            data: {
                users: users.map((user) =>
                    serializeUser(user)
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const searchUsers = async (
    req,
    res,
    next
) => {
    try {
        const {
            username,
            city,
            interest,
            skill,
        } = req.query;

        const filters = [];

        if (username?.trim()) {
            filters.push({
                username: {
                    $regex:
                        escapeRegularExpression(
                            username.trim()
                        ),
                    $options: "i",
                },
            });
        }

        if (city?.trim()) {
            filters.push({
                city: {
                    $regex:
                        escapeRegularExpression(
                            city.trim()
                        ),
                    $options: "i",
                },
            });
        }

        if (interest?.trim()) {
            filters.push({
                interests: {
                    $regex:
                        escapeRegularExpression(
                            interest.trim()
                        ),
                    $options: "i",
                },
            });
        }

        if (skill?.trim()) {
            const skillExpression = {
                $regex:
                    escapeRegularExpression(
                        skill.trim()
                    ),
                $options: "i",
            };

            filters.push({
                $or: [
                    {
                        skillsOffered:
                            skillExpression,
                    },
                    {
                        skillsWanted:
                            skillExpression,
                    },
                ],
            });
        }

        const mongoQuery =
            filters.length > 0
                ? {
                      $and: filters,
                  }
                : {};

        const users = await User.find(
            mongoQuery
        )
            .sort({
                username: 1,
            })
            .limit(50);

        return res.status(200).json({
            success: true,
            count: users.length,
            data: {
                users: users.map((user) =>
                    serializeUser(user)
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const updateCurrentUser = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findOneAndUpdate(
                {
                    firebaseUid:
                        req.firebaseUser.uid,
                },
                {
                    $set: req.body,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!user) {
            const error = new Error(
                "Skillora user profile was not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return res.status(200).json({
            success: true,
            message:
                "User profile updated successfully",
            data: {
                user: serializeUser(
                    user,
                    true
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteCurrentUser = async (
    req,
    res,
    next
) => {
    try {
        const firebaseUid =
            req.firebaseUser.uid;

        const user = await User.findOne({
            firebaseUid,
        });

        if (!user) {
            const error = new Error(
                "Skillora user profile was not found"
            );

            error.statusCode = 404;

            throw error;
        }

        await getAuth().deleteUser(
            firebaseUid
        );

        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message:
                "User account deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};