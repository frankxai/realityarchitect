# Polar setup: The Imaginal Act — Complete Edition

These are the exact settings, so the launch takes minutes once the organization can take payments. Claude can create
the product through the Polar connector after Frank says yes. Going live is Frank's click.

## 0. Before anything (Frank)

- Today the connected account has one organization, `arcanea`, created 2026-07-13. Its onboarding is incomplete:
  `checkout_payments`, `payouts` and `refunds` are all false.
- Create the organization **Reality Architect**:
  - slug `realityarchitect`;
  - website `https://www.realityarchitect.ai`;
  - support email on that domain.
- Complete onboarding: business details, identity, and a payout account.
- Its fee is 5% + 50¢ per sale (+1.5% for non-US cards), because it is created after 27 May 2026.

## 1. Product

| Field | Value |
| --- | --- |
| Name | The Imaginal Act — Complete Edition |
| Type | One-time purchase |
| Price | **USD 39.00**, fixed |
| Visibility | Public, once the files are attached and tested in the sandbox |
| Description | Guided rehearsal audio (14 tracks, about 73 minutes), *The Honest Canon* (PDF and EPUB), the printable 30-day journal (A4 and Letter), and the Reality Architect vault for Obsidian. Every update is included. A refund within 30 days needs no reason. The narration is a synthesized voice, and the music is original. No outcome is promised. |
| Metadata | `product: complete-edition`, `program: imaginal-30` |

## 2. Benefit: File downloads (one benefit, these files)

| File | Built by |
| --- | --- |
| `the-imaginal-act-audio-mp3.zip` (14 MP3s) | `node scripts/audio/build.mjs --scripts <audio-scripts> --out <dir> --music <beds> --voice <id>` |
| `the-imaginal-act-audio-companion.m4b` (chapters) | same run |
| `the-honest-canon.epub` | `node scripts/book/build-book.mjs --src <honest-canon> --out <dir>` |
| `the-honest-canon.pdf` | print the book HTML to PDF (Chrome headless), or Typst later |
| `imaginal-30-journal-a4.pdf`, `imaginal-30-journal-letter.pdf` | `node scripts/journal/build-journal.mjs --out <dir> --paper a4\|letter --browser <chrome>` |
| `reality-architect-vault.zip` (includes the audio and a listening plan) | `node scripts/vault/build-vault.mjs --out <zip> --audio <mp3 dir>` |
| `LICENSE.txt` | the text in §5 below |

Polar allows up to 10 GB per file, and each buyer gets a personal signed link.

## 3. Discount

| Field | Value |
| --- | --- |
| Name / code | Launch · `LAUNCH` |
| Amount | USD 10 off, once |
| Starts / ends | launch day / launch day + 7 days |
| Max redemptions | 500 |
| Products | Complete Edition only |

Announce it exactly like that: "$10 off for the first week, code LAUNCH". There is no countdown and no fake
scarcity.

## 4. Checkout link

- **Product:** the Complete Edition.
- **Success URL:** `https://www.realityarchitect.ai/programs/imaginal-30/complete/thanks`. That page lists the files,
  links to the buyer's Polar portal, says where to begin (day 1), and covers a missing email. It is never indexed and
  shows "Nothing to collect here yet" while the edition is closed.
- **Metadata:** `source: site`. Create a second link with `source: newsletter` for the email.
- **Benefit description:** paste the body printed by `node scripts/check-edition-launch.mjs` into the File Downloads
  benefit, and keep it as the reply template for "where are my files?". Polar sends the receipt and the download email
  itself; the site sends no email and holds no key.

## 5. LICENSE.txt (personal licence)

```
The Imaginal Act — Complete Edition. © Frank Riemer. Licensed to the buyer for personal use: listen, read, print and
keep copies on your own devices. Please do not share, resell or republish the files. Coaches and teachers: ask about
the Guide licence. The narration is a synthesized voice made with ElevenLabs; the music is original. This is a
practice of attention and rehearsal, not medical, psychological or financial advice, and it promises no outcome.
Refunds within 30 days, no questions: reply to your receipt.
```

## 6. Test before going live

1. Sandbox: create the same product and buy it with a test card.
2. Check that every file downloads and opens: an MP3 on a phone, the M4B in Apple Books, the EPUB in Apple Books and
   on a Kindle via Send to Kindle, the vault in Obsidian on a desktop and a phone, and both journal PDFs printed at
   100%.
3. Test a refund from the sandbox portal.
4. Then go live and flip the switch (§7).

## 7. The switch

The whole sale sits behind one object, `COMPLETE_EDITION` in `lib/programs/complete-edition.ts`. There are no
environment variables and no keys: Polar holds the money, the files and the emails.

| Field | Set to |
| --- | --- |
| `checkoutUrl` | the live checkout link, `https://buy.polar.sh/polar_cl_…` (§4) |
| `portalUrl` | `https://polar.sh/realityarchitect/portal` (the organization slug from §0) |
| `supportEmail` | a real inbox on the domain that someone reads |
| `open` | `true` |

`node scripts/check-edition-launch.mjs` names whatever is still missing; `isOpen()` stays false until all four are
right, and the tests fail if `open` is true while anything is missing.

Flipping it changes, in one deploy:

- `/programs/imaginal-30/complete`: shows the $39 price, the checkout button, what happens after paying, the file list,
  the licence line, the refund terms and the support address; becomes indexable; joins the sitemap.
- `/programs/imaginal-30`: the Complete Edition card links to the page with the price instead of "In production".
- `/programs/imaginal-30/complete/thanks`: shows the delivery page instead of "Nothing to collect here yet".
- `scripts/check-built-pages.mjs` switches from "no price, no checkout" to "the checkout and portal links are present".

Turning it off again is `open: false`; nothing else needs to change.

