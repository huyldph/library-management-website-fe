"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutForm } from "@/components/checkout-form"
import { ReturnForm } from "@/components/return-form"
import { LoanHistoryTable } from "@/components/loan-history-table"
import { getLoans, getMembers, getBooks, getBookCopies } from "@/lib/storage"
import type { LoanHistory } from "@/lib/types"

export default function CirculationPage() {
  const [loanHistory, setLoanHistory] = useState<LoanHistory[]>([])

  useEffect(() => {
    loadLoanHistory()
  }, [])

  const loadLoanHistory = () => {
    const loans = getLoans()
    const members = getMembers()
    const books = getBooks()
    const bookCopies = getBookCopies()

    const history: LoanHistory[] = loans.map((loan) => {
      const member = members.find((m) => m.id === loan.memberId)
      const book = books.find((b) => b.id === loan.bookId)
      const bookCopy = bookCopies.find((bc) => bc.id === loan.bookCopyId)

      return {
        ...loan,
        memberName: member?.fullName || "Unknown",
        bookTitle: book?.title || "Unknown",
        bookBarcode: bookCopy?.barcode || "Unknown",
      }
    })

    setLoanHistory(history)
  }

  const handleCheckoutSuccess = () => {
    loadLoanHistory()
  }

  const handleReturnSuccess = () => {
    loadLoanHistory()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mượn/Trả sách</h1>
        <p className="text-muted-foreground">Quản lý việc mượn và trả sách của độc giả</p>
      </div>

      <Tabs defaultValue="checkout" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checkout">Mượn sách</TabsTrigger>
          <TabsTrigger value="return">Trả sách</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="checkout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mượn sách</CardTitle>
              <CardDescription>Quét mã vạch hoặc nhập thông tin để cho độc giả mượn sách</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutForm onSuccess={handleCheckoutSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="return" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trả sách</CardTitle>
              <CardDescription>Quét mã vạch hoặc nhập thông tin để xử lý trả sách</CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnForm onSuccess={handleReturnSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử mượn/trả</CardTitle>
              <CardDescription>Xem lịch sử các giao dịch mượn và trả sách</CardDescription>
            </CardHeader>
            <CardContent>
              <LoanHistoryTable loans={loanHistory} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
