"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Member } from "@/lib/types"

interface MemberFormProps {
  initialData?: Member
  onSubmit: (data: Omit<Member, "id" | "registrationDate">) => void
  onCancel: () => void
}

export function MemberForm({ initialData, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    memberCode: initialData?.memberCode || "",
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split("T")[0] : "",
    membershipType: initialData?.membershipType || "student",
    membershipStatus: initialData?.membershipStatus || "active",
    expiryDate: initialData?.expiryDate
      ? new Date(initialData.expiryDate).toISOString().split("T")[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    maxBorrowLimit: initialData?.maxBorrowLimit || 5,
    currentBorrowCount: initialData?.currentBorrowCount || 0,
    totalFines: initialData?.totalFines || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      dateOfBirth: new Date(formData.dateOfBirth),
      expiryDate: new Date(formData.expiryDate),
      membershipType: formData.membershipType as Member["membershipType"],
      membershipStatus: formData.membershipStatus as Member["membershipStatus"],
    })
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="memberCode">
            Mã độc giả <span className="text-destructive">*</span>
          </Label>
          <Input
            id="memberCode"
            value={formData.memberCode}
            onChange={(e) => handleChange("memberCode", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Số điện thoại <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Ngày sinh <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipType">
            Loại thẻ <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.membershipType} onValueChange={(value) => handleChange("membershipType", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Học sinh</SelectItem>
              <SelectItem value="teacher">Giáo viên</SelectItem>
              <SelectItem value="public">Công chúng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipStatus">
            Trạng thái <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.membershipStatus} onValueChange={(value) => handleChange("membershipStatus", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="suspended">Tạm ngưng</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">
            Ngày hết hạn <span className="text-destructive">*</span>
          </Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => handleChange("expiryDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxBorrowLimit">
            Giới hạn mượn <span className="text-destructive">*</span>
          </Label>
          <Input
            id="maxBorrowLimit"
            type="number"
            min="1"
            value={formData.maxBorrowLimit}
            onChange={(e) => handleChange("maxBorrowLimit", Number.parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentBorrowCount">Số sách đang mượn</Label>
          <Input
            id="currentBorrowCount"
            type="number"
            min="0"
            value={formData.currentBorrowCount}
            onChange={(e) => handleChange("currentBorrowCount", Number.parseInt(e.target.value))}
            disabled={!initialData}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalFines">Tổng phí phạt (VND)</Label>
          <Input
            id="totalFines"
            type="number"
            min="0"
            value={formData.totalFines}
            onChange={(e) => handleChange("totalFines", Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Địa chỉ <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">{initialData ? "Cập nhật" : "Thêm độc giả"}</Button>
      </div>
    </form>
  )
}
