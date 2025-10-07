"use client"

import {useState, useEffect} from "react"
import {useParams, useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {fetchPublicBook, fetchBookCopiesByBookId, type PublicBook, type PublicBookCopy} from "@/lib/api/books"
import {ArrowLeft, BookOpen, Calendar, Building2, Hash, Tag} from "lucide-react"
import Link from "next/link"
import {PublicHeader} from "@/components/public-header"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"

const statusColors = {
    available: "bg-green-500/10 text-green-700 dark:text-green-400",
    borrowed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    maintenance: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    lost: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const statusLabels = {
    Available: "Có sẵn",
    Loaned: "Đang mượn",
    Lost: "Mất",
    Damaged: "Hỏng",
    Reserved: "Đã đặt trước"
}

export default function BookDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [book, setBook] = useState<PublicBook | null>(null)
    const [copies, setCopies] = useState<PublicBookCopy[]>([])

    useEffect(() => {
        loadBookDetails()
    }, [params.id])

    const loadBookDetails = async () => {
        const id = String(params.id)
        const foundBook = await fetchPublicBook(id)
        if (!foundBook) return
        setBook(foundBook)
        const bookCopies = await fetchBookCopiesByBookId(foundBook.bookId)
        setCopies(bookCopies)
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-background">
                <PublicHeader/>
                <main className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-lg font-medium mb-2">Không tìm thấy sách</p>
                            <Link href="/opac">
                                <Button variant="outline">Quay lại trang tìm kiếm</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <PublicHeader/>

            <main className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Quay lại
                </Button>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Book Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary">{book.categoryName}</Badge>
                                        {(book.availableCopies ?? 0) > 0 ? (
                                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                                                {book.availableCopies ?? 0} bản có sẵn
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">Hết sách</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-3xl mb-2 text-balance">{book.title}</CardTitle>
                                    <p className="text-xl text-muted-foreground">{book.author}</p>
                                </div>
                                {book.imageUrl ? (
                                    <img
                                        src={book.imageUrl}
                                        alt={book.title}
                                        className="h-20 w-16 rounded object-contain bg-muted"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <BookOpen className="h-8 w-8 text-primary"/>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Mô tả</h3>
                                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nhà xuất bản</p>
                                        <p className="font-medium">{book.publisherName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Năm xuất bản</p>
                                        <p className="font-medium">{book.publicationYear}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Hash className="h-5 w-5 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm text-muted-foreground">ISBN</p>
                                        <p className="font-mono font-medium">{book.isbn}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Thể loại</p>
                                        <p className="font-medium">{book.categoryName}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Copies Availability */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tình trạng bản sao</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {copies.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">Chưa có bản sao nào</p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Mã vạch</TableHead>
                                                <TableHead>Vị trí</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Hành động</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {copies.map((copy) => (
                                                <TableRow key={copy.id}>
                                                    <TableCell
                                                        className="font-mono font-medium">{copy.barcode}</TableCell>
                                                    <TableCell>{copy.location}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="secondary"
                                                            className={statusColors[(copy.status as keyof typeof statusColors) || "Available"]}
                                                        >
                                                            {statusLabels[(copy.status as keyof typeof statusLabels) || "Available"]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm">Xem</Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Chi tiết bản sao</DialogTitle>
                                                                    <DialogDescription>Thông tin chi tiết về bản sao của
                                                                        sách</DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-3">
                                                                    {copy.barcodeImageUrl && (
                                                                        <div className="flex justify-center py-2">
                                                                            <img
                                                                                src={copy.barcodeImageUrl}
                                                                                alt="Ảnh mã vạch"
                                                                                className="max-h-32 object-contain"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between">
                                                                        <span
                                                                            className="text-muted-foreground">Mã vạch</span>
                                                                        <span
                                                                            className="font-mono font-medium">{copy.barcode || "-"}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span
                                                                            className="text-muted-foreground">Vị trí</span>
                                                                        <span
                                                                            className="font-medium">{copy.location || "-"}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Trạng thái</span>
                                                                        <span
                                                                            className="font-medium">{statusLabels[(copy.status as keyof typeof statusLabels) || "Available"]}</span>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
