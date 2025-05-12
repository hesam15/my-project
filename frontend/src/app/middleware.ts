// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host')

  // اگر درخواست از subdomain admin آمده باشد
  if (hostname?.startsWith('admin.')) {
    // مسیر را به دایرکتوری admin تغییر دهید
    url.pathname = `/admin${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // اگر درخواست از مسیر app آمده باشد
  if (url.pathname.startsWith('app.')) {
    // مسیر را به دایرکتوری app/app تغییر دهید
    url.pathname = `/app${url.pathname.replace('/app', '')}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}