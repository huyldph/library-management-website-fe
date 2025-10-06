"use client";

import { API_URL } from "../constants";
import { fetchWithAuth } from "./fetcher";

export type DateRange = "this-month" | "last-month" | "this-year" | "all-time";

export type ReportsStats = {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  totalFines: number;
  newMembers: number;
  activeMembers: number;
  popularBooks: { title: string; author: string; count: number }[];
  categoryStats: { category: string; count: number }[];
  memberActivity: { name: string; cardNumber: string; loanCount: number }[];
};

export async function getReports(range: DateRange): Promise<ReportsStats> {
  const res = await fetchWithAuth(`${API_URL}/api/v1/reports?range=${range}`);
  const data = await res.json();
  if (data?.code === 1000 && data?.result) return data.result as ReportsStats;
  return {
    totalLoans: 0,
    activeLoans: 0,
    returnedLoans: 0,
    overdueLoans: 0,
    totalFines: 0,
    newMembers: 0,
    activeMembers: 0,
    popularBooks: [],
    categoryStats: [],
    memberActivity: [],
  };
}


