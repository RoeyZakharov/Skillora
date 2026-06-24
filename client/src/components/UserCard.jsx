import styles from "../styles/cards.module.css";

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "Unknown";
    }

    return new Date(dateValue).toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );
};

const getInitials = (displayName) => {
    if (!displayName) {
        return "U";
    }

    return displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((namePart) =>
            namePart.charAt(0).toUpperCase()
        )
        .join("");
};

const SkillList = ({
    title,
    values,
    emptyMessage,
}) => {
    return (
        <section className={styles.listSection}>
            <h3>{title}</h3>

            {values?.length > 0 ? (
                <ul className={styles.tagList}>
                    {values.map((value) => (
                        <li key={value}>
                            {value}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.emptyText}>
                    {emptyMessage}
                </p>
            )}
        </section>
    );
};

export default function UserCard({
    user,
}) {
    return (
        <article className={styles.userCard}>
            <header className={styles.userHeader}>
                <div className={styles.avatar}>
                    {getInitials(
                        user.displayName
                    )}
                </div>

                <div>
                    <h1 className={styles.displayName}>
                        {user.displayName}
                    </h1>

                    <p className={styles.username}>
                        @{user.username}
                    </p>
                </div>
            </header>

            <section className={styles.profileDetails}>
                <div>
                    <span>City</span>
                    <strong>
                        {user.city ||
                            "Not specified"}
                    </strong>
                </div>

                <div>
                    <span>Member since</span>
                    <strong>
                        {formatDate(
                            user.createdAt
                        )}
                    </strong>
                </div>
            </section>

            <section className={styles.bioSection}>
                <h2>About</h2>

                <p>
                    {user.bio ||
                        "This user has not added a bio yet."}
                </p>
            </section>

            <div className={styles.skillsGrid}>
                <SkillList
                    title="Interests"
                    values={user.interests}
                    emptyMessage="No interests added."
                />

                <SkillList
                    title="Skills offered"
                    values={
                        user.skillsOffered
                    }
                    emptyMessage="No offered skills added."
                />

                <SkillList
                    title="Skills wanted"
                    values={
                        user.skillsWanted
                    }
                    emptyMessage="No wanted skills added."
                />
            </div>
        </article>
    );
}