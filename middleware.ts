import {NextResponse, type NextRequest} from "next/server";
import { decodeJwt } from "jose";
import {ROLES} from "./lib/constants";

type Role = typeof ROLES[keyof typeof ROLES];

// --- Cấu hình phân quyền ---
const routePermissions: Record<string, Role[]> = {
    "/admin": [ROLES.ADMIN],
    "/staff": [ROLES.ADMIN, ROLES.STAFF],
};

// --- Hàm trợ giúp ---
function decodeToken(token: string) {
    try {
        const payload = decodeJwt(token);
        return payload as { sub?: string; scope?: "ROLE_ADMIN" | "ROLE_STAFF" };
    } catch {
        return null;
    }
}

// --- Middleware chính ---
export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const {pathname} = request.nextUrl;

    // 1. Kiểm tra sự tồn tại của token
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Giải mã token để lấy scope (không xác thực chữ ký ở edge)
    const payload = decodeToken(token);
    if (!payload) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        // Xóa cookie hỏng để tránh vòng lặp lỗi
        response.cookies.delete("token");
        return response;
    }

    // 3. Kiểm tra quyền truy cập dựa trên vai trò
    if (!payload.scope) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    const userRole = payload.scope as Role;

    // Tìm quy tắc phân quyền phù hợp với đường dẫn hiện tại
    const matchingPath = Object.keys(routePermissions).find((path) =>
        pathname.startsWith(path)
    );

    if (matchingPath) {
        const allowedRoles = routePermissions[matchingPath];
        // Nếu vai trò của người dùng không nằm trong danh sách được phép
        if (!allowedRoles.includes(userRole)) {
            // Chuyển hướng đến trang không có quyền
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    // 4. Cho phép truy cập nếu mọi thứ hợp lệ
    return NextResponse.next();
}

// --- Cấu hình Matcher ---
export const config = {
    /*
     * Áp dụng middleware cho tất cả các đường dẫn bắt đầu bằng:
     * /admin, /staff
     */
    matcher: ["/admin/:path*", "/staff/:path*"],
};