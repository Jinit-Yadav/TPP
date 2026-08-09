import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCurrentUser, hasProAccess } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!(await hasProAccess(user._id))) return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
  const { id } = await params
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  const db = await connectMongo()
  const result = await db.collection('study_plans').deleteOne({ _id: new ObjectId(id), userId: user._id })
  if (!result.deletedCount) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
