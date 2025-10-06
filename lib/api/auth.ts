"use client";
import {API_URL} from "../constants";
import {setToken, clearToken, getToken} from "../token";

export async function login(username: string, password: string) {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
    });

    const data = await res.json();
    if (data.code === 1000 && data.result?.token) {
        setToken(data.result.token);
        return {success: true, token: data.result.token};
    }
    return {success: false, message: data.message || "Sai tài khoản hoặc mật khẩu"};
}

export async function register(user: {
    username: string;
    password: string;
    fullName: string;
    email: string;
}) {
    return fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(user),
    }).then(r => r.json());
}

export async function refreshToken() {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token}),
    });

    const data = await res.json();
    if (data.code === 1000 && data.result?.token) {
        setToken(data.result.token);
        return data.result.token;
    } else {
        clearToken();
        return null;
    }
}

export async function logout() {
    const token = getToken();
    if (token) {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({token}),
        });
    }
    clearToken();
}
