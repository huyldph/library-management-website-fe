import type React from "react";
import type {Metadata} from "next";
import {GeistSans} from "geist/font/sans";
import {GeistMono} from "geist/font/mono";
import {Analytics} from "@vercel/analytics/next";
import {AuthProvider} from "@/contexts/auth-context";
import {Suspense} from "react";
import "./globals.css";

export const metadata: Metadata = {
    title: "Hệ thống quản lý thư viện",
    description: "Library Management System",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="vi">
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
            <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Analytics/>
        </body>
        </html>
    );
}
