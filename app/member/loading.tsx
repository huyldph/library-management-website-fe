export default function MemberLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Đang tải...</p>
            </div>
        </div>
    );
}
