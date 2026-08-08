import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'
export async function GET() { const user = await getCurrentUser(); if (!user) return NextResponse.json({ plan: 'free' }, { status: 401 }); const db = await connectMongo(); const subscription = await db.collection('subscriptions').findOne({ userId: user._id }); return NextResponse.json({ plan: subscription?.status === 'active' ? subscription.plan : 'free' }) }
