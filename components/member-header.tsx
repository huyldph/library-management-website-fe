"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, User } from "lucide-react"
import Link from "next/link"

type MemberHeaderProps = {
  memberName?: string
  memberCode?: string
}

export function MemberHeader({ memberName, memberCode }: MemberHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear any member session data
    localStorage.removeItem('memberData')
    // Redirect to home
    router.replace("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Quản lý thành viên</h1>
            {memberName && (
              <p className="text-sm text-muted-foreground">
                Xin chào, {memberName} ({memberCode})
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              Trang chủ
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:inline-flex">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  )
}
