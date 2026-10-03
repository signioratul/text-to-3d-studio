# Decisions

Decision source: the workspace-level `docs/AGENT_BUILD_PROMPT.md` (the app repo has `AGENTS.md`, but no `AGENT.md`). Recorded 2026-10-02.

## Locked decisions

| ID | Decision | One-line rationale |
|---|---|---|
| D1 | TypeScript, Next.js App Router, Tailwind CSS | One application can include the UI and API routes and deploy on Vercel. |
| D2 | React Three Fiber, `@react-three/drei`, and Three.js | Declarative GLB loading and established orbit controls. |
| D3 | Client-orchestrated, stateless two-step pipeline; no database, Redis, or background jobs | Each generation step is a separate request and needs no job store. |
| D4 | GLB model format | A single binary can contain the model and embedded assets and is supported by Three.js. |
| D5 | Text-to-image followed by image-to-3D; choose models only after testing | The selected pipeline is evidence-based rather than assumed. |
| D6 | Tokens remain server-side in environment variables; never `NEXT_PUBLIC_*` | Prevent credentials from entering browser code or responses. |
| D7 | Vercel is the primary host; Render or an HF Docker Space are fallback options if blocked | Keep the planned deployment target while retaining documented alternatives. |
| D8 | Providers sit behind `ImageProvider` and `MeshProvider` adapters | Providers can be replaced without changing the route contract. |

## Vercel limits and route settings

VERIFIED on 2026-10-02 from current official documentation:

- [Vercel Function duration](https://vercel.com/docs/functions/configuring-functions/duration) and [Function limitations](https://vercel.com/docs/functions/limitations) list a 300-second maximum for Node.js/Next.js Functions on Hobby. The duration docs show App Router handlers configure this with `export const maxDuration = N`.
- Vercel documents a 4.5 MB maximum request or response payload for Functions. This project returns GLB bytes as a streamed `Response` because models can exceed that size; streaming success on Vercel is not inferred from local success.
- `app/api/mesh/route.ts` exports `runtime = "nodejs"` and `maxDuration = 300`.
- `/api/mesh` accepts an `imageUrl` string and passes it to the mesh provider; it does not accept image bytes in the request body.
- The current `.env.local` setting is `MESH_TIMEOUT_MS=240000`, 60 seconds below the 300-second route maximum.
- Config note: `.env.example` currently says `MESH_TIMEOUT_MS=300000`, which differs from the local value and is not below the 300-second maximum. It was not changed because this task is limited to these two documentation files.

## Large GLB evidence

VERIFIED: LOCAL production-server verification (user-provided evidence; not a Vercel deployment test):

| Check | Result |
|---|---|
| Source `public/samples/chest.glb` size | 16,580,240 bytes |
| HTTP status | 200 |
| `Content-Type` | `model/gltf-binary` |
| `Content-Length` | 16,580,240 |
| `X-Provider` | `MOCK` |
| Downloaded response size | 16,580,240 bytes |
| First four bytes | `glTF` |

UNVERIFIED / UNKNOWN: Vercel production deployment, function settings, and delivery of a GLB larger than 4.5 MB. Verify those during the later Phase 5 deployment task; local production-server evidence does not establish Vercel behavior.