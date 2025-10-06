"use client";

import { API_URL } from "../constants";
import { fetchWithAuth } from "./fetcher";

export type AdminMember = {
  id: string;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  membershipType: "student" | "teacher" | "public" | string;
  membershipStatus: "active" | "suspended" | "expired" | string;
  currentBorrowCount?: number;
  maxBorrowLimit?: number;
  registrationDate?: string | Date;
};

export async function listMembers(params: { query?: string; page?: number; size?: number } = {}) {
  const url = new URL(`${API_URL}/api/v1/members`);
  if (params.query) url.searchParams.set("query", params.query);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.size) url.searchParams.set("size", String(params.size));

  const res = await fetchWithAuth(url.toString());
  const data = await res.json();
  if (data?.code === 1000 && data?.result) {
    const r = data.result;
    const items: AdminMember[] = Array.isArray(r.items) ? r.items : Array.isArray(r) ? r : [];
    return items;
  }
  return [] as AdminMember[];
}

export async function findMemberByCode(memberCode: string): Promise<AdminMember | null> {
  const url = new URL(`${API_URL}/api/v1/members`);
  url.searchParams.set("memberCode", memberCode);
  const res = await fetchWithAuth(url.toString());
  const data = await res.json();
  if (data?.code === 1000 && data?.result) {
    const r = data.result;
    const items: AdminMember[] = Array.isArray(r.items) ? r.items : Array.isArray(r) ? r : [];
    const exact = items.find((m) => m.memberCode === memberCode);
    return exact || items[0] || null;
  }
  return null;
}

export async function createMember(input: Omit<AdminMember, "id">) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateMember(id: string, input: Omit<AdminMember, "id">) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function deleteMember(id: string) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/members/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function getMyProfile(): Promise<AdminMember | null> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/members/me`);
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result as AdminMember;
  return null;
}


