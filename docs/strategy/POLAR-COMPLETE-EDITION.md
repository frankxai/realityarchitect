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
- **Success URL:** `https://www.realityarchitect.ai/programs/imaginal-30/1?from=complete`. The buyer starts the
  practice at once, and the files arrive by email and in the Polar portal.
- **Metadata:** `source: site`. Create a second link with `source: newsletter` for the email.
- **Site:** paste the link into `lib/programs/complete-edition.ts` as `checkoutUrl`, set `open: true`, and open a PR.
  The tests refuse any URL that is not Polar's hosted checkout.

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
4. Then go live, paste the link, and flip the flag.
