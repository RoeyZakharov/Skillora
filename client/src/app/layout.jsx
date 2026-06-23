import "../styles/globals.css";

export const metadata = {
    title: "Skillora",
    description:
        "A social network for learning and sharing skills",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}