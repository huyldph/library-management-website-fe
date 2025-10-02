"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Users, ArrowLeftRight, BarChart3, Home, BookCopy } from "lucide-react"

const navItems = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Quản lý sách",
    href: "/admin/books",
    icon: BookOpen,
  },
  {
    title: "Bản sao sách",
    href: "/admin/book-copies",
    icon: BookCopy,
  },
  {
    title: "Quản lý độc giả",
    href: "/admin/members",
    icon: Users,
  },
  {
    title: "Mượn/Trả sách",
    href: "/admin/circulation",
    icon: ArrowLeftRight,
  },
  {
    title: "Báo cáo & Thống kê",
    href: "/admin/reports",
    icon: BarChart3,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
