import Link from 'next/link'
import { LockKeyhole } from 'lucide-react'

export function ProGate({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  if (!locked) return children
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="pointer-events-none select-none blur-[3px] opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-6 text-center backdrop-blur-sm">
        <LockKeyhole className="text-primary" size={22} />
        <strong className="mt-3 font-mono text-sm">Pro feature locked</strong>
        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Upgrade your workspace to unlock this feature.</p>
        <Link href="/payment" className="primary-button mt-4">View Pro demo</Link>
      </div>
    </div>
  )
}
