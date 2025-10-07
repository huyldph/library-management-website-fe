"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, BookOpen } from "lucide-react"
import Link from "next/link"
import { ROLES } from "@/lib/constants"

export function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    // Clear state + token instantly
    logout()
    // Replace to avoid back navigation returning to admin
    router.replace("/")
  }

  // Tạo ký hiệu avatar từ user.sub (UUID) hoặc mặc định
  const initials = (user?.sub?.slice(0, 2) || "AD").toUpperCase()

  const roleLabel = user?.scope === ROLES.ADMIN
    ? "Quản trị viên"
    : user?.scope === ROLES.STAFF
      ? "Thủ thư"
      : "Người dùng"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Quản lý thư viện</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              Trang chủ
            </Button>
          </Link>

          {/* Nút đăng xuất hiển thị trực tiếp để dễ tìm thấy */}
          <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:inline-flex">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  )
}
