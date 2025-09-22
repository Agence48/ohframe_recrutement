import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  if (url.pathname.startsWith('/dashboard')) {
    // Simple gate: check supabase-auth-token present (client-side SSR would be stronger)
    const has = req.cookies.get('sb:token') || req.cookies.get('sb-access-token')
    if (!has) {
      const u = req.nextUrl.clone(); u.pathname = '/login'; return NextResponse.redirect(u)
    }
  }
  return NextResponse.next()
}
export const config = { matcher: ['/dashboard/:path*'] }
