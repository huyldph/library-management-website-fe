"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listLoans } from "@/lib/api/loans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, DollarSign, Calendar, BookOpen, Clock } from "lucide-react";
import type { Loan } from "@/lib/api/loans";

export default function MemberFinesPage() {
    const params = useParams();
    const memberId = params.id as string;
    
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const loansData = await listLoans({ memberId });
                setLoans(loansData);
            } catch (error) {
                console.error("Error fetching loans:", error);
                setError("Không thể tải thông tin phiếu phạt");
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchLoans();
        }
    }, [memberId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Đang tải thông tin phiếu phạt...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Lỗi tải dữ liệu</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                </div>
            </div>
        );
    }

    // Calculate fines
    const overdueLoans = loans.filter(loan => loan.status === "overdue");
    const totalFines = overdueLoans.reduce((sum, loan) => sum + (loan.fineAmount || 0), 0);
    const paidFines = loans.filter(loan => loan.status === "returned" && loan.fineAmount && loan.fineAmount > 0);
    const totalPaidFines = paidFines.reduce((sum, loan) => sum + (loan.fineAmount || 0), 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getFineStatus = (loan: Loan) => {
        if (loan.status === "returned" && loan.fineAmount && loan.fineAmount > 0) {
            return "paid";
        }
        if (loan.status === "overdue" && loan.fineAmount && loan.fineAmount > 0) {
            return "unpaid";
        }
        return "none";
    };

    const getFineStatusLabel = (status: string) => {
        switch (status) {
            case "paid": return "Đã thanh toán";
            case "unpaid": return "Chưa thanh toán";
            default: return "Không có phạt";
        }
    };

    const getFineStatusVariant = (status: string) => {
        switch (status) {
            case "paid": return "default";
            case "unpaid": return "destructive";
            default: return "secondary";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý phiếu phạt</h1>
                <p className="text-muted-foreground">Theo dõi và quản lý các khoản phạt do trả sách muộn</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng phạt chưa thanh toán</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {formatCurrency(totalFines)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {overdueLoans.length} sách quá hạn
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalPaidFines)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {paidFines.length} phiếu phạt
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sách quá hạn</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overdueLoans.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Cần trả sớm
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng phiếu phạt</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loans.filter(loan => loan.fineAmount && loan.fineAmount > 0).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tất cả phiếu phạt
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Unpaid Fines */}
            {overdueLoans.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Phiếu phạt chưa thanh toán
                        </CardTitle>
                        <CardDescription>
                            Danh sách các khoản phạt cần thanh toán do trả sách muộn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {overdueLoans.map((loan) => (
                                <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                                    <div className="flex items-center space-x-4">
                                        <BookOpen className="h-8 w-8 text-red-500" />
                                        <div>
                                            <p className="font-medium">Sách ID: {loan.bookId}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Hạn trả: {new Date(loan.dueDate).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Ngày mượn: {new Date(loan.borrowDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-red-600">
                                            {formatCurrency(loan.fineAmount || 0)}
                                        </div>
                                        <Badge variant="destructive">
                                            Chưa thanh toán
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-4 bg-red-100 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Tổng cần thanh toán:</span>
                                <span className="text-xl font-bold text-red-600">
                                    {formatCurrency(totalFines)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Paid Fines History */}
            {paidFines.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Lịch sử thanh toán phạt
                        </CardTitle>
                        <CardDescription>
                            Danh sách các phiếu phạt đã được thanh toán
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paidFines.map((loan) => (
                                <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                    <div className="flex items-center space-x-4">
                                        <BookOpen className="h-8 w-8 text-green-500" />
                                        <div>
                                            <p className="font-medium">Sách ID: {loan.bookId}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Hạn trả: {new Date(loan.dueDate).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Ngày trả: {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                            {formatCurrency(loan.fineAmount || 0)}
                                        </div>
                                        <Badge variant="default">
                                            Đã thanh toán
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Fines */}
            {loans.filter(loan => loan.fineAmount && loan.fineAmount > 0).length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Không có phiếu phạt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <DollarSign className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Tuyệt vời!</h3>
                            <p className="text-muted-foreground">
                                Bạn không có phiếu phạt nào. Hãy tiếp tục trả sách đúng hạn để duy trì tình trạng tốt.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Instructions */}
            {totalFines > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hướng dẫn thanh toán</CardTitle>
                        <CardDescription>
                            Thông tin về cách thanh toán các khoản phạt
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium mb-2">Cách thanh toán:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Đến quầy thủ thư tại thư viện</li>
                                    <li>• Mang theo thẻ thành viên và sách cần trả</li>
                                    <li>• Thanh toán bằng tiền mặt hoặc chuyển khoản</li>
                                    <li>• Nhận biên lai thanh toán</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <h4 className="font-medium mb-2">Lưu ý quan trọng:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Phí phạt được tính theo ngày trễ</li>
                                    <li>• Cần thanh toán phạt trước khi mượn sách mới</li>
                                    <li>• Liên hệ thủ thư nếu có thắc mắc về phí phạt</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
