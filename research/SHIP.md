# SHIP — deployment, rollback, and re-verification

**Target:** `bcaicompass.ca` on Cloudflare Pages
**Build command:** `npm run build`
**Output directory:** `dist`

Every command in this file is PowerShell or an exact Cloudflare dashboard click
path. No bash.

---

## 0. Before you deploy anything

```powershell
Set-Location C:\Users\User\dev\BCAICompass
powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1 -CleanInstall
```

**All 17 conditions must read PASS.** If any reads FAIL, stop — the failure is the
work, not the deploy.

Note the `-CleanInstall` switch stops any `npm run dev` vite server running against
this project, because a live dev server holds `node_modules` open and silently
turns "clean install" into "install over whatever was there". Restart it afterwards
with `npm run dev` if you were using it.

Confirm the build artefacts are what you think they are:

```powershell
Get-ChildItem .\dist -Recurse -File | Select-Object FullName, Length | Format-Table -AutoSize
Get-Content .\dist\CNAME
(Get-Content .\dist\ecosystem.json -Raw | ConvertFrom-Json).count
```

`dist\CNAME` must read `bcaicompass.ca`. The count must be at least 100.

---

## 1. First-time deployment — Cloudflare Pages

Exact click path. Cloudflare renames things; if a label differs, the parenthetical
says what to look for.

