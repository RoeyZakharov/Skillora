"use client";

import {
    useState,
} from "react";

import styles from "../styles/forms.module.css";

const initialFilters = {
    keyword: "",
    category: "",
    city: "",
    privacy: "",
    format: "",
    tags: "",
    minMembers: "",
};

export default function AdvancedSearch({
    onSearch,
    isSearching = false,
}) {
    const [filters, setFilters] =
        useState(initialFilters);

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFilters(
            (currentFilters) => ({
                ...currentFilters,
                [name]: value,
            })
        );
    };

    const normalizeFilters = () => {
        return Object.fromEntries(
            Object.entries(filters)
                .map(
                    ([
                        key,
                        value,
                    ]) => [
                        key,
                        typeof value ===
                        "string"
                            ? value.trim()
                            : value,
                    ]
                )
                .filter(
                    ([, value]) =>
                        value !== ""
                )
        );
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        await onSearch(
            normalizeFilters()
        );
    };

    const handleReset = async () => {
        setFilters(initialFilters);

        await onSearch({});
    };

    return (
        <form
            className={
                styles.searchForm
            }
            onSubmit={handleSubmit}
        >
            <label
                className={
                    styles.searchWideField
                }
            >
                Keyword

                <input
                    type="text"
                    name="keyword"
                    value={
                        filters.keyword
                    }
                    onChange={
                        handleChange
                    }
                    placeholder="Search name, description or tags"
                />
            </label>

            <label>
                Category

                <input
                    type="text"
                    name="category"
                    value={
                        filters.category
                    }
                    onChange={
                        handleChange
                    }
                    placeholder="Programming"
                    maxLength={50}
                />
            </label>

            <label>
                City

                <input
                    type="text"
                    name="city"
                    value={
                        filters.city
                    }
                    onChange={
                        handleChange
                    }
                    placeholder="Tel Aviv"
                    maxLength={80}
                />
            </label>

            <label>
                Privacy

                <select
                    name="privacy"
                    value={
                        filters.privacy
                    }
                    onChange={
                        handleChange
                    }
                >
                    <option value="">
                        Any privacy
                    </option>

                    <option value="public">
                        Public
                    </option>

                    <option value="private">
                        Private
                    </option>
                </select>
            </label>

            <label>
                Format

                <select
                    name="format"
                    value={
                        filters.format
                    }
                    onChange={
                        handleChange
                    }
                >
                    <option value="">
                        Any format
                    </option>

                    <option value="online">
                        Online
                    </option>

                    <option value="in-person">
                        In person
                    </option>
                </select>
            </label>

            <label
                className={
                    styles.searchWideField
                }
            >
                Tags

                <input
                    type="text"
                    name="tags"
                    value={filters.tags}
                    onChange={
                        handleChange
                    }
                    placeholder="android, kotlin"
                />

                <small>
                    Separate tags with commas.
                    All entered tags must match.
                </small>
            </label>

            <label>
                Minimum members

                <input
                    type="number"
                    name="minMembers"
                    value={
                        filters.minMembers
                    }
                    onChange={
                        handleChange
                    }
                    min="0"
                    step="1"
                    placeholder="0"
                />
            </label>

            <div
                className={
                    styles.searchActions
                }
            >
                <button
                    type="button"
                    className={
                        styles.searchResetButton
                    }
                    onClick={
                        handleReset
                    }
                    disabled={
                        isSearching
                    }
                >
                    Clear filters
                </button>

                <button
                    type="submit"
                    disabled={
                        isSearching
                    }
                >
                    {isSearching
                        ? "Searching..."
                        : "Search groups"}
                </button>
            </div>
        </form>
    );
}