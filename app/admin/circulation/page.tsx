"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutForm } from "@/components/checkout-form"
import { ReturnForm } from "@/components/return-form"
import { LoanHistoryTable } from "@/components/loan-history-table"
import { listLoans } from "@/lib/api/loans"
import { listMembers } from "@/lib/api/members"
import { fetchPublicBooks, fetchBookCopiesByBookId } from "@/lib/api/books"
import type { Loan } from "@/lib/api/loans"

export default function CirculationPage() {
  const [loanHistory, setLoanHistory] = useState<any[]>([])

  useEffect(() => {
    loadLoanHistory()
  }, [])

  const loadLoanHistory = async () => {
    const [loans, members, booksRes] = await Promise.all([
      listLoans({ page: 1, size: 200 }),
      listMembers({ page: 1, size: 200 }),
      fetchPublicBooks({ page: 1, size: 200 }),
    ])
    const books = booksRes.items
    const copyCache: Record<string, any[]> = {}
    const getCopies = async (bookId: string) => {
      if (!copyCache[bookId]) copyCache[bookId] = await fetchBookCopiesByBookId(bookId)
      return copyCache[bookId]
    }
    const history = await Promise.all(
      loans.map(async (loan: Loan) => {
        const member = members.find((m) => m.id === loan.memberId)
        const book = books.find((b) => b.id === loan.bookId)
        const copies = loan.bookId ? await getCopies(loan.bookId) : []
        const bookCopy = copies.find((c) => c.id === loan.bookCopyId)
        return {
          ...loan,
          memberName: member?.fullName || "Unknown",
          bookTitle: book?.title || "Unknown",
          bookBarcode: bookCopy?.barcode || "Unknown",
        }
      })
    )
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
