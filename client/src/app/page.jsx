"use client";

import { useEffect, useState } from "react";

import { getHealth } from "../services/ajaxService";

export default function HomePage() {
    const [healthData, setHealthData] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        let isMounted = true;

        const loadHealth = async () => {
            try {
                const response =
                    await getHealth();

                if (!isMounted) {
                    return;
                }

                setHealthData(response);
                setErrorMessage("");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                if (error.textStatus === "timeout") {
                    setErrorMessage(
                        "The server request timed out."
                    );

                    return;
                }

                setErrorMessage(
                    error.message ||
                        "Could not connect to the Skillora server."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadHealth();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <main className="home-page">
            <section className="health-card">
                <header className="health-card__header">
                    <h1>Skillora</h1>

                    <p>
                        Learn. Share. Build Together.
                    </p>
                </header>

                <h2>System Status</h2>

                {isLoading && (
                    <p className="status-message">
                        Checking the server...
                    </p>
                )}

                {!isLoading && errorMessage && (
                    <div className="status-box status-box--error">
                        <h3>Connection failed</h3>
                        <p>{errorMessage}</p>
                    </div>
                )}

                {!isLoading && healthData && (
                    <div className="status-box status-box--success">
                        <h3>
                            {healthData.message}
                        </h3>

                        <dl className="health-list">
                            <div>
                                <dt>Server</dt>
                                <dd>
                                    {
                                        healthData
                                            .data
                                            .server
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt>Database</dt>
                                <dd>
                                    {
                                        healthData
                                            .data
                                            .database
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    Database name
                                </dt>
                                <dd>
                                    {
                                        healthData
                                            .data
                                            .databaseName
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt>Environment</dt>
                                <dd>
                                    {
                                        healthData
                                            .data
                                            .environment
                                    }
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}
            </section>
        </main>
    );
}