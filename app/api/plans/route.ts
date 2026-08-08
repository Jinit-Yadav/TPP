import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'
export async function POST(request: Request) { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 }); const body = await request.json().catch(() => null); if (!body?.planData) return NextResponse.json({ error: 'Plan data required' }, { status: 400 }); const db = await connectMongo(); await db.collection('study_plans').updateOne({ userId: user._id }, { $set: { userId: user._id, title: String(body.title || 'My study plan'), planData: body.planData, updatedAt: new Date() } }, { upsert: true }); return NextResponse.json({ ok: true }) }
