"use client";

import { useState } from "react";

import {
    createPost,
    uploadPostVideo,
} from "../services/postService";

export default function PostForm({
    groupId = null,
    onPostCreated,
    onCancel,
}) {
    const [content, setContent] =
        useState("");

    const [postType, setPostType] =
        useState("text");

    const [mediaUrl, setMediaUrl] =
        useState("");

    const [videoSource, setVideoSource] =
        useState("url");

    const [videoFile, setVideoFile] =
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

        if (
            postType === "video" &&
            videoSource === "url" &&
            !mediaUrl.trim()
        ) {
            setErrorMessage(
                "Please enter a video URL."
            );

            return;
        }

        if (
            postType === "video" &&
            videoSource === "file" &&
            !videoFile
        ) {
            setErrorMessage(
                "Please select a video file."
            );

            return;
        }

        const normalizedContent =
            content.trim();

        if (!normalizedContent) {
            setErrorMessage(
                "Write something before publishing."
            );

            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {

            let finalMediaUrl =
                mediaUrl.trim();

            if (
                postType === "video" &&
                videoSource === "file"
            ) {
                finalMediaUrl =
                    await uploadPostVideo(
                        videoFile
                    );
            }

            const newPost = await createPost({
                content: normalizedContent,
                groupId,
                postType,
                mediaUrl:
                    postType === "video"
                        ? finalMediaUrl
                        : "",
            });

            setContent("");

            setPostType("text");

            setMediaUrl("");

            setVideoSource("url");
            
            setVideoFile(null);

            onPostCreated?.(newPost);
        } catch (error) {
            setErrorMessage(
                error.message ||
                    "Could not publish the post."
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
                        postType === "text"
                            ? "skillora-post-type-button skillora-post-type-button-active"
                            : "skillora-post-type-button"
                    }
                    onClick={() => {
                        setPostType("text");
                        setMediaUrl("");
                        setErrorMessage("");
                    }}
                    disabled={isSubmitting}
                >
                    Text
                </button>

                <button
                    type="button"
                    className={
                        postType === "video"
                            ? "skillora-post-type-button skillora-post-type-button-active"
                            : "skillora-post-type-button"
                    }
                    onClick={() => {
                        setPostType("video");
                        setErrorMessage("");
                    }}
                    disabled={isSubmitting}
                >
                    Video
                </button>
            </div>

            <textarea
                value={content}
                onChange={(event) => {
                    setContent(
                        event.target.value
                    );

                    setErrorMessage("");
                }}
                placeholder="Share a skill, question or update..."
                maxLength={3000}
                rows={6}
                disabled={isSubmitting}
                autoFocus
            />

            {postType === "video" && (
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
                                setVideoFile(null);
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
                                onChange={(event) => {
                                    const selectedFile =
                                        event.target.files?.[0] ||
                                        null;

                                    setVideoFile(
                                        selectedFile
                                    );

                                    setErrorMessage("");
                                }}
                                disabled={isSubmitting}
                                required
                            />

                            {videoFile && (
                                <p className="skillora-selected-video-file">
                                    Selected: {videoFile.name}
                                </p>
                            )}
                        </div>
                    )}
                </div>
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