import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStripe, PRO_PRICE_INR } from '@/lib/stripe'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const origin = new URL(request.url).origin
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price_data: { currency: 'inr', product_data: { name: 'Study Planner Pro' }, unit_amount: PRO_PRICE_INR }, quantity: 1 }], customer_email: user.email, metadata: { userId: String(user._id), plan: 'pro' }, success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/payment` })
  return NextResponse.json({ url: session.url })
}
