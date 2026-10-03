# Progress

## 2026-10-02

### PHASE/TASK: Phase 5 / P5.1

DONE: Added `docs/DECISIONS.md` and this progress record. No application source, environment file, or deployment configuration was changed.

EVIDENCE:
- Current official Vercel docs checked 2026-10-02: Hobby Node.js/Next.js Function maximum is 300 seconds; Function request and response payload limit is 4.5 MB.
- `app/api/mesh/route.ts` exports `maxDuration = 300`, accepts `imageUrl`, and returns the provider stream with `Content-Type: model/gltf-binary` and `X-Provider`.
- Current local settings (HF_TOKEN intentionally omitted): `PROVIDER = mock`, `IMAGE_TIMEOUT_MS=120000`, `MESH_TIMEOUT_MS=240000`, `RATE_LIMIT_MAX=3`, `RATE_LIMIT_WINDOW_MIN=1`.
- VERIFIED, LOCAL production-server evidence supplied for this task: HTTP 200; `Content-Length: 16580240`; `Content-Type: model/gltf-binary`; `X-Provider: MOCK`; downloaded size 16,580,240 bytes; first four bytes `glTF`. Source sample size is 16,580,240 bytes.
- `npm run build`: PASS. Next.js 16.3.6 compiled, typechecked, generated the routes, and completed the production build. Warning: Next.js notes the parent workspace `package-lock.json` is outside this Git repository.
- `npm run lint`: PASS with 0 errors and 1 existing `@next/next/no-img-element` warning in `app/page.tsx`.
- `npm test`: PASS, 1 test file and 6 tests.

VERIFIED:
- Local production server returned the complete 16,580,240-byte mock GLB with the expected headers and `glTF` magic bytes (evidence above, supplied by the user).
- `.env.local`, `node_modules`, `.next`, and `scratch/` are ignored by Git.
- The new documentation files contain no HF token values.
- The rate limiter is in-memory and therefore best-effort only; serverless instances do not share its state.

ASSUMED:
- None.

UNVERIFIED / UNKNOWN:
- Vercel production deployment and Vercel delivery of a response larger than 4.5 MB have not been tested. This remains a later Phase 5 deployment task.
- `.env.example` has `MESH_TIMEOUT_MS=300000`, while current `.env.local` has `240000`; the example was not modified in this docs-only task.

NEXT: P5.1 documentation and local checks are complete. Wait for authorization before starting the later deployment task; no deployment was performed here.