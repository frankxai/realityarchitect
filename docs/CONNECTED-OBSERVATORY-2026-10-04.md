# Connected Observatory

Built on SIP. Optional connected evidence desk at `/observatory/workspace`; the existing `/studio` remains offline-first and is never imported automatically.

## Implemented

- Supabase email signup, confirmation-dependent access, login, logout and password recovery.
- Owner-scoped evidence storage, removal and JSON export. Sources, method, uncertainty and next tests remain distinct. No automatic source retrieval or verification.
- AI SDK 7 structured reviews through Vercel AI Gateway: OpenAI GPT-6.1 Sol or Anthropic Claude Sonnet 5.5. Model IDs checked against the live Gateway catalog on 2 October 2026.
- Supabase `ra_runs` reserves at most five attempts per verified account and fifty across this product per UTC day. Failed attempts retain slots. One recent outstanding reservation per account. Record cap 200. These are capacity controls, not purchased credits or a dollar budget.
- Eve 0.69 guardian discussions, resumed by owned session ID. Internal routes accept project OIDC only. The app proxy verifies Supabase identity and checks session ownership on every continuation, stream and cancellation. It strips attachments, forwarded identity, context, unsupported controls and budget approvals.
- No guardian tools, connections, schedules or subagents; confirmed in Eve's compiled summary. Each model call caps output at 1,600 tokens. A conservative 128,000-token context setting stays below the catalog's 1,050,000-token context; session input budget is 16,000. Virtual just-bash workspace, no externally provisioned sandbox compute. No private model inputs or outputs in OpenTelemetry; Workflow session history still persists submitted content.

## Database deployment and review

The additive `reality_studio` migration was applied on 2 October 2026 to the existing Starlight Platform project (`gfrfcqyprekhazzugdkr`). Its migration history is mirrored exactly in `supabase/migrations/20261002213058_reality_studio.sql`. Shared Clerk principal and tenancy tables were not modified. This product's current accounts are separate Supabase identities; estate-wide SSO and organizations remain future work.

`supabase/tests/reality_studio_rls.sql` passed against the real database on 4 October; all fixtures rolled back. It verifies anonymous denial, owner isolation, ownership transfer denial, foreign review/completion denial, concurrent reservation rejection, and retention of failed-attempt quota.

Supabase's advisor flags the two intentionally authenticated SECURITY DEFINER RPCs. Each has an empty search path, explicit auth checks, no caller-supplied owner, and revoked PUBLIC/anon execution. They provide atomic capacity enforcement without granting clients quota-table writes. Receipts can be authored by their owning user through the completion RPC; they are explicitly not cryptographic provider-execution evidence. See [advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). The existing curator usage table also has an informational no-policy finding; it is unrelated and remains server-mediated.

## Configuration

Public Supabase URL and modern publishable key are included in `lib/platform-public.json` (not secrets). Environment overrides: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No service-role key or provider key is used or committed. On Vercel, AI Gateway and internal Eve calls use project OIDC. Local model calls require an authorized Gateway credential or local Vercel OIDC.

Set `RA_AI_ENABLED=false` to pause new review and guardian requests while retaining evidence, streams and cancellation. Gateway funding is not verified by model-catalog availability or a successful build. ChatGPT subscription credits are not assumed transferable to this deployment.

Supabase Auth must allow the production confirmation/reset redirect `https://www.realityarchitect.ai/observatory/workspace` and the approved preview origin. Verify email delivery/SMTP before public onboarding. The connector does not expose Auth configuration, and Vercel returned 403 for project environment access. No new paid project, credit purchase or subscription was created.

## Release evidence and remaining checks

Local typecheck, public claims, 198 tests, Next production build and Eve build passed. Database security tests passed. Seven new UI files passed the mechanical guidelines scan. Final audit found no known vulnerabilities after overriding vulnerable transitive Undici versions to 7.29.1.

Before promotion: exact-commit Vercel preview; email signup/confirmation/reset with an approved account; saved record ownership; live structured review and provider usage; guardian create/stream/resume/cancel and cross-user denial; desktop/mobile/reduced-motion interaction review. Production and domain changes follow the repository's human gate. Organization invitations, purchased credits/billing and autonomous protection are not implemented.
