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
    router.replace("/login")
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
          <Link href="/opac">
            <Button variant="outline" size="sm">
              Trang công khai
            </Button>
          </Link>

          {/* Nút đăng xuất hiển thị trực tiếp để dễ tìm thấy */}
          <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:inline-flex">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Mở menu tài khoản" title="Tài khoản" variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.sub || "Tài khoản"}</p>
                  <p className="text-xs text-muted-foreground">{user?.sub}</p>
                  <p className="text-xs text-muted-foreground capitalize">Vai trò: {roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </header>
  )
}
