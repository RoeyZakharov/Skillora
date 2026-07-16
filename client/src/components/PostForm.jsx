"use client";

import { useState } from "react";

import {
    createPost,
    uploadPostImage,
    uploadPostVideo,
} from "../services/postService";

import CanvasEditor from "./CanvasEditor";

export default function PostForm({
    groupId = null,
    onPostCreated,
    onCancel,
}) {
    const [content, setContent] =
        useState("");

    const [
        showImageAttachment,
        setShowImageAttachment,
    ] = useState(false);

    const [
        showVideoAttachment,
        setShowVideoAttachment,
    ] = useState(false);

    const [
        showCanvasAttachment,
        setShowCanvasAttachment,
    ] = useState(false);

    const [imageFiles, setImageFiles] =
        useState([]);

    const [mediaUrl, setMediaUrl] =
        useState("");

    const [videoSource, setVideoSource] =
        useState("url");

    const [videoFiles, setVideoFiles] =
        useState([]);

    const [canvasData, setCanvasData] =
        useState(null);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        const normalizedContent =
            content.trim();

        if (!normalizedContent) {
            setErrorMessage(
                "Post content is required."
            );

            return;
        }

        if (
            showImageAttachment &&
            imageFiles.length === 0
        ) {
            setErrorMessage(
                "Please select an image file."
            );

            return;
        }

        if (
            showVideoAttachment &&
            videoSource === "file" &&
            videoFiles.length === 0
        ) {
            setErrorMessage(
                "Please select a video file."
            );

            return;
        }

        if (
            showVideoAttachment &&
            videoSource === "url" &&
            !mediaUrl.trim()
        ) {
            setErrorMessage(
                "Please enter a video URL."
            );

            return;
        }

        if (
            showCanvasAttachment &&
            !canvasData?.imageData
        ) {
            setErrorMessage(
                "Please draw something on the canvas."
            );

            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const attachments = [];

            if (showImageAttachment) {
                const imageUrls =
                    await Promise.all(
                        imageFiles.map((file) =>
                            uploadPostImage(file)
                        )
                    );

                attachments.push(
                    ...imageUrls.map((url) => ({
                        type: "image",
                        url,
                        canvasData: null,
                    }))
                );
            }

            if (showVideoAttachment) {
                if (videoSource === "file") {
                    const videoUrls =
                        await Promise.all(
                            videoFiles.map(
                                (file) =>
                                    uploadPostVideo(file)
                            )
                        );

                    attachments.push(
                        ...videoUrls.map((url) => ({
                            type: "video",
                            url,
                            canvasData: null,
                        }))
                    );
                } else {
                    attachments.push({
                        type: "video",
                        url: mediaUrl.trim(),
                        canvasData: null,
                    });
                }
            }

            /*
             * Important:
             * A pure canvas post is stored in the top-level
             * canvasData field because the backend saves that
             * field only when postType === "canvas".
             *
             * If we also send the same canvas inside attachments,
             * PostCard can render it twice: once from post.canvasData
             * and once from post.attachments.
             *
             * For mixed posts, the postType is "mixed", so the
             * backend does not save top-level canvasData. In that
             * case the canvas must be sent as an attachment.
             */
            const hasCanvasAttachment =
                showCanvasAttachment &&
                Boolean(canvasData?.imageData);

            const hasOtherAttachments =
                attachments.length > 0;

            if (
                hasCanvasAttachment &&
                hasOtherAttachments
            ) {
                attachments.push({
                    type: "canvas",
                    url: "",
                    canvasData,
                });
            }

            let postType = "text";

            if (
                hasCanvasAttachment &&
                !hasOtherAttachments
            ) {
                postType = "canvas";
            } else if (
                attachments.length > 1
            ) {
                postType = "mixed";
            } else if (
                attachments.length === 1
            ) {
                postType = attachments[0].type;
            }

            const topLevelCanvasData =
                postType === "canvas"
                    ? canvasData
                    : null;

            const topLevelMediaUrl =
                postType === "video"
                    ? attachments[0]?.url || ""
                    : "";

            const newPost =
                await createPost({
                    content:
                        normalizedContent,
                    groupId,
                    postType,
                    mediaUrl:
                        topLevelMediaUrl,
                    canvasData:
                        topLevelCanvasData,
                    attachments,
                });

            setContent("");
            setShowImageAttachment(false);
            setShowVideoAttachment(false);
            setShowCanvasAttachment(false);
            setImageFiles([]);
            setMediaUrl("");
            setVideoSource("url");
            setVideoFiles([]);
            setCanvasData(null);

            onPostCreated?.(newPost);
        } catch (submitError) {
            setErrorMessage(
                submitError.message ||
                    "Could not create the post."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="skillora-post-form"
            onSubmit={handleSubmit}
        >
            <div className="skillora-post-type-selector">
                <button
                    type="button"
                    className={
                        showImageAttachment
                            ? "skillora-post-type-button skillora-post-type-button-active"
                            : "skillora-post-type-button"
                    }
                    onClick={() => {
                        setShowImageAttachment(
                            (currentValue) =>
                                !currentValue
                        );

                        setImageFiles([]);
                        setErrorMessage("");
                    }}
                    disabled={isSubmitting}
                >
                    Photo
                </button>

                <button
                    type="button"
                    className={
                        showVideoAttachment
                            ? "skillora-post-type-button skillora-post-type-button-active"
                            : "skillora-post-type-button"
                    }
                    onClick={() => {
                        setShowVideoAttachment(
                            (currentValue) =>
                                !currentValue
                        );

                        setMediaUrl("");
                        setVideoFiles([]);
                        setErrorMessage("");
                    }}
                    disabled={isSubmitting}
                >
                    Video
                </button>

                <button
                    type="button"
                    className={
                        showCanvasAttachment
                            ? "skillora-post-type-button skillora-post-type-button-active"
                            : "skillora-post-type-button"
                    }
                    onClick={() => {
                        setShowCanvasAttachment(
                            (currentValue) =>
                                !currentValue
                        );

                        setCanvasData(null);
                        setErrorMessage("");
                    }}
                    disabled={isSubmitting}
                >
                    Canvas
                </button>
            </div>

            <textarea
                value={content}
                onChange={(event) => {
                    setContent(event.target.value);
                    setErrorMessage("");
                }}
                placeholder="Share a skill, question or update..."
                maxLength={3000}
                rows={6}
                disabled={isSubmitting}
                autoFocus
            />

            {showImageAttachment && (
                <div className="skillora-post-video-field">
                    <label htmlFor="post-image-file">
                        Select an image
                    </label>

                    <input
                        id="post-image-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={(event) => {
                            const selectedFiles =
                                Array.from(
                                    event.target.files || []
                                );

                            setImageFiles(selectedFiles);

                            setErrorMessage("");
                        }}
                        disabled={isSubmitting}
                        required
                    />

                    {imageFiles.length > 0 && (
                        <div className="skillora-selected-video-file">
                            {imageFiles.map((file) => (
                                <p key={`${file.name}-${file.lastModified}`}>
                                    Selected: {file.name}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showVideoAttachment && (
                <div className="skillora-post-video-options">
                    <div className="skillora-video-source-selector">
                        <button
                            type="button"
                            className={
                                videoSource === "url"
                                    ? "skillora-video-source-button skillora-video-source-button-active"
                                    : "skillora-video-source-button"
                            }
                            onClick={() => {
                                setVideoSource("url");
                                setVideoFiles([]);
                                setErrorMessage("");
                            }}
                            disabled={isSubmitting}
                        >
                            Video URL
                        </button>

                        <button
                            type="button"
                            className={
                                videoSource === "file"
                                    ? "skillora-video-source-button skillora-video-source-button-active"
                                    : "skillora-video-source-button"
                            }
                            onClick={() => {
                                setVideoSource("file");
                                setMediaUrl("");
                                setErrorMessage("");
                            }}
                            disabled={isSubmitting}
                        >
                            Upload from computer
                        </button>
                    </div>

                    {videoSource === "url" && (
                        <div className="skillora-post-video-field">
                            <label htmlFor="post-video-url">
                                Video or YouTube URL
                            </label>

                            <input
                                id="post-video-url"
                                type="url"
                                value={mediaUrl}
                                onChange={(event) => {
                                    setMediaUrl(
                                        event.target.value
                                    );

                                    setErrorMessage("");
                                }}
                                placeholder="https://www.youtube.com/watch?v=..."
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    )}

                    {videoSource === "file" && (
                        <div className="skillora-post-video-field">
                            <label htmlFor="post-video-file">
                                Select a video file
                            </label>

                            <input
                                id="post-video-file"
                                type="file"
                                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                multiple
                                onChange={(event) => {
                                    const selectedFiles =
                                        Array.from(
                                            event.target.files || []
                                        );

                                    setVideoFiles(selectedFiles);
                                    setErrorMessage("");
                                }}
                                disabled={isSubmitting}
                                required
                            />

                            {videoFiles.length > 0 && (
                                <div className="skillora-selected-video-file">
                                    {videoFiles.map((file) => (
                                        <p
                                            key={`${file.name}-${file.lastModified}`}
                                        >
                                            Selected: {file.name}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {showCanvasAttachment && (
                <CanvasEditor
                    onChange={setCanvasData}
                />
            )}

            <div className="skillora-post-form-count">
                {content.length} / 3000
            </div>

            {errorMessage && (
                <p className="skillora-post-form-error">
                    {errorMessage}
                </p>
            )}

            <div className="skillora-post-form-actions">
                {onCancel && (
                    <button
                        type="button"
                        className="skillora-post-cancel-button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    className="skillora-post-submit-button"
                    disabled={
                        isSubmitting ||
                        !content.trim()
                    }
                >
                    {isSubmitting
                        ? "Publishing..."
                        : "Publish post"}
                </button>
            </div>
        </form>
    );
}