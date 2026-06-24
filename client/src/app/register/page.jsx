"use client";

import {
    useState,
} from "react";

import Link from "next/link";

import {
    useRouter,
} from "next/navigation";

import {
    registerUser,
} from "../../services/userService";

import styles from "../../styles/forms.module.css";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] =
        useState({
            username: "",
            displayName: "",
            email: "",
            password: "",
            confirmPassword: "",
        });

    const [errorMessage,
        setErrorMessage] =
        useState("");

    const [isSubmitting,
        setIsSubmitting] =
        useState(false);

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

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setErrorMessage("");

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setErrorMessage(
                "The passwords do not match."
            );

            return;
        }

        setIsSubmitting(true);

        try {
            const user =
                await registerUser({
                    username:
                        formData.username,
                    displayName:
                        formData.displayName,
                    email:
                        formData.email,
                    password:
                        formData.password,
                });

            router.push(
                `/profile/${user.username}`
            );
        } catch (error) {
            setErrorMessage(
                error.message ||
                    "Registration failed."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.page}>
            <section
                className={styles.formCard}
            >
                <h1>Create Skillora Account</h1>

                <p className={styles.subtitle}>
                    Join the learning community
                </p>

                {errorMessage && (
                    <div
                        className={
                            styles.errorMessage
                        }
                    >
                        {errorMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <label>
                        Username
                        <input
                            type="text"
                            name="username"
                            value={
                                formData.username
                            }
                            onChange={
                                handleChange
                            }
                            minLength={3}
                            maxLength={30}
                            required
                        />
                    </label>

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
                        Email
                        <input
                            type="email"
                            name="email"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            name="password"
                            value={
                                formData.password
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </label>

                    <label>
                        Confirm password
                        <input
                            type="password"
                            name="confirmPassword"
                            value={
                                formData
                                    .confirmPassword
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "Creating account..."
                            : "Register"}
                    </button>
                </form>

                <p className={styles.footer}>
                    Already registered?{" "}
                    <Link href="/login">
                        Login
                    </Link>
                </p>
            </section>
        </main>
    );
}