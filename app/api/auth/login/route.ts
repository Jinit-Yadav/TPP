import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { connectMongo } from '@/lib/mongodb'
import { createSession, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: Request) { const body = await request.json().catch(() => null); const email = String(body?.email || '').trim().toLowerCase(); const password = String(body?.password || ''); if (!email || !password) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 }); const db = await connectMongo(); const user = await db.collection('users').findOne({ email }); if (!user || !(await compare(password, user.passwordHash))) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 }); const token = await createSession(user._id); const response = NextResponse.json({ ok: true }); response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 14 }); return response }
