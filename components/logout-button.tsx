'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleLogout() {
    setBusy(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } finally {
      router.replace('/auth/login')
      router.refresh()
    }
  }

  return (
    <button type="button" className="secondary-button" onClick={handleLogout} disabled={busy}>
      <LogOut size={15} /> {busy ? 'Logging out…' : 'Log out'}
    </button>
  )
}
