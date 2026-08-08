import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Please log in first.' }, { status: 401 })
  const db = await connectMongo()
  await db.collection('subscriptions').updateOne(
    { userId: user._id },
    { $set: { plan: 'pro', status: 'active', updatedAt: new Date(), source: 'demo' }, $setOnInsert: { userId: user._id } },
    { upsert: true },
  )
  return NextResponse.json({ ok: true, plan: 'pro', demo: true })
}
