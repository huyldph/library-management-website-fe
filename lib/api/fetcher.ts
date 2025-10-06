import { getToken, setToken, clearToken } from "../token";
import { refreshToken as apiRefreshToken } from "./auth";

// Biến toàn cục để quản lý trạng thái làm mới token
let isRefreshing = false;
let isRedirectingToLogin = false;
// Hàng đợi chứa các yêu cầu bị tạm dừng trong khi chờ token mới
let failedQueue: Array<{ resolve: (value: any) => void, reject: (reason?: any) => void }> = [];

/**
 * Xử lý các yêu cầu trong hàng đợi sau khi quá trình làm mới token hoàn tất.
 * @param error - Lỗi (nếu có) từ quá trình làm mới token.
 * @param token - Token mới (nếu làm mới thành công).
 */
const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    // Xóa hàng đợi sau khi đã xử lý
    failedQueue = [];
};

/**
 * Một trình bao bọc (wrapper) cho hàm fetch, tự động đính kèm token xác thực
 * và xử lý làm mới token khi hết hạn.
 * @param url - URL của API cần gọi.
 * @param options - Các tùy chọn cho request (giống như hàm fetch gốc).
 * @returns - Một Promise chứa đối tượng Response.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // Lấy token hiện tại
    let token = getToken();

    // Thực hiện yêu cầu API ban đầu
    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            // Đảm bảo Content-Type được thiết lập nếu có body
            ...(options.body && { 'Content-Type': 'application/json' }),
            // Đính kèm token vào header
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    // Nếu token hết hạn (lỗi 401)
    if (res.status === 401) {
        // Nếu đang có một tiến trình làm mới token khác diễn ra
        if (isRefreshing) {
            // "Tạm dừng" yêu cầu này bằng cách thêm nó vào hàng đợi.
            // Nó sẽ được "tiếp tục" khi token mới có sẵn.
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(newToken => {
                    // Thử lại yêu cầu ban đầu với token mới
                    return fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            ...(options.body && { 'Content-Type': 'application/json' }),
                            Authorization: `Bearer ${newToken}`,
                        },
                    });
                });
        }

        // Đánh dấu là đang trong quá trình làm mới token
        isRefreshing = true;

        try {
            // Gọi API để làm mới token
            const newToken = await apiRefreshToken();
            if (!newToken) throw new Error("Không thể làm mới token.");

            // Xử lý thành công các yêu cầu đang trong hàng đợi với token mới
            processQueue(null, newToken);

            // Thử lại yêu cầu API ban đầu đã thất bại
            return fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    ...(options.body && { 'Content-Type': 'application/json' }),
                    Authorization: `Bearer ${newToken}`,
                },
            });
        } catch (error) {
            // Nếu làm mới token thất bại, báo lỗi cho tất cả các yêu cầu trong hàng đợi
            processQueue(error as Error, null);

            // Xóa token và điều hướng về trang đăng nhập (chỉ khi không ở trang login và tránh vòng lặp)
            clearToken();
            if (typeof window !== "undefined") {
                const onLoginPage = window.location.pathname.startsWith("/login");
                if (!onLoginPage && !isRedirectingToLogin) {
                    isRedirectingToLogin = true;
                    window.location.replace("/login");
                }
            }

            // Ném lỗi để dừng tiến trình
            return Promise.reject(error);
        } finally {
            // Đặt lại trạng thái sau khi hoàn tất
            isRefreshing = false;
            // Cho phép điều hướng lần sau
            setTimeout(() => {
                isRedirectingToLogin = false;
            }, 300);
        }
    }

    // Trả về kết quả nếu không có lỗi
    return res;
}