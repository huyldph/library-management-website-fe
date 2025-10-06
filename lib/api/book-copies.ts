"use client";

import { API_URL } from "../constants";
import { fetchWithAuth } from "./fetcher";

export type AdminBookCopy = {
  id: string;
  bookId: string;
  barcode: string;
  location?: string;
  condition?: string;
  status?: "available" | "borrowed" | "maintenance" | "lost" | string;
  acquiredDate?: string | Date;
  notes?: string;
};

export async function listBookCopies(params: { page?: number; size?: number; bookId?: string } = {}) {
  const url = new URL(`${API_URL}/api/v1/book-copies`);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.size) url.searchParams.set("size", String(params.size));
  if (params.bookId) url.searchParams.set("bookId", params.bookId);

  const res = await fetchWithAuth(url.toString());
  const data = await res.json();
  if (data?.code === 1000 && data?.result) {
    const r = data.result;
    const items: AdminBookCopy[] = Array.isArray(r.items) ? r.items : Array.isArray(r) ? r : [];
    return items;
  }
  return [] as AdminBookCopy[];
}

export async function createBookCopy(input: Omit<AdminBookCopy, "id">) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/book-copies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateBookCopy(id: string, input: Omit<AdminBookCopy, "id">) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/book-copies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function deleteBookCopy(id: string) {
  const res = await fetchWithAuth(`${API_URL}/api/v1/book-copies/${id}`, {
    method: "DELETE",
  });
  return res.json();
}


