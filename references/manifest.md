# Build manifest

Use `build.json` for a new build or substantial revision. For a narrow repair,
update existing project records rather than creating a parallel source of truth.
Review-only requests may describe missing evidence without writing a manifest.
This records decisions and evidence; it does not generate the page DOM.

## Minimal identity

The server and screenshot tools read `buildId` and `revision`. Keep both
nonempty and stable for one reviewed artifact; change revision after edits.

```json
{
  "schemaVersion": 1,
  "buildId": "sample-product",
  "revision": "r1",
  "mode": "create",
  "assets": [],
  "decisions": [],
  "approvals": [],
  "budget": {
    "currency": "USD",
    "approvedLimit": null,
    "estimatedTotal": 0,
    "recordedCharges": 0,
    "unreconciledAttempts": []
  },
  "verification": {
    "status": "INCOMPLETE",
    "reports": [],
    "unverified": ["Real phone"]
  }
}
```

`approvedLimit: null` means no monetary authorization recorded, not unlimited
spending. Zero means no paid generation. The entry records the user's approval;
writing the file is not itself approval. Provider-specific stricter gates remain
in force.

Add matching markup:

```html
<meta name="scroll-forge-build-id" content="sample-product">
<meta name="scroll-forge-revision" content="r1">
```

Pass `--manifest /absolute/path/build.json` to `serve.mjs` and `shoot.mjs`.
Header-only identity proves server configuration, not the contents of every
file. Record whether asset hashes were actually checked.

## Asset and decision records

For each delivered asset, record a build-relative path, SHA-256 when frozen,
source (supplied/generated/derived), actual dimensions/duration, role, original
reference, generation attempt ID if applicable, and mobile counterpart.
Do not put credentials, signed private URLs or sensitive provider responses here.
Hash the final encoded/delivered file, not only its master. Update the revision
and hashes when bytes change.

For each material decision, record the reason and its class:
- **hard:** truth, user authority, accessibility or functional requirement;
- **conditional:** a chosen runtime architecture's technical contract;
- **preference:** aesthetic direction that may be changed to fit the brief.

Record intentional reuse, grammar variants and approved deviations with their
reason. A preference exception does not waive safety or functionality.
Record approvals with scope, ceiling and the user's actual authorization; never
invent an approval message or backfill it from a successful tool call.

## Recovery and evidence

Keep generation attempts traceable, including rejected outputs and uncertain
billing. An errored or interrupted paid request is not automatically safe to
retry. Chain execution keeps its own attempt state; link it from this manifest
rather than silently resetting history. Its
`chain/.scroll-forge-attempts/legNN-attemptNN.json` reservations are estimates,
not proof of charges. Reconcile them against provider accounting before setting
`recordedCharges`; retain uncertain attempts explicitly. See
[assets.md](assets.md#8-chains-and-recovery) for local resume, recovery and review
controls. Updating the manifest alone does not change the chain journal's state.

Verification status starts INCOMPLETE. Store report paths, revision, scope,
measured results and unverified cases. Do not set PASS from a command's exit code
alone; an exploratory report-only run can exit zero while remaining incomplete.
Do not assert measured human emotion, conversion or device behavior from a
screenshot report.
