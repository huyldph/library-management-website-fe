"use client";

import {useEffect, useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {login} from "@/lib/api/auth";
import {jwtDecode} from "jwt-decode";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {BookOpen, AlertCircle, Home} from "lucide-react";
import {ROLES} from "@/lib/constants";
import {getToken} from "@/lib/token";

// ✅ Kiểu payload của token
interface TokenPayload {
    sub: string;
    scope: "ROLE_ADMIN" | "ROLE_STAFF" | "ROLE_MEMBER";
}

// ✅ Kiểu trả về từ API login()
interface LoginResult {
    success: boolean;
    token?: string;
    message?: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Nếu đã có token hợp lệ, tự động chuyển hướng theo vai trò
    useEffect(() => {
        const token = getToken();
        if (!token) return;
        try {
            const decoded = jwtDecode<TokenPayload>(token);
            switch (decoded.scope) {
                case ROLES.ADMIN:
                    router.replace("/admin");
                    return;
                case ROLES.STAFF:
                    router.replace("/staff");
                    return;
                default:
                    router.replace("/");
                    return;
            }
        } catch {
            // token không hợp lệ thì bỏ qua, để người dùng đăng nhập lại
        }
    }, [router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result: LoginResult = await login(username, password);

            if (result.success && result.token) {
                try {
                    const decoded = jwtDecode<TokenPayload>(result.token);
                    switch (decoded.scope) {
                        case ROLES.ADMIN:
                            router.push("/admin");
                            return;
                        case ROLES.STAFF:
                            router.push("/staff");
                            return;
                        default:
                            router.push("/");
                            return;
                    }
                } catch (err) {
                    console.error("Decode error:", err);
                    setError("Token không hợp lệ từ máy chủ");
                }
            } else {
                setError(result.message || "Đăng nhập thất bại");
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
        } finally {
            // Nếu chưa chuyển trang thì bỏ trạng thái loading
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                            <BookOpen className="h-8 w-8 text-primary-foreground"/>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Hệ thống quản lý thư viện
                    </CardTitle>
                    <CardDescription>Đăng nhập để tiếp tục</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4"/>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">Về trang chủ</Link>
                        </Button>

                        <p className="text-sm text-muted-foreground text-center">
                            Chưa có tài khoản?{" "}
                            <Link href="/register" className="text-primary hover:underline">
                                Đăng ký
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
