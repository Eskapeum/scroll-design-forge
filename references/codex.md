# Harness capabilities and Codex

Read this when the active harness is Codex or when asset tools differ from a
previous build. Tool availability is discovered in the current session, not
inferred permanently from a product name.

## Select the supported route

1. Inventory supplied assets and the image/video tools actually available.
2. Read the selected tool's own instructions before using it. On Codex, when
   the built-in image tool is available, read the installed `imagegen` skill;
   it owns invocation, image references, editing and output handling.
3. Identify missing capabilities before committing to a concept. A scrub or
   worldflight needs suitable clips; images alone do not satisfy that contract.
4. If there is no authorized video source, offer supplied footage, an available
   approved generation route, or a revised still-based concept. Do not silently
   replace a requested clip with a still or install a provider without authority.

Do not require an API key for a built-in tool that does not need one. Conversely,
a subscription tool is not permission for unlimited retries: agree a useful
iteration bound and respect usage limits. Follow the active provider's cost and
approval requirements; never relabel estimated usage as measured spend.

## Image direction

Keep a shared art-direction record: product identity, material treatment,
palette, grade and the lighting relationships that must remain consistent.
Allow lens, framing, aspect ratio and composition to vary by shot purpose.
Read [assets.md](assets.md) for the asset contract and [worlds.md](worlds.md)
for examples of art direction.

- Attach real product/packaging references when available. Do not invent a
  replacement for a missing brand-critical asset without asking.
- Request text-safe space only for images that will sit behind copy. An
  editorial image in its own column has a different composition contract.
- Keep essential copy, labels and controls in semantic HTML. Authentic text on
  supplied packaging is not a reason to remove the real asset.
- Inspect actual output dimensions and image quality. Previously observed
  resolutions and provider styles are not fixed capabilities.
- Keep originals; copy chosen outputs into the build's assets directory.
  Reference build-relative assets, never a temporary tool-output directory.
- Record source, chosen file, dimensions, intended use and provenance in the
  build manifest. Do not promise deterministic pixels merely because a seed exists.

For transparency or edits, use the image tool's current supported workflow.
The bundled `knockout.py` is optional for existing flat-background images;
inspect originals and preserve them. Do not assume another skill's helper
script or save path exists without checking it.

## Existing installations

The user-requested directory is the source of truth for this task. An installed
copy may be a separate snapshot or a symlink. Inspect before updating it, preserve
local divergence, and avoid recursive deletion as an installation procedure.
Do not change harness configuration to make an old recipe run.

Skill discovery and CLI flags vary by version. Consult installed help/docs and
the current skill catalog if discovery fails. Do not treat one machine's
symlink behavior, model roster or output sizes as universal facts.

## Verification and handoff

Asset source does not change the semantic markup, static fallback, keyboard,
mobile or identity requirements in [verify.md](verify.md). State which route
was used and any requested effect that remains blocked. A different harness is
not evidence that the page works on a real phone.
