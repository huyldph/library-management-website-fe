"use client";

import { API_URL } from "../constants";
import { fetchWithAuth } from "./fetcher";

export type BorrowingStats = {
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    returnedLoans: number;
    totalFines: number;
};

export type AdminOverview = {
    totalBooks: number;
    totalMembers: number;
    stats: BorrowingStats;
};

export async function getAdminOverview(): Promise<AdminOverview> {
    try {
        const res = await fetchWithAuth(`${API_URL}/api/v1/admin/overview`, {
            method: "GET",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data && data.code === 1000 && data.result) {
            const r = data.result;
            return {
                totalBooks: Number(r.totalBooks ?? 0),
                totalMembers: Number(r.totalMembers ?? 0),
                stats: {
                    totalLoans: Number(r.stats?.totalLoans ?? 0),
                    activeLoans: Number(r.stats?.activeLoans ?? 0),
                    overdueLoans: Number(r.stats?.overdueLoans ?? 0),
                    returnedLoans: Number(r.stats?.returnedLoans ?? 0),
                    totalFines: Number(r.stats?.totalFines ?? 0),
                },
            };
        }
    } catch (e) {
        // swallow and return zeros; UI remains usable
    }

    return {
        totalBooks: 0,
        totalMembers: 0,
        stats: {
            totalLoans: 0,
            activeLoans: 0,
            overdueLoans: 0,
            returnedLoans: 0,
            totalFines: 0,
        },
    };
}


