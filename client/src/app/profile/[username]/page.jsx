"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
} from "next/navigation";

import ProtectedPage from "../../../components/ProtectedPage";
import UserCard from "../../../components/UserCard";

import {
    getCurrentUserProfile,
    getUserByUsername,
    updateCurrentUserProfile,
} from "../../../services/userService";

import styles from "../../../styles/cards.module.css";

const createFormData = (user) => {
    return {
        displayName:
            user?.displayName || "",

        bio:
            user?.bio || "",

        city:
            user?.city || "",

        interests:
            user?.interests?.join(", ") ||
            "",

        skillsOffered:
            user?.skillsOffered?.join(
                ", "
            ) || "",

        skillsWanted:
            user?.skillsWanted?.join(
                ", "
            ) || "",

        avatarUrl:
            user?.avatarUrl || "",
    };
};

const parseCommaSeparatedValues = (
    value
) => {
    return [
        ...new Set(
            value
                .split(",")
                .map((item) =>
                    item
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        ),
    ];
};

export default function ProfilePage() {
    const params = useParams();

    const username =
        typeof params.username === "string"
            ? params.username
            : "";

    const [user, setUser] =
        useState(null);

    const [isOwner, setIsOwner] =
        useState(false);

    const [isEditing, setIsEditing] =
        useState(false);

    const [formData, setFormData] =
        useState(createFormData(null));

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSaving, setIsSaving] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage,
        setSuccessMessage] =
        useState("");

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            if (!username) {
                setErrorMessage(
                    "Invalid username."
                );

                setIsLoading(false);

                return;
            }

            try {
                const [
                    viewedUser,
                    currentUser,
                ] = await Promise.all([
                    getUserByUsername(
                        username
                    ),
                    getCurrentUserProfile(),
                ]);

                if (!isMounted) {
                    return;
                }

                setUser(viewedUser);

                setIsOwner(
                    viewedUser._id ===
                        currentUser._id
                );

                setFormData(
                    createFormData(
                        viewedUser
                    )
                );

                setErrorMessage("");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    error.message ||
                        "Could not load the user profile."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [username]);

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setFormData(
            createFormData(user)
        );

        setErrorMessage("");
        setSuccessMessage("");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(
            createFormData(user)
        );

        setErrorMessage("");
        setSuccessMessage("");
        setIsEditing(false);
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");
        setIsSaving(true);

        try {
            const updatedUser =
                await updateCurrentUserProfile(
                    {
                        displayName:
                            formData
                                .displayName
                                .trim(),

                        bio:
                            formData.bio.trim(),

                        city:
                            formData.city.trim(),

                        interests:
                            parseCommaSeparatedValues(
                                formData.interests
                            ),

                        skillsOffered:
                            parseCommaSeparatedValues(
                                formData
                                    .skillsOffered
                            ),

                        skillsWanted:
                            parseCommaSeparatedValues(
                                formData
                                    .skillsWanted
                            ),

                        avatarUrl:
                            formData
                                .avatarUrl
                                .trim(),
                    }
                );

            setUser(updatedUser);

            setFormData(
                createFormData(
                    updatedUser
                )
            );

            setSuccessMessage(
                "Profile updated successfully."
            );

            setIsEditing(false);
        } catch (error) {
            setErrorMessage(
                error.message ||
                    "Could not update the profile."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedPage>
            <main className={styles.profilePage}>
                {isLoading && (
                    <div
                        className={
                            styles.stateMessage
                        }
                    >
                        Loading profile...
                    </div>
                )}

                {!isLoading &&
                    errorMessage &&
                    !user && (
                        <div
                            className={
                                styles.errorMessage
                            }
                        >
                            <h1>
                                Profile unavailable
                            </h1>

                            <p>
                                {errorMessage}
                            </p>
                        </div>
                    )}

                {!isLoading &&
                    user &&
                    !isEditing && (
                        <div
                            className={
                                styles.profileContainer
                            }
                        >
                            {successMessage && (
                                <div
                                    className={
                                        styles
                                            .successMessage
                                    }
                                >
                                    {
                                        successMessage
                                    }
                                </div>
                            )}

                            <UserCard
                                user={user}
                                canEdit={isOwner}
                                onEdit={handleEdit}
                            />
                        </div>
                    )}

                {!isLoading &&
                    user &&
                    isEditing && (
                        <section
                            className={
                                styles.editCard
                            }
                        >
                            <header
                                className={
                                    styles
                                        .editHeader
                                }
                            >
                                <div>
                                    <h1>
                                        Edit profile
                                    </h1>

                                    <p>
                                        Update your
                                        Skillora
                                        information.
                                    </p>
                                </div>
                            </header>

                            {errorMessage && (
                                <div
                                    className={
                                        styles
                                            .formError
                                    }
                                >
                                    {
                                        errorMessage
                                    }
                                </div>
                            )}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className={
                                    styles.editForm
                                }
                            >
                                <label>
                                    Display name

                                    <input
                                        type="text"
                                        name="displayName"
                                        value={
                                            formData
                                                .displayName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        minLength={2}
                                        maxLength={60}
                                        required
                                    />
                                </label>

                                <label>
                                    City

                                    <input
                                        type="text"
                                        name="city"
                                        value={
                                            formData.city
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={80}
                                    />
                                </label>

                                <label
                                    className={
                                        styles
                                            .fullWidthField
                                    }
                                >
                                    Bio

                                    <textarea
                                        name="bio"
                                        value={
                                            formData.bio
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={500}
                                        rows={5}
                                    />

                                    <span
                                        className={
                                            styles
                                                .characterCount
                                        }
                                    >
                                        {
                                            formData
                                                .bio
                                                .length
                                        }
                                        /500
                                    </span>
                                </label>

                                <label
                                    className={
                                        styles
                                            .fullWidthField
                                    }
                                >
                                    Interests

                                    <input
                                        type="text"
                                        name="interests"
                                        value={
                                            formData
                                                .interests
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="programming, music, photography"
                                    />

                                    <small>
                                        Separate values
                                        with commas.
                                    </small>
                                </label>

                                <label
                                    className={
                                        styles
                                            .fullWidthField
                                    }
                                >
                                    Skills offered

                                    <input
                                        type="text"
                                        name="skillsOffered"
                                        value={
                                            formData
                                                .skillsOffered
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="javascript, guitar, design"
                                    />

                                    <small>
                                        Separate values
                                        with commas.
                                    </small>
                                </label>

                                <label
                                    className={
                                        styles
                                            .fullWidthField
                                    }
                                >
                                    Skills wanted

                                    <input
                                        type="text"
                                        name="skillsWanted"
                                        value={
                                            formData
                                                .skillsWanted
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="android, photography, public speaking"
                                    />

                                    <small>
                                        Separate values
                                        with commas.
                                    </small>
                                </label>

                                <label
                                    className={
                                        styles
                                            .fullWidthField
                                    }
                                >
                                    Avatar URL

                                    <input
                                        type="url"
                                        name="avatarUrl"
                                        value={
                                            formData
                                                .avatarUrl
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={500}
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </label>

                                <div
                                    className={
                                        styles
                                            .formActions
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles
                                                .cancelButton
                                        }
                                        onClick={
                                            handleCancel
                                        }
                                        disabled={
                                            isSaving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className={
                                            styles
                                                .saveButton
                                        }
                                        disabled={
                                            isSaving
                                        }
                                    >
                                        {isSaving
                                            ? "Saving..."
                                            : "Save changes"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}
            </main>
        </ProtectedPage>
    );
}