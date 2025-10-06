"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, TrendingUp, Clock, BarChart3 } from "lucide-react"
import { getReports, type DateRange as ApiDateRange } from "@/lib/api/reports"
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns"

type DateRange = ApiDateRange

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("this-month")
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    returnedLoans: 0,
    overdueLoans: 0,
    totalFines: 0,
    newMembers: 0,
    activeMembers: 0,
    popularBooks: [] as { title: string; author: string; count: number }[],
    categoryStats: [] as { category: string; count: number }[],
    memberActivity: [] as { name: string; cardNumber: string; loanCount: number }[],
  })

  useEffect(() => {
    calculateStats()
  }, [dateRange])

  const calculateStats = async () => {
    const api = await getReports(dateRange)
    setStats(api)
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "this-month":
        return "Tháng này"
      case "last-month":
        return "Tháng trước"
      case "this-year":
        return "Năm nay"
      case "all-time":
        return "Tất cả"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground mt-1">Xem thống kê và phân tích hoạt động thư viện</p>
        </div>
        <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">Tháng này</SelectItem>
            <SelectItem value="last-month">Tháng trước</SelectItem>
            <SelectItem value="this-year">Năm nay</SelectItem>
            <SelectItem value="all-time">Tất cả</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lượt mượn</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">{getDateRangeLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang mượn</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">Quá hạn: {stats.overdueLoans}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành viên mới</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">Đang hoạt động: {stats.activeMembers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phí phạt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFines.toLocaleString("vi-VN")} ₫</div>
            <p className="text-xs text-muted-foreground mt-1">{getDateRangeLabel()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="books" className="space-y-4">
        <TabsList>
          <TabsTrigger value="books">
            <BookOpen className="h-4 w-4 mr-2" />
            Sách phổ biến
          </TabsTrigger>
          <TabsTrigger value="categories">
            <BarChart3 className="h-4 w-4 mr-2" />
            Thể loại
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Thành viên
          </TabsTrigger>
        </TabsList>

        {/* Popular Books */}
        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 sách được mượn nhiều nhất</CardTitle>
              <CardDescription>
                Danh sách các đầu sách có lượt mượn cao nhất trong {getDateRangeLabel().toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.popularBooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
              ) : (
                <div className="space-y-4">
                  {stats.popularBooks.map((book, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{book.count} lượt mượn</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Statistics */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo thể loại</CardTitle>
              <CardDescription>
                Phân tích lượt mượn theo từng thể loại sách trong {getDateRangeLabel().toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.categoryStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
              ) : (
                <div className="space-y-4">
                  {stats.categoryStats.map((category, index) => {
                    const maxCount = stats.categoryStats[0]?.count || 1
                    const percentage = (category.count / maxCount) * 100

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">{category.count} lượt mượn</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Activity */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 thành viên tích cực</CardTitle>
              <CardDescription>
                Danh sách thành viên có số lượt mượn cao nhất trong {getDateRangeLabel().toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.memberActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
              ) : (
                <div className="space-y-4">
                  {stats.memberActivity.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.cardNumber}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{member.loanCount} lượt mượn</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
