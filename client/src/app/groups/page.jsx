"use client";

import {
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import AdvancedSearch from "../../components/AdvancedSearch";
import ProtectedPage from "../../components/ProtectedPage";
import GroupCard from "../../components/GroupCard";

import {
    listGroups,
    searchGroups,
} from "../../services/groupService";

import styles from "../../styles/cards.module.css";

export default function GroupsPage() {
    const [groups, setGroups] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [searchText, setSearchText] =
        useState("");

    const [isSearching, setIsSearching] =
        useState(false);

    const [showAdvancedSearch, setShowAdvancedSearch] =
        useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadGroups = async () => {
            try {
                const loadedGroups =
                    await listGroups();

                if (!isMounted) {
                    return;
                }

                setGroups(loadedGroups);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    error.message ||
                        "Could not load groups."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadGroups();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleBasicSearch = async (
        event
    ) => {
        event.preventDefault();

        setIsSearching(true);
        setErrorMessage("");

        try {
            const normalizedSearch =
                searchText.trim();

            const matchingGroups =
                normalizedSearch
                    ? await searchGroups({
                        keyword:
                            normalizedSearch,
                    })
                    : await listGroups();

            setGroups(matchingGroups);
        } catch (error) {
            setGroups([]);

            setErrorMessage(
                error.message ||
                    "Could not search groups."
            );
        } finally {
            setIsSearching(false);
        }
    };

    const handleAdvancedSearch = async (
        filters
    ) => {
        setIsSearching(true);
        setErrorMessage("");

        try {
            const matchingGroups =
                await searchGroups(filters);

            setGroups(matchingGroups);
        } catch (error) {
            setGroups([]);

            setErrorMessage(
                error.message ||
                    "Could not search groups."
            );
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <ProtectedPage>
            <main
                className={
                    styles.groupsPage
                }
            >
                <header
                    className={
                        styles.groupsHeader
                    }
                >
                    <div>
                        <h1>
                            Skillora Groups
                        </h1>

                        <p>
                            Learn together with
                            the community.
                        </p>
                    </div>

                    <Link
                        href="/groups/create"
                        className={
                            styles.primaryLink
                        }
                    >
                        Create group
                    </Link>
                </header>

                <form
                    className={
                        styles.groupsBasicSearch
                    }
                    onSubmit={handleBasicSearch}
                >
                    <input
                        type="search"
                        value={searchText}
                        onChange={(event) =>
                            setSearchText(
                                event.target.value
                            )
                        }
                        placeholder="Search groups by name, description or tags"
                        aria-label="Search groups"
                    />

                    <button
                        type="submit"
                        disabled={isSearching}
                    >
                        {isSearching
                            ? "Searching..."
                            : "Search"}
                    </button>
                </form>

                <div
                    className={
                        styles.advancedSearchContainer
                    }
                >
                    <button
                        type="button"
                        className={
                            styles.advancedSearchToggle
                        }
                        onClick={() =>
                            setShowAdvancedSearch(
                                (currentValue) =>
                                    !currentValue
                            )
                        }
                    >
                        {showAdvancedSearch
                            ? "Hide advanced filters"
                            : "Advanced filters"}
                    </button>

                    {showAdvancedSearch && (
                        <div
                            className={
                                styles.advancedSearchPanel
                            }
                        >
                            <AdvancedSearch
                                onSearch={
                                    handleAdvancedSearch
                                }
                                isSearching={
                                    isSearching
                                }
                            />
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div
                        className={
                            styles.stateMessage
                        }
                    >
                        Loading groups...
                    </div>
                )}

                {!isLoading &&
                    errorMessage && (
                        <div
                            className={
                                styles
                                    .errorMessage
                            }
                        >
                            {errorMessage}
                        </div>
                    )}

                {!isLoading &&
                    !errorMessage &&
                    groups.length === 0 && (
                        <div
                            className={`${styles.stateMessage} ${styles.noGroupsFound}`}
                        >
                            No groups found.
                        </div>
                    )}

                {!isLoading &&
                    groups.length > 0 && (
                        <section
                            className={
                                styles
                                    .groupsGrid
                            }
                        >
                            {groups.map(
                                (group) => (
                                    <GroupCard
                                        key={
                                            group._id
                                        }
                                        group={
                                            group
                                        }
                                    />
                                )
                            )}
                        </section>
                    )}
            </main>
        </ProtectedPage>
    );
}