"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MemberHeader } from "@/components/member-header";
import { MemberNav } from "@/components/member-nav";
import { findMemberByCode } from "@/lib/api/members";
import type { AdminMember } from "@/lib/api/members";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [memberData, setMemberData] = useState<AdminMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract member ID from pathname
  const memberId = pathname.split('/')[2];

  useEffect(() => {
    const fetchMemberData = async () => {
      if (memberId) {
        try {
          const member = await findMemberByCode(memberId);
          if (member) {
            setMemberData(member);
            // Store member data in localStorage for persistence
            localStorage.setItem('memberData', JSON.stringify(member));
          } else {
            // Member not found, redirect to home
            router.replace('/');
          }
        } catch (error) {
          console.error('Error fetching member data:', error);
          router.replace('/');
        }
      }
      setLoading(false);
    };

    fetchMemberData();
  }, [memberId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy thành viên</h2>
          <p className="text-muted-foreground mb-4">Mã thành viên không tồn tại</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MemberHeader 
        memberName={memberData.fullName} 
        memberCode={memberData.memberCode} 
      />
      <div className="flex">
        <aside className="w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)] p-4">
          <MemberNav memberId={memberId} />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}