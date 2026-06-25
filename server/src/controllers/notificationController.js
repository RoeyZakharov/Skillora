import Notification from "../models/Notification.js";

export const getMyNotifications = async (
    req,
    res,
    next
) => {
    try {
        const notifications =
            await Notification.find({
                recipient: req.user._id,
            })
                .populate(
                    "actor",
                    "username displayName avatarUrl"
                )
                .populate(
                    "group",
                    "name privacy"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(50);

        const unreadCount =
            notifications.filter(
                (notification) =>
                    !notification.isRead
            ).length;

        return res.status(200).json({
            success: true,
            count:
                notifications.length,
            unreadCount,

            data: {
                notifications,
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const markMyNotificationsAsRead =
    async (req, res, next) => {
        try {
            const result =
                await Notification.updateMany(
                    {
                        recipient:
                            req.user._id,
                        isRead: false,
                    },
                    {
                        $set: {
                            isRead: true,
                        },
                    }
                );

            return res.status(200).json({
                success: true,
                message:
                    "Notifications marked as read",
                modifiedCount:
                    result.modifiedCount,
            });
        } catch (error) {
            return next(error);
        }
    };