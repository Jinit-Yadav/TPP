import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'
import { LogOut, Sparkles } from 'lucide-react'
import { DownloadPlanPdf } from '@/components/download-plan-pdf'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?next=/dashboard')
  const db = await connectMongo()
  const [subscription, plans, progress] = await Promise.all([
    db.collection('subscriptions').findOne({ userId: user._id }),
    db.collection('study_plans').find({ userId: user._id }).sort({ updatedAt: -1 }).toArray(),
    db.collection('progress_entries').find({ userId: user._id }).toArray(),
  ])
  const plan = subscription?.status === 'active' ? subscription.plan : 'free'
  const minutes = progress.reduce((sum, item) => sum + Number(item.minutes || 0), 0)

  return <main className="min-h-screen bg-background">
    <header className="site-header"><Link href="/" className="brand-mark">study planner<span>.</span></Link><div className="flex items-center gap-3"><span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span><form action="/api/auth/logout" method="post"><button className="secondary-button"><LogOut size={15} /> Log out</button></form></div></header>
    <section className="dashboard-shell">
      <div className="dashboard-intro"><div><p className="eyebrow">Private workspace</p><h1 className="dashboard-title">Your saved plans.</h1><p className="auth-copy">Everything here belongs to your account.</p></div><div className="flex flex-wrap items-center gap-3"><Link href="/" className="primary-button"><Sparkles size={15} /> Generate a new plan</Link><div className="plan-badge"><Sparkles size={15} /> {plan.toUpperCase()} plan</div></div></div>
      <div className="metric-grid"><div className="metric-card"><span>Saved plans</span><strong>{plans.length}</strong><p>Your personal library</p></div><div className="metric-card"><span>Minutes logged</span><strong>{minutes}</strong><p>Progress recorded</p></div><div className="metric-card"><span>Access level</span><strong>{plan === 'free' ? 'Starter' : 'Pro'}</strong><p>{plan === 'free' ? 'Upgrade for full access' : 'All features unlocked'}</p></div></div>
      {plan === 'free' && <div className="premium-card mb-8"><p className="premium-label">Upgrade your workspace</p><h2 className="mt-2 font-mono text-2xl font-bold">Unlock your full study system.</h2><p className="mt-2 text-sm text-muted-foreground">Activate the Pro demo to save plans, track progress, and download PDFs.</p><Link href="/payment" className="primary-button mt-5">Unlock Pro</Link></div>}
      <section className="dashboard-grid"><div className="paper-card"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Plan library</p><h2 className="mt-1 font-mono text-2xl font-bold">Saved plans</h2></div></div>{plans.length ? <div className="mt-6 grid gap-3">{plans.map((saved) => <article key={String(saved._id)} className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between gap-4"><div><h3 className="font-semibold">{saved.title}</h3><p className="mt-1 text-xs text-muted-foreground">Updated {new Date(saved.updatedAt || saved.createdAt).toLocaleDateString()}</p></div><DownloadPlanPdf plan={saved.planData} title={saved.title} /></div></article>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">No saved plans yet. <Link href="/" className="font-semibold text-primary">Build your first plan</Link></div>}</div><div className="paper-card"><p className="eyebrow">Next step</p><h2 className="mt-1 font-mono text-2xl font-bold">Plan with purpose.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Generate a schedule that balances your subjects by difficulty and keeps your workload realistic.</p><Link href="/" className="secondary-button mt-6">Open planner</Link></div></section>
    </section>
  </main>
}
