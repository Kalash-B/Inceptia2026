import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session =
    request.cookies.get('hogwarts_session')?.value ||
    request.cookies.get('hogwarts_user')?.value ||
    request.cookies.get('currentUser')?.value ||
    request.cookies.get('session')?.value

  const { pathname } = request.nextUrl

  // Only allow requests to dashboard to be redirected to login page if there is no session recorded
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
}
