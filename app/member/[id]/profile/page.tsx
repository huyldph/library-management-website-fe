"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { findMemberByCode } from "@/lib/api/members";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, CreditCard, AlertCircle } from "lucide-react";
import type { AdminMember } from "@/lib/api/members";

export default function MemberProfilePage() {
    const params = useParams();
    const memberId = params.id as string;
    
    const [profile, setProfile] = useState<AdminMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const member = await findMemberByCode(memberId);
                if (member) {
                    setProfile(member);
                } else {
                    setError("Không tìm thấy thông tin thành viên");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Không thể tải thông tin cá nhân");
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchProfile();
        }
    }, [memberId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center py-12">
                <div className="text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Không tìm thấy thông tin</h2>
                    <p className="text-muted-foreground mb-4">
                        {error || "Mã thành viên không tồn tại"}
                    </p>
                </div>
            </div>
        );
    }

    const getMembershipTypeLabel = (type: string) => {
        switch (type) {
            case "student": return "Sinh viên";
            case "teacher": return "Giảng viên";
            case "public": return "Công chúng";
            default: return type;
        }
    };

    const getMembershipStatusLabel = (status: string) => {
        switch (status) {
            case "active": return "Hoạt động";
            case "suspended": return "Tạm khóa";
            case "expired": return "Hết hạn";
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
                <p className="text-muted-foreground">Quản lý thông tin cá nhân và tài khoản thành viên</p>
            </div>

            {/* Profile Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mã thành viên</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{profile.memberCode}</div>
                        <p className="text-xs text-muted-foreground">
                            Sử dụng để mượn sách
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trạng thái thẻ</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Badge 
                                variant={profile.membershipStatus === "active" ? "default" : "destructive"}
                            >
                                {getMembershipStatusLabel(profile.membershipStatus)}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Loại: {getMembershipTypeLabel(profile.membershipType)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sách đang mượn</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile.currentBorrowCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Tối đa {profile.maxBorrowLimit || 0} cuốn
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ngày đăng ký</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {profile.registrationDate 
                                ? new Date(profile.registrationDate).toLocaleDateString('vi-VN')
                                : "Chưa xác định"
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Thành viên từ
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Personal Information */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                        <CardDescription>
                            Thông tin cá nhân của thành viên
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Họ và tên</p>
                                <p className="text-lg font-semibold">{profile.fullName}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-lg">{profile.email}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                                <p className="text-lg">{profile.phoneNumber}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin thành viên</CardTitle>
                        <CardDescription>
                            Chi tiết về tài khoản thành viên
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Loại thành viên</p>
                            <p className="text-lg font-semibold">{getMembershipTypeLabel(profile.membershipType)}</p>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Trạng thái tài khoản</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                    variant={profile.membershipStatus === "active" ? "default" : "destructive"}
                                >
                                    {getMembershipStatusLabel(profile.membershipStatus)}
                                </Badge>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Giới hạn mượn sách</p>
                            <p className="text-lg font-semibold">
                                {profile.currentBorrowCount || 0} / {profile.maxBorrowLimit || 0} cuốn
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Ngày đăng ký</p>
                            <p className="text-lg">
                                {profile.registrationDate 
                                    ? new Date(profile.registrationDate).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : "Chưa xác định"
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Hành động</CardTitle>
                    <CardDescription>
                        Các thao tác có thể thực hiện với tài khoản
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" disabled>
                            Chỉnh sửa thông tin
                        </Button>
                        <Button variant="outline" disabled>
                            Đổi mật khẩu
                        </Button>
                        <Button variant="outline" disabled>
                            Tải thẻ thành viên
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        * Các tính năng chỉnh sửa thông tin sẽ được cập nhật trong phiên bản tiếp theo
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
