"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, loading, user } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                // Điều hướng theo role
                if (user?.scope === "ROLE_ADMIN") router.push("/admin");
                else if (user?.scope === "ROLE_STAFF") router.push("/staff");
                else if (user?.scope === "ROLE_MEMBER") router.push("/member");
            } else {
                router.push("/login");
            }
        }
    }, [isAuthenticated, loading, user, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="mt-4 text-muted-foreground">Đang tải...</p>
            </div>
        </div>
    );
}
