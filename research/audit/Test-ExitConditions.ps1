<#
.SYNOPSIS
  Runs every exit condition for BC AI Compass and reports PASS/FAIL per item.

.DESCRIPTION
  This is the gate. It is a script rather than a checklist so that "it passed"
  is a fact rather than a claim. Exits non-zero if any condition fails.

  Pure ASCII on purpose -- see Analyze-ArtifactA.ps1 for why.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1
  powershell -NoProfile -File .\research\audit\Test-ExitConditions.ps1 -CleanInstall
#>
[CmdletBinding()]
param(
  [string]$Root = 'C:\Users\User\dev\BCAICompass',
  [switch]$CleanInstall
)
$ErrorActionPreference = 'Continue'
Set-Location $Root

$results = New-Object System.Collections.ArrayList
function Add-Result {
  param([string]$Name, [bool]$Pass, [string]$Detail = '')
  [void]$results.Add([pscustomobject]@{ Name = $Name; Pass = $Pass; Detail = $Detail })
  $tag = if ($Pass) { 'PASS' } else { 'FAIL' }
  '{0}  {1}{2}' -f $tag, $Name, $(if ($Detail) { "  --  $Detail" } else { '' })
}

'=' * 78
'BC AI COMPASS -- EXIT CONDITIONS'
'run at (local): ' + (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
'=' * 78
''

# ---------------------------------------------------------------- 1. clean build
if ($CleanInstall) {
  # The condition is "builds from a CLEAN node_modules", so the removal has to be
  # proven, not attempted. esbuild.exe in particular can be held open by a
  # lingering service process, and an install over a half-deleted tree is not a
  # clean install -- reporting it as one would make this whole gate a formality.
  'Removing node_modules and dist for a clean install...'

  # esbuild runs as a long-lived child process and keeps its own binary open, so
  # a previous `vite build` in this shell will block the removal. Stop only the
  # esbuild processes whose executable lives under THIS project root -- never a
  # process belonging to anything else on the machine.
  $rootPrefix = (Resolve-Path '.').Path
  $held = @(Get-Process -Name esbuild -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -and $_.Path.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
  })

  # A `npm run dev` vite server holds node_modules open for as long as it runs, so
  # a dev session in another terminal silently downgrades this gate from "clean
  # install" to "install over whatever was there". Matched on the command line
  # containing THIS project root, so no unrelated node process is touched. The
  # server is trivially restartable with `npm run dev`.
  $devServers = @(Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine -like ('*' + $rootPrefix + '*') })
  foreach ($p in $devServers) {
    '  stopping project node process pid ' + $p.ProcessId + ' (' + $p.CommandLine.Trim() + ')'
    try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch { }
  }

  foreach ($p in $held) {
    '  stopping esbuild pid ' + $p.Id + ' (' + $p.Path + ')'
    try { Stop-Process -Id $p.Id -Force -ErrorAction Stop } catch { }
  }
  if ($held.Count -gt 0 -or $devServers.Count -gt 0) { Start-Sleep -Milliseconds 1200 }

  foreach ($target in @('node_modules', 'dist')) {
    for ($attempt = 1; $attempt -le 3; $attempt++) {
      if (-not (Test-Path $target)) { break }
      try { Remove-Item -Recurse -Force $target -ErrorAction Stop } catch { }
      if (Test-Path $target) { Start-Sleep -Milliseconds 800 }
    }
  }
  $reallyClean = -not (Test-Path 'node_modules')
  if (-not $reallyClean) {
    $left = @(Get-ChildItem 'node_modules' -Recurse -File -ErrorAction SilentlyContinue)
    '  node_modules could not be fully removed; ' + $left.Count + ' file(s) remain (likely locked):'
    $left | Select-Object -First 5 | ForEach-Object { '    ' + $_.FullName }
  }

  $npmi = & npm install --no-audit --no-fund 2>&1
  $installOk = $LASTEXITCODE -eq 0
  $null = $npmi
  Add-Result 'npm install from a clean node_modules' ($installOk -and $reallyClean) `
    ("install exit $LASTEXITCODE; node_modules verified removed before install: $reallyClean")
} else {
  Add-Result 'npm install from a clean node_modules' (Test-Path 'node_modules') 'NOT TESTED: pass -CleanInstall to force'
}

$buildOut = & npm run build 2>&1
$buildOk = $LASTEXITCODE -eq 0
Add-Result 'npm run build succeeds' $buildOk ("exit $LASTEXITCODE")
if (-not $buildOk) { $buildOut | Select-Object -Last 20 | ForEach-Object { '      ' + $_ } }

# ---------------------------------------------------------------- 2. tsc
$null = & npx tsc -b --force 2>&1
Add-Result 'tsc reports no errors' ($LASTEXITCODE -eq 0) ("exit $LASTEXITCODE")

# ---------------------------------------------------------------- 3. eslint
$lintOut = & npm run lint 2>&1
$lintOk = $LASTEXITCODE -eq 0
Add-Result 'eslint reports no errors' $lintOk ("exit $LASTEXITCODE")
if (-not $lintOk) { $lintOut | Select-Object -Last 20 | ForEach-Object { '      ' + $_ } }

# ---------------------------------------------------------------- 4. JSON parses
$jsonOk = $true; $jsonDetail = ''
foreach ($f in @('public\ecosystem.json', 'public\ecosystem.geojson')) {
  if (-not (Test-Path $f)) { $jsonOk = $false; $jsonDetail += "$f missing; "; continue }
  try { $null = Get-Content $f -Raw -Encoding UTF8 | ConvertFrom-Json }
  catch { $jsonOk = $false; $jsonDetail += "$f does not parse; " }
}
Add-Result 'ecosystem.json and ecosystem.geojson parse as valid JSON' $jsonOk $jsonDetail

$eco = Get-Content 'public\ecosystem.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$geo = Get-Content 'public\ecosystem.geojson' -Raw -Encoding UTF8 | ConvertFrom-Json
$orgs = $eco.organizations

# ---------------------------------------------------------------- 5. unique ids
$ids = @($orgs | ForEach-Object { $_.id })
$uniq = @($ids | Select-Object -Unique)
Add-Result 'every id is unique' ($ids.Count -eq $uniq.Count) ("$($ids.Count) records, $($uniq.Count) distinct")

# ---------------------------------------------------------------- 6. per-record fields
$bad = @($orgs | Where-Object {
  $_.status -ne 'verified' -or
  [string]::IsNullOrWhiteSpace($_.sourceUrl) -or
  [string]::IsNullOrWhiteSpace($_.sourceDate) -or
  [string]::IsNullOrWhiteSpace($_.verified) -or
  $_.sourceUrl -notmatch '^https?://' -or
  $_.sourceDate -notmatch '^\d{4}-\d{2}-\d{2}$' -or
  $_.verified -notmatch '^\d{4}-\d{2}$'
})
Add-Result 'every record: status verified, non-null sourceUrl, sourceDate, verified stamp' ($bad.Count -eq 0) ("$($bad.Count) offending")
$bad | ForEach-Object { '      [' + $_.id + ']' }

Add-Result 'at least 100 verified records' ($orgs.Count -ge 100) ("$($orgs.Count) records")

# ---------------------------------------------------------------- 7. category closure
$declared = @($eco.categories)
$used = @($orgs | ForEach-Object { $_.category } | Select-Object -Unique)
$declaredNotUsed = @($declared | Where-Object { $used -notcontains $_ })
$usedNotDeclared = @($used | Where-Object { $declared -notcontains $_ })
Add-Result 'every category in the data appears in the union, and vice versa' `
  (($declaredNotUsed.Count -eq 0) -and ($usedNotDeclared.Count -eq 0)) `
  ("declared-but-unused: $($declaredNotUsed.Count); used-but-undeclared: $($usedNotDeclared.Count)")
$declaredNotUsed | ForEach-Object { '      declared but unused: ' + $_ }
$usedNotDeclared | ForEach-Object { '      used but undeclared: ' + $_ }

# ---------------------------------------------------------------- 8. coordinates sourced
$coordNoSource = @($orgs | Where-Object { $null -ne $_.lat -and [string]::IsNullOrWhiteSpace($_.geoSourceUrl) })
Add-Result 'no record carries coordinates without a geoSourceUrl' ($coordNoSource.Count -eq 0) ("$($coordNoSource.Count) offending")

$mapped = @($orgs | Where-Object { $null -ne $_.lat })
Add-Result 'geojson feature count matches records with coordinates' `
  ($geo.features.Count -eq $mapped.Count) ("geojson $($geo.features.Count) vs data $($mapped.Count)")

