#!/usr/bin/env node
/**
 * Before flipping the Complete Edition open: lists what is still missing in lib/programs/complete-edition.ts, the
 * success URL to give the Polar checkout link, and the confirmation copy to paste into the File Downloads benefit.
 * Read-only; it calls nothing. Exits 1 when `open: true` is set but the edition would still stay closed.
 *
 *   node scripts/check-edition-launch.mjs
 */
import { COMPLETE_EDITION, THANKS_PATH, confirmationEmail, isOpen, launchGaps } from '../lib/programs/complete-edition.ts'

const gaps = launchGaps()
console.log(`Complete Edition: open flag ${COMPLETE_EDITION.open ? 'ON' : 'OFF'}, ${isOpen() ? 'on sale' : 'not on sale'}`)
console.log(gaps.length ? `Missing before it can open:\n- ${gaps.join('\n- ')}` : 'Every link and address is in place.')
console.log(`\nPolar checkout link success URL: https://www.realityarchitect.ai${THANKS_PATH}`)
const email = confirmationEmail()
console.log(`\nConfirmation copy\nSubject: ${email.subject}\n\n${email.body}`)
if (COMPLETE_EDITION.open && gaps.length) {
  console.error('\n✗ open is true, but the edition stays closed until the gaps above are fixed.')
  process.exit(1)
}
