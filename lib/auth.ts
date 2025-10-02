// Authentication utilities (mock implementation)
import type { User } from "./types"
import { mockUsers } from "./mock-data"

const TOKEN_KEY = "library_auth_token"
const USER_KEY = "library_user"

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export function login(username: string, password: string): AuthResponse {
  // Mock authentication - in production, this would call an API
  const user = mockUsers.find((u) => u.username === username)

  if (!user) {
    return { success: false, message: "Tên đăng nhập không tồn tại" }
  }

  // Mock password check (in production, use proper password hashing)
  if (password !== "password123") {
    return { success: false, message: "Mật khẩu không đúng" }
  }

  // Generate mock JWT token
  const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }))

  // Store in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  return { success: true, user, token }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function hasRole(role: User["role"]): boolean {
  const user = getCurrentUser()
  return user?.role === role
}
