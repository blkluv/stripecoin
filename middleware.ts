import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { allow } from "@/lib/rateLimiter";


export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
        const ip = req.headers.get("x-forwarded-for") ?? "anon";
        if (!allow(ip)) return new NextResponse("Too Many Requests", { status: 429 });
    }
    return NextResponse.next();
}


export const config = { matcher: "/api/:path*" };