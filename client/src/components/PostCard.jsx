"use client";

import Link from "next/link";

const getInitials = (user) => {
    const name =
        user?.displayName?.trim() ||
        user?.username?.trim() ||
        "Skillora User";

    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
};

const formatPostDate = (createdAt) => {
    if (!createdAt) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(new Date(createdAt));
};

export default function PostCard({
    post,
}) {
    const profilePath =
        `/profile/${encodeURIComponent(
            post.author.username
        )}`;

    return (
        <article className="skillora-post-card">
            <header className="skillora-post-card-header">
                <Link
                    href={profilePath}
                    className="skillora-post-author-avatar"
                >
                    {post.author.avatarUrl ? (
                        <img
                            src={
                                post.author
                                    .avatarUrl
                            }
                            alt=""
                        />
                    ) : (
                        getInitials(
                            post.author
                        )
                    )}
                </Link>

                <div className="skillora-post-author-details">
                    <Link
                        href={profilePath}
                        className="skillora-post-author-name"
                    >
                        {
                            post.author
                                .displayName
                        }
                    </Link>

                    <span>
                        @
                        {
                            post.author
                                .username
                        }
                    </span>

                    <time
                        dateTime={
                            post.createdAt
                        }
                    >
                        {formatPostDate(
                            post.createdAt
                        )}
                    </time>
                </div>
            </header>

            {post.group && (
                <Link
                    href={`/groups/${post.group._id}`}
                    className="skillora-post-group"
                >
                    Posted in{" "}
                    <strong>
                        {post.group.name}
                    </strong>
                </Link>
            )}

            <p className="skillora-post-content">
                {post.content}
            </p>
        </article>
    );
}