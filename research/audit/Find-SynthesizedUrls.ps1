<#
.SYNOPSIS
  Tests whether artifact A's website values were derived mechanically from the
  organisation name rather than sourced.

.DESCRIPTION
  FAKE_DATA_AUDIT_REPORT.md (2025-08-09) lists "Website URLs: Auto-generated
  patterns, not verified" under POSSIBLY FAKE/OUTDATED but gives no count. This
  script measures it: a URL is name-derived when its registered domain equals the
  organisation name with all non-alphanumerics stripped, plus a common TLD.

  Read-only. Pure ASCII on purpose.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Find-SynthesizedUrls.ps1
#>
[CmdletBinding()]
param(
  [string]$ArtifactA = 'C:\Users\User\dev\ecomap-reference\archive\2025-08-04-project-cleanup\cleanup-files\database-backup-2025-08-04.json'
)
$ErrorActionPreference = 'Stop'
function Write-Head { param([string]$T) ; '' ; '=' * 78 ; $T ; '=' * 78 }

$j = Get-Content $ArtifactA -Raw -Encoding UTF8 | ConvertFrom-Json
$rows = $j.entries

function Get-Slug {
  param([string]$Name)
  $n = $Name.ToLowerInvariant()
  $n = $n -replace '^\s*\d+[\.\)]\s*', ''
  $n = $n -replace '\*+', ''
  $n = $n -replace '\s*\([^)]*\)\s*', ' '
  $n = $n -replace '[^a-z0-9]', ''
  return $n
}

$http = @($rows | Where-Object { $_.properties.website -match '^https?://' })
Write-Head 'NAME-DERIVED URL TEST'
'rows with an http(s) website: ' + $http.Count

$hits = New-Object System.Collections.ArrayList
$flat = New-Object System.Collections.ArrayList     # exactly www.<slug>.<tld>, no path
foreach ($r in $http) {
  $slug = Get-Slug ([string]$r.properties.name)
  if ($slug.Length -lt 5) { continue }
  $u = [string]$r.properties.website
  try { $uri = [uri]$u } catch { continue }
  $h = $uri.Host.ToLowerInvariant()
  $bare = $h -replace '^www\.', ''
  $stem = ($bare -split '\.')[0]
  $isDerived = $false
  foreach ($tld in @('com','ca','ai','io','co','net','org','tech','app','eco','dev')) {
    if ($bare -eq ($slug + '.' + $tld)) { $isDerived = $true; break }
  }
  if ($isDerived) {
    [void]$hits.Add([pscustomobject]@{ Name = $r.properties.name; Url = $u; Host = $h; Slug = $slug })
    $path = $uri.AbsolutePath
    if (($path -eq '/' -or $path -eq '') -and $h.StartsWith('www.')) { [void]$flat.Add($r.properties.name) }
  }
  $null = $stem
}
'website whose registered domain == slug(name) + a common TLD: ' + $hits.Count
'  of those, the bare shape https://www.<slug>.<tld>/ with no path: ' + $flat.Count
''
'full list (name -> url):'
$hits | Sort-Object Name | ForEach-Object { '    [{0}]  ->  {1}' -f $_.Name, $_.Url }

Write-Head 'THE SHARPEST SUBSET: https://www.<slug>.com with no path'
$dotcom = @($hits | Where-Object { $_.Host -eq ('www.' + $_.Slug + '.com') })
'count: ' + $dotcom.Count
$dotcom | Sort-Object Name | ForEach-Object { '    [{0}]  ->  {1}' -f $_.Name, $_.Url }

Write-Head 'CONTROL: SAME TEST ON A KNOWN-GOOD SUBSET'
'Organisations whose real site genuinely is www.<name>.com will match this test'
'too, so the count is an upper bound on synthesis, not a proof per row. The'
'signal is the shape of the population: rows sharing one URL template AND a'
'round funding figure AND no other sourced field.'
$both = @($hits | Where-Object {
  $nm = $_.Name
  $row = $rows | Where-Object { $_.properties.name -eq $nm } | Select-Object -First 1
  $row.properties.funding -match '^\$[\d\.]+[KMB]$'
})
'name-derived URL AND a bare-dollar funding value on the same row: ' + $both.Count
$both | Sort-Object Name | ForEach-Object { '    [{0}]  ->  {1}' -f $_.Name, $_.Url }
''
'done.'
