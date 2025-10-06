"use client";

import { API_URL } from "../constants";
import { fetchWithAuth } from "./fetcher";

export type Loan = {
  id: string;
  memberId: string;
  bookId: string;
  bookCopyId: string;
  borrowDate: string | Date;
  dueDate: string | Date;
  returnDate?: string | Date;
  status: "active" | "overdue" | "returned" | string;
  renewalCount?: number;
  maxRenewals?: number;
  fineAmount?: number;
};

export async function listLoans(params: { memberId?: string; status?: string; page?: number; size?: number } = {}) {
  const url = new URL(`${API_URL}/api/v1/loans`);
  if (params.memberId) url.searchParams.set("memberId", params.memberId);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.size) url.searchParams.set("size", String(params.size));
  const res = await fetchWithAuth(url.toString());
  const data = await res.json();
  if (data?.code === 1000 && data?.result) {
    const r = data.result;
    const items: Loan[] = Array.isArray(r.items) ? r.items : Array.isArray(r) ? r : [];
    return items;
  }
  return [] as Loan[];
}

export async function checkout(input: { memberCode: string; barcode: string }) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/loans/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function returnBook(input: { barcode: string }) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/loans/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function findActiveLoanByBarcode(barcode: string): Promise<{ loan: Loan; member: any; book: any; copy: any } | null> {
  const url = new URL(`${API_URL}/api/v1/loans/active-by-barcode`);
  url.searchParams.set("barcode", barcode);
  const res = await fetchWithAuth(url.toString());
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result;
  return null;
}