1. Sign in at **dash.cloudflare.com**.
2. Left sidebar → **Compute (Workers)** → **Workers & Pages**.
3. **Create** → **Pages** tab → **Connect to Git**.
4. Authorise GitHub if prompted, then select the **`bcaicompass`** repository.
5. **Set up builds and deployments:**
   - Production branch: **`main`**
   - Framework preset: **None** (do **not** pick Vite — the preset overrides the
     build command, and this project's `prebuild` step must run)
   - Build command: **`npm run build`**
   - Build output directory: **`dist`**
   - Root directory: leave blank
6. **Environment variables** → **Add variable** for the production environment:
   - `NODE_VERSION` = **`20`**

   Set this explicitly. Cloudflare's default image has changed before, and a
   silent Node downgrade breaks `tsc -b` in a way whose error message points
   nowhere useful.
7. **Save and Deploy.** Watch the log. You are looking for two lines, in order:
   ```
   export-data: OK — 102 verified organizations, 97 with sourced coordinates.
   ✓ built in ...
   ```
   If the first line is missing, `prebuild` did not run — go back to step 5 and
   check the framework preset is None.
8. When the deploy finishes, open the `*.pages.dev` URL and confirm the map renders
   and the directory lists records.

### 1.1 Custom domain

9. In the project → **Custom domains** → **Set up a custom domain**.
10. Enter **`bcaicompass.ca`** → **Continue** → **Activate domain**.
11. Repeat for **`www.bcaicompass.ca`**.

If the `bcaicompass.ca` zone is in the same Cloudflare account, DNS records and the
TLS certificate are created automatically — nothing to add by hand. If the zone
lives elsewhere, Cloudflare shows the exact CNAME target to add at your registrar;
use that value, not one from memory.

12. Confirm HTTPS resolves at `https://bcaicompass.ca/` and that
    `https://bcaicompass.ca/ecosystem.json` returns JSON.

### 1.2 Confirm the security headers actually applied

`public\_headers` ships to `dist\_headers` and Cloudflare Pages applies it. Verify
rather than assume:

```powershell
$r = Invoke-WebRequest -Uri "https://bcaicompass.ca/" -Method Head -UseBasicParsing
$r.Headers.GetEnumerator() | Sort-Object Key | Format-Table -AutoSize
```

Expected: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`.

Then confirm the page is not silently unthemed, which is what a stale CSP hash looks
like — open the site, open the browser console, and check for a
`Refused to execute inline script` error. If it is there, the inline theme script in
`index.html` changed without the CSP being updated:

```powershell
powershell -NoProfile -File .\research\audit\Get-CspHash.ps1
```

Paste the printed value into the `script-src` directive in `public\_headers`, then
rebuild and redeploy. `Test-ExitConditions.ps1` checks this pairing on every run, so
it should never reach production — but check anyway.

### 1.3 If GitHub Pages was ever enabled on this repository

Turn it off, or DNS and deploys will fight: repository → **Settings** → **Pages** →
**Source** → **None**.

---

## 2. Routine deployment

```powershell
Set-Location C:\Users\User\dev\BCAICompass
powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1
git add -A
git status
git commit -m "data: re-verify <what changed>"
git push origin main
```

Every push to `main` auto-deploys. Watch the build log for the `export-data: OK`
line before considering it shipped.

---

## 3. Rollback

Two routes. **Use the first** — it is instant and needs no build.

### 3.1 Instant redeploy of a previous version (preferred)

1. dash.cloudflare.com → **Workers & Pages** → **bcaicompass**.
2. **Deployments** tab.
3. Find the last known-good deployment. Confirm it by its commit message and
   timestamp before acting.
4. Row menu (**…**) → **Rollback to this deployment** → confirm.

Live within seconds. No rebuild, so a broken build cannot break the rollback.

### 3.2 Revert the commit

Use when the bad state must leave `main` as well, not just production.

```powershell
Set-Location C:\Users\User\dev\BCAICompass
git log --oneline -10
git revert --no-edit <bad-commit-sha>
powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1
git push origin main
```

**Never** `git push --force`, and **never** rewrite published history to undo a
deploy. `git revert` adds a commit; that is the point. A forced push to `main`
desynchronises every clone and Cloudflare's deployment history, and there is no
situation on this project where it is the right tool.

### 3.3 If the data is wrong rather than the code

A wrong record is the more likely emergency, and it does not need a rollback.
Delete or correct the record in `src\data\organizations.ts`, then:

```powershell
npm run verify:data
npm run build
git add src\data\organizations.ts public\ecosystem.json public\ecosystem.geojson
git commit -m "data: remove <organization> — <reason>, source <url>"
git push origin main
```

Removing a record is always safe: the build only fails if the count drops below 100.
If a removal would take it under 100, that is a real signal — the dataset is thinner
than it claims and the fix is verification, not lowering the floor.

---

## 4. Re-verification cadence

**Oldest `verified` stamp first, always.** The whole dataset was stamped `2026-08`
in one pass, so the first cycle is uniform; after that, the stamps spread out and
this ordering starts doing real work.

### 4.1 Find the stalest records

```powershell
Set-Location C:\Users\User\dev\BCAICompass
$eco = Get-Content .\public\ecosystem.json -Raw -Encoding UTF8 | ConvertFrom-Json
$eco.organizations |
  Sort-Object verified, category, name |
  Select-Object -First 25 verified, category, region, name, sourceUrl |
  Format-Table -AutoSize
```

Count what is due, by category:

```powershell
$cutoffQuarterly = (Get-Date).AddMonths(-3).ToString('yyyy-MM')
$cutoffAnnual    = (Get-Date).AddMonths(-12).ToString('yyyy-MM')
$fast = @('Companies & Applied AI','Community & Convening')
$eco.organizations | ForEach-Object {
  $due = if ($fast -contains $_.category) { $_.verified -lt $cutoffQuarterly } else { $_.verified -lt $cutoffAnnual }
  if ($due) { $_ }
} | Group-Object category | Sort-Object Count -Descending | Format-Table Count, Name -AutoSize
```

### 4.2 The schedule

| Category | Cadence | Why |
|---|---|---|
| **Companies & Applied AI** | Quarterly | BC tech companies closed 82+ M&A deals in 2025. Ownership change is the normal case. |
| **Community & Convening** | Quarterly | Meetups and community groups go dormant quietly, and a Meetup URL reveals nothing about whether the group still meets. |
| **Capital & Accelerators** | Semi-annually | Programmes and cohorts change; the organizations rarely disappear. |
| **Compute & Infrastructure** | Annually — **plus an event trigger, see below** | Multi-year builds. Stable between milestones, then they move all at once. |
| **Research & Academia** | Annually | Labs are stable. The *pages* are not — see §4.4. |
| **Public Sector & Policy** | Annually, and after any provincial election or ministry reorganisation | Ministry names change with governments. |
| **Talent & Education** | Annually | |

### 4.3 The event trigger that matters most

**BC Hydro notifies successful applicants for the 400 MW AI and data-centre
allocation in September 2026.** 15 applications totalling roughly 800 MW were
reported against 400 MW available, so roughly half will be refused.

**Re-verify every `Compute & Infrastructure` record within two weeks of that
announcement.** It will change this map more than anything else on the horizon, and
a data-centre record that silently goes stale is the most misleading kind this
dataset can carry.

### 4.4 The concentration risk to watch

59 of 102 records rest on 16 institutional pages. **If UBC restructures its research
site, a fifth of the dataset loses its source at once** — and the records will still
render, still stamped, still linking a dead URL.

Check for that specifically, every cycle:

```powershell
$eco = Get-Content .\public\ecosystem.json -Raw -Encoding UTF8 | ConvertFrom-Json
$eco.organizations | Group-Object sourceUrl |
  Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending |
  Select-Object Count, Name | Format-Table -AutoSize
```

Any `sourceUrl` carrying five or more records is a single point of failure. Load each
one by hand before trusting the records under it.

### 4.5 Link rot sweep

Between full cycles, a cheap check that every `sourceUrl` and `url` still resolves.
This catches the `4agrobotics.com` case — a domain that resolves but is now a
parking page will return 200 here, so **a 200 is not a pass, it is a "look at it"**.

```powershell
Set-Location C:\Users\User\dev\BCAICompass
$eco = Get-Content .\public\ecosystem.json -Raw -Encoding UTF8 | ConvertFrom-Json
$report = foreach ($o in $eco.organizations) {
  foreach ($pair in @(@{K='url';V=$o.url}, @{K='sourceUrl';V=$o.sourceUrl})) {
    $status = ''
    try {
      $resp = Invoke-WebRequest -Uri $pair.V -Method Head -TimeoutSec 20 -MaximumRedirection 5 -UseBasicParsing -ErrorAction Stop
      $status = [string]$resp.StatusCode
    } catch {
      $status = 'ERROR: ' + $_.Exception.Message
    }
    [pscustomobject]@{ Id = $o.id; Field = $pair.K; Status = $status; Url = $pair.V }
  }
}
$report | Where-Object { $_.Status -ne '200' } | Format-Table -AutoSize
$report | Export-Csv .\research\audit\link-check.csv -NoTypeInformation -Encoding UTF8
"checked $($report.Count) URLs; $((@($report | Where-Object { $_.Status -ne '200' })).Count) need attention"
```

### 4.6 Stamping a re-verified record

Re-verification means re-reading the source, not bumping a date. When a record is
genuinely re-checked:

- `verified` → the current `YYYY-MM`
- `sourceDate` → the day you re-read it
- `sourceUrl` → the page you actually read this time, even if it moved

Then `npm run verify:data`, commit with the reason, push.

**Bumping `verified` without re-reading the source reproduces the exact defect this
project was built to correct.** The predecessor database had a `Last Verified` field
too. It meant nothing.

---

## 5. Deployment facts, in one place

| | |
|---|---|
| Host | Cloudflare Pages |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Framework preset | **None** |
| `NODE_VERSION` | `20` |
| Custom domains | `bcaicompass.ca`, `www.bcaicompass.ca` |
| Domain file | `public\CNAME` → `dist\CNAME` |
| Headers file | `public\_headers` → `dist\_headers` |
| Published data | `dist\ecosystem.json`, `dist\ecosystem.geojson` |
| Never deployed | `research\` — including `unverified.json`, which is checked for in `dist\` on every gate run |
| Rollback | Cloudflare **Deployments** → **Rollback to this deployment** |
| Forbidden | `git push --force`, history rewrites, deploying with any FAIL condition |
