import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'
export async function GET() { const user = await getCurrentUser(); if (!user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const db = await connectMongo(); const subscriptions = await db.collection('subscriptions').find({}).sort({ updatedAt: -1 }).limit(50).toArray(); return NextResponse.json({ subscriptions: subscriptions.map((item) => ({ ...item, _id: item._id.toString(), userId: item.userId.toString() })) }) }
