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
$forbidden = @('funding', 'keyPeople', 'yearFounded', 'focusAreas')
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
$distCname = (Test-Path 'dist\CNAME') -and ((Get-Content 'dist\CNAME' -Raw).Trim() -eq 'bcaicompass.ca')
$distHeaders = Test-Path 'dist\_headers'
$distJson = (Test-Path 'dist\ecosystem.json') -and (Test-Path 'dist\ecosystem.geojson')
Add-Result 'dist\ contains index.html, CNAME (bcaicompass.ca), _headers and both data files' `
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
