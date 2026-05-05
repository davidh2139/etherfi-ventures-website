# INF-146 Vercel Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the ether.fi Ventures marketing site from `davidh2139/etherfi-ventures-website` (Cloudflare Pages) to a Vercel deploy on `etherfi-protocol/ventures-website` at `ventures.ether.fi`, mirror turbo-neobank's release-please pipeline, and disable the `/investor/` LP dashboard at the deploy layer with a "Coming Soon" tooltip on the nav button.

**Architecture:** Two-PR rollout. PR1 (`inf-146`) gets the codebase ready for Vercel — moves `public/investor/*` to a non-served `archive/investor/*` location, deletes the dead Cloudflare Pages middleware, and changes the marketing nav so the "Investors" CTA is a disabled `<button>` with a CSS-only tooltip. Vercel project link + production deploy happen between PR merges. PR2 (`inf-146-release-please`) layers the release-please workflow, config, manifest, and Discord-user mapping copied from turbo-neobank with `master` retargeted to `main`. Custom domain (`ventures.ether.fi`) is wired up at the very end.

**Tech Stack:** Create React App 5.0.1, React 19.2, Node 24 (`.nvmrc`), Vercel (CRA preset), GitHub Actions, `googleapis/release-please-action@v4`, OpenRouter, Discord webhooks, Jest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-05-05-vercel-deploy-design.md`

---

## File structure

| Path | What | Status |
|---|---|---|
| `public/investor/*` | Static investor dashboard | **Move** to `archive/investor/*` |
| `archive/investor/*` | Same files, in a directory Vercel does not serve | **Create** (via `git mv`) |
| `functions/investor/_middleware.js` | Cloudflare Pages Function (dead on Vercel) | **Delete** |
| `functions/` | Empty parent after deletion | **Delete** |
| `src/components/NavBar.js` | Marketing nav | **Modify** — replace Investors `<a>` with disabled `<button>` |
| `src/components/NavBar.test.js` | New unit test for the disabled-Investors UX | **Create** |
| `src/index.css` | Design-token CSS | **Modify** — add `.btn-ghost-disabled[data-tooltip]:hover::after` rule |
| `.github/workflows/release-please.yml` | release-please workflow (two jobs) | **Create** (PR2) |
| `release-please-config.json` | release-please channel config | **Create** (PR2) |
| `.release-please-manifest.json` | release-please version manifest | **Create** (PR2) |
| `.github/discord-users.json` | GitHub → Discord handle/ID map | **Create** (PR2) |

---

## Task 0: Verify branch state

**Files:** none

- [ ] **Step 1: Confirm working tree state**

Run: `git -C /Users/nicolaas/repos/etherfi-ventures-website status -sb && git -C /Users/nicolaas/repos/etherfi-ventures-website log --oneline -3`

Expected: on branch `inf-146`, the only untracked file is `CLAUDE.md`, and the most recent commit is `767866f docs: add INF-146 Vercel deploy design`. If the branch is `main` rather than `inf-146`, run `git checkout inf-146`.

- [ ] **Step 2: Confirm Node version**

Run: `cd /Users/nicolaas/repos/etherfi-ventures-website && nvm use && node --version`

Expected: `v24.x.x`. If `nvm use` errors, run `nvm install` first.

---

## Task 1: Move investor dashboard to archive/

**Files:**
- Move: `public/investor/*` → `archive/investor/*`

- [ ] **Step 1: Move the directory with `git mv`**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
mkdir -p archive
git mv public/investor archive/investor
```

- [ ] **Step 2: Verify the move**

Run: `git status -sb && ls archive/investor/`

Expected: status shows four renames (`public/investor/{app.js,data.js,index.html,styles.css}` → `archive/investor/{...}`); `ls` lists `app.js  data.js  index.html  styles.css`.

- [ ] **Step 3: Confirm `public/investor/` is gone**

Run: `ls public/`

Expected: directories `investor` no longer present. Output shows `favicon.ico  index.html  logo192.png  logo512.png  manifest.json  robots.txt`.

- [ ] **Step 4: Commit**

Run:
```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: archive investor dashboard until LP gating is ready

Moves public/investor/{app.js,data.js,index.html,styles.css} to
archive/investor/. Vercel only serves files under public/ (and the
build/ output of CRA), so this disables the /investor/ route at the
deploy layer without deleting the dashboard. Resurrection is a
single git mv when LP-side auth is ready.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Delete the Cloudflare Pages middleware

**Files:**
- Delete: `functions/investor/_middleware.js`
- Delete: `functions/` (empty parent)

- [ ] **Step 1: Delete the middleware and its parent dirs**

Run:
```bash
git rm functions/investor/_middleware.js
rmdir functions/investor functions
```

Expected: `git rm` prints `rm 'functions/investor/_middleware.js'`; `rmdir` succeeds with no output.

- [ ] **Step 2: Verify removal**

Run: `ls -la functions 2>&1 || echo 'gone'; git status -sb`

Expected: `ls` errors with "No such file or directory", followed by `gone`. `git status` shows `D functions/investor/_middleware.js` staged.

- [ ] **Step 3: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
chore: drop Cloudflare Pages middleware

Vercel does not read the functions/ directory — its equivalent is
api/* for serverless or a root middleware.ts for Edge. With the
investor route disabled in this rollout there is no auth middleware
to port; this file is dead code on the new platform.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Test the disabled "Investors" nav button

**Files:**
- Test: `src/components/NavBar.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/NavBar.test.js` with:

```javascript
import { render, screen } from '@testing-library/react';
import NavBar from './NavBar';

describe('NavBar', () => {
  test('renders an Investors button that is disabled with a "Coming Soon" tooltip', () => {
    render(<NavBar page="home" go={() => {}} scrolled={false} />);
    const investorsBtn = screen.getByRole('button', { name: /investors/i });
    expect(investorsBtn).toBeDisabled();
    expect(investorsBtn).toHaveAttribute('data-tooltip', 'Coming Soon');
  });

  test('does not render an Investors anchor link', () => {
    render(<NavBar page="home" go={() => {}} scrolled={false} />);
    expect(screen.queryByRole('link', { name: /investors/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `CI=true npm test -- NavBar.test.js --watchAll=false`

Expected: both tests FAIL. The first fails with something like `Unable to find an accessible element with the role "button" and name /investors/i` (because the current code renders an anchor, not a button); the second fails because `screen.queryByRole('link', { name: /investors/i })` returns the existing `<a href="/investor/">Investors</a>`.

---

## Task 4: Implement the disabled "Investors" button

**Files:**
- Modify: `src/components/NavBar.js`

- [ ] **Step 1: Replace the Investors anchor with a disabled button**

In `src/components/NavBar.js`, find:

```jsx
          <a href="/investor/" className="btn-ghost" style={{ marginLeft: 8 }}>
            Investors
          </a>
```

Replace with:

```jsx
          <button
            type="button"
            className="btn-ghost btn-ghost-disabled"
            data-tooltip="Coming Soon"
            disabled
            aria-disabled="true"
            style={{ marginLeft: 8 }}
          >
            Investors
          </button>
```

- [ ] **Step 2: Run the NavBar test and watch it pass**

Run: `CI=true npm test -- NavBar.test.js --watchAll=false`

Expected: both tests PASS.

- [ ] **Step 3: Run the full test suite to confirm no regressions**

Run: `CI=true npm test -- --watchAll=false`

Expected: all tests pass. Note: the default `src/App.test.js` test (`renders learn react link`) is a CRA placeholder that currently fails because the app does not contain "learn react" text. Either it has already been fixed, or you will see it fail. If it fails AND it was already failing on `main`, leave it for now (the spec calls out that pre-existing test breakage is not in scope). If it fails AND it was passing before your changes, your `<button>` swap broke something — debug. Verify the pre-existing state with: `git stash && CI=true npm test -- --watchAll=false; git stash pop`.

- [ ] **Step 4: Commit**

Run:
```bash
git add src/components/NavBar.js src/components/NavBar.test.js
git commit -m "$(cat <<'EOF'
feat(nav): disable Investors CTA with Coming Soon tooltip

The investor dashboard is parked behind archive/investor/ until LP-
side auth is ready. The nav still shows an "Investors" affordance so
the IA stays legible, but it is now a disabled <button> with a CSS
tooltip exposing the "Coming Soon" copy on hover.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add the tooltip CSS

**Files:**
- Modify: `src/index.css` (after the existing `.btn-ghost:disabled` rule, around line 266)

- [ ] **Step 1: Add the tooltip rules**

In `src/index.css`, locate the existing rule (around lines 261–266):

```css
.btn:disabled,
.btn-ghost:disabled {
  color: var(--text-disabled);
  border-color: var(--border-subtle);
  cursor: not-allowed;
}
```

Immediately AFTER this block, insert:

```css
/* Disabled ghost button with a hover tooltip — used for "Coming Soon"
   CTAs. The tooltip text is read from the data-tooltip attribute and
   rendered as a ::after pseudo-element on hover. No JS, no library. */
