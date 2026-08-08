import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function PaymentSuccess() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?next=/payment')
  return <main className="auth-shell"><section className="auth-card text-center"><p className="eyebrow">Demo activated</p><h1 className="auth-title">Pro features are unlocked.</h1><p className="auth-copy mx-auto">Your test subscription is active. You can now save plans, see them in your workspace, track progress, and download PDFs.</p><div className="mt-8 flex gap-3"><Link className="primary-button" href="/dashboard">Open workspace</Link><Link className="secondary-button" href="/">Back to planner</Link></div></section></main>
}
