"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { LoanHistory } from "@/lib/types"

interface LoanHistoryTableProps {
  loans: LoanHistory[]
}

const statusColors = {
  active: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
  returned: "bg-green-500/10 text-green-700 dark:text-green-400",
}

const statusLabels = {
  active: "Đang mượn",
  overdue: "Quá hạn",
  returned: "Đã trả",
}

export function LoanHistoryTable({ loans }: LoanHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLoans = loans.filter((loan) => {
    const query = searchQuery.toLowerCase()
    return (
      loan.memberName.toLowerCase().includes(query) ||
      loan.bookTitle.toLowerCase().includes(query) ||
      loan.bookBarcode.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên độc giả, tên sách, mã vạch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Độc giả</TableHead>
              <TableHead>Sách</TableHead>
              <TableHead>Mã vạch</TableHead>
              <TableHead>Ngày mượn</TableHead>
              <TableHead>Hạn trả</TableHead>
              <TableHead>Ngày trả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Phí phạt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLoans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchQuery ? "Không tìm thấy kết quả" : "Chưa có lịch sử mượn/trả"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.memberName}</TableCell>
                  <TableCell>{loan.bookTitle}</TableCell>
                  <TableCell className="font-mono text-sm">{loan.bookBarcode}</TableCell>
                  <TableCell>{new Date(loan.borrowDate).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>{new Date(loan.dueDate).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString("vi-VN") : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[loan.status]}>
                      {statusLabels[loan.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {loan.fineAmount > 0 ? (
                      <span className="text-destructive font-medium">{loan.fineAmount.toLocaleString("vi-VN")} ₫</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
