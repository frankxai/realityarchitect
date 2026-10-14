# Contributing to Reality Architect

Reality Architect is an open, MIT-licensed practice for architecting a life, plus the site at https://www.realityarchitect.ai. This file says how to take part. Updated 14 Oct 2026.

## Ways to take part

- **Use it and tell us what broke.** Run [/assess](https://www.realityarchitect.ai/assess) or the [/apply](https://www.realityarchitect.ai/apply) audit, then [open an issue](https://github.com/frankxai/realityarchitect/issues/new/choose) if something is wrong, unclear or a dead end.
- **Improve the method.** Suggest edits to the `reality.md` standard (`standard/`), the starter templates (`starter/`) or the method pages. Use the "Method feedback" issue template, or send a small pull request.
- **Fix the site.** Small, focused pull requests are welcome. Look for issues labelled `good first issue` or `help wanted`.

There is no forum or chat yet. GitHub issues are the one public channel.

## Before you open a pull request

1. Read [AGENTS.md](AGENTS.md). It maps the repo and the rules agents and humans follow here.
2. Keep the change small: one purpose, a few files.
3. Run the gate locally with Node 24 and pnpm 11.5.0:

   ```sh
   pnpm install --frozen-lockfile
   pnpm gate
   ```

4. Some files are protected surfaces (the homepage, `lib/site.ts`, `components/Nav.tsx`, `components/Footer.tsx`, `app/layout.tsx`, `app/globals.css`). A change there needs a surface change brief in the PR body. See `.github/protected-surfaces.json`.

## Copy rules

- No invented numbers, counters, testimonials or outcome claims. Every number needs a source and a date.
- Label future plans as planned. Don't describe something as live until it is.
- Never commit anyone's personal `reality.md` or `soul.md`.

## Security

Please don't post vulnerability details in a public issue. Open an issue that asks for a private contact, and we'll reply there.

## Licence

By contributing, you agree that your contribution is released under the [MIT License](LICENSE).
