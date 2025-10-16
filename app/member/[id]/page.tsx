"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { findMemberByCode } from "@/lib/api/members";
import { listLoans } from "@/lib/api/loans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";
import Link from "next/link";
import type { AdminMember } from "@/lib/api/members";
import { MemberStatus } from "@/lib/api/members"; // MemberStatus enum
import type { Loan } from "@/lib/api/loans";
import { LoanStatus } from "@/lib/api/loans";

// Helper function to handle API errors
const handleApiError = (error: any, defaultMessage: string) => {
    console.error("API Error:", error);
    if (error?.message) {
        return error.message;
    }
    return defaultMessage;
};

// Helper function to get member status display info
const getMemberStatusInfo = (status: string) => {
    switch (status) {
        case MemberStatus.Active:
            return {
                text: "Hoạt động",
                variant: "default" as const,
                color: "text-green-600"
            };
        case MemberStatus.Inactive:
            return {
                text: "Không hoạt động", 
                variant: "secondary" as const,
                color: "text-gray-600"
            };
        case MemberStatus.Suspended:
            return {
                text: "Tạm khóa",
                variant: "destructive" as const,
                color: "text-red-600"
            };
        default:
            return {
                text: "Chưa xác định",
                variant: "outline" as const,
                color: "text-muted-foreground"
            };
    }
};

// Helper function to get loan status display info
const getLoanStatusInfo = (status: string) => {
    switch (status) {
        case LoanStatus.Active:
            return {
                text: "Đang mượn",
                variant: "default" as const,
                color: "text-blue-600"
            };
        case LoanStatus.Overdue:
            return {
                text: "Quá hạn",
                variant: "destructive" as const,
                color: "text-red-600"
            };
        case LoanStatus.Returned:
            return {
                text: "Đã trả",
                variant: "secondary" as const,
                color: "text-gray-600"
            };
        default:
            return {
                text: "Chưa xác định",
                variant: "outline" as const,
                color: "text-muted-foreground"
            };
    }
};

export default function MemberPage() {
    const params = useParams();
    const memberId = params.id as string;
    
    const [profile, setProfile] = useState<AdminMember | null>(null);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                
                // Fetch member profile by member code
                const profileData = await findMemberByCode(memberId);
                
                if (profileData) {
                    setProfile(profileData);
                    
                    // Fetch loans data using the specified API: GET /api/v1/loans/public/{memberId}
                    console.log("🔍 Debug - Using memberId for loans API:", profileData.id);
                    
                    const loansData = await listLoans({ memberId: profileData.id });
                    console.log("🔍 Debug - Profile Data:", profileData);
                    console.log("🔍 Debug - Loans Data:", loansData);
                    console.log("🔍 Debug - Loans Count:", loansData.length);
                    setLoans(loansData);
                } else {
                    setError("Không tìm thấy thông tin thành viên");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(handleApiError(error, "Không thể tải dữ liệu"));
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchData();
        }
    }, [memberId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center py-12">
                <div className="text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Không tìm thấy thành viên</h2>
                    <p className="text-muted-foreground mb-4">
                        {error || "Mã thành viên không tồn tại"}
                    </p>
                    <Button asChild>
                        <Link href="/">Về trang chủ</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Debug all loan statuses
    const allStatuses = loans.map(loan => loan.status);
    console.log("🔍 Debug - All Loan Statuses:", [...new Set(allStatuses)]);
    
    const activeLoans = loans.filter(loan => loan.status === LoanStatus.Active);
    const overdueLoans = loans.filter(loan => loan.status === LoanStatus.Overdue);
    
    // Debug logging for loan filtering
    console.log("🔍 Debug - All Loans:", loans);
    console.log("🔍 Debug - Active Loans:", activeLoans);
    console.log("🔍 Debug - Overdue Loans:", overdueLoans);
    console.log("🔍 Debug - Active Count:", activeLoans.length);
    console.log("🔍 Debug - Overdue Count:", overdueLoans.length);
    console.log("🔍 Debug - Total Count:", loans.length);
    
    // Also check if we should use profile.currentBorrowCount
    console.log("🔍 Debug - Profile currentBorrowCount:", profile.currentBorrowCount);

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center py-6">
                <h1 className="text-3xl font-bold">Thông tin thành viên</h1>
                <p className="text-muted-foreground mt-2">
                    Xin chào {profile.fullName}, đây là trang quản lý của bạn
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sách đang mượn</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activeLoans.length > 0 ? activeLoans.length : (profile.currentBorrowCount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tối đa {profile.maxBorrowLimit || 0} cuốn
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sách quá hạn</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overdueLoans.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Cần trả sớm
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trạng thái thẻ</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {(() => {
                                const statusInfo = getMemberStatusInfo(profile.membershipStatus);
                                return (
                                    <Badge variant={statusInfo.variant}>
                                        {statusInfo.text}
                                    </Badge>
                                );
                            })()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Loại: {profile.membershipType || "Chưa xác định"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mã thành viên</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-mono font-bold">{profile.memberCode}</div>
                        <p className="text-xs text-muted-foreground">
                            Sử dụng để mượn sách
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Member Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>
                            Thông tin cơ bản của thành viên
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Họ và tên</p>
                                <p className="text-lg">{profile.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-lg">{profile.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                                <p className="text-lg">{profile.phoneNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ngày đăng ký</p>
                                <p className="text-lg">
                                    {profile.registrationDate 
                                        ? new Date(profile.registrationDate).toLocaleDateString('vi-VN')
                                        : "Chưa xác định"
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê mượn sách</CardTitle>
                        <CardDescription>
                            Tổng quan về hoạt động mượn sách
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Sách đang mượn</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {activeLoans.length > 0 ? activeLoans.length : (profile.currentBorrowCount || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Sách quá hạn</p>
                                <p className="text-2xl font-bold text-red-600">{overdueLoans.length}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tổng đã mượn</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loans.length > 0 ? loans.length : (profile.currentBorrowCount || 0)}
                                </p>
                            </div>
                        </div>
                        <Button asChild className="mt-4">
                            <Link href={`/member/${memberId}/history`}>Xem lịch sử chi tiết</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Loans */}
            <Card>
                <CardHeader>
                    <CardTitle>Sách đang mượn</CardTitle>
                    <CardDescription>
                        Danh sách sách bạn đang mượn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeLoans.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {activeLoans.slice(0, 3).map((loan) => (
                                    <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">
                                                {loan.bookTitle || `Mã sách: ${loan.bookId}`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Mã bản sao: {loan.bookCopyId}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Hạn trả: {new Date(loan.dueDate).toLocaleDateString('vi-VN')}
                                            </p>
                                            {loan.fineAmount && loan.fineAmount > 0 && (
                                                <p className="text-sm text-red-600 font-medium">
                                                    Phí phạt: {loan.fineAmount.toLocaleString('vi-VN')} VNĐ
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {(() => {
                                                const statusInfo = getLoanStatusInfo(loan.status);
                                                return (
                                                    <Badge variant={statusInfo.variant}>
                                                        {statusInfo.text}
                                                    </Badge>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button asChild className="mt-4">
                                <Link href={`/member/${memberId}/history`}>Xem tất cả</Link>
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {loans.length === 0 && profile.currentBorrowCount && profile.currentBorrowCount > 0
                                    ? "Không thể tải dữ liệu mượn sách từ API"
                                    : "Bạn chưa mượn cuốn sách nào"
                                }
                            </p>
                            {loans.length === 0 && profile.currentBorrowCount && profile.currentBorrowCount > 0 && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Số sách đang mượn: {profile.currentBorrowCount} (từ thông tin thành viên)
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
