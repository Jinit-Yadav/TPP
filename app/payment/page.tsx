'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, FlaskConical } from 'lucide-react'

export default function PaymentPage() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function activateDemo() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/demo-upgrade', { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401) return router.push('/auth/login?next=/payment')
      if (!response.ok) { setError(data.error || 'Demo activation failed.'); setBusy(false); return }
      router.push('/payment/success?demo=1')
    } catch { setError('Unable to activate the demo subscription. Please try again.'); setBusy(false) }
  }
  return <main className="auth-shell"><section className="auth-card"><p className="eyebrow">Subscriber feature preview</p><h1 className="auth-title">Test Pro access.</h1><p className="auth-copy">This is a no-payment demo. Activate Pro on your own account to preview exactly what a subscriber sees.</p><div className="metric-card mt-8"><span>Demo subscription</span><strong>₹0</strong><p>No card, UPI, or real payment is collected. Your account is upgraded in the test database only.</p></div><ul className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground"><li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Unlimited saved study plans</li><li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Personal progress workspace</li><li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Downloadable plan PDFs</li></ul>{error && <p className="mt-5 text-sm text-destructive">{error}</p>}<button className="primary-button mt-8 w-full" onClick={activateDemo} disabled={busy}>{busy ? 'Activating Pro demo…' : 'Activate Pro demo'} <ArrowRight size={16} /></button><p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><FlaskConical size={14} /> Test-only subscription. No payment is processed.</p></section></main>
}
