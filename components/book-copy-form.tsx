"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Book, BookCopy } from "@/lib/types"

interface BookCopyFormProps {
  books: Book[]
  initialData?: BookCopy
  onSubmit: (data: Omit<BookCopy, "id">) => void
  onCancel: () => void
}

export function BookCopyForm({ books, initialData, onSubmit, onCancel }: BookCopyFormProps) {
  const [formData, setFormData] = useState({
    bookId: initialData?.bookId || "",
    barcode: initialData?.barcode || "",
    status: initialData?.status || "available",
    location: initialData?.location || "",
    condition: initialData?.condition || "good",
    acquiredDate: initialData?.acquiredDate
      ? new Date(initialData.acquiredDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      acquiredDate: new Date(formData.acquiredDate),
      status: formData.status as BookCopy["status"],
      condition: formData.condition as BookCopy["condition"],
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bookId">
            Sách <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.bookId} onValueChange={(value) => handleChange("bookId", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Chọn sách" />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">
            Mã vạch <span className="text-destructive">*</span>
          </Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => handleChange("barcode", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Trạng thái <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Có sẵn</SelectItem>
              <SelectItem value="borrowed">Đang mượn</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
              <SelectItem value="lost">Mất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">
            Tình trạng <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Xuất sắc</SelectItem>
              <SelectItem value="good">Tốt</SelectItem>
              <SelectItem value="fair">Khá</SelectItem>
              <SelectItem value="poor">Kém</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            Vị trí <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Ví dụ: Kệ A1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acquiredDate">
            Ngày nhập <span className="text-destructive">*</span>
          </Label>
          <Input
            id="acquiredDate"
            type="date"
            value={formData.acquiredDate}
            onChange={(e) => handleChange("acquiredDate", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">{initialData ? "Cập nhật" : "Thêm bản sao"}</Button>
      </div>
    </form>
  )
}
