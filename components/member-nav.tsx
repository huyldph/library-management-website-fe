"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, History, AlertTriangle, Home } from "lucide-react"

type MemberNavProps = {
  memberId: string
}

const navItems = [
  {
    title: "Tổng quan",
    href: "/member",
    icon: Home,
  },
  {
    title: "Thông tin cá nhân",
    href: "/member/profile",
    icon: User,
  },
  {
    title: "Lịch sử mượn sách",
    href: "/member/history",
    icon: History,
  },
  {
    title: "Phiếu phạt",
    href: "/member/fines",
    icon: AlertTriangle,
  },
]

export function MemberNav({ memberId }: MemberNavProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || 
          (item.href === "/member" && pathname === `/member/${memberId}`) ||
          (item.href === "/member/history" && pathname === `/member/${memberId}/history`)

        return (
          <Link
            key={item.href}
            href={item.href === "/member" ? `/member/${memberId}` : 
                  item.href === "/member/history" ? `/member/${memberId}/history` :
                  item.href === "/member/profile" ? `/member/${memberId}/profile` :
                  item.href === "/member/fines" ? `/member/${memberId}/fines` :
                  item.href}
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
