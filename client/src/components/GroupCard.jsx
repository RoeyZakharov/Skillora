import Link from "next/link";

import styles from "../styles/cards.module.css";

export default function GroupCard({
    group,
}) {
    return (
        <article className={styles.groupCard}>
            <header
                className={styles.groupCardHeader}
            >
                <div>
                    <h2>
                        <Link
                            href={`/groups/${group._id}`}
                            className={
                                styles.groupTitleLink
                            }
                        >
                            {group.name}
                        </Link>
                    </h2>

                    <p>{group.category}</p>
                </div>

                <span
                    className={
                        styles.privacyBadge
                    }
                >
                    {group.privacy}
                </span>
            </header>

            <p
                className={
                    styles.groupDescription
                }
            >
                {group.description}
            </p>

            <dl
                className={
                    styles.groupInformation
                }
            >
                <div>
                    <dt>Manager</dt>

                    <dd>
                        {group.admin
                            ?.displayName ||
                            "Unknown"}
                    </dd>
                </div>

                <div>
                    <dt>Members</dt>

                    <dd>
                        {group.memberCount}
                    </dd>
                </div>

                <div>
                    <dt>Format</dt>

                    <dd>
                        {group.isOnline
                            ? "Online"
                            : "In person"}
                    </dd>
                </div>

                <div>
                    <dt>City</dt>

                    <dd>
                        {group.city ||
                            "Not specified"}
                    </dd>
                </div>
            </dl>

            {group.tags?.length > 0 && (
                <ul className={styles.tagList}>
                    {group.tags.map((tag) => (
                        <li key={tag}>
                            {tag}
                        </li>
                    ))}
                </ul>
            )}

            <Link
                href={`/groups/${group._id}`}
                className={
                    styles.groupDetailsLink
                }
            >
                View group
            </Link>
        </article>
    );
}