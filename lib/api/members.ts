"use client";

import {API_URL} from "../constants";
import {fetchWithAuth} from "./fetcher";

// Member status enum matching backend
export enum MemberStatus {
    Active = "Active",
    Inactive = "Inactive", 
    Suspended = "Suspended"
}

export type AdminMember = {
    id: string;
    memberCode: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    membershipType: "student" | "teacher" | "public" | string;
    membershipStatus: MemberStatus | string;
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

export async function findMemberByCode(cardNumber: string): Promise<AdminMember | null> {
    try {
        // Use public API endpoint for member lookup
        const res = await fetch(`${API_URL}/api/v1/members/card-number/${cardNumber}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (!res.ok) {
            console.error(`HTTP error! status: ${res.status}`);
            return null;
        }
        
        const data = await res.json();
        if (data?.code === 1000 && data?.result) {
            return data.result as AdminMember;
        }
        
        // Log error response for debugging
        console.error("API Error:", data?.message || "Unknown error");
        return null;
    } catch (error) {
        console.error("Error fetching member by code:", error);
        return null;
    }
}

export async function createMember(input: Omit<AdminMember, "id">) {
    const res = await fetchWithAuth(`${API_URL}/api/v1/members`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(input),
    });
    return res.json();
}

export async function updateMember(id: string, input: Omit<AdminMember, "id">) {
    const res = await fetchWithAuth(`${API_URL}/api/v1/members/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
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
    try {
        const res = await fetchWithAuth(`${API_URL}/api/v1/members/me`);
        const data = await res.json();
        if (data?.code === 1000 && data?.result) return data.result as AdminMember;
        return null;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}

// Get member's loan statistics
export async function getMemberLoanStats(): Promise<{
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    returnedLoans: number;
} | null> {
    try {
        const res = await fetchWithAuth(`${API_URL}/api/v1/members/me/loan-stats`);
        const data = await res.json();
        if (data?.code === 1000 && data?.result) return data.result;
        return null;
    } catch (error) {
        console.error("Error fetching loan stats:", error);
        return null;
    }
}

// Public (non-auth) self-registration for member card
export async function publicRegisterMember(input: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
}) {
    try {
        // Check if API_URL is configured
        if (!API_URL) {
            throw new Error("API_URL is not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.");
        }

        const res = await fetch(`${API_URL}/api/v1/members/create`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        });

        // Check if response is ok
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error in publicRegisterMember:", error);

        // Return a consistent error response format
        if (error instanceof Error) {
            return {
                code: 5000,
                message: error.message,
                result: null
            };
        }

        return {
            code: 5000,
            message: "An unexpected error occurred",
            result: null
        };
    }
}