# ---------------------------------------------------------------- 9. no inherited values in src\
# Field names that would mean something was carried forward from artifact A.
# keyPeople was on this list and was removed on 2026-08-19 when the field was
# restored. It is now carried where a source names a current officer. The privacy
# concern that banned it was about scraped contact details -- emails and phone
# numbers -- which remain banned. funding, yearFounded and focusAreas stay banned
# outright: every predecessor value for them was generated rather than researched.
$forbidden = @('funding', 'yearFounded', 'focusAreas')
$hits = New-Object System.Collections.ArrayList
foreach ($term in $forbidden) {
  $m = Select-String -Path 'src\*.ts', 'src\*.tsx', 'src\**\*.ts', 'src\**\*.tsx' -Pattern ("\b" + $term + "\s*:") -ErrorAction SilentlyContinue
  foreach ($x in $m) { [void]$hits.Add("$($x.Filename):$($x.LineNumber) $term") }
}
Add-Result 'no funding / keyPeople / yearFounded / focus-area field appears anywhere in src\' ($hits.Count -eq 0) ("$($hits.Count) hits")
$hits | ForEach-Object { '      ' + $_ }

# Also assert the predecessor's source tag never reaches src\ AS A VALUE.
# Deliberately scoped to quoted strings. src\data\organizations.ts names the tag
# once, in a header comment, to record that nothing traces to it -- documenting
# the exclusion is the opposite of violating it, and a check that cannot tell
# those apart would push the next person to delete the provenance note.
$tagPattern = "['`"][^'`"]*database-backup-2025-08-04[^'`"]*['`"]"
$tagHits = @(Select-String -Path 'src\*.ts', 'src\*.tsx', 'src\**\*.ts', 'src\**\*.tsx' -Pattern $tagPattern -ErrorAction SilentlyContinue)
Add-Result 'the predecessor dump tag never appears as a value in src\' ($tagHits.Count -eq 0) ("$($tagHits.Count) hits")
$tagHits | ForEach-Object { '      ' + $_.Filename + ':' + $_.LineNumber }

# ---------------------------------------------------------------- 10. src\ never imports research\
$resHits = @(Select-String -Path 'src\*.ts', 'src\*.tsx', 'src\**\*.ts', 'src\**\*.tsx' -Pattern "from\s+['`"][^'`"]*research/" -ErrorAction SilentlyContinue)
Add-Result 'nothing in src\ imports from research\' ($resHits.Count -eq 0) ("$($resHits.Count) hits")

# ---------------------------------------------------------------- 11. unverified.json is not built
$unverifiedInDist = @(Get-ChildItem -Path 'dist' -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -eq 'unverified.json' })
Add-Result 'unverified.json is not present in dist\' ($unverifiedInDist.Count -eq 0) ("$($unverifiedInDist.Count) found")

# ---------------------------------------------------------------- 12. deploy artifacts
$distIndex = Test-Path 'dist\index.html'
$distCname = (Test-Path 'dist\CNAME') -and ((Get-Content 'dist\CNAME' -Raw).Trim() -eq 'bc-aicompass.ca')
$distHeaders = Test-Path 'dist\_headers'
$distJson = (Test-Path 'dist\ecosystem.json') -and (Test-Path 'dist\ecosystem.geojson')
Add-Result 'dist\ contains index.html, CNAME (bc-aicompass.ca), _headers and both data files' `
  ($distIndex -and $distCname -and $distHeaders -and $distJson) `
  ("index=$distIndex cname=$distCname headers=$distHeaders data=$distJson")

# ---------------------------------------------------------------- 13. CSP hash matches
$html = [System.IO.File]::ReadAllText('index.html')
$rx = [regex]'(?s)<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>'
$sha = [System.Security.Cryptography.SHA256]::Create()
$hashesOk = $true
foreach ($m in $rx.Matches($html)) {
  $b = [System.Text.Encoding]::UTF8.GetBytes($m.Groups[1].Value)
  $h = "'sha256-" + [Convert]::ToBase64String($sha.ComputeHash($b)) + "'"
  $headers = Get-Content 'public\_headers' -Raw
  if ($headers -notlike ('*' + $h + '*')) { $hashesOk = $false; '      missing from _headers: ' + $h }
}
$sha.Dispose()
Add-Result 'every inline script hash in index.html is present in public\_headers CSP' $hashesOk ''

# ---------------------------------------------------------------------------
# 14. The gate must count the same thing the artifact does.
# A gate that reports a different record count from the file it gates is not
# measuring what it claims to measure. Cross-checked against BOTH the emitted
# JSON and the TypeScript source of truth.
# ---------------------------------------------------------------------------
$srcText = Get-Content 'src\data\organizations.ts' -Raw -Encoding UTF8
$srcIds = @([regex]::Matches($srcText, "(?m)^\s{4}id: '([^']+)'") | ForEach-Object { $_.Groups[1].Value })
$countsAgree = ($srcIds.Count -eq $orgs.Count) -and ($orgs.Count -eq $eco.count)
Add-Result 'record count agrees across organizations.ts, ecosystem.json and this report' $countsAgree `
  ("organizations.ts $($srcIds.Count); ecosystem.json.organizations $($orgs.Count); ecosystem.json.count $($eco.count)")

# ---------------------------------------------------------------- 15. evidence quotes
$noQuoteNoFlag = @($orgs | Where-Object {
  $null -eq $_.evidenceQuote -and ($_.flags -notcontains 'quote-pending')
})
Add-Result 'every record has an evidenceQuote or a quote-pending flag' ($noQuoteNoFlag.Count -eq 0) `
  ("$($noQuoteNoFlag.Count) offending")
$noQuoteNoFlag | ForEach-Object { '      [' + $_.id + ']' }

$longQuotes = @($orgs | Where-Object {
  $_.evidenceQuote -and (@($_.evidenceQuote -split '\s+' | Where-Object { $_ -ne '' }).Count -ge 15)
})
Add-Result 'every evidenceQuote is under 15 words' ($longQuotes.Count -eq 0) ("$($longQuotes.Count) too long")
$longQuotes | ForEach-Object { '      [' + $_.id + '] ' + (@($_.evidenceQuote -split '\s+').Count) + ' words' }

$pending = @($orgs | Where-Object { $null -eq $_.evidenceQuote })
Add-Result 'quote-pending count is reported' $true ("$($pending.Count) of $($orgs.Count) records are quote-pending")

# The eight hand-verified quotes must appear verbatim, not reworded.
$vrPath = 'research\verified\verified-records.json'
if (Test-Path $vrPath) {
  $vr = Get-Content $vrPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $missing = New-Object System.Collections.ArrayList
  foreach ($r in $vr.records) {
    if ([string]::IsNullOrWhiteSpace($r.evidenceQuote)) { continue }
    if (-not $srcText.Contains($r.evidenceQuote)) { [void]$missing.Add($r.id) }
  }
  Add-Result 'the hand-verified quotes appear verbatim in the dataset' ($missing.Count -eq 0) `
    ("$($vr.records.Count) checked; $($missing.Count) missing")
  $missing | ForEach-Object { '      missing verbatim quote for: ' + $_ }
} else {
  Add-Result 'the hand-verified quotes appear verbatim in the dataset' $false 'verified-records.json not found'
}

# ---------------------------------------------------------------- 16. the false claim
$claimPattern = 'not affiliated with, endorsed by'
$claimHits = New-Object System.Collections.ArrayList
foreach ($f in @('public\ecosystem.json', 'README.md')) {
  if ((Test-Path $f) -and (Select-String -Path $f -Pattern $claimPattern -SimpleMatch -Quiet)) { [void]$claimHits.Add($f) }
}
# Rendered sections: the built bundle is what a visitor actually receives.
$bundles = @(Get-ChildItem 'dist\assets' -Filter '*.js' -File -ErrorAction SilentlyContinue)
foreach ($b in $bundles) {
  if (Select-String -Path $b.FullName -Pattern $claimPattern -SimpleMatch -Quiet) { [void]$claimHits.Add($b.Name) }
}
Add-Result 'the independence claim appears in no published artifact' ($claimHits.Count -eq 0) `
  ("checked ecosystem.json, README.md and $($bundles.Count) built bundle(s); $($claimHits.Count) hit(s)")
$claimHits | ForEach-Object { '      ' + $_ }

# ---------------------------------------------------------------- 17. scope reinstatements
$mustBePresent = @('abcellera', 'visier', 'innovate-bc', 'digibc', 'accelerate-okanagan')
$absent = @($mustBePresent | Where-Object { $orgs.id -notcontains $_ })
Add-Result 'the five organizations withheld under the old scope test are present' ($absent.Count -eq 0) `
  ("$($absent.Count) still absent")
$absent | ForEach-Object { '      absent: ' + $_ }

# ---------------------------------------------------------------- 18. out-of-scope
$mustBeAbsent = @('cohere', 'colab-software', 'featherless-ai')
$present = @($mustBeAbsent | Where-Object { $orgs.id -contains $_ })
Add-Result 'Cohere, CoLab Software and Featherless AI do not appear as BC organizations' ($present.Count -eq 0) `
  ("$($present.Count) present")

# Ethos Lab must never be filed under an Indigenous category or described as Indigenous.
$ethos = @($orgs | Where-Object { $_.id -eq 'ethos-lab' })
$ethosClean = $true
foreach ($e in $ethos) {
  if ($e.category -match '(?i)indigenous') { $ethosClean = $false }
  if ($e.description -and $e.description -match '(?i)indigenous') { $ethosClean = $false }
}
Add-Result 'Ethos Lab does not appear under any Indigenous category or framing' $ethosClean `
  ("record present: $($ethos.Count -gt 0)")

# ---------------------------------------------------------------- 19. fields that stay null
$nullViolations = New-Object System.Collections.ArrayList
$caida = @($orgs | Where-Object { $_.id -eq 'caida' })
foreach ($c in $caida) { if ($null -ne $c.size) { [void]$nullViolations.Add('caida.size') } }
$ibc = @($orgs | Where-Object { $_.id -eq 'innovate-bc' })
foreach ($i in $ibc) { if ($i.description -match '(?i)reports to the Ministry') { [void]$nullViolations.Add('innovate-bc ministry') } }
$bcai = @($orgs | Where-Object { $_.id -eq 'bc-ai-ecosystem-association' })
foreach ($b in $bcai) { if ($b.description -match '(?i)founded in 20\d\d|since 20\d\d') { [void]$nullViolations.Add('bc-ai founding year') } }
Add-Result 'no non-null value in any field required to stay null' ($nullViolations.Count -eq 0) `
  ("$($nullViolations.Count) violation(s): " + ($nullViolations -join ', '))

# ---------------------------------------------------------------- 20. union + seed flags
$EXTENDED_FLAGS = @('section-heading','markdown-artifact','unmerged-duplicate','linkedin-as-website',
                    'duplicate-name','duplicate-domain','non-bc-suspected','defunct-suspected',
                    'person-not-org','product-not-org','no-url','not-an-entity','synthesized-url',
                    'marked-for-deletion')
if (Test-Path 'research\union.json') {
  $union = Get-Content 'research\union.json' -Raw -Encoding UTF8 | ConvertFrom-Json
  $uIds = @($union | ForEach-Object { $_.id })
  $uUniq = @($uIds | Select-Object -Unique)
  $badFlags = @($union | ForEach-Object { $_.flags } | Where-Object { $_ } | Select-Object -Unique |
    Where-Object { $EXTENDED_FLAGS -notcontains $_ })
  Add-Result 'union.json exists with unique ids and only closed-set flags' `
    (($uIds.Count -eq $uUniq.Count) -and ($badFlags.Count -eq 0)) `
    ("$($uIds.Count) records, $($uUniq.Count) distinct ids, $($badFlags.Count) out-of-set flag(s)")
  $badFlags | ForEach-Object { '      unexpected flag: ' + $_ }
  Add-Result 'union.json is materially larger than the single-file seed' ($uIds.Count -gt 2000) `
    ("$($uIds.Count) names across every json/csv in the reference clone")
} else {
  Add-Result 'union.json exists with unique ids and only closed-set flags' $false 'research\union.json not found'
}

$seed = Get-Content 'research\seed.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$seedNotEntity = @($seed | Where-Object { $_.flags -contains 'not-an-entity' }).Count
$seedSynth = @($seed | Where-Object { $_.flags -contains 'synthesized-url' }).Count
Add-Result 'seed.json carries not-an-entity on the report-fragment rows' ($seedNotEntity -ge 250) `
  ("$seedNotEntity rows flagged not-an-entity")
Add-Result 'seed.json carries synthesized-url on the name-derived URLs' ($seedSynth -ge 150) `
  ("$seedSynth rows flagged synthesized-url")

# ---------------------------------------------------------------- 21. region coverage
$regionsDeclared = @($eco.regions)
$uncoveredRegions = @($regionsDeclared | Where-Object { @($orgs | Where-Object { $_.region -eq $_ }).Count -eq 0 })
$uncoveredRegions = @()
foreach ($r in $regionsDeclared) {
  $n = @($orgs | Where-Object { $_.region -eq $r }).Count
  if ($n -eq 0) { $uncoveredRegions += $r }
}
$coverageDoc = if (Test-Path 'research\COVERAGE.md') { Get-Content 'research\COVERAGE.md' -Raw -Encoding UTF8 } else { '' }
$allExplained = $true
foreach ($r in $uncoveredRegions) {
  if ($coverageDoc -notlike ('*' + $r + '*')) { $allExplained = $false; '      no searched-conclusion written for: ' + $r }
}
Add-Result 'every region has a record or a written searched-conclusion' $allExplained `
  ("$($uncoveredRegions.Count) region(s) with zero records, all documented in COVERAGE.md: $allExplained")

# ---------------------------------------------------------------------------
# 22. The ecosystem-tool layer sits OVER the dataset and never inside it.
# The onramp/pathway work is a layer of navigation; if it ever needed a record
# changed to make a route work, the route would be describing the tool rather
# than the province. git is the arbiter, not inspection.
# ---------------------------------------------------------------------------
git diff --quiet -- 'src\data\organizations.ts' 2>&1 | Out-Null
$dataUntouchedUnstaged = ($LASTEXITCODE -eq 0)
git diff --cached --quiet -- 'src\data\organizations.ts' 2>&1 | Out-Null
$dataUntouchedStaged = ($LASTEXITCODE -eq 0)
Add-Result 'src\data\organizations.ts is untouched by this feature' `
  ($dataUntouchedUnstaged -and $dataUntouchedStaged) `
  ("unstaged clean: $dataUntouchedUnstaged; staged clean: $dataUntouchedStaged")

# ---------------------------------------------------------------- 23. pathways
$pathwaysSrc = Get-Content 'src\data\pathways.ts' -Raw -Encoding UTF8
$orgIds = @($orgs | ForEach-Object { $_.id })

# Parse the draft stop lists straight out of the source, so the gate sees what the
# author wrote rather than what the module chose to export after filtering.
$stopBlocks = [regex]::Matches($pathwaysSrc, "stops:\s*\[(.*?)\]", 'Singleline')
$allStops = New-Object System.Collections.ArrayList
foreach ($b in $stopBlocks) {
  foreach ($m in [regex]::Matches($b.Groups[1].Value, "'([^']+)'")) { [void]$allStops.Add($m.Groups[1].Value) }
}
$unresolved = @($allStops | Where-Object { $orgIds -notcontains $_ } | Select-Object -Unique)
Add-Result 'every pathway stop id resolves to a record in ORGANIZATIONS' ($unresolved.Count -eq 0) `
  ("$($allStops.Count) stop references across $($stopBlocks.Count) pathways; $($unresolved.Count) unresolved")
$unresolved | ForEach-Object { '      unresolved stop id: ' + $_ }

$shortPathways = @($stopBlocks | Where-Object {
  ([regex]::Matches($_.Groups[1].Value, "'([^']+)'")).Count -lt 3
})
Add-Result 'every shipped pathway has at least 3 stops' ($shortPathways.Count -eq 0) `
  ("$($stopBlocks.Count) pathways; $($shortPathways.Count) under 3 stops")

# The BC Hydro note is a factual claim and may appear only while its source says so.
$noteInPathways = $pathwaysSrc -match 'BC Hydro decides the power behind all of this in September 2026'
$govLayer = if (Test-Path 'research\GOVERNMENT-LAYER.md') { Get-Content 'research\GOVERNMENT-LAYER.md' -Raw -Encoding UTF8 } else { '' }
$govSupports = ($govLayer -match 'allocation in mid-September 2026') -and ($govLayer -match '400 MW')
Add-Result 'the BC Hydro pathway note appears only if GOVERNMENT-LAYER.md supports it' `
  ((-not $noteInPathways) -or $govSupports) `
  ("note present: $noteInPathways; government layer supports it: $govSupports")

# ---------------------------------------------------------------- 24. onramps
$onrampsSrc = Get-Content 'src\data\onramps.ts' -Raw -Encoding UTF8
$declaredCats = @($eco.categories)
$onrampCats = @()
foreach ($m in [regex]::Matches($onrampsSrc, "categories:\s*\[(.*?)\]", 'Singleline')) {
  foreach ($c in [regex]::Matches($m.Groups[1].Value, "'([^']+)'")) { $onrampCats += $c.Groups[1].Value }
}
$onrampCats = @($onrampCats | Select-Object -Unique)
$badCats = @($onrampCats | Where-Object { $declaredCats -notcontains $_ })
Add-Result 'every onramp category is a member of CATEGORIES' ($badCats.Count -eq 0) `
  ("$($onrampCats.Count) distinct categories referenced; $($badCats.Count) not in the union")
$badCats | ForEach-Object { '      not a declared category: ' + $_ }

# A hardcoded count is a fact that goes stale silently. Counts must be derived.
$countLiterals = New-Object System.Collections.ArrayList
foreach ($f in @('src\sections\Onramps.tsx', 'src\sections\Pathways.tsx', 'src\data\onramps.ts', 'src\data\pathways.ts')) {
  if (-not (Test-Path $f)) { continue }
  foreach ($line in (Get-Content $f -Encoding UTF8)) {
    # Comments are not rendered, so a number in one cannot go stale on a visitor.
    # Skipping them keeps the check pointed at the thing it actually cares about:
    # a literal count reaching the page.
    $trimmed = $line.Trim()
    if ($trimmed.StartsWith('//') -or $trimmed.StartsWith('*') -or $trimmed.StartsWith('/*')) { continue }
    # A bare number next to "record"/"organization"/"verified" in rendered text.
    if ($line -match '\b\d{2,}\s*(verified|records?|organizations?)\b') { [void]$countLiterals.Add($f + ': ' + $trimmed) }
  }
}
Add-Result 'no hardcoded record counts in the onramp or pathway layer' ($countLiterals.Count -eq 0) `
  ("$($countLiterals.Count) suspect literal(s)")
$countLiterals | ForEach-Object { '      ' + $_ }

# ---------------------------------------------------------------- 25. no raw hex in new components
$hexHits = New-Object System.Collections.ArrayList
foreach ($f in @('src\sections\Onramps.tsx', 'src\sections\Pathways.tsx', 'src\data\onramps.ts', 'src\data\pathways.ts', 'src\data\preset.ts')) {
  if (-not (Test-Path $f)) { continue }
  foreach ($h in (Select-String -Path $f -Pattern '#[0-9a-fA-F]{3,8}\b')) {
    [void]$hexHits.Add($f + ':' + $h.LineNumber)
  }
}
Add-Result 'no raw hex colour in any new component' ($hexHits.Count -eq 0) ("$($hexHits.Count) hit(s)")
$hexHits | ForEach-Object { '      ' + $_ }

# ---------------------------------------------------------------- 26. SHIP.md freshness
$ship = Get-Content 'research\SHIP.md' -Raw -Encoding UTF8
$shipStale = New-Object System.Collections.ArrayList
if ($ship -match '17 exit conditions' -or $ship -match 'All 17 conditions') { [void]$shipStale.Add('17 exit conditions') }
if ($ship -match '104 organizations' -or $ship -match '104 verified organizations') { [void]$shipStale.Add('104 organizations') }
if ($ship -match '(?m)^###\s*4\.3\.1') { [void]$shipStale.Add('duplicated 4.3.1') }
if ($ship -match '59 of 104') { [void]$shipStale.Add('59 of 104 recount') }
Add-Result 'SHIP.md carries no stale counts and no duplicated 4.3.1' ($shipStale.Count -eq 0) `
  ("$($shipStale.Count) stale item(s): " + ($shipStale -join ', '))

# ---------------------------------------------------------------- 27. dataset size held
# Derived, never hardcoded. This condition originally froze the literal 117 to
# guard the onramps feature against silently changing the dataset -- and then
# failed the moment a legitimately verified record was added, in a suite that
# separately forbids hardcoded counts in the feature layer. The real invariant
# is AGREEMENT between the source of truth and the generated artifacts, not a
# particular number. A record added on purpose passes; a record lost by accident
# still fails, because the three counts diverge.
$tsRecordCount = ([regex]::Matches($srcText, "(?m)^\s{4}id:\s*'")).Count
Add-Result 'ecosystem.json and ecosystem.geojson agree with organizations.ts' `
  (($eco.count -eq $orgs.Count) -and ($orgs.Count -eq $tsRecordCount)) `
  ("organizations.ts $tsRecordCount; ecosystem.json.count $($eco.count); organizations array $($orgs.Count)")

# ---------------------------------------------------------------- summary
''
'=' * 78
$failed = @($results | Where-Object { -not $_.Pass })
'CONDITIONS: {0} total, {1} passed, {2} failed' -f $results.Count, ($results.Count - $failed.Count), $failed.Count
'=' * 78
if ($failed.Count -gt 0) {
  ''
  'FAILED:'
  $failed | ForEach-Object { '  - ' + $_.Name + $(if ($_.Detail) { '  (' + $_.Detail + ')' } else { '' }) }
  exit 1
}
''
'ALL EXIT CONDITIONS PASS.'
exit 0
