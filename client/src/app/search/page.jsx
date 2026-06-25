"use client";

import {
    useEffect,
    useState,
} from "react";

import AdvancedSearch from "../../components/AdvancedSearch";
import GroupCard from "../../components/GroupCard";
import ProtectedPage from "../../components/ProtectedPage";

import {
    searchGroups,
} from "../../services/groupService";

import styles from "../../styles/cards.module.css";

export default function SearchPage() {
    const [groups, setGroups] =
        useState([]);

    const [
        isSearching,
        setIsSearching,
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        hasSearched,
        setHasSearched,
    ] = useState(false);

    const handleSearch = async (
        filters
    ) => {
        setIsSearching(true);
        setErrorMessage("");

        try {
            const matchingGroups =
                await searchGroups(
                    filters
                );

            setGroups(
                matchingGroups
            );

            setHasSearched(true);
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

    useEffect(() => {
        handleSearch({});
    }, []);

    return (
        <ProtectedPage>
            <main
                className={
                    styles.searchPage
                }
            >
                <header
                    className={
                        styles.searchHeader
                    }
                >
                    <h1>
                        Search Skillora Groups
                    </h1>

                    <p>
                        Find communities by
                        topic, location, format
                        and membership size.
                    </p>
                </header>

                <section
                    className={
                        styles.searchPanel
                    }
                >
                    <AdvancedSearch
                        onSearch={
                            handleSearch
                        }
                        isSearching={
                            isSearching
                        }
                    />
                </section>

                {errorMessage && (
                    <div
                        className={
                            styles.errorMessage
                        }
                    >
                        {errorMessage}
                    </div>
                )}

                {!errorMessage &&
                    isSearching && (
                        <div
                            className={
                                styles.stateMessage
                            }
                        >
                            Searching groups...
                        </div>
                    )}

                {!errorMessage &&
                    !isSearching &&
                    hasSearched && (
                        <section
                            className={
                                styles.searchResults
                            }
                        >
                            <div
                                className={
                                    styles.searchResultsHeader
                                }
                            >
                                <h2>
                                    Results
                                </h2>

                                <span>
                                    {
                                        groups.length
                                    }{" "}
                                    {groups.length ===
                                    1
                                        ? "group"
                                        : "groups"}
                                </span>
                            </div>

                            {groups.length >
                            0 ? (
                                <div
                                    className={
                                        styles.groupsGrid
                                    }
                                >
                                    {groups.map(
                                        (
                                            group
                                        ) => (
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
                                </div>
                            ) : (
                                <div
                                    className={
                                        styles.stateMessage
                                    }
                                >
                                    No groups match
                                    the selected
                                    filters.
                                </div>
                            )}
                        </section>
                    )}
            </main>
        </ProtectedPage>
    );
}