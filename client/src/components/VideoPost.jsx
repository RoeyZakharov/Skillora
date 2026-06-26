"use client";

const getYouTubeVideoId = (videoUrl) => {
    try {
        const parsedUrl = new URL(videoUrl);
        const hostname =
            parsedUrl.hostname
                .replace("www.", "")
                .toLowerCase();

        if (hostname === "youtu.be") {
            return parsedUrl.pathname
                .split("/")
                .filter(Boolean)[0];
        }

        if (
            hostname === "youtube.com" ||
            hostname ===
                "m.youtube.com" ||
            hostname ===
                "youtube-nocookie.com"
        ) {
            if (
                parsedUrl.pathname ===
                "/watch"
            ) {
                return parsedUrl.searchParams.get(
                    "v"
                );
            }

            const pathParts =
                parsedUrl.pathname
                    .split("/")
                    .filter(Boolean);

            if (
                ["embed", "shorts"].includes(
                    pathParts[0]
                )
            ) {
                return pathParts[1];
            }
        }

        return null;
    } catch {
        return null;
    }
};

export default function VideoPost({
    videoUrl,
}) {
    if (!videoUrl) {
        return null;
    }

    const youtubeVideoId =
        getYouTubeVideoId(videoUrl);

    if (youtubeVideoId) {
        return (
            <div className="skillora-video-post skillora-youtube-post">
                <iframe
                    src={`https://www.youtube.com/embed/${encodeURIComponent(
                        youtubeVideoId
                    )}`}
                    title="Skillora YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className="skillora-video-post">
            <video
                src={videoUrl}
                controls
                preload="metadata"
            >
                Your browser does not support
                HTML video.
            </video>
        </div>
    );
}