"use client";

import {useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {publicRegisterMember} from "@/lib/api/members";
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
import {BookOpen, AlertCircle, CheckCircle} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Validation function based on backend DTO
    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        // Full name validation
        if (!fullName.trim()) {
            errors.fullName = "Họ và tên không được để trống";
        } else if (fullName.trim().length > 100) {
            errors.fullName = "Họ và tên không được vượt quá 100 ký tự";
        }
        
        // Email validation
        if (!email.trim()) {
            errors.email = "Email không được để trống";
        } else if (email.trim().length > 100) {
            errors.email = "Email không được vượt quá 100 ký tự";
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            errors.email = "Email không hợp lệ";
        }
        
        // Phone number validation (Vietnamese format)
        if (!phoneNumber.trim()) {
            errors.phoneNumber = "Số điện thoại không được để trống";
        } else if (!/^(\+84|0)\d{9,10}$/.test(phoneNumber.trim())) {
            errors.phoneNumber = "Số điện thoại không hợp lệ (định dạng: +84xxxxxxxxx hoặc 0xxxxxxxxx)";
        }
        
        // Address validation
        if (!address.trim()) {
            errors.address = "Địa chỉ không được để trống";
        } else if (address.trim().length > 255) {
            errors.address = "Địa chỉ không được vượt quá 255 ký tự";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setValidationErrors({});
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);

        try {
            const response = await publicRegisterMember({
                fullName: fullName.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
                address: address.trim()
            });

            if (response.code === 1000) {
                setSuccess("Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang quản lý.");
                // Extract member code from response if available
                const memberCode = response.result?.memberCode || response.result?.id;
                setTimeout(() => {
                    if (memberCode) {
                        router.push(`/member/${memberCode}`);
                    } else {
                        router.push("/opac");
                    }
                }, 2000);
            } else {
                setError(response.message || "Đăng ký thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.");
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
                        Đăng ký thẻ thành viên
                    </CardTitle>
                    <CardDescription>
                        Đăng ký để trở thành bạn đọc của thư viện
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
                        
                        {success && (
                            <Alert className="border-green-200 bg-green-50 text-green-800">
                                <CheckCircle className="h-4 w-4"/>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ và tên</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Nhập họ và tên (tối đa 100 ký tự)"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                disabled={loading}
                                maxLength={100}
                                className={validationErrors.fullName ? "border-red-500" : ""}
                            />
                            {validationErrors.fullName && (
                                <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Nhập email (tối đa 100 ký tự)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                maxLength={100}
                                className={validationErrors.email ? "border-red-500" : ""}
                            />
                            {validationErrors.email && (
                                <p className="text-sm text-red-500">{validationErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Số điện thoại</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="Nhập số điện thoại (+84xxxxxxxxx hoặc 0xxxxxxxxx)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                disabled={loading}
                                maxLength={12}
                                className={validationErrors.phoneNumber ? "border-red-500" : ""}
                            />
                            <p className="text-xs text-muted-foreground">
                                Ví dụ: +84987654321 hoặc 0987654321
                            </p>
                            {validationErrors.phoneNumber && (
                                <p className="text-sm text-red-500">{validationErrors.phoneNumber}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Địa chỉ</Label>
                            <Input
                                id="address"
                                type="text"
                                placeholder="Nhập địa chỉ (tối đa 255 ký tự)"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                disabled={loading}
                                maxLength={255}
                                className={validationErrors.address ? "border-red-500" : ""}
                            />
                            {validationErrors.address && (
                                <p className="text-sm text-red-500">{validationErrors.address}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">Về trang chủ</Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}