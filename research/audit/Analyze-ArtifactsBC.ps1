<#
.SYNOPSIS
  Confirms the shape and headline numbers of artifacts B and C, and diffs their
  organisation name sets against artifact A.

.DESCRIPTION
  Read-only. Pure ASCII on purpose.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Analyze-ArtifactsBC.ps1
#>
[CmdletBinding()]
param(
  [string]$ArtifactA = 'C:\Users\User\dev\ecomap-reference\archive\2025-08-04-project-cleanup\cleanup-files\database-backup-2025-08-04.json',
  [string]$ArtifactB = 'C:\Users\User\dev\ecomap-reference\data\reports\refined-database-completeness-analysis-2025-08-04.json',
  [string]$ArtifactC = 'C:\Users\User\dev\ecomap-reference\tools\data\quality-reports\database-quality-2025-10-19.json'
)
$ErrorActionPreference = 'Stop'
function Write-Head { param([string]$T) ; '' ; '=' * 78 ; $T ; '=' * 78 }

function Show-Shape {
  param($Obj, [string]$Path, [int]$Depth = 0)
  if ($Depth -gt 2) { return }
  foreach ($p in $Obj.PSObject.Properties) {
    $v = $p.Value
    $t = if ($null -eq $v) { 'null' }
         elseif ($v -is [array]) { 'array[' + $v.Count + ']' }
         elseif ($v -is [pscustomobject]) { 'object' }
         else { $v.GetType().Name }
    ('  ' * $Depth) + $p.Name + ' : ' + $t
    if ($v -is [pscustomobject] -and $Depth -lt 2) { Show-Shape $v $Path ($Depth + 1) }
  }
}

# ---------------- Artifact B ----------------
$b = Get-Content $ArtifactB -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Head ('ARTIFACT B -- ' + $ArtifactB)
'top-level keys and types:'
Show-Shape $b $ArtifactB 0

# ---------------- Artifact C ----------------
$c = Get-Content $ArtifactC -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Head ('ARTIFACT C -- ' + $ArtifactC)
'top-level keys and types:'
Show-Shape $c $ArtifactC 0

# ---------------- cross-artifact name diff ----------------
Write-Head 'CROSS-ARTIFACT ORGANISATION-NAME DIFF'

function Get-NameSet {
  param($Node)
  $names = New-Object System.Collections.Generic.HashSet[string]
  $stack = New-Object System.Collections.Stack
  $stack.Push($Node)
  while ($stack.Count -gt 0) {
    $cur = $stack.Pop()
    if ($null -eq $cur) { continue }
    if ($cur -is [array]) { foreach ($i in $cur) { $stack.Push($i) } ; continue }
    if ($cur -is [pscustomobject]) {
      foreach ($p in $cur.PSObject.Properties) {
        if ($p.Name -eq 'name' -and $p.Value -is [string] -and $p.Value.Trim() -ne '') {
          [void]$names.Add($p.Value.Trim())
        } else {
          $stack.Push($p.Value)
        }
      }
    }
  }
  return $names
}

$a = Get-Content $ArtifactA -Raw -Encoding UTF8 | ConvertFrom-Json
$setA = New-Object System.Collections.Generic.HashSet[string]
foreach ($e in $a.entries) { [void]$setA.Add(([string]$e.properties.name).Trim()) }
$setB = Get-NameSet $b
$setC = Get-NameSet $c

'distinct names in A: ' + $setA.Count
'distinct names in B: ' + $setB.Count
'distinct names in C: ' + $setC.Count

$inCnotA = New-Object System.Collections.Generic.HashSet[string]
foreach ($n in $setC) { if (-not $setA.Contains($n)) { [void]$inCnotA.Add($n) } }
$inAnotC = New-Object System.Collections.Generic.HashSet[string]
foreach ($n in $setA) { if (-not $setC.Contains($n)) { [void]$inAnotC.Add($n) } }

'names in C but NOT in A (added to Notion after the 2025-08-04 dump): ' + $inCnotA.Count
($inCnotA | Sort-Object) | ForEach-Object { '    [' + $_ + ']' }
''
'names in A but NOT in C (deleted from Notion, or renamed, after 2025-08-04): ' + $inAnotC.Count
''
'done.'
