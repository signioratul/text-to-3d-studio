# Form3D frontend UI update

This archive contains replacement frontend files and the shark background source.

## Apply

1. Back up your current project or commit it to Git.
2. Extract this archive into the root of your Form3D project, allowing files to merge/overwrite.
3. Keep your existing `hooks/`, API routes, backend, generation code, `public/`, and package files unchanged.
4. Run:

```powershell
npm run dev
```

## Files included

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `components/InteractiveBackground.tsx`
- `components/PromptForm.tsx`
- `components/ModelViewer.tsx`
- `components/StatusPanel.tsx`
- `components/DownloadButton.tsx`
- `components/SampleGallery.tsx`
- `components/ascii-sharks/*` (source from the supplied shark-background archive)

No new npm packages are required.

## Notes

- The background uses `mountSharkBackground({ theme: "auto" })`, which follows the OS light/dark preference and sets `data-theme` on the document root.
- The CSS in this update includes the shark canvas styles directly. Do not additionally import the supplied `shark-background.css`, because that file defines generic `html, body` and theme variables that would override the app's design tokens.
- Generation hooks, request logic, routes, GLB loading, retry behavior, and API integrations are not changed.
