"use client";

import {API_URL} from "../constants";

export type PublicBook = {
    bookId: string;
    title: string;
    author: string;
    imageUrl?: string;
    isbn?: string;
    description?: string;
    publisherName?: string;
    publicationYear?: number;
    categoryName?: string;
    availableCopies?: number;
    totalCopies?: number;
};

export type PublicBookCopy = {
    id: string;
    bookId?: string;
    barcode?: string;
    barcodeImageUrl?: string;
    location?: string;
    status?: "Available" | "Loaned" | "Lost" | "Damaged" | "Reserved" | string;
};

export type FetchBooksParams = {
    query?: string;
    category?: string;
    page?: number;
    size?: number;
};

export type PublicBooksResponse = {
    items: PublicBook[];
    total: number;
    categories?: string[];
};

export type UpsertBookInput = {
    title: string;
    author: string;
    isbn?: string;
    description?: string;
    publisherName?: string;
    publicationYear?: number;
    category?: string;
    totalCopies?: number;
};

export async function fetchPublicBooks(params: FetchBooksParams = {}): Promise<PublicBooksResponse> {
    const {query = "", category = "", page = 1, size = 24} = params;

    const url = new URL(`${API_URL}/api/v1/books`);
    if (query) url.searchParams.set("query", query);
    if (category && category !== "all") url.searchParams.set("category", category);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(size));

    try {
        const res = await fetch(url.toString(), {method: "GET"});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Expected format: { code: 1000, result: { items, total, categories? } }
        if (data?.code === 1000 && data?.result) {
            const r = data.result;
            const items: PublicBook[] = Array.isArray(r.items) ? r.items : Array.isArray(r)
                ? r
                : [];
            const total: number = Number(r.total ?? items.length ?? 0);
            const categories: string[] | undefined = r.categories ?? undefined;
            return {items, total, categories};
        }
    } catch (e) {
        // fall through to return empty list
    }

    return {items: [], total: 0};
}

export async function fetchPublicBook(id: string): Promise<PublicBook | null> {
    try {
        const res = await fetch(`${API_URL}/api/v1/books/${id}`, {method: "GET"});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.code === 1000 && data?.result) {
            return data.result as PublicBook;
        }
    } catch (e) {
    }
    return null;
}

export async function fetchBookCopiesByBookId(bookId: string): Promise<PublicBookCopy[]> {
    try {
        const url = new URL(`${API_URL}/api/v1/book-copies`);
        url.searchParams.set("bookId", bookId);
        const res = await fetch(url.toString(), {method: "GET"});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.code === 1000 && data?.result) {
            const r = data.result;
            const items: PublicBookCopy[] = Array.isArray(r.items) ? r.items : Array.isArray(r) ? r : [];
            return items;
        }
    } catch (e) {
    }
    return [];
}

export async function createBook(input: UpsertBookInput) {
    const res = await fetch(`${API_URL}/api/v1/books`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(input),
        credentials: "include",
    });
    const data = await res.json();
    return data;
}

export async function updateBook(id: string, input: UpsertBookInput) {
    const res = await fetch(`${API_URL}/api/v1/books/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(input),
        credentials: "include",
    });
    const data = await res.json();
    return data;
}

export async function deleteBook(id: string) {
    const res = await fetch(`${API_URL}/api/v1/books/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    const data = await res.json();
    return data;
}


