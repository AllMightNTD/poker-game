import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
    console.log(`[Vercel Cron] Pinging backend: ${backendUrl}/health`);
    
    const startTime = Date.now();
    const res = await fetch(`${backendUrl}/health`, { 
      cache: "no-store",
      headers: {
        "x-ping-source": "vercel-cron"
      }
    });
    const duration = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json().catch(() => ({ status: "ok" }));
      return NextResponse.json({ 
        success: true, 
        message: "Backend pinged successfully", 
        duration: `${duration}ms`,
        data 
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: `Backend returned status ${res.status}`,
      duration: `${duration}ms`
    }, { status: 500 });
  } catch (error: any) {
    console.error("[Vercel Cron] Failed to ping backend:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
