"use client";

import {useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {register} from "@/lib/api/auth";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {BookOpen, AlertCircle, Home} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await register({username, password, fullName, email});

            // API backend theo kiểu ApiResponse<RegisterResponse>
            if (response.code === 1000) {
                router.push("/login");
            } else {
                setError(response.message || "Đăng ký thất bại");
            }
        } catch (err) {
            console.error(err);
            setError("Không thể kết nối đến máy chủ");
        } finally {
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
                        Đăng ký tài khoản
                    </CardTitle>
                    <CardDescription>
                        Tạo tài khoản mới để truy cập hệ thống
                    </CardDescription>
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
                            <Label htmlFor="fullName">Họ và tên</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Nhập họ và tên"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

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
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">Về trang chủ</Link>
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-2">
                            Đã có tài khoản?{" "}
                            <span
                                onClick={() => router.push("/login")}
                                className="text-primary hover:underline cursor-pointer"
                            >
                Đăng nhập ngay
              </span>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}