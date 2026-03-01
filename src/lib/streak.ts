/** Check streak status against last active date */
export function checkStreak(lastDate: string | null): { reset: boolean; increment: boolean } {
  if (!lastDate) return { reset: false, increment: true }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(lastDate + 'T00:00:00')
  const diffMs = today.getTime() - last.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Same day — no increment
    return { reset: false, increment: false }
  }
  if (diffDays <= 2) {
    // 1-2 days gap — 48h freeze window preserves streak
    return { reset: false, increment: true }
  }
  // 3+ days — streak resets
  return { reset: true, increment: true }
}
