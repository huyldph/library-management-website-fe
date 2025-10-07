"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield } from "lucide-react";

export default function HomePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();

    const goReader = () => {
        router.push("/opac");
    };

    const goManager = () => {
        if (loading) return;
        if (isAuthenticated && user?.scope) {
            if (user.scope === "ROLE_ADMIN") {
                router.push("/admin");
                return;
            }
            if (user.scope === "ROLE_STAFF") {
                router.push("/staff");
                return;
            }
            // Không phải admin/staff thì yêu cầu đăng nhập lại để vào khu quản lý
        }
        router.push("/login");
    };

    return (
        <main className="min-h-screen bg-muted/20">
            <section className="container mx-auto flex min-h-screen flex-col items-center justify-center px-6 text-center">
                <div className="mb-8 flex items-center justify-center gap-3">
                    <BookOpen className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-bold">Hệ thống quản lý thư viện</h1>
                </div>
                <p className="mb-10 max-w-2xl text-muted-foreground">
                    Nền tảng tra cứu và quản lý tài nguyên thư viện. Vui lòng chọn vai trò phù hợp để tiếp tục.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" onClick={goReader}>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Người Đọc
                    </Button>
                    <Button size="lg" variant="secondary" onClick={goManager}>
                        <Shield className="mr-2 h-5 w-5" />
                        Thủ thư
                    </Button>
                </div>
            </section>
        </main>
    );
}
