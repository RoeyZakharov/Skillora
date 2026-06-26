import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.resolve(
    "uploads",
    "videos"
);

fs.mkdirSync(uploadDirectory, {
    recursive: true,
});

const storage = multer.diskStorage({
    destination: (
        req,
        file,
        callback
    ) => {
        callback(
            null,
            uploadDirectory
        );
    },

    filename: (
        req,
        file,
        callback
    ) => {
        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        callback(null, uniqueName);
    },
});

const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
];

const fileFilter = (
    req,
    file,
    callback
) => {
    if (
        allowedVideoTypes.includes(
            file.mimetype
        )
    ) {
        callback(null, true);
        return;
    }

    const error = new Error(
        "Only MP4, WebM, OGG, and MOV video files are allowed"
    );

    error.statusCode = 400;

    callback(error);
};

export const uploadVideo = multer({
    storage,
    fileFilter,
    limits: {
        fileSize:
            100 * 1024 * 1024,
    },
});