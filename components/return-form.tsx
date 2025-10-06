"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AdminMember } from "@/lib/api/members"
import type { PublicBook, PublicBookCopy } from "@/lib/api/books"
import { returnBook, findActiveLoanByBarcode, type Loan } from "@/lib/api/loans"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, BookOpen } from "lucide-react"

interface ReturnFormProps {
  onSuccess: () => void
}

export function ReturnForm({ onSuccess }: ReturnFormProps) {
  const [barcode, setBarcode] = useState("")
  const [loan, setLoan] = useState<Loan | null>(null)
  const [member, setMember] = useState<AdminMember | null>(null)
  const [book, setBook] = useState<PublicBook | null>(null)
  const [bookCopy, setBookCopy] = useState<PublicBookCopy | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (barcode) {
      findActiveLoan(barcode)
    } else {
      resetState()
    }
  }, [barcode])

  const resetState = () => {
    setLoan(null)
    setMember(null)
    setBook(null)
    setBookCopy(null)
  }

  const findActiveLoan = async (code: string) => {
    const info = await findActiveLoanByBarcode(code)
    if (!info) {
      resetState()
      return
    }
    setLoan(info.loan as Loan)
    setMember(info.member as any)
    setBook(info.book as any)
    setBookCopy(info.copy as any)
  }

  const calculateFine = (dueDate: Date | string): number => {
    const now = new Date()
    const due = new Date(dueDate as any)

    if (now <= due) return 0

    const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    return daysOverdue * 5000 // 5,000 VND per day
  }

  const handleReturn = async () => {
    setError("")
    setLoading(true)

    if (!loan || !member || !bookCopy) {
      setError("Không tìm thấy thông tin mượn sách")
      setLoading(false)
      return
    }

    const res = await returnBook({ barcode })
    if (!(res?.code === 1000)) {
      setLoading(false)
      setError(res?.message || "Không thể trả sách")
      return
    }

    toast({
      title: "Trả sách thành công",
      description: fine > 0 ? `Phí phạt: ${fine.toLocaleString("vi-VN")} ₫` : "Trả đúng hạn",
    })

    // Reset form
    setBarcode("")
    resetState()
    setLoading(false)
    onSuccess()
  }

  const isOverdue = loan ? new Date() > new Date(loan.dueDate) : false
  const fine = loan ? calculateFine(loan.dueDate) : 0

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="returnBarcode">Mã vạch sách</Label>
          <Input
            id="returnBarcode"
            placeholder="Nhập hoặc quét mã vạch"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>

        {loan && member && book && bookCopy && (
          <Card className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                <p className="text-sm text-muted-foreground">Mã vạch: {bookCopy.barcode}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Độc giả:</span>
                <span className="font-medium">{member.fullName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ngày mượn:</span>
                <span>{new Date(loan.borrowDate).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hạn trả:</span>
                <div className="flex items-center gap-2">
                  <span>{new Date(loan.dueDate).toLocaleDateString("vi-VN")}</span>
                  {isOverdue && <Badge variant="destructive">Quá hạn</Badge>}
                </div>
              </div>
              {fine > 0 && (
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-destructive font-medium">Phí phạt:</span>
                  <span className="text-destructive font-bold">{fine.toLocaleString("vi-VN")} ₫</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <Button onClick={handleReturn} disabled={!loan || loading} className="w-full" size="lg">
        {loading ? "Đang xử lý..." : "Xác nhận trả sách"}
      </Button>
    </div>
  )
}
