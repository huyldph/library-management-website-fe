"use client"

import type React from "react"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import type {Book} from "@/lib/types"

interface BookFormProps {
    initialData?: Book
    onSubmit: (data: Omit<Book, "id" | "createdAt" | "updatedAt">) => void
    onCancel: () => void
}

export function BookForm({initialData, onSubmit, onCancel}: BookFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        author: initialData?.author || "",
        isbn: initialData?.isbn || "",
        publisherName: initialData?.publisher || "",
        publicationYear: initialData?.publishYear || new Date().getFullYear(),
        category: initialData?.category || "",
        description: initialData?.description || "",
        totalCopies: initialData?.totalCopies || 1,
        availableCopies: initialData?.availableCopies || 1,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({...prev, [field]: value}))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title">
                        Tên sách <span className="text-destructive">*</span>
                    </Label>
                    <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)}
                           required/>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="author">
                        Tác giả <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => handleChange("author", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="isbn">
                        ISBN <span className="text-destructive">*</span>
                    </Label>
                    <Input id="isbn" value={formData.isbn} onChange={(e) => handleChange("isbn", e.target.value)}
                           required/>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">
                        Thể loại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="publisher">
                        Nhà xuất bản <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="publisher"
                        value={formData.publisherName}
                        onChange={(e) => handleChange("publisher", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="publishYear">
                        Năm xuất bản <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="publishYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.publicationYear}
                        onChange={(e) => handleChange("publishYear", Number.parseInt(e.target.value))}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="totalCopies">
                        Tổng số bản <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="totalCopies"
                        type="number"
                        min="1"
                        value={formData.totalCopies}
                        onChange={(e) => handleChange("totalCopies", Number.parseInt(e.target.value))}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="availableCopies">
                        Số bản còn lại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="availableCopies"
                        type="number"
                        min="0"
                        max={formData.totalCopies}
                        value={formData.availableCopies}
                        onChange={(e) => handleChange("availableCopies", Number.parseInt(e.target.value))}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit">{initialData ? "Cập nhật" : "Thêm sách"}</Button>
            </div>
        </form>
    )
}
