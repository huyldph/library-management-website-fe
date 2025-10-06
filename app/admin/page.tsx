"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {BookOpen, Users, ArrowLeftRight, AlertCircle} from "lucide-react"
import {getAdminOverview, type BorrowingStats} from "@/lib/api/admin"

export default function AdminDashboard() {
    const [stats, setStats] = useState<BorrowingStats>({
        totalLoans: 0,
        activeLoans: 0,
        overdueLoans: 0,
        returnedLoans: 0,
        totalFines: 0,
    })
    const [totalBooks, setTotalBooks] = useState(0)
    const [totalMembers, setTotalMembers] = useState(0)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            const data = await getAdminOverview()
            if (!mounted) return
            setTotalBooks(data.totalBooks)
            setTotalMembers(data.totalMembers)
            setStats(data.stats)
        })()
        return () => {
            mounted = false
        }
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
                <p className="text-muted-foreground">Thống kê tổng quan hệ thống thư viện</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số sách</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBooks}</div>
                        <p className="text-xs text-muted-foreground">Đầu sách trong thư viện</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng độc giả</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMembers}</div>
                        <p className="text-xs text-muted-foreground">Độc giả đã đăng ký</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đang mượn</CardTitle>
                        <ArrowLeftRight className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeLoans}</div>
                        <p className="text-xs text-muted-foreground">Sách đang được mượn</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats.overdueLoans}</div>
                        <p className="text-xs text-muted-foreground">Sách chưa trả đúng hạn</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê mượn/trả</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tổng lượt mượn</span>
                            <span className="text-sm font-medium">{stats.totalLoans}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Đang mượn</span>
                            <span className="text-sm font-medium">{stats.activeLoans}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Đã trả</span>
                            <span className="text-sm font-medium">{stats.returnedLoans}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-destructive">Quá hạn</span>
                            <span className="text-sm font-medium text-destructive">{stats.overdueLoans}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Phí phạt</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalFines.toLocaleString("vi-VN")} ₫</div>
                        <p className="text-sm text-muted-foreground mt-2">Tổng phí phạt chưa thanh toán</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
