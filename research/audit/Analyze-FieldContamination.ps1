<#
.SYNOPSIS
  Evidence pass on artifact A's value-bearing fields: funding, yearFounded, email,
  keyPeople, status. Tests the FAKE_DATA_AUDIT_REPORT claim against the data itself.

.DESCRIPTION
  Read-only. Pure ASCII on purpose (see Analyze-ArtifactA.ps1 header for why).

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Analyze-FieldContamination.ps1
#>
[CmdletBinding()]
param(
  [string]$ArtifactA = 'C:\Users\User\dev\ecomap-reference\archive\2025-08-04-project-cleanup\cleanup-files\database-backup-2025-08-04.json'
)
$ErrorActionPreference = 'Stop'

function Write-Head { param([string]$T) ; '' ; '=' * 78 ; $T ; '=' * 78 }

$j = Get-Content $ArtifactA -Raw -Encoding UTF8 | ConvertFrom-Json
$rows = $j.entries
$total = $rows.Count

Write-Head 'FUNDING FIELD'
$f = @($rows | Where-Object { ([string]$_.properties.funding).Trim() -ne '' })
'rows carrying a funding value: ' + $f.Count
$bare = @($f | Where-Object { $_.properties.funding -match '^\$[\d\.]+[KMB]$' })
'values of the bare-dollar shape $NNN[KMB]: ' + $bare.Count
$bareDistinct = @($bare | ForEach-Object { $_.properties.funding } | Select-Object -Unique)
'distinct bare-dollar values: ' + $bareDistinct.Count
''
'bare-dollar value frequency (all):'
$bare | ForEach-Object { $_.properties.funding } | Group-Object | Sort-Object Count -Descending |
  ForEach-Object { '  {0,4}x  [{1}]' -f $_.Count, $_.Name }
''
'top 15 funding values overall:'
$f | ForEach-Object { $_.properties.funding } | Group-Object | Sort-Object Count -Descending |
  Select-Object -First 15 | ForEach-Object { '  {0,4}x  [{1}]' -f $_.Count, $_.Name }

Write-Head 'YEARFOUNDED FIELD'
$y = @($rows | Where-Object { $null -ne $_.properties.yearFounded -and ([string]$_.properties.yearFounded).Trim() -ne '' })
'rows carrying yearFounded: ' + $y.Count
$bad = @($y | Where-Object {
  $v = [string]$_.properties.yearFounded
  if ($v -notmatch '^\d{4}$') { $true } else { ([int]$v -lt 1800 -or [int]$v -gt 2026) }
})
'implausible or non-4-digit values: ' + $bad.Count
$bad | ForEach-Object { '    [{0}] = [{1}]' -f $_.properties.name, $_.properties.yearFounded }
''
'yearFounded frequency (top 20):'
$y | ForEach-Object { [string]$_.properties.yearFounded } | Group-Object | Sort-Object Count -Descending |
  Select-Object -First 20 | ForEach-Object { '  {0,4}x  [{1}]' -f $_.Count, $_.Name }

Write-Head 'EMAIL FIELD'
$em = @($rows | Where-Object { ([string]$_.properties.email).Trim() -ne '' })
'rows carrying an email: ' + $em.Count
$badEm = @($em | Where-Object { $_.properties.email -notmatch '^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$' })
'values that are not a plausible single email address: ' + $badEm.Count
$badEm | ForEach-Object { '    [{0}] = [{1}]' -f $_.properties.name, $_.properties.email }
$libEm = @($em | Where-Object { $_.properties.email -match '^[a-z0-9\-]+@\d+(\.\d+)+$' })
'values of the npm-package shape name@1.2.3 (scraper damage): ' + $libEm.Count
$libEm | ForEach-Object { '    [{0}] = [{1}]' -f $_.properties.name, $_.properties.email }

Write-Head 'KEYPEOPLE FIELD'
$kp = @($rows | Where-Object { ([string]$_.properties.keyPeople).Trim() -ne '' })
'rows carrying keyPeople: ' + $kp.Count
$src = @($kp | Where-Object { $_.properties.keyPeople -match '\(Source:' })
'carrying an inline "(Source: ...)" tag: ' + $src.Count
'  distinct source tags used:'
$src | ForEach-Object {
  if ($_.properties.keyPeople -match '\(Source:\s*([^)]*)\)') { $Matches[1].Trim() }
} | Group-Object | Sort-Object Count -Descending | ForEach-Object { '    {0,4}x  [{1}]' -f $_.Count, $_.Name }
$generic = @($kp | Where-Object { $_.properties.keyPeople -cnotmatch '[A-Z][a-z]+\s+[A-Z]' })
'values naming no identifiable person (generic placeholder): ' + $generic.Count
$generic | ForEach-Object { '    [{0}] = [{1}]' -f $_.properties.name, $_.properties.keyPeople }

Write-Head 'STATUS FIELD'
$rows | ForEach-Object { [string]$_.properties.status } | Where-Object { $_.Trim() -ne '' } |
  Group-Object | Sort-Object Count -Descending | ForEach-Object { '  {0,4}x  [{1}]' -f $_.Count, $_.Name }

Write-Head 'DESCRIPTION / REGION / COORDINATES'
$keys = @{}
foreach ($r in $rows) { foreach ($p in $r.properties.PSObject.Properties.Name) { $keys[$p] = 1 } }
'property keys present anywhere in artifact A: ' + (($keys.Keys | Sort-Object) -join ', ')
foreach ($want in @('description','region','city','latitude','longitude','lat','lng','linkedin','size','employees')) {
  $has = if ($keys.ContainsKey($want)) { 'PRESENT' } else { 'ABSENT' }
  '  {0,-12} {1}' -f $want, $has
}
''
'done. total rows: ' + $total
