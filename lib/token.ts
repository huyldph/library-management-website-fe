"use client";
import Cookies from "js-cookie";

const TOKEN_KEY = "token";

export function setToken(token: string) {
    Cookies.set(TOKEN_KEY, token, { path: "/", secure: process.env.NODE_ENV === "production", sameSite: "strict" });
}

export function getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
}

export function clearToken() {
    // Xóa mọi biến thể có thể tồn tại do trước đây set cookie ở các path khác nhau
    const paths = ["/", "/login", "/admin", "/member", "/staff"];
    try {
        Cookies.remove(TOKEN_KEY);
    } catch {}
    for (const p of paths) {
        try {
            Cookies.remove(TOKEN_KEY, { path: p });
        } catch {}
    }
}