.btn-ghost-disabled {
  position: relative;
}

.btn-ghost-disabled[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
  z-index: 200;
}
```

- [ ] **Step 2: Manually verify the tooltip in a browser**

Run: `npm start`

Open `http://localhost:3000`, hover over the disabled "Investors" button in the nav. Expected: the "Coming Soon" tooltip appears below the button (centered horizontally), styled with the dark elevated background and a hairline border. Cursor shows `not-allowed` over the button. Stop the dev server (`Ctrl-C`) when satisfied.

- [ ] **Step 3: Commit**

Run:
```bash
git add src/index.css
git commit -m "$(cat <<'EOF'
style(nav): add CSS-only tooltip for disabled ghost buttons

Renders the value of data-tooltip as a ::after pseudo-element on
hover. Used by the disabled Investors CTA; reusable for any future
disabled ghost button that needs a "Coming Soon"-style affordance.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Verify the production build

**Files:** none (build verification)

- [ ] **Step 1: Run a clean production build**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
rm -rf build
npm run build
```

Expected: build succeeds. Final lines include:
```
The build folder is ready to be deployed.
```

- [ ] **Step 2: Verify the build output excludes the investor dashboard**

Run: `ls build/ && (ls build/investor 2>&1 || echo 'no /investor in build, good')`

