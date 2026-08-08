import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function proxy(request: NextRequest) { if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) { const user = await getCurrentUser(); if (!user) return NextResponse.redirect(new URL('/auth/login', request.url)) } return NextResponse.next() }
export default proxy
export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] }
