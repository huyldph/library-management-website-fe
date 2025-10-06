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
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { fetchPublicBooks, createBook, updateBook, deleteBook, type PublicBook } from "@/lib/api/books"
import { BookForm } from "@/components/book-form"
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

export default function BooksPage() {
  const [books, setBooks] = useState<PublicBook[]>([])
  const [filteredBooks, setFilteredBooks] = useState<PublicBook[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<PublicBook | null>(null)
  const [deletingBook, setDeletingBook] = useState<PublicBook | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [searchQuery, books])

  const loadBooks = async () => {
    const data = await fetchPublicBooks({ page: 1, size: 100 })
    setBooks(data.items)
    setFilteredBooks(data.items)
  }

  const filterBooks = () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query),
    )
    setFilteredBooks(filtered)
  }

  const handleAddBook = async (bookData: any) => {
    const res = await createBook({
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      description: bookData.description,
      publisher: bookData.publisher,
      publishYear: bookData.publishYear,
      category: bookData.category,
      totalCopies: bookData.totalCopies,
    })
    if (res?.code === 1000) {
      await loadBooks()
      setIsAddDialogOpen(false)
      toast({ title: "Thành công", description: "Đã thêm sách mới" })
    } else {
      toast({ title: "Lỗi", description: res?.message || "Không thể thêm sách", variant: "destructive" })
    }
  }

  const handleEditBook = async (bookData: any) => {
    if (!editingBook) return
    const res = await updateBook(editingBook.id, {
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      description: bookData.description,
      publisher: bookData.publisher,
      publishYear: bookData.publishYear,
      category: bookData.category,
      totalCopies: bookData.totalCopies,
    })
    if (res?.code === 1000) {
      await loadBooks()
      setEditingBook(null)
      toast({ title: "Thành công", description: "Đã cập nhật thông tin sách" })
    } else {
      toast({ title: "Lỗi", description: res?.message || "Không thể cập nhật sách", variant: "destructive" })
    }
  }

  const handleDeleteBook = async () => {
    if (!deletingBook) return
    const res = await deleteBook(deletingBook.id)
    if (res?.code === 1000) {
      await loadBooks()
      setDeletingBook(null)
      toast({ title: "Thành công", description: "Đã xóa sách" })
    } else {
      toast({ title: "Lỗi", description: res?.message || "Không thể xóa sách", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sách</h1>
          <p className="text-muted-foreground">Quản lý thông tin đầu sách trong thư viện</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm sách mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm sách mới</DialogTitle>
              <DialogDescription>Nhập thông tin đầu sách mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <BookForm onSubmit={handleAddBook} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên sách, tác giả, ISBN, thể loại..."
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
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Nhà xuất bản</TableHead>
              <TableHead className="text-center">Tổng bản</TableHead>
              <TableHead className="text-center">Còn lại</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchQuery ? "Không tìm thấy sách phù hợp" : "Chưa có sách nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>{book.publisher}</TableCell>
                  <TableCell className="text-center">{book.totalCopies}</TableCell>
                  <TableCell className="text-center">{book.availableCopies}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingBook(book)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingBook(book)}>
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
      <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin sách</DialogTitle>
            <DialogDescription>Cập nhật thông tin đầu sách</DialogDescription>
          </DialogHeader>
          {editingBook && (
            <BookForm initialData={editingBook} onSubmit={handleEditBook} onCancel={() => setEditingBook(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBook} onOpenChange={(open) => !open && setDeletingBook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sách</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sách "{deletingBook?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
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
