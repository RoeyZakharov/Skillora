"use client";

import { useState } from "react";

import {
    createPost,
} from "../services/postService";

export default function PostForm({
    groupId = null,
    onPostCreated,
    onCancel,
}) {
    const [content, setContent] =
        useState("");

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
                "Write something before publishing."
            );

            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const newPost =
                await createPost({
                    content:
                        normalizedContent,
                    groupId,
                });

            setContent("");

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