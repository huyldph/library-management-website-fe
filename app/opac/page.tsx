"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { fetchPublicBooks, type PublicBook } from "@/lib/api/books"
import { Search, BookOpen, Filter } from "lucide-react"
import Link from "next/link"
import { PublicHeader } from "@/components/public-header"

export default function OpacPage() {
  const [books, setBooks] = useState<PublicBook[]>([])
  const [filteredBooks, setFilteredBooks] = useState<PublicBook[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [searchQuery, categoryFilter, books])

  const loadBooks = async () => {
    setLoading(true)
    const res = await fetchPublicBooks({ query: "", category: "", page: 1, size: 48 })
    setBooks(res.items)
    setFilteredBooks(res.items)
    if (res.categories && Array.isArray(res.categories)) {
      setCategories(res.categories)
    } else {
      const unique = Array.from(new Set(res.items.map((b) => b.category).filter(Boolean))) as string[]
      setCategories(unique)
    }
    setLoading(false)
  }

  const filterBooks = () => {
    let filtered = books

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((book) => {
        const title = (book.title || "").toLowerCase()
        const author = (book.author || "").toLowerCase()
        const isbn = (book.isbn || "").toLowerCase()
        const desc = (book.description || "").toLowerCase()
        return title.includes(query) || author.includes(query) || isbn.includes(query) || desc.includes(query)
      })
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((book) => (book.category || "") === categoryFilter)
    }

    setFilteredBooks(filtered)
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Tra cứu sách trực tuyến</h1>
          <p className="text-lg text-muted-foreground">Tìm kiếm và khám phá bộ sưu tập sách của thư viện</p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên sách, tác giả, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lọc theo:</span>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả thể loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thể loại</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Đang tải..." : (
                <>Tìm thấy <span className="font-medium text-foreground">{filteredBooks.length}</span> kết quả</>
              )}
            </p>
          </div>

          {filteredBooks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Không tìm thấy sách</p>
                <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <Link key={book.id} href={`/opac/books/${book.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary">{book.category}</Badge>
                        {(book.availableCopies ?? 0) > 0 ? (
                          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Có sẵn</Badge>
                        ) : (
                          <Badge variant="destructive">Hết sách</Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 text-balance">{book.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{book.author || ""}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{book.description || ""}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nhà xuất bản:</span>
                          <span className="font-medium">{book.publisher || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Năm xuất bản:</span>
                          <span className="font-medium">{book.publishYear ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Còn lại:</span>
                          <span className="font-medium">{book.availableCopies ?? 0}/{book.totalCopies ?? 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
