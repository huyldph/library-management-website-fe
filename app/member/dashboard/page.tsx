"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Calendar, AlertCircle, CreditCard, Clock, CheckCircle } from "lucide-react"
import { getMembers, getLoans, getBooks, getBookCopies, renewLoan } from "@/lib/storage"
import type { Member, Loan, Book, BookCopy } from "@/lib/types"
import { format, differenceInDays } from "date-fns"
import { vi } from "date-fns/locale"

export default function MemberDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [activeLoans, setActiveLoans] = useState<(Loan & { book: Book; copy: BookCopy })[]>([])
  const [loanHistory, setLoanHistory] = useState<(Loan & { book: Book; copy: BookCopy })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "member") {
      router.push("/member/login")
      return
    }

    loadMemberData()
  }, [user, router])

  const loadMemberData = () => {
    if (!user) return

    const members = getMembers()
    const foundMember = members.find((m) => m.cardNumber === user.username)

    if (foundMember) {
      setMember(foundMember)

      const loans = getLoans()
      const books = getBooks()
      const copies = getBookCopies()

      const memberLoans = loans
        .filter((loan) => loan.memberId === foundMember.id)
        .map((loan) => {
          const copy = copies.find((c) => c.id === loan.bookCopyId)!
          const book = books.find((b) => b.id === copy.bookId)!
          return { ...loan, book, copy }
        })

      setActiveLoans(memberLoans.filter((loan) => loan.status === "borrowed"))
      setLoanHistory(memberLoans.filter((loan) => loan.status === "returned"))
    }

    setIsLoading(false)
  }

  const handleRenew = (loanId: string) => {
    const success = renewLoan(loanId)
    if (success) {
      loadMemberData()
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/member/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Không tìm thấy thông tin thành viên</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isExpired = new Date(member.expiryDate) < new Date()
  const overdueLoans = activeLoans.filter((loan) => new Date(loan.dueDate) < new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Tài khoản thành viên</h1>
              <p className="text-sm text-muted-foreground">{member.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/opac")}>
              Tìm kiếm sách
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alerts */}
        {isExpired && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Thẻ thành viên của bạn đã hết hạn. Vui lòng liên hệ thư viện để gia hạn.
            </AlertDescription>
          </Alert>
        )}

        {overdueLoans.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bạn có {overdueLoans.length} sách quá hạn. Vui lòng trả sách sớm để tránh phí phạt.
            </AlertDescription>
          </Alert>
        )}

        {/* Member Info Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số thẻ</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{member.cardNumber}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Hạn: {format(new Date(member.expiryDate), "dd/MM/yyyy")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang mượn</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Tối đa: {member.borrowLimit} sách</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueLoans.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Cần trả ngay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phí phạt</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{member.fines.toLocaleString("vi-VN")} ₫</div>
              <p className="text-xs text-muted-foreground mt-1">Cần thanh toán</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Đang mượn ({activeLoans.length})</TabsTrigger>
            <TabsTrigger value="history">Lịch sử ({loanHistory.length})</TabsTrigger>
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          </TabsList>

          {/* Active Loans */}
          <TabsContent value="active" className="space-y-4">
            {activeLoans.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Bạn chưa mượn sách nào</p>
                  <Button className="mt-4" onClick={() => router.push("/opac")}>
                    Tìm kiếm sách
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeLoans.map((loan) => {
                const daysUntilDue = differenceInDays(new Date(loan.dueDate), new Date())
                const isOverdue = daysUntilDue < 0
                const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3

                return (
                  <Card key={loan.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{loan.book.title}</CardTitle>
                          <CardDescription>
                            {loan.book.author} • {loan.book.publisher}
                          </CardDescription>
                        </div>
                        {isOverdue ? (
                          <Badge variant="destructive">Quá hạn</Badge>
                        ) : isDueSoon ? (
                          <Badge variant="secondary">Sắp đến hạn</Badge>
                        ) : (
                          <Badge variant="outline">Đang mượn</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Ngày mượn:</span>
                            <span className="font-medium">
                              {format(new Date(loan.borrowDate), "dd/MM/yyyy", { locale: vi })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Hạn trả:</span>
                            <span className={`font-medium ${isOverdue ? "text-destructive" : ""}`}>
                              {format(new Date(loan.dueDate), "dd/MM/yyyy", { locale: vi })}
                            </span>
                          </div>
                          {isOverdue && (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="text-destructive font-medium">
                                Quá hạn {Math.abs(daysUntilDue)} ngày
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-end justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRenew(loan.id)}
                            disabled={loan.renewalCount >= 2 || isOverdue}
                          >
                            {loan.renewalCount >= 2 ? "Đã gia hạn tối đa" : "Gia hạn"}
                          </Button>
                        </div>
                      </div>
                      {loan.renewalCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">Đã gia hạn {loan.renewalCount} lần</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Loan History */}
          <TabsContent value="history" className="space-y-4">
            {loanHistory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chưa có lịch sử mượn sách</p>
                </CardContent>
              </Card>
            ) : (
              loanHistory.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{loan.book.title}</CardTitle>
                        <CardDescription>
                          {loan.book.author} • {loan.book.publisher}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Đã trả
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Mượn:</span>
                        <span>{format(new Date(loan.borrowDate), "dd/MM/yyyy", { locale: vi })}</span>
                      </div>
                      {loan.returnDate && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Trả:</span>
                          <span>{format(new Date(loan.returnDate), "dd/MM/yyyy", { locale: vi })}</span>
                        </div>
                      )}
                      {loan.fineAmount > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-muted-foreground">Phí phạt:</span>
                          <span className="text-destructive font-medium">
                            {loan.fineAmount.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Thông tin tài khoản thành viên của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Họ và tên</Label>
                    <p className="text-base">{member.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Số thẻ</Label>
                    <p className="text-base">{member.cardNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-base">{member.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Số điện thoại</Label>
                    <p className="text-base">{member.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Địa chỉ</Label>
                    <p className="text-base">{member.address}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Loại thành viên</Label>
                    <p className="text-base capitalize">{member.type}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Ngày đăng ký</Label>
                    <p className="text-base">{format(new Date(member.joinDate), "dd/MM/yyyy", { locale: vi })}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Ngày hết hạn</Label>
                    <p className={`text-base ${isExpired ? "text-destructive" : ""}`}>
                      {format(new Date(member.expiryDate), "dd/MM/yyyy", { locale: vi })}
                      {isExpired && " (Đã hết hạn)"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Giới hạn mượn</Label>
                    <p className="text-base">{member.borrowLimit} sách</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Trạng thái</Label>
                    <div>
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {member.status === "active" ? "Đang hoạt động" : "Tạm khóa"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
