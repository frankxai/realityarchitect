# ADR-001 — Passkey accounts and Studio Cloud keys

- **Status:** superseded 2026-10-06 by [ADR-003](ADR-003-your-agent-your-keys-your-storage.md) (proposed). Frank's
  product doctrine rules out multi-tenant hosting, so do not build this stack. It was accepted on 2026-10-05 under
  Frank's delegation (FRONTIER §11) as workstream B of the product-fundamentals handoff. It is kept as history.
- **Decision:** Better Auth with `@better-auth/passkey` (1.7.x), self-hosted on Vercel (`fra1`) with Postgres on Neon
  Frankfurt. The end-to-end encryption layer is ours, on the client.

## Context

- Accounts exist only for what needs the cloud: Studio Cloud sync, renders, and paid plans. Free never needs one.
- Sign-in is passkey-only.
- Studio Cloud must be end-to-end encrypted. The client derives a key-encryption key from the WebAuthn **PRF** output
  of the very passkey the person signs in with, so the server can never read their practice.
- Entitlements come from Polar.
- Privacy and EU residency matter.

## Options weighed (sources in the research brief, checked 2026-10-05)

| Option | Client PRF access | Verdict |
| --- | --- | --- |
| **Better Auth + passkey plugin** | **Yes.** `signIn.passkey()` and `passkey.addPasskey()` accept `extensions` and return `clientExtensionResults`, which are stripped before the server POST. One prompt both signs in and unlocks | **chosen**: MIT, our tables in our region, Next 16 `proxy.ts` documented, official Polar plugin, very active (joined Vercel 2026-07) |
| SimpleWebAuthn, self-built | Yes | runner-up: the same engine, but we would own sessions, CSRF and rate limits ourselves |
| Supabase Auth passkeys | Partial (two-step API) | beta since 2026-05, "may change without notice" |
| Auth.js v5 WebAuthn | No | marked experimental; the project is in maintenance mode |
| Clerk | No | no PRF; passkeys only on paid plans; US-only residency |

## The design

1. **Sign-up (passkey-first).**
   - Call `addPasskey` with `prf.eval.first = SALT_V1`, a fixed, versioned app salt.
   - If PRF returns nothing at create time (the spec allows that), run an immediate `get` restricted to the new
     credential.
   - Generate a random AES-256 data key in the browser.
   - Wrap it with HKDF(PRF, `"ra/studio-cloud/kek/v1"`) and upload only `{credentialId, wrappedDataKey}`.
2. **Recovery key (mandatory before sync starts).** 24 words, 256-bit. It is used two ways:
   - HKDF → a recovery wrapping key; a second wrapped copy of the data key is uploaded.
   - HKDF → an Ed25519 key pair; only the public key is uploaded.
3. **Sign-in.**
   - One `signIn.passkey` with PRF.
   - Unwrap the data key for that credential and keep it as a non-extractable `CryptoKey` in memory only.
4. **A second device.** A synced passkey gives the same PRF, so nothing more is needed. Across ecosystems, sign in by
   QR (hybrid), add a local passkey, and wrap the data key for it.
5. **Recovery.**
   - The person signs a server challenge with the recovery key; the server grants a session limited to registering a
     passkey.
   - The client unwraps with the recovery key and rewraps for the new passkey.
6. **No-PRF authenticators** (some Bitwarden, Edge, Dashlane and NordPass setups, and Windows before February 2026).
   They still sign in, then unlock with the recovery key, or stay local-only. The recovery path is required, not a
   nicety.
7. **Entitlements.** `createCustomerOnSignUp: false`. Read server-side via Polar's customer state by external ID.
8. **Email.** Better Auth v1 requires a unique `user.email`. Passkey-only accounts store `<uuid>@users.invalid` until
   the person adds a real one for receipts.

## Risks and how they are met

- **A WebAuthn spec co-editor warns against encrypting data with passkeys** (Cappalli, 2026-02-27): a deleted passkey
  can mean lost data. We answer with:
  - envelope encryption (passkeys wrap a data key; they never encrypt the data);
  - a mandatory recovery key;
  - `/.well-known/passkey-endpoints` with `prfUsageDetails`, so password managers warn before deletion;
  - in-app warnings;
  - the Obsidian export as the person's own plaintext backup.
- **Fragmented PRF support.** Hence the recovery-key unlock. Re-test the support matrix ourselves before launch; the
  vendor matrix is a starting point, not proof.
- **Library pinning.** `@better-auth/passkey` 1.7.7 pins `@simplewebauthn/server` ^13. Two moderate advisories fixed
  in v14 concern attestation revocation. Use attestation `none`, pin exact versions, and track updates.
- **Web E2EE trusts the served JavaScript.** Mitigated by a strict CSP, no third-party scripts, SRI where applicable,
  and keys held only in memory.
- **Conditional UI (autofill) with PRF is unverified.** Test it, and fall back to an explicit button.

## Consequences

- **New dependencies:** `better-auth`, `@better-auth/passkey`, the Polar Better Auth plugin, and a Postgres driver.
  Install with pnpm only when the workstation has at least 4 GiB free.
- **New infrastructure:** a Neon project in Frankfurt (free tier to start). **Frank's button:** creating the Neon
  project and the Vercel environment variables.
- `rpID` is `realityarchitect.ai`. Previews use a separate rpID and cannot unlock production keys, by design.
