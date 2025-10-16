"use client"

import Link from "next/link"
import {Button} from "@/components/ui/button"
import {BookOpen} from "lucide-react"
import {useRouter} from "next/navigation"
import {useEffect, useRef, useState} from "react"
import { findMemberByCode } from "@/lib/api/members"
import { useToast } from "@/hooks/use-toast"

type PublicHeaderProps = {
    mode?: "default" | "opac"
}

export function PublicHeader({ mode: _mode = "default" }: PublicHeaderProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [memberQuery, setMemberQuery] = useState("")
    const [isScanning, setIsScanning] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const scanIntervalRef = useRef<number | null>(null)

    async function handleMemberSearch(identifier: string) {
        const id = identifier?.trim()
        if (!id) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập số thẻ thành viên.",
                variant: "destructive"
            })
            return
        }
        
        try {
            const found = await findMemberByCode(id)
            if (found) {
                // Clear the search input
                setMemberQuery("")
                // Show success message
                toast({
                    title: "Tìm thấy thành viên",
                    description: `Chào mừng ${found.fullName}! Đang chuyển hướng...`,
                })
                // redirect to member home
                router.push(`/member/${encodeURIComponent(id)}`)
            } else {
                toast({
                    title: "Không tìm thấy thành viên",
                    description: `Không tìm thấy thành viên với số thẻ "${id}". Vui lòng kiểm tra lại.`,
                    variant: "destructive"
                })
            }
        } catch (err) {
            console.error("Error searching member:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi khi tìm thành viên. Vui lòng thử lại.",
                variant: "destructive"
            })
        }
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        void handleMemberSearch(memberQuery)
    }

    async function startQrScan() {
        // Prefer BarcodeDetector if available
        const isBarcodeDetectorAvailable = typeof window !== "undefined" && (window as any).BarcodeDetector
        if (!isBarcodeDetectorAvailable) {
            alert("Thiết bị không hỗ trợ quét QR trực tiếp. Vui lòng nhập số thẻ.")
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}})
            streamRef.current = stream
            setIsScanning(true)
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }
            const detector = new (window as any).BarcodeDetector({formats: ["qr_code"]})
            const scan = async () => {
                if (!videoRef.current) return
                try {
                    const barcodes = await detector.detect(videoRef.current)
                    if (barcodes && barcodes.length > 0) {
                        const raw = barcodes[0].rawValue as string
                        await stopQrScan()
                        // Use the same lookup flow as manual search
                        await handleMemberSearch(raw)
                        return
                    }
                } catch {
                    // ignore iteration errors
                }
            }
            // Poll every 300ms
            scanIntervalRef.current = window.setInterval(scan, 300)
        } catch (err) {
            console.error(err)
            alert("Không thể truy cập camera để quét QR.")
        }
    }

    async function stopQrScan() {
        setIsScanning(false)
        if (scanIntervalRef.current) {
            window.clearInterval(scanIntervalRef.current)
            scanIntervalRef.current = null
        }
        if (videoRef.current) {
            try { videoRef.current.pause() } catch {}
            videoRef.current.srcObject = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
    }

    useEffect(() => {
        return () => { void stopQrScan() }
    }, [])

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary"/>
                    <span className="text-xl font-bold">Thư viện</span>
                </Link>

                <nav className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost">Trang chủ</Button>
                    </Link>
                    <form onSubmit={onSubmit} className="flex items-center gap-2">
                        <input
                            value={memberQuery}
                            onChange={(e) => setMemberQuery(e.target.value)}
                            placeholder="Tìm kiếm thành viên với mã thẻ"
                            className="h-9 w-64 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button type="submit" variant="default">Tìm</Button>
                        <Button type="button" variant="ghost" onClick={startQrScan}>
                            Quét QR
                        </Button>
                    </form>
                    <Link href="/member/register">
                        <Button variant="outline">
                            Đăng ký thẻ thành viên
                        </Button>
                    </Link>
                </nav>

                {isScanning && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
                        <div className="w-full max-w-md rounded-lg bg-background p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium">Quét mã QR thành viên</span>
                                <Button variant="ghost" onClick={stopQrScan}>Đóng</Button>
                            </div>
                            <div className="overflow-hidden rounded-md">
                                <video ref={videoRef} className="h-64 w-full bg-black" muted playsInline />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
