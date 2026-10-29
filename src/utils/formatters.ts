/** { min: 14, max: 16 } → "14–16", { min: 5, max: 5 } → "5" */
export function formatRange({ min, max }: { min: number; max: number }): string {
  return min === max ? String(min) : `${min}–${max}`
}

/** Timestamp → "10:32 AM" */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
