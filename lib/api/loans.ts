"use client";

import { API_URL } from "../constants";
import { fetchWithAuth } from "./fetcher";

// Loan status enum matching backend
export enum LoanStatus {
    Active = "Active",
    Returned = "Returned", 
    Overdue = "Overdue"
}

export type Loan = {
  id: string;
  memberId: string;
  bookId: string;
  bookCopyId: string;
  borrowDate: string | Date;
  dueDate: string | Date;
  returnDate?: string | Date;
  status: LoanStatus | string;
  renewalCount?: number;
  maxRenewals?: number;
  fineAmount?: number;
  // Additional fields from API response
  loanCode?: string;
  bookTitle?: string;
  memberName?: string;
  loanDate?: string | Date;
};

export async function listLoans(params: { memberId?: string; status?: string; page?: number; size?: number } = {}) {
  try {
    let res: Response;
    
    if (params.memberId) {
      // Use only the specified public API endpoint: GET /api/v1/loans/public/{memberId}
      const endpoint = `${API_URL}/api/v1/loans/public/${params.memberId}`;
      console.log("🔍 Debug - Using public loans API:", endpoint);
      
      res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else {
      // Use authenticated API for admin
      const url = new URL(`${API_URL}/api/v1/loans`);
      if (params.status) url.searchParams.set("status", params.status);
      if (params.page) url.searchParams.set("page", String(params.page));
      if (params.size) url.searchParams.set("size", String(params.size));
      
      res = await fetchWithAuth(url.toString());
    }
    
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      return [] as Loan[];
    }
    
    const data = await res.json();
    console.log("🔍 Debug - Loans API Response:", data);
    
    if (data?.code === 1000 && data?.result) {
      const r = data.result;
      // Handle paginated response structure: result.content[]
      const items: Loan[] = Array.isArray(r.content) ? r.content : 
                           Array.isArray(r.items) ? r.items : 
                           Array.isArray(r) ? r : [];
      console.log("🔍 Debug - Processed Loans Items:", items);
      return items;
    }
    
    // Log error response for debugging
    console.error("API Error:", data?.message || "Unknown error");
    return [] as Loan[];
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [] as Loan[];
  }
}



