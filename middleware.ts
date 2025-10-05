import {NextResponse, type NextRequest} from "next/server";
import {jwtVerify} from "jose";
import {ROLES} from "./lib/constants"; // Import từ file constants

type AppJwtPayload = {
    sub: string;
    scope: "ROLE_ADMIN" | "ROLE_STAFF" | "ROLE_MEMBER";
};

/**
 * Xác minh chữ ký của JWT bằng secret key.
 * @param token - Chuỗi JWT từ cookie.
 * @returns Payload của token nếu hợp lệ, ngược lại trả về null.
 */
async function verifyToken(token: string): Promise<AppJwtPayload | null> {
    if (!process.env.JWT_SECRET_KEY) {
        console.error("JWT_SECRET_KEY is not set in .env.local");
        return null;
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        const {payload} = await jwtVerify(token, secret);

        // Ép kiểu cho payload để tránh TS báo đỏ
        return payload as AppJwtPayload;
    } catch (err) {
        console.error("JWT Verification Failed:", err);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;
    const token = request.cookies.get("token")?.value;

    // 1. Nếu không có token, chuyển hướng đến trang đăng nhập.
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Xác minh token.
    const payload = await verifyToken(token);

    // 3. Nếu token không hợp lệ, xóa cookie và redirect login
    if (!payload) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
    }

    const userRole = payload.scope;

    // 4. Phân quyền dựa trên vai trò
    if (pathname.startsWith("/admin") && userRole !== ROLES.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (
        pathname.startsWith("/staff") &&
        !(userRole === ROLES.STAFF || userRole === ROLES.ADMIN)
    ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/member") && userRole !== ROLES.MEMBER) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // 5. Nếu hợp lệ thì cho đi tiếp
    return NextResponse.next();
}

// Chỉ apply middleware cho các route cần bảo vệ
export const config = {
    matcher: ["/admin/:path*", "/staff/:path*", "/member/:path*"],
};
