export const ROLES = {
    ADMIN: "ROLE_ADMIN",
    STAFF: "ROLE_STAFF",
    MEMBER: "ROLE_MEMBER",
} as const;

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
