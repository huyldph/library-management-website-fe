"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminMember } from "@/lib/api/members"
import { listLoans, type Loan } from "@/lib/api/loans"
import { fetchPublicBook, fetchBookCopiesByBookId, type PublicBookCopy } from "@/lib/api/books"
import { User, Mail, Phone, MapPin, Calendar, CreditCard } from "lucide-react"

type MemberView = AdminMember & {
  address?: string
  dateOfBirth?: string | Date
  expiryDate?: string | Date
  totalFines?: number
  currentBorrowCount?: number
  maxBorrowLimit?: number
  registrationDate?: string | Date
}

interface MemberDetailsDialogProps {
  member: MemberView
  open: boolean
  onClose: () => void
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  suspended: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  expired: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  active: "Hoạt động",
  suspended: "Tạm ngưng",
  expired: "Hết hạn",
}

const loanStatusColors: Record<string, string> = {
  active: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
  returned: "bg-green-500/10 text-green-700 dark:text-green-400",
}

const loanStatusLabels: Record<string, string> = {
  active: "Đang mượn",
  overdue: "Quá hạn",
  returned: "Đã trả",
}

type LoanHistory = Loan & {
  memberName: string
  bookTitle: string
  bookBarcode: string
}

export function MemberDetailsDialog({ member, open, onClose }: MemberDetailsDialogProps) {
  const [loanHistory, setLoanHistory] = useState<LoanHistory[]>([])

  useEffect(() => {
    if (open) {
      loadLoanHistory()
    }
  }, [open, member.id])

  const loadLoanHistory = async () => {
    try {
      const loans: Loan[] = await listLoans({ memberId: member.id })
      const history: LoanHistory[] = await Promise.all(
        loans.map(async (loan: Loan) => {
          const [book, copies] = await Promise.all([
            fetchPublicBook(loan.bookId),
            fetchBookCopiesByBookId(loan.bookId),
          ])
          const bookCopy: PublicBookCopy | undefined = copies.find(
            (copy: PublicBookCopy) => copy.id === loan.bookCopyId,
          )

          return {
            ...loan,
            memberName: member.fullName,
            bookTitle: book?.title || "Unknown",
            bookBarcode: bookCopy?.barcode || "Unknown",
          }
        }),
      )
      setLoanHistory(history)
    } catch (e) {
      setLoanHistory([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết độc giả</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Họ và tên</p>
                  <p className="font-medium">{member.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mã độc giả</p>
                  <p className="font-mono font-medium">{member.memberCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày sinh</p>
                  <p className="font-medium">{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString("vi-VN") : "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="font-medium">{member.address || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin thẻ</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <Badge variant="secondary" className={`mt-1 ${statusColors[member.membershipStatus]}`}>
                  {statusLabels[member.membershipStatus]}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Ngày đăng ký</p>
                <p className="font-medium mt-1">{member.registrationDate ? new Date(member.registrationDate).toLocaleDateString("vi-VN") : "-"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Ngày hết hạn</p>
                <p className="font-medium mt-1">{member.expiryDate ? new Date(member.expiryDate).toLocaleDateString("vi-VN") : "-"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Giới hạn mượn</p>
                <p className="font-medium mt-1">
                  {member.currentBorrowCount}/{member.maxBorrowLimit} cuốn
                </p>
              </div>

              {typeof member.totalFines === "number" && member.totalFines > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Phí phạt</p>
                  <p className="font-medium text-destructive mt-1">{member.totalFines.toLocaleString("vi-VN")} ₫</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loan History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lịch sử mượn sách</CardTitle>
            </CardHeader>
            <CardContent>
              {loanHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Chưa có lịch sử mượn sách</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sách</TableHead>
                        <TableHead>Mã vạch</TableHead>
                        <TableHead>Ngày mượn</TableHead>
                        <TableHead>Hạn trả</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanHistory.map((loan: LoanHistory) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.bookTitle}</TableCell>
                          <TableCell className="font-mono text-sm">{loan.bookBarcode}</TableCell>
                          <TableCell>{new Date(loan.borrowDate).toLocaleDateString("vi-VN")}</TableCell>
                          <TableCell>{new Date(loan.dueDate).toLocaleDateString("vi-VN")}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={loanStatusColors[loan.status]}>
                              {loanStatusLabels[loan.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
