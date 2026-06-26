import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.resolve(
    "uploads",
    "images"
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

const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

const fileFilter = (
    req,
    file,
    callback
) => {
    if (
        allowedImageTypes.includes(
            file.mimetype
        )
    ) {
        callback(null, true);
        return;
    }

    const error = new Error(
        "Only JPEG, PNG, WebP, and GIF image files are allowed"
    );

    error.statusCode = 400;

    callback(error);
};

export const uploadImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize:
            10 * 1024 * 1024,
    },
});