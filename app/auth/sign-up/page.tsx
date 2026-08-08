'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter(); const supabase = createClient(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`, data: { display_name: name } } }); if (authError) setError(authError.message); else if (data.session) router.push('/dashboard'); else router.push('/auth/sign-up-success'); setBusy(false) }
  return <main className="auth-shell"><div className="auth-card"><Link href="/" className="brand-mark">study planner<span>.</span></Link><p className="eyebrow mt-10">Start with free</p><h1 className="auth-title">Make time count.</h1><p className="auth-copy">Create your workspace. An admin can unlock Pro or Team features later.</p><form onSubmit={submit} className="auth-form"><label>Display name<input className="subject-input w-full" required value={name} onChange={(e) => setName(e.target.value)} /></label><label>Email<input className="subject-input w-full" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input className="subject-input w-full" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="error-box">{error}</p>}<button className="primary-button w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button></form><p className="auth-footer">Already a member? <Link href="/auth/login">Sign in</Link></p></div></main>
}
