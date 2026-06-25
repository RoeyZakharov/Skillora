"use client";

import {
    useEffect,
    useState,
} from "react";

import styles from "../styles/forms.module.css";

const emptyFormData = {
    name: "",
    description: "",
    category: "",
    city: "",
    isOnline: false,
    privacy: "public",
    tags: "",
};

const createFormData = (group) => {
    if (!group) {
        return {
            ...emptyFormData,
        };
    }

    return {
        name: group.name || "",
        description:
            group.description || "",
        category:
            group.category || "",
        city: group.city || "",
        isOnline:
            Boolean(group.isOnline),
        privacy:
            group.privacy || "public",
        tags:
            group.tags?.join(", ") || "",
    };
};

const parseTags = (value) => {
    return [
        ...new Set(
            value
                .split(",")
                .map((tag) =>
                    tag
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        ),
    ];
};

export default function GroupForm({
    initialGroup = null,
    onSubmit,
    onCancel = null,
    isSubmitting = false,
    errorMessage = "",
    submitText = "Create group",
}) {
    const [formData, setFormData] =
        useState(
            createFormData(initialGroup)
        );

    useEffect(() => {
        setFormData(
            createFormData(initialGroup)
        );
    }, [initialGroup]);

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData((currentData) => ({
            ...currentData,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        await onSubmit({
            name:
                formData.name.trim(),

            description:
                formData.description.trim(),

            category:
                formData.category
                    .trim()
                    .toLowerCase(),

            city:
                formData.city.trim(),

            isOnline:
                formData.isOnline,

            privacy:
                formData.privacy,

            tags:
                parseTags(
                    formData.tags
                ),
        });
    };

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
        >
            {errorMessage && (
                <div
                    className={
                        styles.errorMessage
                    }
                >
                    {errorMessage}
                </div>
            )}

            <label>
                Group name

                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    minLength={3}
                    maxLength={80}
                    required
                />
            </label>

            <label>
                Category

                <input
                    type="text"
                    name="category"
                    value={
                        formData.category
                    }
                    onChange={handleChange}
                    minLength={2}
                    maxLength={50}
                    required
                />
            </label>

            <label>
                City

                <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    maxLength={80}
                />
            </label>

            <label>
                Privacy

                <select
                    name="privacy"
                    value={
                        formData.privacy
                    }
                    onChange={handleChange}
                >
                    <option value="public">
                        Public
                    </option>

                    <option value="private">
                        Private
                    </option>
                </select>
            </label>

            <label
                className={
                    styles.fullWidthField
                }
            >
                Description

                <textarea
                    name="description"
                    value={
                        formData.description
                    }
                    onChange={handleChange}
                    minLength={10}
                    maxLength={1000}
                    rows={6}
                    required
                />
            </label>

            <label
                className={
                    styles.fullWidthField
                }
            >
                Tags

                <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="android, kotlin, mobile"
                />

                <small>
                    Separate tags with commas.
                </small>
            </label>

            <label
                className={
                    styles.checkboxField
                }
            >
                <input
                    type="checkbox"
                    name="isOnline"
                    checked={
                        formData.isOnline
                    }
                    onChange={handleChange}
                />

                This is an online group
            </label>

            <div
                className={
                    styles.groupFormActions
                }
            >
                {onCancel && (
                    <button
                        type="button"
                        className={
                            styles.groupCancelButton
                        }
                        onClick={onCancel}
                        disabled={
                            isSubmitting
                        }
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={
                        isSubmitting
                    }
                >
                    {isSubmitting
                        ? "Saving..."
                        : submitText}
                </button>
            </div>
        </form>
    );
}