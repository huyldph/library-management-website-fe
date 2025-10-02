"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { getBooks, getBookCopies, saveBookCopies } from "@/lib/storage"
import type { Book, BookCopy } from "@/lib/types"
import { BookCopyForm } from "@/components/book-copy-form"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const statusColors = {
  available: "bg-green-500/10 text-green-700 dark:text-green-400",
  borrowed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  maintenance: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  lost: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const statusLabels = {
  available: "Có sẵn",
  borrowed: "Đang mượn",
  maintenance: "Bảo trì",
  lost: "Mất",
}

export default function BookCopiesPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([])
  const [filteredCopies, setFilteredCopies] = useState<BookCopy[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null)
  const [deletingCopy, setDeletingCopy] = useState<BookCopy | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterCopies()
  }, [searchQuery, bookCopies])

  const loadData = () => {
    setBooks(getBooks())
    const copies = getBookCopies()
    setBookCopies(copies)
    setFilteredCopies(copies)
  }

  const filterCopies = () => {
    if (!searchQuery.trim()) {
      setFilteredCopies(bookCopies)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = bookCopies.filter((copy) => {
      const book = books.find((b) => b.id === copy.bookId)
      return (
        copy.barcode.toLowerCase().includes(query) ||
        book?.title.toLowerCase().includes(query) ||
        copy.location.toLowerCase().includes(query)
      )
    })
    setFilteredCopies(filtered)
  }

  const getBookTitle = (bookId: string) => {
    return books.find((b) => b.id === bookId)?.title || "Unknown"
  }

  const handleAddCopy = (copyData: Omit<BookCopy, "id">) => {
    const newCopy: BookCopy = {
      ...copyData,
      id: Date.now().toString(),
    }

    const updatedCopies = [...bookCopies, newCopy]
    saveBookCopies(updatedCopies)
    setBookCopies(updatedCopies)
    setIsAddDialogOpen(false)

    toast({
      title: "Thành công",
      description: "Đã thêm bản sao mới",
    })
  }

  const handleEditCopy = (copyData: Omit<BookCopy, "id">) => {
    if (!editingCopy) return

    const updatedCopy: BookCopy = {
      ...copyData,
      id: editingCopy.id,
    }

    const updatedCopies = bookCopies.map((c) => (c.id === editingCopy.id ? updatedCopy : c))
    saveBookCopies(updatedCopies)
    setBookCopies(updatedCopies)
    setEditingCopy(null)

    toast({
      title: "Thành công",
      description: "Đã cập nhật thông tin bản sao",
    })
  }

  const handleDeleteCopy = () => {
    if (!deletingCopy) return

    const updatedCopies = bookCopies.filter((c) => c.id !== deletingCopy.id)
    saveBookCopies(updatedCopies)
    setBookCopies(updatedCopies)
    setDeletingCopy(null)

    toast({
      title: "Thành công",
      description: "Đã xóa bản sao",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý bản sao sách</h1>
          <p className="text-muted-foreground">Quản lý các bản sao vật lý của sách</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm bản sao
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm bản sao mới</DialogTitle>
              <DialogDescription>Nhập thông tin bản sao vật lý của sách</DialogDescription>
            </DialogHeader>
            <BookCopyForm books={books} onSubmit={handleAddCopy} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã vạch, tên sách, vị trí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã vạch</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Tình trạng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCopies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchQuery ? "Không tìm thấy bản sao phù hợp" : "Chưa có bản sao nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCopies.map((copy) => (
                <TableRow key={copy.id}>
                  <TableCell className="font-mono font-medium">{copy.barcode}</TableCell>
                  <TableCell>{getBookTitle(copy.bookId)}</TableCell>
                  <TableCell>{copy.location}</TableCell>
                  <TableCell className="capitalize">{copy.condition}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[copy.status]}>
                      {statusLabels[copy.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingCopy(copy)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingCopy(copy)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCopy} onOpenChange={(open) => !open && setEditingCopy(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bản sao</DialogTitle>
            <DialogDescription>Cập nhật thông tin bản sao</DialogDescription>
          </DialogHeader>
          {editingCopy && (
            <BookCopyForm
              books={books}
              initialData={editingCopy}
              onSubmit={handleEditCopy}
              onCancel={() => setEditingCopy(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCopy} onOpenChange={(open) => !open && setDeletingCopy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bản sao</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bản sao "{deletingCopy?.barcode}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCopy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
