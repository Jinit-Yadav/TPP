import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'
import { getStripe } from '@/lib/stripe'

export default async function PaymentSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) { const user = await getCurrentUser(); if (!user) redirect('/auth/login'); const { session_id } = await searchParams; if (session_id) { const stripe = getStripe(); const session = await stripe.checkout.sessions.retrieve(session_id); if (session.payment_status === 'paid' && session.metadata?.userId === String(user._id)) { const db = await connectMongo(); await db.collection('subscriptions').updateOne({ userId: user._id }, { $set: { userId: user._id, plan: 'pro', status: 'active', updatedAt: new Date() } }, { upsert: true }) } } return <main className="auth-shell"><section className="auth-card text-center"><p className="eyebrow">Payment confirmed</p><h1 className="auth-title">Pro is unlocked.</h1><p className="auth-copy mx-auto">Your account now has access to the full study planner workspace.</p><Link href="/dashboard" className="primary-button mt-8 inline-flex">Open workspace</Link></section></main> }
