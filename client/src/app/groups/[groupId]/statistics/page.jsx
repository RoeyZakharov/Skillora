"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import ProtectedPage from "../../../../components/ProtectedPage";

import {
    getGroupById,
} from "../../../../services/groupService";

import {
    getGroupPosts,
} from "../../../../services/postService";

import GroupCharts from "../../../../components/GroupCharts";

import GroupActivityChart from "../../../../components/GroupActivityChart";

import styles from "../../../../styles/cards.module.css";

export default function GroupStatisticsPage() {
    const params = useParams();

    const groupId =
        typeof params.groupId === "string"
            ? params.groupId
            : "";

    const [group, setGroup] =
        useState(null);
    
    const [groupPosts, setGroupPosts] =
        useState([]);

    const [
        isLoadingPosts,
        setIsLoadingPosts,
    ] = useState(false);

    const [
        postsError,
        setPostsError,
    ] = useState("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        selectedMetric,
        setSelectedMetric,
    ] = useState("posts");

    const [
        selectedPeriod,
        setSelectedPeriod,
    ] = useState("week");

    const [
        selectedLimit,
        setSelectedLimit,
    ] = useState("5");

    useEffect(() => {
        let isMounted = true;

        const loadGroup = async () => {
            if (!groupId) {
                setErrorMessage(
                    "Invalid group identifier."
                );

                setIsLoading(false);
                return;
            }

            try {
                const loadedGroup =
                    await getGroupById(
                        groupId
                    );

                if (!isMounted) {
                    return;
                }

                setGroup(loadedGroup);
                setErrorMessage("");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    error.message ||
                        "Could not load the group."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadGroup();

        return () => {
            isMounted = false;
        };
    }, [groupId]);

    useEffect(() => {
        let isMounted = true;

        if (!group?.canManage) {
            return () => {
                isMounted = false;
            };
        }

        const loadPosts = async () => {
            setIsLoadingPosts(true);
            setPostsError("");

            try {
                const posts =
                    await getGroupPosts(
                        groupId
                    );

                if (isMounted) {
                    setGroupPosts(posts);
                }
            } catch (error) {
                if (isMounted) {
                    setPostsError(
                        error.message ||
                            "Could not load group statistics."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoadingPosts(false);
                }
            }
        };

        loadPosts();

        return () => {
            isMounted = false;
        };
    }, [
        groupId,
        group?.canManage,
    ]);

    const filteredPosts = useMemo(() => {
        if (selectedPeriod === "all") {
            return groupPosts;
        }

        const periodMilliseconds = {
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
        };

        const periodLength =
            periodMilliseconds[
                selectedPeriod
            ];

        if (!periodLength) {
            return groupPosts;
        }

        const startingTime =
            Date.now() - periodLength;

        return groupPosts.filter((post) => {
            const postTime =
                new Date(
                    post.createdAt
                ).getTime();

            return (
                Number.isFinite(postTime) &&
                postTime >= startingTime
            );
        });
    }, [
        groupPosts,
        selectedPeriod,
    ]);

    const postsByMemberData =
        useMemo(() => {
            const members =
                group?.members || [];

            return members
                .filter(
                    (member) =>
                        member.user
                )
                .map((member) => {
                    const userId = String(
                        member.user._id
                    );

                    const postCount =
                        filteredPosts.filter(
                            (post) => {
                                const authorId =
                                    post.author
                                        ?._id ||
                                    post.author;

                                return (
                                    String(
                                        authorId
                                    ) ===
                                    userId
                                );
                            }
                        ).length;

                    return {
                        label:
                            member.user
                                .displayName ||
                            `@${member.user.username}`,
                        value: postCount,
                    };
                })
                .sort(
                    (firstMember, secondMember) =>
                        secondMember.value -
                        firstMember.value
                );
        }, [
            group?.members,
            filteredPosts,
        ]);

    const activityData = useMemo(() => {
        const now = new Date();

        const bucketCount =
            selectedPeriod === "day"
                ? 24
                : selectedPeriod === "week"
                ? 7
                : 30;

        const isHourly =
            selectedPeriod === "day";

        const buckets = [];

        for (
            let index = bucketCount - 1;
            index >= 0;
            index -= 1
        ) {
            const bucketStart =
                new Date(now);

            if (isHourly) {
                bucketStart.setMinutes(
                    0,
                    0,
                    0
                );

                bucketStart.setHours(
                    bucketStart.getHours() -
                        index
                );
            } else {
                bucketStart.setHours(
                    0,
                    0,
                    0,
                    0
                );

                bucketStart.setDate(
                    bucketStart.getDate() -
                        index
                );
            }

            const bucketEnd =
                new Date(bucketStart);

            if (isHourly) {
                bucketEnd.setHours(
                    bucketEnd.getHours() + 1
                );
            } else {
                bucketEnd.setDate(
                    bucketEnd.getDate() + 1
                );
            }

            const value =
                groupPosts.filter((post) => {
                    const postDate =
                        new Date(
                            post.createdAt
                        );

                    return (
                        postDate >=
                            bucketStart &&
                        postDate < bucketEnd
                    );
                }).length;

            const label = isHourly
                ? bucketStart.toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                )
                : bucketStart.toLocaleDateString(
                    [],
                    {
                        month: "short",
                        day: "numeric",
                    }
                );

            buckets.push({
                label,
                value,
            });
        }

        return buckets;
    }, [
        groupPosts,
        selectedPeriod,
    ]);

    const activityAverage =
        useMemo(() => {
            if (
                selectedPeriod === "day" ||
                activityData.length === 0
            ) {
                return null;
            }

            const totalPosts =
                activityData.reduce(
                    (total, item) =>
                        total + item.value,
                    0
                );

            return (
                totalPosts /
                activityData.length
            );
        }, [
            activityData,
            selectedPeriod,
        ]);

    const periodLabels = {
        day: "Last 24 hours",
        week: "Last 7 days",
        month: "Last 30 days",
        all: "All time",
    };

    const commentsByMemberData =
        useMemo(() => {
            const members =
                group?.members || [];

            return members
                .filter(
                    (member) =>
                        member.user
                )
                .map((member) => {
                    const userId = String(
                        member.user._id
                    );

                    const commentCount =
                        filteredPosts.reduce(
                            (
                                total,
                                post
                            ) => {
                                const comments =
                                    post.comments ||
                                    [];

                                const memberComments =
                                    comments.filter(
                                        (
                                            comment
                                        ) => {
                                            const authorId =
                                                comment
                                                    .author
                                                    ?._id ||
                                                comment
                                                    .author;

                                            return (
                                                String(
                                                    authorId
                                                ) ===
                                                userId
                                            );
                                        }
                                    ).length;

                                return (
                                    total +
                                    memberComments
                                );
                            },
                            0
                        );

                    return {
                        label:
                            member.user
                                .displayName ||
                            `@${member.user.username}`,
                        value: commentCount,
                    };
                })
                .sort(
                    (
                        firstMember,
                        secondMember
                    ) =>
                        secondMember.value -
                        firstMember.value
                );
        }, [
            group?.members,
            filteredPosts,
        ]);

    const likesReceivedData =
        useMemo(() => {
            const members =
                group?.members || [];

            return members
                .filter(
                    (member) =>
                        member.user
                )
                .map((member) => {
                    const userId = String(
                        member.user._id
                    );

                    const likesReceived =
                        filteredPosts.reduce(
                            (
                                total,
                                post
                            ) => {
                                const authorId =
                                    post.author
                                        ?._id ||
                                    post.author;

                                if (
                                    String(
                                        authorId
                                    ) !== userId
                                ) {
                                    return total;
                                }

                                return (
                                    total +
                                    (
                                        post.likes ||
                                        []
                                    ).length
                                );
                            },
                            0
                        );

                    return {
                        label:
                            member.user
                                .displayName ||
                            `@${member.user.username}`,
                        value: likesReceived,
                    };
                })
                .sort(
                    (
                        firstMember,
                        secondMember
                    ) =>
                        secondMember.value -
                        firstMember.value
                );
        }, [
            group?.members,
            filteredPosts,
        ]);

    const inactiveMembers =
        useMemo(() => {
            const members =
                group?.members || [];

            const activeMemberIds =
                new Set(
                    filteredPosts.map(
                        (post) =>
                            String(
                                post.author?._id ||
                                post.author
                            )
                    )
                );

            return members
                .filter(
                    (member) =>
                        member.user &&
                        !activeMemberIds.has(
                            String(
                                member.user._id
                            )
                        )
                )
                .map((member) => ({
                    id: member.user._id,
                    name:
                        member.user
                            .displayName ||
                        `@${member.user.username}`,
                    username:
                        member.user.username,
                }))
                .sort((first, second) =>
                    first.name.localeCompare(
                        second.name
                    )
                );
        }, [
            group?.members,
            filteredPosts,
        ]);

    return (
        <ProtectedPage>
            <main
                className={
                    styles.groupDetailPage
                }
            >
                {isLoading && (
                    <div
                        className={
                            styles.stateMessage
                        }
                    >
                        Loading statistics...
                    </div>
                )}

                {!isLoading &&
                    errorMessage && (
                        <section
                            className={
                                styles.errorMessage
                            }
                        >
                            <h1>
                                Statistics unavailable
                            </h1>

                            <p>
                                {errorMessage}
                            </p>
                        </section>
                    )}

                {!isLoading &&
                    !errorMessage &&
                    group &&
                    !group.canManage && (
                        <section
                            className={
                                styles.errorMessage
                            }
                        >
                            <h1>Access denied</h1>

                            <p>
                                Only the group manager
                                can view group
                                statistics.
                            </p>

                            <Link
                                href={`/groups/${groupId}`}
                                className={
                                    styles.backLink
                                }
                            >
                                Back to group
                            </Link>
                        </section>
                    )}

                {!isLoading &&
                    !errorMessage &&
                    group?.canManage && (
                        <article
                            className={
                                styles.groupDetailCard
                            }
                        >
                            <Link
                                href={`/groups/${groupId}`}
                                className={
                                    styles.backLink
                                }
                            >
                                ← Back to group
                            </Link>

                            <header className="skillora-statistics-header">
                                <div>
                                    <h1>
                                        {group.name} statistics
                                    </h1>

                                    <p>
                                        Analyse group
                                        participation and
                                        member engagement.
                                    </p>
                                </div>
                            </header>

                            <section className="skillora-statistics-controls">
                                <label>
                                    Statistic

                                    <select
                                        value={
                                            selectedMetric
                                        }
                                        onChange={(event) => {
                                            const nextMetric =
                                                event.target.value;

                                            setSelectedMetric(nextMetric);

                                            if (
                                                nextMetric === "activity" &&
                                                selectedPeriod === "all"
                                            ) {
                                                setSelectedPeriod("week");
                                            }
                                        }}
                                    >
                                        <option value="posts">
                                            Posts by member
                                        </option>

                                        <option value="comments">
                                            Comments by member
                                        </option>

                                        <option value="likes">
                                            Likes received
                                        </option>

                                        <option value="inactive">
                                            Members with no
                                            posts
                                        </option>

                                        <option value="activity">
                                            Total posts over time
                                        </option>

                                    </select>

                                </label>

                                <label>

                                    Time period

                                    <select
                                        value={
                                            selectedPeriod
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setSelectedPeriod(
                                                event
                                                    .target
                                                    .value
                                            );
                                        }}
                                    >
                                        <option value="day">
                                            Last 24 hours
                                        </option>

                                        <option value="week">
                                            Last 7 days
                                        </option>

                                        <option value="month">
                                            Last 30 days
                                        </option>

                                        {selectedMetric !== "activity" && (
                                            <option value="all">
                                                All time
                                            </option>
                                        )}

                                    </select>
                                    
                                </label>
                                
                                {![
                                    "inactive",
                                    "activity",
                                ].includes(selectedMetric) && (
                                    <label>
                                        Results shown

                                        <select
                                            value={selectedLimit}
                                            onChange={(event) => {
                                                setSelectedLimit(
                                                    event.target.value
                                                );
                                            }}
                                        >
                                            <option value="5">
                                                Top 5
                                            </option>

                                            <option value="10">
                                                Top 10
                                            </option>

                                            <option value="20">
                                                Top 20
                                            </option>
                                        </select>
                                    </label>
                                )}

                            </section>

                            {isLoadingPosts && (
                                <div className={styles.stateMessage}>
                                    Loading group activity...
                                </div>
                            )}

                            {postsError && (
                                <div className={styles.errorMessage}>
                                    {postsError}
                                </div>
                            )}

                            {!isLoadingPosts &&
                                !postsError &&
                                selectedMetric === "posts" && (
                                    <GroupCharts
                                        data={postsByMemberData.slice(
                                            0,
                                            Number(selectedLimit)
                                        )}
                                        title={`Posts by member — ${
                                            periodLabels[
                                                selectedPeriod
                                            ]
                                        }`}
                                    />
                                )}

                            {!isLoadingPosts &&
                                !postsError &&
                                selectedMetric ===
                                    "comments" && (
                                    <GroupCharts
                                        data={commentsByMemberData.slice(
                                            0,
                                            Number(selectedLimit)
                                        )}
                                        title={`Comments by member — ${
                                            periodLabels[
                                                selectedPeriod
                                            ]
                                        }`}
                                    />
                                )}

                            {!isLoadingPosts &&
                                !postsError &&
                                selectedMetric === "likes" && (
                                    <GroupCharts
                                        data={likesReceivedData.slice(
                                            0,
                                            Number(selectedLimit)
                                        )}
                                        title={`Likes received — ${
                                            periodLabels[
                                                selectedPeriod
                                            ]
                                        }`}
                                    />
                                )}

                            {!isLoadingPosts &&
                                !postsError &&
                                selectedMetric === "activity" && (
                                    <GroupActivityChart
                                        data={activityData}
                                        averageValue={
                                            activityAverage
                                        }
                                        title={`Total posts — ${
                                            periodLabels[
                                                selectedPeriod
                                            ]
                                        }`}
                                    />
                                )}

                            {!isLoadingPosts &&
                                !postsError &&
                                selectedMetric === "inactive" && (
                                    <section className="skillora-inactive-members">
                                        <h2>
                                            Members with no posts —{" "}
                                            {
                                                periodLabels[
                                                    selectedPeriod
                                                ]
                                            }
                                        </h2>

                                        {inactiveMembers.length ===
                                        0 ? (
                                            <p>
                                                Every group member
                                                posted during this
                                                period.
                                            </p>
                                        ) : (
                                            <ul>
                                                {inactiveMembers.map(
                                                    (member) => (
                                                        <li
                                                            key={
                                                                member.id
                                                            }
                                                        >
                                                            <div>
                                                                <strong>
                                                                    {
                                                                        member.name
                                                                    }
                                                                </strong>

                                                                {member.username && (
                                                                    <span>
                                                                        @
                                                                        {
                                                                            member.username
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <span className="skillora-inactive-badge">
                                                                0 posts
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
                                    </section>
                                )}

                            {!isLoadingPosts &&
                                !postsError &&
                                ![
                                    "posts",
                                    "comments",
                                    "likes",
                                    "inactive",
                                    "activity",
                                ].includes(selectedMetric) && (
                                    <section className="skillora-statistics-placeholder">
                                        <h2>
                                            Statistic not connected yet
                                        </h2>

                                        <p>
                                            The selected statistic will
                                            be added in the next steps.
                                        </p>
                                    </section>
                                )}
                        </article>
                    )}
            </main>
        </ProtectedPage>
    );
}