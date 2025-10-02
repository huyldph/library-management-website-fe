"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, User } from "lucide-react"

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/opac" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Thư viện</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/opac">
            <Button variant="ghost">Tra cứu sách</Button>
          </Link>
          <Link href="/opac/account">
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Tài khoản
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Quản trị
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
