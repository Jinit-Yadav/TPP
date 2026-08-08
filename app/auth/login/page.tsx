'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      const message = authError.message.toLowerCase()
      setError(message.includes('invalid') || message.includes('credentials') ? 'Invalid email or password.' : message.includes('load failed') || message.includes('failed to fetch') ? 'Unable to reach the authentication service. Please refresh and try again.' : authError.message)
    } else router.push('/dashboard')
    setBusy(false)
  }
  return <main className="auth-shell"><div className="auth-card"><Link href="/" className="brand-mark">study planner<span>.</span></Link><p className="eyebrow mt-10">Member workspace</p><h1 className="auth-title">Welcome back.</h1><p className="auth-copy">Sign in to pick up where you left off.</p><form onSubmit={submit} className="auth-form"><label>Email<input className="subject-input w-full" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input className="subject-input w-full" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="error-box">{error}</p>}<button className="primary-button w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="auth-footer">New here? <Link href="/auth/sign-up">Create a free account</Link></p></div></main>
}
