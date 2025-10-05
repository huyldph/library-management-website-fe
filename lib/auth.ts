"use client";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function login(username: string, password: string) {
    try {
        const res = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        if (!res.ok) {
            return {success: false, message: "Lỗi server khi đăng nhập"};
        }

        const data = await res.json();

        if (data.code === 1000 && data.result?.token) {
            localStorage.setItem("token", data.result.token);
            return {success: true, token: data.result.token};
        }

        return {success: false, message: "Sai tài khoản hoặc mật khẩu"};
    } catch (err) {
        return {success: false, message: "Không thể kết nối server"};
    }
}

export async function register(user: {
    username: string;
    password: string;
    fullName: string;
    email: string;
}) {
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(user),
    });

    return res.json();
}

export async function refreshToken(token: string) {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token}),
    });

    return res.json();
}

export async function logout() {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token}),
    });

    localStorage.removeItem("token");
}

export function getToken() {
    return localStorage.getItem("token");
}
