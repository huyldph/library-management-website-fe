"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react"
import { listMembers, createMember, updateMember, deleteMember, type AdminMember } from "@/lib/api/members"
import { MemberForm } from "@/components/member-form"
import { MemberDetailsDialog } from "@/components/member-details-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const statusColors = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  suspended: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  expired: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const statusLabels = {
  active: "Hoạt động",
  suspended: "Tạm ngưng",
  expired: "Hết hạn",
}

const typeLabels = {
  student: "Học sinh",
  teacher: "Giáo viên",
  public: "Công chúng",
}

export default function MembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<AdminMember[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<AdminMember | null>(null)
  const [viewingMember, setViewingMember] = useState<AdminMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<AdminMember | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [searchQuery, members])

  const loadMembers = async () => {
    const loadedMembers = await listMembers({ page: 1, size: 100 })
    setMembers(loadedMembers)
    setFilteredMembers(loadedMembers)
  }

  const filterMembers = () => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = members.filter(
      (member) =>
        member.fullName.toLowerCase().includes(query) ||
        member.memberCode.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.phone.toLowerCase().includes(query),
    )
    setFilteredMembers(filtered)
  }

  const handleAddMember = async (memberData: any) => {
    const res = await createMember(memberData)
    if (res?.code === 1000) {
      await loadMembers()
      setIsAddDialogOpen(false)
      toast({ title: "Thành công", description: "Đã thêm độc giả mới" })
    } else {
      toast({ title: "Lỗi", description: res?.message || "Không thể thêm độc giả", variant: "destructive" })
    }
  }

  const handleEditMember = async (memberData: any) => {
    if (!editingMember) return
    const res = await updateMember(editingMember.id, memberData)
    if (res?.code === 1000) {
      await loadMembers()
      setEditingMember(null)
      toast({ title: "Thành công", description: "Đã cập nhật thông tin độc giả" })
    } else {
      toast({ title: "Lỗi", description: res?.message || "Không thể cập nhật độc giả", variant: "destructive" })
    }
  }

  const handleDeleteMember = async () => {
    if (!deletingMember) return
    const res = await deleteMember(deletingMember.id)
    if (res?.code === 1000) {
      await loadMembers()
      setDeletingMember(null)
      toast({ title: "Thành công", description: "Đã xóa độc giả" })
    } else {
      toast({ title: "Lỗi", description: res?.message || "Không thể xóa độc giả", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý độc giả</h1>
          <p className="text-muted-foreground">Quản lý thông tin thành viên thư viện</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm độc giả
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm độc giả mới</DialogTitle>
              <DialogDescription>Nhập thông tin độc giả mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <MemberForm onSubmit={handleAddMember} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, mã độc giả, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã độc giả</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Loại thẻ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Đang mượn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchQuery ? "Không tìm thấy độc giả phù hợp" : "Chưa có độc giả nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-mono font-medium">{member.memberCode}</TableCell>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{typeLabels[member.membershipType]}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[(member.membershipStatus as keyof typeof statusColors) || "active"]}
                    >
                      {statusLabels[(member.membershipStatus as keyof typeof statusLabels) || "active"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {member.currentBorrowCount}/{member.maxBorrowLimit}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingMember(member)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingMember(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingMember(member)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      {viewingMember && (
        <MemberDetailsDialog member={viewingMember} open={!!viewingMember} onClose={() => setViewingMember(null)} />
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin độc giả</DialogTitle>
            <DialogDescription>Cập nhật thông tin độc giả</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <MemberForm
              initialData={editingMember}
              onSubmit={handleEditMember}
              onCancel={() => setEditingMember(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa độc giả</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa độc giả "{deletingMember?.fullName}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
