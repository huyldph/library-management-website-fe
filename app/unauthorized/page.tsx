export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Bạn không có quyền truy cập</h1>
        <p className="text-muted-foreground">Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.</p>
        <a href="/" className="text-primary underline">Quay về trang chủ</a>
      </div>
    </div>
  );
}
