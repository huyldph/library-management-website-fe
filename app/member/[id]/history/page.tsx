"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { findMemberByCode } from "@/lib/api/members";
import { listLoans } from "@/lib/api/loans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    BookOpen, 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    Calendar,
    RefreshCw,
    Filter,
    User
} from "lucide-react";
import Link from "next/link";
import type { AdminMember } from "@/lib/api/members";
import type { Loan } from "@/lib/api/loans";

export default function MemberHistoryPage() {
    const params = useParams();
    const memberId = params.id as string;
    
    const [profile, setProfile] = useState<AdminMember | null>(null);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, loansData] = await Promise.all([
                    findMemberByCode(memberId),
                    listLoans({ memberId })
                ]);
                
                if (profileData) {
                    setProfile(profileData);
                    setLoans(loansData);
                } else {
                    setError("Không tìm thấy thông tin thành viên");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchData();
        }
    }, [memberId]);

    const handleRefresh = async () => {
        setLoading(true);
        setError("");
        try {
            const [profileData, loansData] = await Promise.all([
                findMemberByCode(memberId),
                listLoans({ memberId })
            ]);
            
            if (profileData) {
                setProfile(profileData);
                setLoans(loansData);
            } else {
                setError("Không tìm thấy thông tin thành viên");
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
            setError("Không thể tải lại dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="default">Đang mượn</Badge>;
            case "overdue":
                return <Badge variant="destructive">Quá hạn</Badge>;
            case "returned":
                return <Badge variant="secondary">Đã trả</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Clock className="h-4 w-4 text-blue-500" />;
            case "overdue":
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case "returned":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            default:
                return <BookOpen className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = (dueDate: string | Date) => {
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    const filteredLoans = loans.filter(loan => {
        switch (activeTab) {
            case "active":
                return loan.status === "active";
            case "overdue":
                return loan.status === "overdue" || (loan.status === "active" && isOverdue(loan.dueDate));
            case "returned":
                return loan.status === "returned";
            default:
                return true;
        }
    });

    const stats = {
        total: loans.length,
        active: loans.filter(l => l.status === "active").length,
        overdue: loans.filter(l => l.status === "overdue" || (l.status === "active" && isOverdue(l.dueDate))).length,
        returned: loans.filter(l => l.status === "returned").length,
    };

    if (loading && loans.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Đang tải lịch sử mượn sách...</p>
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lịch sử mượn sách</h1>
                    <p className="text-muted-foreground">Theo dõi lịch sử mượn và trả sách của bạn</p>
                </div>
                <Button onClick={handleRefresh} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số lần mượn</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang mượn</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã trả</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.returned}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
                    <TabsTrigger value="active">Đang mượn ({stats.active})</TabsTrigger>
                    <TabsTrigger value="overdue">Quá hạn ({stats.overdue})</TabsTrigger>
                    <TabsTrigger value="returned">Đã trả ({stats.returned})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {filteredLoans.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Không có dữ liệu</h3>
                                <p className="text-muted-foreground">
                                    {activeTab === "all" 
                                        ? "Thành viên chưa có lịch sử mượn sách nào"
                                        : `Không có sách ${activeTab === "active" ? "đang mượn" : activeTab === "overdue" ? "quá hạn" : "đã trả"}`
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Filter className="h-5 w-5" />
                                    <span>
                                        {activeTab === "all" 
                                            ? "Tất cả lịch sử mượn sách"
                                            : activeTab === "active" 
                                                ? "Sách đang mượn"
                                                : activeTab === "overdue"
                                                    ? "Sách quá hạn"
                                                    : "Sách đã trả"
                                        }
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    {filteredLoans.length} kết quả
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Sách</TableHead>
                                                <TableHead>Ngày mượn</TableHead>
                                                <TableHead>Hạn trả</TableHead>
                                                <TableHead>Ngày trả</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Gia hạn</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLoans.map((loan) => (
                                                <TableRow key={loan.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">Sách ID: {loan.bookId}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Bản sao: {loan.bookCopyId}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatDate(loan.borrowDate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className={isOverdue(loan.dueDate) ? "text-red-600 font-medium" : ""}>
                                                                {formatDate(loan.dueDate)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {loan.returnDate ? (
                                                            <div className="flex items-center space-x-2">
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                <span>{formatDate(loan.returnDate)}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">Chưa trả</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(loan.status)}
                                                            {getStatusBadge(loan.status)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <span>{loan.renewalCount || 0}</span>
                                                            <span className="text-muted-foreground">
                                                                /{loan.maxRenewals || 0}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
