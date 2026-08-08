import { NextResponse } from 'next/server'
import { deleteCurrentSession, SESSION_COOKIE } from '@/lib/auth'
export async function POST() { await deleteCurrentSession(); const response = NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')); response.cookies.delete(SESSION_COOKIE); return response }
