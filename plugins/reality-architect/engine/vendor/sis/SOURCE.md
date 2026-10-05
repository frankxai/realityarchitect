# Vendored from Starlight Intelligence System

- **Source:** [frankxai/Starlight-Intelligence-System](https://github.com/frankxai/Starlight-Intelligence-System) at commit `5d4312c96b803d749f8ebefc68a91bd8f2299c5a` (MIT, © 2026 Frank Riemer).
- **Schemas:** `docs/reality-architecture/schemas/*.schema.json`, the Reality Architecture kernel v0.1.1. They are copied unchanged.
- **Validator:** `protocol/lib/jsonschema.mjs`. It has three added keywords (`minLength`, `minimum`, `maximum`), each marked `Reality Architect: added`, so it can be upstreamed as is.
- **Why vendored:** the plugin has no dependencies and runs offline. Pinning the bytes means a kernel change upstream is a deliberate update here, never a silent drift. `tests/kernel.test.mjs` checks these hashes.
- **To update:** copy the new files from SIS, update the commit and the hashes below, and run `node --test`.

| File | sha256 |
| --- | --- |
| `schemas/actualization-plan.schema.json` | `cdeaed4af03ab5885d44e9862a63c86a85c8d0f638bebcedf668cfea52808bbf` |
| `schemas/actualization-receipt.schema.json` | `b802a238b15ff6e10849a9468d35c901e73812ef0736c6b8c1c9378fed9b01f5` |
| `schemas/future-branch.schema.json` | `3c688974e5d8ca14b8ccb32e0918ba22248a31f1b6a30ab4a7d4073cb0559ce5` |
| `schemas/reality-diff.schema.json` | `b51292d89952ffac7753bbf0d62ed53b1cfcf12cbd4e72bada43d2fd14608d9a` |
| `schemas/reality-event.schema.json` | `3038952ff4d248edb9a788eb640183fc69424b5d3016925dbd3cae7bdc067534` |
| `schemas/reality-object.schema.json` | `169636e0c6f1895af46493186599f05c42b1c3fe04398fc661006d62aada322a` |
