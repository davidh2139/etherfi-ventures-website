# Vercel deploy of ether.fi Ventures website

**Date:** 2026-05-05
**Linear:** [INF-146](https://linear.app/ether-fi/issue/INF-146/deploy-etherfi-ventures-website-to-vercel)
**Status:** Approved (design)

## Context

The ventures marketing site lives in `etherfi-protocol/ventures-website` (just transferred from `davidh2139/etherfi-ventures-website`). It is a Create React App SPA (`react-scripts` 5.0.1, React 19.2). It has no production deploy and no CI/CD. The previous deploy target was Cloudflare Pages, evidenced by `functions/investor/_middleware.js` (a Cloudflare Pages Function that password-gated `/investor/*` against the `INVESTOR_PASSWORD` env var). That file does not run on Vercel — Vercel ignores `functions/` and uses `api/*` or a root `middleware.ts`.

We need:
- Production deploys to Vercel from `main`, preview deploys per PR.
- Custom domain `ventures.ether.fi` with HTTPS.
- The same release-please pipeline used by `etherfi-protocol/turbo-neobank` (release PRs, AI-summarised release notes, Discord notification).
- The `/investor/` LP dashboard is **not** ready for public consumption yet, and we are not standing up auth on Vercel for it. The path is disabled in this rollout; the dashboard files stay in the repo (moved to `archive/investor/`) for easy resurrection later.

## Goals

- `https://ventures.ether.fi` serves the marketing SPA, with HTTPS, on Vercel.
- Every PR opens a Vercel preview deployment automatically.
- `main` triggers `release-please`, which opens release PRs against `main`; merging a release PR cuts a GitHub release, posts an AI-summarised Discord message, and adds an enrichment block (AI summary + contributors) to the release notes.
- The `/investor/` route is disabled at the deploy layer; the marketing site's "Investors" nav button is visibly disabled with a "Coming Soon" tooltip on hover.
- No password gate, no Vercel deploy protection, no auth middleware in this iteration.

## Non-goals

- Migrating off CRA (`react-scripts` is unmaintained upstream; tracked separately).
- Re-enabling the investor dashboard or porting its auth to Vercel.
- Adding `commitlint` / a PR template enforcing Conventional Commits — release-please will simply ignore non-conformant commits; revisit if drift becomes an issue.
- Migrating any historical content from the `davidh2139/etherfi-ventures-website` issues / PRs (none exist).

## Design

### Repo changes

Two PRs, in order:

#### PR1 — `chore: prepare for Vercel deploy, gate /investor behind "Coming Soon"`

| Action | Path |
|---|---|
| `git mv` | `public/investor/*` → `archive/investor/*` |
| Delete | `functions/investor/_middleware.js` and the empty `functions/` parent |
| Edit | `src/components/NavBar.js` — replace `<a href="/investor/">Investors</a>` with a `<button disabled>` styled as a ghost CTA, with a CSS-only "Coming Soon" tooltip on hover |
| Edit | `src/index.css` — add `.btn-ghost[disabled]` styles + a `:hover::after` rule that reads its label from a `data-tooltip="Coming Soon"` attribute on the button |

No `vercel.json` is required: Vercel auto-detects the CRA preset, builds with `react-scripts build`, and serves from `build/`. Once `public/investor/` no longer exists in the source tree, `/investor/*` resolves to a normal 404 — there is nothing to redirect or rewrite.

#### PR2 — `ci: add release-please pipeline`

Files copied verbatim from `etherfi-protocol/turbo-neobank`, with one targeted edit:

| Action | Path | Note |
|---|---|---|
| Add | `.github/workflows/release-please.yml` | Replace `master` with `main` in: `on.push.branches`, the `release-please` job's `target-branch:` input, the `enrich-and-notify` job's checkout `ref:`, and the comment "The just-created tag points at a commit on master." |
| Add | `release-please-config.json` | Copied verbatim |
| Add | `.release-please-manifest.json` | Initialise at `{".": "0.1.0"}` to match `package.json` |
| Add | `.github/discord-users.json` | Copied verbatim from turbo-neobank (extra entries are harmless; future-proofs against any of those folks contributing) |

### Vercel project setup (out-of-band, between PR1 and PR2 merges)

1. Create a Vercel project on the `etherfi` team named `ventures-website`. Link it to the `etherfi-protocol/ventures-website` GitHub repo.
2. Framework preset: **Create React App** (auto-detected). Build command, output directory, install command: leave at the framework defaults.
3. Production branch: `main`. PR previews are on by default.
4. Add custom domain `ventures.ether.fi` to the project. Vercel will surface a CNAME target (typically `cname.vercel-dns.com.`).
5. **DNS:** add the CNAME on the holder of the `ether.fi` zone. Wait for propagation; Vercel auto-issues the Let's Encrypt certificate once the record resolves.

The dashboard's existing branch ruleset (`main-merge-only`) means PRs merge with merge commits — each PR's underlying conventional commits flow through to `main`, which is what release-please wants.

### Secrets & GitHub App (before PR2 merge)

Confirm the **Release Please GitHub App** (already used by turbo-neobank) is installed on `etherfi-protocol/ventures-website` with access to this repo. If it isn't, install it with the minimum scope.

Set repo-level secrets and vars on `etherfi-protocol/ventures-website` (only set what is not already inherited from the org):

| Kind | Name | Source |
|---|---|---|
| secret | `RELEASE_PLEASE_APP_ID` | Same App ID as turbo-neobank |
| secret | `RELEASE_PLEASE_PRIVATE_KEY` | Same private key as turbo-neobank |
| secret | `OPENROUTER_API_KEY` | Reuse org-level if available, else copy turbo-neobank's value |
| secret | `DISCORD_RELEASE_WEBHOOK_URL` | Reuse turbo-neobank's value (same Discord channel) |
| var | `OPENROUTER_MODEL` | Leave unset (workflow defaults to `deepseek/deepseek-v3.2`) |

### Data flow at runtime

```
PR opened on ventures-website
    │
    ▼
Vercel builds preview deploy → posts "Vercel – ventures-website" status check on the PR
    │
    ▼
PR merged to main (merge commit, per main-merge-only ruleset)
    │
    ├──► Vercel builds production deploy → ventures.ether.fi
    │
    └──► .github/workflows/release-please.yml fires
            │
            ▼
         release-please job: opens / updates Release PR for main, signed by the Release Please GitHub App
            │
            ▼
         Release PR merged
            │
            ▼
         release-please cuts a GitHub release (tag vX.Y.Z, generated changelog)
            │
            ▼
         enrich-and-notify job: generates AI summary via OpenRouter, extracts contributors via git log + GH API,
                                edits the GitHub release notes to add an <!-- enrichment-start --> block,
                                posts a formatted embed to the Discord webhook
```

### Error handling

- **Build failure on Vercel.** Vercel surfaces the failure on the PR check; deployments roll back automatically (production keeps the last good build).
- **OpenRouter unreachable / 4xx / 5xx.** The `enrich-and-notify` job logs a warning, skips the AI summary, and proceeds with contributor enrichment + Discord post. Already coded defensively in turbo-neobank's workflow; mirrored as-is.
- **Discord webhook returns non-2xx.** The job logs a warning but does not fail; release is still cut.
- **Release Please GitHub App missing or unauthorised on the repo.** The first run fails. Operator installs the App with access to this repo and re-runs.

## Rollout

```
1. Open PR1 (chore: prepare for Vercel deploy, gate /investor behind "Coming Soon")
2. Review, merge to main (merge commit per main-merge-only ruleset)
3. Create Vercel project on etherfi team, link repo, framework preset = CRA, production branch = main
4. First production deploy fires automatically; smoke test the *.vercel.app URL
5. Add ventures.ether.fi as custom domain → DNS CNAME on ether.fi zone → wait → verify HTTPS
6. Confirm GitHub App install on the new repo + add the four repo secrets (skip those inherited from org)
7. Open PR2 (ci: add release-please pipeline)
8. Review, merge to main
9. Watch the release-please workflow on main; expect either a Release PR to open or a clean idle (no conventional commits since 0.1.0)
10. (Optional) Land a chore: commit to drive an end-to-end test of the AI-summary + Discord notification path
```

## Verification

| Gate | Check |
|---|---|
| PR1 merged | `npm run build` succeeds in CI and locally on a fresh checkout |
| First Vercel deploy | site renders on `*.vercel.app`; nav shows disabled "Investors" button; tooltip "Coming Soon" appears on hover; `/investor/` returns 404 |
| Custom domain | `https://ventures.ether.fi` resolves, valid Let's Encrypt cert, no mixed-content or HTTPS warnings |
| PR preview workflow | Open a throwaway PR after PR1 merges; verify a `Vercel – ventures-website` status check appears on the PR and the preview URL is reachable |
| PR2 merged | `release-please` workflow shows green; either a Release PR is opened or the run idles cleanly |
| Release PR merged | `enrich-and-notify` job runs green; Discord channel shows the release embed; GitHub release notes contain the `<!-- enrichment-start -->` AI-summary block |

## Out of scope / follow-ups

- Re-enable the `/investor/` LP dashboard. When this happens, restore `public/investor/*` from `archive/investor/*` and decide on auth: a Vercel Edge Middleware port of the SHA-256-cookie scheme, Vercel Deployment Protection, or a different model.
- Add a required-status-checks branch rule on `main` for the `Vercel – ventures-website` preview check (mirrors turbo-neobank's `dev` ruleset). Cannot be added until the project exists on Vercel and the check name is known.
- Add `commitlint` enforcement and a PR template if Conventional Commits drift becomes a problem.
- Migrate off CRA — `react-scripts` is unmaintained upstream.
- Decide whether `ether.fi` itself links to `ventures.ether.fi`; that change is outside this repo.
