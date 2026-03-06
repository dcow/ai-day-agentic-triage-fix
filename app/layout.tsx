import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <footer className="fixed bottom-0 w-full py-2 text-center text-xs text-gray-400 bg-gray-100">
          Example app for the{" "}
          <a
            href="https://github.com/dcow/ai-day-agentic-triage-fix"
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            AI Day agentic triage
          </a>{" "}
          project &middot;{" "}
          <a
            href="/slides.pdf"
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            View slides
          </a>
        </footer>
      </body>
    </html>
  );
}
