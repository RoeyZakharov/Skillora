"use client";

import { useState } from "react";

import {
    useRouter,
} from "next/navigation";

import ProtectedPage from "../../../components/ProtectedPage";
import GroupForm from "../../../components/GroupForm";

import {
    createGroup,
} from "../../../services/groupService";

import styles from "../../../styles/forms.module.css";

export default function CreateGroupPage() {
    const router = useRouter();

    const [isSubmitting,
        setIsSubmitting] =
        useState(false);

    const [errorMessage,
        setErrorMessage] =
        useState("");

    const handleCreateGroup = async (
        groupData
    ) => {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await createGroup(groupData);

            router.push("/groups");
        } catch (error) {
            setErrorMessage(
                error.message ||
                    "Could not create the group."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedPage>
            <main className={styles.page}>
                <section
                    className={
                        styles.formCardWide
                    }
                >
                    <h1>
                        Create a Skillora Group
                    </h1>

                    <p
                        className={
                            styles.subtitle
                        }
                    >
                        Build a community for
                        learning and sharing.
                    </p>

                    <GroupForm
                        onSubmit={
                            handleCreateGroup
                        }
                        isSubmitting={
                            isSubmitting
                        }
                        errorMessage={
                            errorMessage
                        }
                    />
                </section>
            </main>
        </ProtectedPage>
    );
}