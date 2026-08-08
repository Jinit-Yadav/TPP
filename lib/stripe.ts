import Stripe from 'stripe'

export const PRO_PRICE_INR = 2000
export function getStripe() { const key = process.env.STRIPE_SECRET_KEY; if (!key) throw new Error('STRIPE_SECRET_KEY is not configured'); return new Stripe(key, { apiVersion: '2025-03-31.basil' }) }
