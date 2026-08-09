'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function DeletePlanButton({ planId }: { planId: string }) {
  const [busy, setBusy] = useState(false)

  async function removePlan() {
    if (!window.confirm('Delete this saved plan? This cannot be undone.')) return
    setBusy(true)
    const response = await fetch(`/api/plans/${planId}`, { method: 'DELETE' })
    if (response.ok) window.location.reload()
    else setBusy(false)
  }

  return <button type="button" aria-label="Delete saved plan" title="Delete saved plan" className="icon-button" onClick={removePlan} disabled={busy}><X size={15} /></button>
}