Expected: `build/` exists and contains `index.html`, `static/`, `favicon.ico`, etc., but NO `investor/` subdirectory. The `ls build/investor` should fail.

- [ ] **Step 3: Sanity-check what's there**

Run: `find build -maxdepth 2 -type f | head -20`

Expected: `index.html`, `manifest.json`, `robots.txt`, `static/css/*.css`, `static/js/*.js`, `static/media/*` — and nothing under `build/investor/`.

---

## Task 7: Push branch and open PR1

**Files:** none (Git + GitHub operations)

- [ ] **Step 1: Push the branch to origin**

Run: `git -C /Users/nicolaas/repos/etherfi-ventures-website push -u origin inf-146`

Expected: branch `inf-146` is pushed; output shows `* [new branch] inf-146 -> inf-146` and the upstream tracking is set.

- [ ] **Step 2: Open the pull request**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
gh pr create --base main --head inf-146 --title "chore: prepare for Vercel deploy, gate /investor behind \"Coming Soon\"" --body "$(cat <<'EOF'
## Summary
- Moves `public/investor/*` to `archive/investor/*` so Vercel does not serve the investor dashboard until LP-side auth is ready
- Removes the dead Cloudflare Pages middleware (`functions/investor/_middleware.js`)
- Replaces the Investors nav anchor with a disabled `<button>` + a CSS-only "Coming Soon" tooltip
- Adds the design + plan docs for INF-146

