import Stripe from 'stripe'

// Stripe enforces a minimum converted charge of $0.50; ₹50 is the lowest practical INR test price.
export const PRO_PRICE_INR = 5000
export function getStripe() { const key = process.env.STRIPE_SECRET_KEY; if (!key) throw new Error('STRIPE_SECRET_KEY is not configured'); return new Stripe(key, { apiVersion: '2026-07-29.dahlia' }) }
