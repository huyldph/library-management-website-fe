"use client"

import Link from "next/link"
import {Button} from "@/components/ui/button"
import {BookOpen, User} from "lucide-react"
import {useRouter} from "next/navigation"
import {useEffect, useRef, useState} from "react"

type PublicHeaderProps = {
    mode?: "default" | "opac"
}

export function PublicHeader({mode = "default"}: PublicHeaderProps) {
    const router = useRouter()
    const [memberQuery, setMemberQuery] = useState("")
    const [isScanning, setIsScanning] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const scanIntervalRef = useRef<number | null>(null)

    function goToMemberPage(identifier: string) {
        const id = identifier.trim()
        if (!id) return
        router.push(`/member/${encodeURIComponent(id)}`)
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        goToMemberPage(memberQuery)
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
                        goToMemberPage(raw)
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
                            placeholder="Nhập số thẻ hoặc nội dung QR"
                            className="h-9 w-56 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
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
