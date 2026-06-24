"use client";

import {
    useState,
} from "react";

import Link from "next/link";

import {
    useRouter,
} from "next/navigation";

import {
    loginUser,
} from "../../services/userService";

import styles from "../../styles/forms.module.css";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [errorMessage,
        setErrorMessage] =
        useState("");

    const [isSubmitting,
        setIsSubmitting] =
        useState(false);

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const user =
                await loginUser(
                    email,
                    password
                );

            router.push(
                `/profile/${user.username}`
            );
        } catch (error) {
            setErrorMessage(
                error.message ||
                    "Login failed."
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
                <h1>Login to Skillora</h1>

                <p className={styles.subtitle}>
                    Continue learning and sharing
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
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target
                                        .value
                                )
                            }
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target
                                        .value
                                )
                            }
                            autoComplete="current-password"
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
                            ? "Logging in..."
                            : "Login"}
                    </button>
                </form>

                <p className={styles.footer}>
                    New to Skillora?{" "}
                    <Link href="/register">
                        Register
                    </Link>
                </p>
            </section>
        </main>
    );
}