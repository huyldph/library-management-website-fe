"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { findMemberByCode, type AdminMember } from "@/lib/api/members"
import { fetchBookCopiesByBookId, fetchPublicBooks, type PublicBook, type PublicBookCopy } from "@/lib/api/books"
import { checkout } from "@/lib/api/loans"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, User, BookOpen } from "lucide-react"

interface CheckoutFormProps {
  onSuccess: () => void
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [memberCode, setMemberCode] = useState("")
  const [barcode, setBarcode] = useState("")
  const [member, setMember] = useState<AdminMember | null>(null)
  const [bookCopy, setBookCopy] = useState<PublicBookCopy | null>(null)
  const [book, setBook] = useState<PublicBook | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (memberCode) {
      findMember(memberCode)
    } else {
      setMember(null)
    }
  }, [memberCode])

  useEffect(() => {
    if (barcode) {
      findBookCopy(barcode)
    } else {
      setBookCopy(null)
      setBook(null)
    }
  }, [barcode])

  const findMember = async (code: string) => {
    const found = await findMemberByCode(code)
    setMember(found)
  }

  const findBookCopy = async (code: string) => {
    // Tối giản: tìm qua endpoint copies? Nếu không có, tạm nạp qua all books rồi match barcode bằng API khác.
    // Ở đây giả định backend cho phép tìm trực tiếp qua /book-copies?barcode=...
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/book-copies`)
      url.searchParams.set("barcode", code)
      const res = await fetch(url.toString())
      const data = await res.json()
      if (data?.code === 1000 && data?.result) {
        const items = Array.isArray(data.result.items) ? data.result.items : Array.isArray(data.result) ? data.result : []
        const found = items[0]
        if (found) {
          setBookCopy(found)
          // nạp book theo bookId
          const bookRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/books/${found.bookId}`)
          const bookData = await bookRes.json()
          setBook(bookData?.result || null)
          return
        }
      }
    } catch {}
    setBookCopy(null)
    setBook(null)
  }

  const handleCheckout = async () => {
    setError("")
    setLoading(true)

    // Validation
    if (!member) {
      setError("Không tìm thấy độc giả với mã này")
      setLoading(false)
      return
    }

    if (member.membershipStatus !== "active") {
      setError("Thẻ độc giả không còn hiệu lực")
      setLoading(false)
      return
    }

    if ((member.currentBorrowCount ?? 0) >= (member.maxBorrowLimit ?? 0)) {
      setError(`Độc giả đã đạt giới hạn mượn sách (${member.maxBorrowLimit} cuốn)`)
      setLoading(false)
      return
    }

    if (!bookCopy || !book) {
      setError("Không tìm thấy sách với mã vạch này")
      setLoading(false)
      return
    }

    if (bookCopy.status !== "available") {
      setError("Sách này không có sẵn để mượn")
      setLoading(false)
      return
    }

    const res = await checkout({ memberCode, barcode })
    if (!(res?.code === 1000)) {
      setLoading(false)
      setError(res?.message || "Không thể mượn sách")
      return
    }

    toast({
      title: "Mượn sách thành công",
      description: `${member.fullName} đã mượn "${book.title}"`,
    })

    // Reset form
    setMemberCode("")
    setBarcode("")
    setMember(null)
    setBookCopy(null)
    setBook(null)
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberCode">Mã độc giả</Label>
            <Input
              id="memberCode"
              placeholder="Nhập hoặc quét mã độc giả"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
            />
          </div>

          {member && (
            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                  <User className="h-5 w-5 text-green-700 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Đang mượn: {member.currentBorrowCount}/{member.maxBorrowLimit}
                  </p>
                  {/* Optional fines field if backend provides */}
                  {typeof (member as any).totalFines === "number" && (member as any).totalFines > 0 && (
                    <p className="text-sm text-destructive">Phí phạt: {(member as any).totalFines.toLocaleString("vi-VN")} ₫</p>
                  )}
                </div>
                <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode">Mã vạch sách</Label>
            <Input
              id="barcode"
              placeholder="Nhập hoặc quét mã vạch"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>

          {book && bookCopy && (
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                  <BookOpen className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <p className="text-sm text-muted-foreground">Vị trí: {bookCopy.location}</p>
                  <p className="text-sm text-muted-foreground capitalize">Tình trạng: {bookCopy.condition}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              </div>
            </Card>
          )}
        </div>
      </div>

      <Button onClick={handleCheckout} disabled={!member || !bookCopy || loading} className="w-full" size="lg">
        {loading ? "Đang xử lý..." : "Xác nhận mượn sách"}
      </Button>
    </div>
  )
}