Closes part of [INF-146](https://linear.app/ether-fi/issue/INF-146/deploy-etherfi-ventures-website-to-vercel). The release-please pipeline lands in a follow-up PR after the Vercel project is wired up.

## Test plan
- [x] `npm run build` succeeds locally
- [x] `npm test -- --watchAll=false` passes (NavBar tests added)
- [x] `npm start` — confirmed disabled "Investors" button shows "Coming Soon" tooltip on hover, cursor is `not-allowed`
- [ ] Vercel preview deploy renders the marketing site, `/investor/` returns 404, nav tooltip works on the preview URL

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: `gh` returns the PR URL. Hand it to the reviewer.

- [ ] **Step 3: Wait for PR1 to be reviewed and merged**

After the reviewer approves, the PR is merged into `main` with a merge commit (per the `main-merge-only` ruleset). The merge fires Vercel preview check on the PR (assuming the Vercel project has been linked by then — the order is below).

---

## Task 8: Operator step — Vercel project setup and first production deploy

**Files:** none (Vercel platform configuration)

This task happens between PR1 merge and PR2 work. An operator with admin on the `etherfi` Vercel team performs it. There is no code to write; the steps below are the runbook.

- [ ] **Step 1: Authenticate the Vercel CLI on the etherfi team**

Run: `vercel whoami`

Expected: prints the operator's username. If not, run `vercel login`.

- [ ] **Step 2: Create the project linked to the GitHub repo**

In the Vercel dashboard:
1. Switch to the `etherfi` team (top-left team picker).
2. Click **Add New → Project**.
3. Import `etherfi-protocol/ventures-website`.
4. Project name: `ventures-website`.
5. Framework Preset: **Create React App** (auto-detected).
6. Build & Output Settings: leave at framework defaults (`npm run build`, output `build`, install `npm install`).
7. Environment variables: none required for this iteration (no auth, no API keys).
8. Production branch: `main`.
9. Click **Deploy**.

- [ ] **Step 3: Smoke-test the first deploy**

Once the deploy completes, click the deploy URL (`ventures-website-*.vercel.app`).

Expected:
- Marketing site renders (Home, Manifesto, Portfolio, Team, News tabs all work).
- Nav shows a disabled "Investors" button; hovering reveals a "Coming Soon" tooltip with the dark-elevated background.
- `https://ventures-website-*.vercel.app/investor/` returns a 404 (Vercel's default 404 page is fine).
- Browser console has no errors.

- [ ] **Step 4: Open a throwaway PR to confirm preview deploys + status check**

On the GitHub side:
```bash
git checkout -b smoke-test-vercel-previews
echo " " >> README.md
git commit -am "chore: smoke-test Vercel preview deploy"
git push -u origin smoke-test-vercel-previews
gh pr create --base main --title "chore: smoke-test Vercel preview deploy" --body "Throwaway PR to verify the Vercel preview check appears. Will close without merging."
```

Expected: a `Vercel – ventures-website` (or similar) status check appears on the PR within ~2 minutes, with a "Visit Preview" link in the bot comment. Open the preview URL, smoke-test the same way as Step 3.

- [ ] **Step 5: Close the throwaway PR and delete the branch**

Run: `gh pr close smoke-test-vercel-previews --delete-branch`

---

## Task 9: Add the release-please workflow

**Files:**
- Create: `.github/workflows/release-please.yml`

This task starts PR2. Create a fresh branch off the latest `main` after PR1 has merged.

- [ ] **Step 1: Create the PR2 branch off the latest `main`**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
git checkout main
git pull --ff-only origin main
git checkout -b inf-146-release-please
```

Expected: branch `inf-146-release-please` created from a `main` that includes the merged PR1.

- [ ] **Step 2: Pull turbo-neobank's workflow as the source of truth**

Run:
```bash
mkdir -p .github/workflows
gh api -H "Accept: application/vnd.github.v3.raw" repos/etherfi-protocol/turbo-neobank/contents/.github/workflows/release-please.yml > .github/workflows/release-please.yml
```

Expected: file is written. Run `head -20 .github/workflows/release-please.yml` and confirm the first lines are `name: Release Please` followed by `on:` and `push: branches: - master`.

- [ ] **Step 3: Retarget `master` to `main`**

Edit `.github/workflows/release-please.yml`. Make exactly four substitutions:

(a) In the `on.push.branches` block, change:
```yaml
    branches:
      - master
```
to:
```yaml
    branches:
      - main
```

(b) In the `release-please` job's `googleapis/release-please-action@v4` step, change:
```yaml
          target-branch: master
```
to:
```yaml
          target-branch: main
```

(c) In the `enrich-and-notify` job's checkout step, change:
```yaml
      - name: Checkout master with full history
        uses: actions/checkout@v6
        with:
          ref: master
          fetch-depth: 0
```
to:
```yaml
      - name: Checkout main with full history
        uses: actions/checkout@v6
        with:
          ref: main
          fetch-depth: 0
```

(d) In the `Find previous tag` step's comment, change:
```yaml
          # The just-created tag points at a commit on master. The most recent tag
          # reachable from that commit's parent is the previous release.
```
to:
```yaml
          # The just-created tag points at a commit on main. The most recent tag
          # reachable from that commit's parent is the previous release.
```

- [ ] **Step 4: Verify only those four substitutions changed**

Run: `grep -n "master" .github/workflows/release-please.yml`

Expected: NO matches. If any line still contains `master`, you missed an edit; go back and fix.

- [ ] **Step 5: Validate the YAML parses**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release-please.yml'))" && echo OK`

Expected: prints `OK`. If a `yaml.YAMLError` is thrown, fix indentation issues.

- [ ] **Step 6: Commit**

Run:
```bash
git add .github/workflows/release-please.yml
git commit -m "$(cat <<'EOF'
ci: add release-please workflow targeting main

Mirrors etherfi-protocol/turbo-neobank/.github/workflows/release-
please.yml. The two-job design is unchanged: release-please opens
release PRs, and enrich-and-notify edits the GitHub release with an
AI-summary block (OpenRouter) and posts a formatted embed to
Discord on release_created. master → main throughout: trigger
branch, target-branch input, the enrich-and-notify checkout ref,
and one comment.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Add the release-please config

**Files:**
- Create: `release-please-config.json`

- [ ] **Step 1: Pull the file verbatim from turbo-neobank**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
gh api -H "Accept: application/vnd.github.v3.raw" repos/etherfi-protocol/turbo-neobank/contents/release-please-config.json > release-please-config.json
```

- [ ] **Step 2: Verify content**

Run: `cat release-please-config.json`

Expected output:
```json
{
  "packages": {
    ".": {
      "release-type": "node",
      "include-v-in-tag": true,
      "include-component-in-tag": false,
      "changelog-sections": [
        { "type": "feat", "section": "Features" },
        { "type": "fix", "section": "Bug Fixes" },
        { "type": "perf", "section": "Performance Improvements" },
        { "type": "revert", "section": "Reverts" },
        { "type": "hotfix", "section": "Bug Fixes" },
        { "type": "chore", "section": "Miscellaneous" },
        { "type": "refactor", "section": "Code Refactoring" },
        { "type": "ci", "section": "CI/CD", "hidden": true },
        { "type": "docs", "section": "Documentation", "hidden": true },
        { "type": "style", "section": "Styles", "hidden": true },
        { "type": "test", "section": "Tests", "hidden": true },
        { "type": "vercel", "section": "Vercel", "hidden": true },
        { "type": "release", "section": "Release", "hidden": true }
      ]
    }
  },
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json"
}
```

- [ ] **Step 3: Validate JSON parses**

Run: `python3 -c "import json,sys; json.load(open('release-please-config.json'))" && echo OK`

Expected: `OK`.

- [ ] **Step 4: Commit**

Run:
```bash
git add release-please-config.json
git commit -m "$(cat <<'EOF'
chore: add release-please config (verbatim from turbo-neobank)

release-type: node, include-v-in-tag: true. Changelog sections
match turbo-neobank: feat / fix / perf / revert / hotfix / chore /
refactor visible; ci / docs / style / test / vercel / release
hidden.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Initialise the release-please manifest

**Files:**
- Create: `.release-please-manifest.json`

- [ ] **Step 1: Write the manifest**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
printf '{".": "0.1.0"}\n' > .release-please-manifest.json
```

- [ ] **Step 2: Verify content matches `package.json` version**

Run: `cat .release-please-manifest.json && grep '"version"' package.json`

Expected:
```
{".": "0.1.0"}
  "version": "0.1.0",
```

The two `0.1.0`s must match — release-please uses the manifest as the baseline; `package.json`'s `version` is what release-please will bump on the next release.

- [ ] **Step 3: Commit**

Run:
```bash
git add .release-please-manifest.json
git commit -m "$(cat <<'EOF'
chore: initialise release-please manifest at 0.1.0

Matches the current package.json version. release-please reads
this on the first run as the prior-release baseline; the next
conventional commit will trigger a 0.1.x bump.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Add the Discord user mapping

**Files:**
- Create: `.github/discord-users.json`

- [ ] **Step 1: Pull the file verbatim from turbo-neobank**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
gh api -H "Accept: application/vnd.github.v3.raw" repos/etherfi-protocol/turbo-neobank/contents/.github/discord-users.json > .github/discord-users.json
```

- [ ] **Step 2: Validate JSON**

Run: `python3 -c "import json,sys; print('entries:', len(json.load(open('.github/discord-users.json'))))"`

Expected: `entries: 30` (or similar count — the file is a flat GitHub-handle → Discord-ID map).

- [ ] **Step 3: Commit**

Run:
```bash
git add .github/discord-users.json
git commit -m "$(cat <<'EOF'
chore: add GitHub→Discord handle map (verbatim from turbo-neobank)

Used by .github/workflows/release-please.yml in the enrich-and-
notify job to translate GitHub handles in the release notes into
Discord mentions before posting to the release webhook. Extra
entries are harmless; future-proofs against any of those folks
contributing to ventures.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Push branch and open PR2

**Files:** none (Git + GitHub operations)

- [ ] **Step 1: Push the branch**

Run: `git -C /Users/nicolaas/repos/etherfi-ventures-website push -u origin inf-146-release-please`

Expected: branch pushed; upstream tracking set.

- [ ] **Step 2: Open the PR**

Run:
```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
gh pr create --base main --head inf-146-release-please --title "ci: add release-please pipeline" --body "$(cat <<'EOF'
## Summary
- Adds `.github/workflows/release-please.yml` mirroring turbo-neobank's two-job pipeline (release-please job + enrich-and-notify job), retargeted from `master` to `main`
- Adds `release-please-config.json` and `.release-please-manifest.json` (initialised at 0.1.0, matching `package.json`)
- Adds `.github/discord-users.json` (verbatim copy from turbo-neobank)

Closes [INF-146](https://linear.app/ether-fi/issue/INF-146/deploy-etherfi-ventures-website-to-vercel) once secrets are wired and the first run is verified.

## Required before merge
- Release Please GitHub App must be installed on `etherfi-protocol/ventures-website`
- Repo secrets configured: `RELEASE_PLEASE_APP_ID`, `RELEASE_PLEASE_PRIVATE_KEY`, `OPENROUTER_API_KEY`, `DISCORD_RELEASE_WEBHOOK_URL` (skip any that are inherited from the org)
- Optional repo var: `OPENROUTER_MODEL` (defaults to `deepseek/deepseek-v3.2` if unset)

## Test plan
- [ ] After merge: `release-please` workflow on `main` runs green
- [ ] Either a Release PR is opened (if conventional commits exist since 0.1.0) or the run idles cleanly
- [ ] Optional: land a `chore:` commit to drive a full end-to-end test of the AI-summary + Discord notification path

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: `gh` returns the PR URL.

---

## Task 14: Operator step — GitHub App + secrets

**Files:** none (GitHub repo configuration)

This task happens before PR2 merges. An operator with admin access to the `etherfi-protocol` org performs it.

- [ ] **Step 1: Confirm Release Please GitHub App installation**

Visit `https://github.com/organizations/etherfi-protocol/settings/installations`. Find the **Release Please** App (the one used by turbo-neobank). Confirm `ventures-website` is in its repository access list. If not, click **Configure** on that App → Repository access → add `ventures-website` → Save.

- [ ] **Step 2: Add the four required secrets to the repo**

For each of the secrets below, look up its value from the same secret on `etherfi-protocol/turbo-neobank` (or fetch from your team's secret store) and set it on `etherfi-protocol/ventures-website`:

| Secret | Where to find it |
|---|---|
| `RELEASE_PLEASE_APP_ID` | GitHub App settings page (numeric ID) |
| `RELEASE_PLEASE_PRIVATE_KEY` | Generated `.pem` for the App (full multi-line content including BEGIN/END markers) |
| `OPENROUTER_API_KEY` | Team password manager or turbo-neobank's secret of the same name |
| `DISCORD_RELEASE_WEBHOOK_URL` | turbo-neobank's secret of the same name (same Discord channel) |

CLI alternative for each:
```bash
gh secret set RELEASE_PLEASE_APP_ID --repo etherfi-protocol/ventures-website --body "<value>"
gh secret set RELEASE_PLEASE_PRIVATE_KEY --repo etherfi-protocol/ventures-website < path/to/private-key.pem
gh secret set OPENROUTER_API_KEY --repo etherfi-protocol/ventures-website --body "<value>"
gh secret set DISCORD_RELEASE_WEBHOOK_URL --repo etherfi-protocol/ventures-website --body "<webhook URL>"
```

Note: if any of these are already inherited from the org level (`gh api orgs/etherfi-protocol/actions/secrets`), skip the corresponding repo-level set.

- [ ] **Step 3: Confirm secrets are set**

Run: `gh secret list --repo etherfi-protocol/ventures-website`

Expected: shows the four secret names (only names, never values), each with a recent updated-at timestamp.

- [ ] **Step 4: Skip the `OPENROUTER_MODEL` repo var**

The workflow defaults to `deepseek/deepseek-v3.2` when this var is unset. Don't set it unless you specifically want to override the default.

---

## Task 15: Merge PR2 and verify the first release-please run

**Files:** none (verification)

- [ ] **Step 1: Merge PR2**

After review, merge the PR with a merge commit (the `main-merge-only` ruleset enforces this).

- [ ] **Step 2: Watch the first workflow run on `main`**

Run: `gh run list --workflow release-please.yml --repo etherfi-protocol/ventures-website --limit 3`

Expected: a run appears, status `in_progress` then `completed`, conclusion `success`. If `failure`, run `gh run view <id> --log-failed --repo etherfi-protocol/ventures-website` and diagnose. The most likely failure mode is the GitHub App not being installed on the new repo (re-do Task 14 Step 1).

- [ ] **Step 3: Check whether a Release PR was opened**

Run: `gh pr list --repo etherfi-protocol/ventures-website --label autorelease:pending`

Expected: either one PR (release-please opened it) or zero (no conventional commits since 0.1.0; that's fine for now). If there's a PR, review its title (`chore(main): release X.Y.Z`) and changelog content. Don't merge it yet unless you want to cut a real release.

- [ ] **Step 4 (optional): Drive an end-to-end test**

If you want to verify the AI summary + Discord post end-to-end, land a tiny conventional commit on `main`:

```bash
cd /Users/nicolaas/repos/etherfi-ventures-website
git checkout main && git pull --ff-only
git checkout -b chore/verify-release-please
echo "" >> README.md
git commit -am "chore: trigger release-please end-to-end verification"
git push -u origin chore/verify-release-please
gh pr create --base main --head chore/verify-release-please --title "chore: trigger release-please end-to-end verification" --body "Smoke test."
```

Merge it. release-please will open or update the Release PR. Merging that Release PR will:
1. Cut a `v0.1.1` (or similar) GitHub release.
2. Trigger the `enrich-and-notify` job, which edits the release notes to add the `<!-- enrichment-start -->` block and posts a Discord embed.

Verify both: visit the release page, check for the enrichment block; check the Discord channel for the embed. Neither has to be perfect — partial success (e.g., AI summary skipped because OpenRouter timed out) is fine and surfaces as a job warning.

---

## Task 16: Operator step — Custom domain `ventures.ether.fi`

**Files:** none (Vercel + DNS configuration)

This is the final task. It's deferred until everything else is verified, per user direction.

- [ ] **Step 1: Add the domain to the Vercel project**

In the Vercel dashboard, on the `ventures-website` project:
1. Settings → Domains → **Add Domain**.
2. Enter `ventures.ether.fi`.
3. Vercel surfaces the required DNS record. For a subdomain it's almost always: type `CNAME`, name `ventures` (or `ventures.ether.fi.`), value `cname.vercel-dns.com.`.

CLI alternative (project must be linked locally first via `vercel link --scope etherfi`):
```bash
vercel domains add ventures.ether.fi ventures-website --scope etherfi
```

- [ ] **Step 2: Add the DNS record**

The `ether.fi` zone owner adds the CNAME with the exact target Vercel showed. TTL: leave default (auto / 300s).

**Cloudflare gotcha:** if `ether.fi` is on Cloudflare, set the record to **DNS only (grey cloud)**, NOT Proxied (orange cloud). Proxying terminates TLS at Cloudflare and prevents Vercel's ACME challenge from completing — the LE cert never issues.

- [ ] **Step 3: Verify the record propagated**

Run:
```bash
dig ventures.ether.fi CNAME +short
```

Expected: `cname.vercel-dns.com.` (with trailing dot).

- [ ] **Step 4: Confirm Vercel issued the certificate**

In the Vercel domain panel, the `ventures.ether.fi` row should flip from "Invalid Configuration" or "Pending" to **Valid** within ~1–2 min. Cert badge goes green when LE issuance completes.

- [ ] **Step 5: Smoke-test HTTPS**

Run:
```bash
curl -I https://ventures.ether.fi
```

Expected: `HTTP/2 200` (or 301/302 redirect chain that ends at 200), no `curl: (60) SSL certificate problem` warning.

Open `https://ventures.ether.fi` in a browser. Confirm:
- Lock icon, no cert warnings.
- Marketing site renders identically to the `*.vercel.app` URL.
- `/investor/` returns 404.
- Disabled "Investors" tooltip works.

- [ ] **Step 6: Mark INF-146 done**

In Linear: move INF-146 to **Done**. Add a comment linking to the production URL and the merged PRs.

---

## Done.

The site is on Vercel, `ventures.ether.fi` is live with HTTPS, PRs trigger preview deploys, and `main` triggers release-please with AI-summarised release notes posted to Discord. The investor dashboard is parked under `archive/investor/` ready for resurrection in a follow-up.
