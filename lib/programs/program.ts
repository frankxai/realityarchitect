/** The 30-day program's shape: pure constants, safe to import anywhere (no file system). */

export const SLUG = 'imaginal-30'
export const DAYS = 30
export const LOOPS = ['morning', 'evening', 'weekly', 'monthly', 'decisions', 'pace'] as const

export const WEEKS = [
  { week: 1, name: 'See', first: 1, last: 7 },
  { week: 2, name: 'Bridge', first: 8, last: 14 },
  { week: 3, name: 'Witness', first: 15, last: 21 },
  { week: 4, name: 'Compound', first: 22, last: 30 },
] as const

export function weekOf(day: number): number {
  return WEEKS.find((week) => day >= week.first && day <= week.last)?.week ?? 0
}
