import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { connectMongo } from '@/lib/mongodb'
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, LogOut, Sparkles } from 'lucide-react'
import { DownloadPlanPdf } from '@/components/download-plan-pdf'
import { DeletePlanButton } from '@/components/delete-plan-button'

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
  const latestPlan = plans[0]

  return (
    <main className="min-h-screen bg-background">
      <header className="site-header border-b border-border/70">
        <Link href="/" className="brand-mark">study planner<span>.</span></Link>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:inline">{user.email}</span>
          <form action="/api/auth/logout" method="post">
            <button className="secondary-button"><LogOut size={15} /> Log out</button>
          </form>
        </div>
      </header>

      <section className="dashboard-shell">
        <div className="dashboard-hero">
          <div className="max-w-2xl">
            <p className="eyebrow">Private workspace</p>
            <h1 className="dashboard-title">Make your next study session count.</h1>
            <p className="auth-copy">Your plans, progress, and next steps are organized here so you can focus on the work instead of the setup.</p>
          </div>
          <div className="dashboard-actions">
            <Link href="/" className="primary-button"><Sparkles size={15} /> Generate a new plan</Link>
            <div className="plan-badge"><span className="status-dot" /> {plan.toUpperCase()} plan</div>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card"><div className="metric-icon"><BookOpen size={17} /></div><span>Saved plans</span><strong>{plans.length}</strong><p>Your personal library</p></div>
          <div className="metric-card"><div className="metric-icon"><Clock3 size={17} /></div><span>Minutes logged</span><strong>{minutes}</strong><p>Progress recorded</p></div>
          <div className="metric-card"><div className="metric-icon"><Sparkles size={17} /></div><span>Access level</span><strong>{plan === 'free' ? 'Starter' : 'Pro'}</strong><p>{plan === 'free' ? 'Upgrade for full access' : 'All features unlocked'}</p></div>
        </div>

        {plan === 'free' && <div className="premium-card dashboard-upgrade"><div><p className="premium-label">Unlock the complete system</p><h2 className="mt-2 font-mono text-2xl font-bold">Turn your plan into a practice.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Activate Pro to save unlimited plans, track study progress, expand your full timetable, and download PDFs.</p></div><Link href="/payment" className="primary-button shrink-0">Unlock Pro <ArrowUpRight size={15} /></Link></div>}

        <section className="dashboard-grid">
          <div className="paper-card dashboard-panel">
            <div className="panel-heading"><div><p className="eyebrow">Plan library</p><h2 className="mt-1 font-mono text-2xl font-bold">Saved plans</h2></div><CalendarDays className="text-primary" size={21} /></div>
            {plans.length ? <div className="mt-6 grid gap-3">{plans.map((saved) => <article key={String(saved._id)} className="plan-list-item"><div className="plan-list-icon"><BookOpen size={16} /></div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{saved.title}</h3><p className="mt-1 text-xs text-muted-foreground">Updated {new Date(saved.updatedAt || saved.createdAt).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><DeletePlanButton planId={String(saved._id)} /><DownloadPlanPdf plan={saved.planData} title={saved.title} /></div></article>)}</div> : <div className="empty-workspace"><BookOpen size={20} /><p>No saved plans yet.</p><Link href="/" className="font-semibold text-primary">Build your first plan</Link></div>}
          </div>

          <div className="dashboard-side">
            <div className="paper-card dashboard-panel next-panel"><p className="eyebrow">Next step</p><h2 className="mt-1 font-mono text-2xl font-bold">Keep the rhythm.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{latestPlan ? 'Open your latest plan and keep building consistency one focused session at a time.' : 'Generate a schedule that balances your subjects by difficulty and keeps your workload realistic.'}</p><Link href={latestPlan ? '/' : '/'} className="secondary-button mt-6">Open planner <ArrowUpRight size={15} /></Link></div>
            <div className="quiet-note"><span className="status-dot" /><div><strong>Your workspace is private</strong><p>Only plans belonging to your account appear here.</p></div></div>
          </div>
        </section>
      </section>
    </main>
  )
}
