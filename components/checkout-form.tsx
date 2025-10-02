"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { getMembers, getBooks, getBookCopies, getLoans, saveLoans, saveBookCopies, saveMembers } from "@/lib/storage"
import type { Member, Book, BookCopy, Loan } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, User, BookOpen } from "lucide-react"

interface CheckoutFormProps {
  onSuccess: () => void
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [memberCode, setMemberCode] = useState("")
  const [barcode, setBarcode] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [bookCopy, setBookCopy] = useState<BookCopy | null>(null)
  const [book, setBook] = useState<Book | null>(null)
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

  const findMember = (code: string) => {
    const members = getMembers()
    const found = members.find((m) => m.memberCode === code)
    setMember(found || null)
  }

  const findBookCopy = (code: string) => {
    const bookCopies = getBookCopies()
    const books = getBooks()
    const found = bookCopies.find((bc) => bc.barcode === code)

    if (found) {
      const bookInfo = books.find((b) => b.id === found.bookId)
      setBookCopy(found)
      setBook(bookInfo || null)
    } else {
      setBookCopy(null)
      setBook(null)
    }
  }

  const handleCheckout = () => {
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

    if (member.currentBorrowCount >= member.maxBorrowLimit) {
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

    // Create loan
    const loans = getLoans()
    const borrowDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14 days loan period

    const newLoan: Loan = {
      id: Date.now().toString(),
      memberId: member.id,
      bookCopyId: bookCopy.id,
      bookId: book.id,
      borrowDate,
      dueDate,
      status: "active",
      renewalCount: 0,
      maxRenewals: 2,
      fineAmount: 0,
    }

    // Update book copy status
    const bookCopies = getBookCopies()
    const updatedCopies = bookCopies.map((bc) => (bc.id === bookCopy.id ? { ...bc, status: "borrowed" as const } : bc))

    // Update member borrow count
    const members = getMembers()
    const updatedMembers = members.map((m) =>
      m.id === member.id ? { ...m, currentBorrowCount: m.currentBorrowCount + 1 } : m,
    )

    // Save all changes
    saveLoans([...loans, newLoan])
    saveBookCopies(updatedCopies)
    saveMembers(updatedMembers)

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
                  {member.totalFines > 0 && (
                    <p className="text-sm text-destructive">Phí phạt: {member.totalFines.toLocaleString("vi-VN")} ₫</p>
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
