<#
.SYNOPSIS
  Builds research\union.json -- the union of distinct organisation names across
  EVERY .json and .csv in the ecomap reference, not just the one backup dump.

.DESCRIPTION
  The first pass built its working set from database-backup-2025-08-04.json alone,
  which is 1,399 rows. Organisation names are scattered across dozens of files in
  that repository, and the union is substantially larger -- roughly a thousand names
  the single-file approach never saw.

  Walks every .json and .csv under the reference clone except .git and node_modules,
  extracts any value under a name / organization / company / orgName / title key at
  any nesting depth, normalises for dedup (trim, strip leading list numbering, strip
  markdown asterisks, collapse whitespace, lowercase for the MATCH KEY ONLY --
  original casing is preserved in the output), and records every source file each
  name appeared in.

  READ-ONLY against the reference clone. Writes only research\union.json.
  Pure ASCII on purpose -- see Analyze-ArtifactA.ps1 for why.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Build-Union.ps1
#>
[CmdletBinding()]
param(
  [string]$Reference = 'C:\Users\User\dev\ecomap-reference',
  [string]$Root      = 'C:\Users\User\dev\BCAICompass'
)
$ErrorActionPreference = 'Stop'

$NAME_KEYS = @('name', 'organization', 'organisation', 'company', 'orgname', 'title')

# Keys whose values are names of things that are NOT organisations -- file names,
# report titles, field labels. Extracting these would inflate the union with noise.
$SKIP_PARENT_KEYS = @('file', 'files', 'report', 'reports', 'script', 'scripts', 'tool', 'tools')

$AGGREGATOR_DOMAINS = @('linkedin.com','meetup.com','eventbrite.ca','eventbrite.com','facebook.com','notion.site','github.io')

$NON_BC_PATTERNS = @(
  '(?i)^grammarly$', '(?i)sandboxaq', '(?i)^thales(\s|$|\s*/)', '(?i)brainbox',
  '(?i)^flash\s*forest$', '(?i)^tech\s*yukon$', '(?i)^cohere$', '(?i)^colab\s*software$',
  '(?i)^featherless\s*ai$', '(?i)^caliber\s*data\s*labs$', '(?i)^thinklabs\s*ai$',
  '(?i)^leaders\s*of\s*tomorrow', '(?i)^mooglelabs$', '(?i)^valuelabs$'
)
$DEFUNCT_PATTERNS = @(
  '(?i)^mcloud(\s|$)', '(?i)^nexii(\s|$)', '(?i)^coho\s*data$', '(?i)^canalyst$', '(?i)^dooly$'
)
$PRODUCT_NOT_ORG = @(
  'Flento app (by Acrostrong)', 'Swipe Right App', 'ChildCare Services BC AI Platform',
  'Service BC AI Search Platform'
)

function Test-AnyPattern {
  param([string]$Value, [string[]]$Patterns)
  foreach ($p in $Patterns) { if ($Value -match $p) { return $true } }
  return $false
}

function Get-CleanName {
  param([string]$Raw)
  $n = $Raw
  $n = $n -replace '^\s*\d+[\.\)]\s*', ''    # leading list numbering: "8. Foo" -> "Foo"
  $n = $n -replace '\*+', ''                  # markdown bold markers
  $n = $n -replace '\s+', ' '                 # collapse all whitespace
  return $n.Trim()
}

function Get-MatchKey {
  param([string]$Clean)
  return $Clean.ToLowerInvariant()
}

function Get-Slug {
  param([string]$Name)
  $s = $Name.ToLowerInvariant() -replace '&', ' and '
  $s = $s -replace '[^a-z0-9]+', '-'
  return ($s -replace '-{2,}', '-').Trim('-')
}

function Get-RegisteredDomain {
  param([string]$Url)
  if ([string]::IsNullOrWhiteSpace($Url)) { return $null }
  if ($Url -notmatch '^https?://') { return $null }
  try { $h = ([uri]$Url).Host } catch { return $null }
  if ([string]::IsNullOrWhiteSpace($h)) { return $null }
  $h = $h.ToLowerInvariant() -replace '^www\.', ''
  $parts = $h.Split('.')
  if ($parts.Count -le 2) { return $h }
  $secondLast = $parts[$parts.Count - 2]
  $last = $parts[$parts.Count - 1]
  $slds = @('co','com','net','org','ac','gov','edu','gc','on','bc','qc','ab')
  if ($last.Length -le 3 -and ($slds -contains $secondLast) -and $parts.Count -ge 3) {
    return ($parts[($parts.Count - 3)..($parts.Count - 1)] -join '.')
  }
  return ($secondLast + '.' + $last)
}

# A URL is name-derived when its registered domain equals the name with all
# non-alphanumerics stripped, plus a common TLD. Such a URL carries no evidence
# anyone ever checked it -- see AUDIT.md section 2.3.
function Test-SynthesizedUrl {
  param([string]$Name, [string]$Url)
  if ([string]::IsNullOrWhiteSpace($Url)) { return $false }
  $slug = ($Name.ToLowerInvariant() -replace '^\s*\d+[\.\)]\s*', '') -replace '\*+', ''
  $slug = $slug -replace '\s*\([^)]*\)\s*', ' '
  $slug = $slug -replace '[^a-z0-9]', ''
  if ($slug.Length -lt 5) { return $false }
  $bare = Get-RegisteredDomain $Url
  if (-not $bare) { return $false }
  foreach ($tld in @('com','ca','ai','io','co','net','org','tech','app','eco','dev')) {
    if ($bare -eq ($slug + '.' + $tld)) { return $true }
  }
  return $false
}

# ---------------------------------------------------------------------------
# Recursive extraction
# ---------------------------------------------------------------------------
$found = @{}   # matchKey -> record

function Add-Name {
  param([string]$Raw, [string]$RelFile, $Url, $CategoryRaw)
  if ([string]::IsNullOrWhiteSpace($Raw)) { return }
  $clean = Get-CleanName $Raw
  if ($clean.Length -lt 2) { return }
  if ($clean.Length -gt 120) { return }   # prose, not a name
  $key = Get-MatchKey $clean
  if (-not $found.ContainsKey($key)) {
    $found[$key] = [pscustomobject]@{
      name        = $clean
      name_raw    = $Raw
      url         = $null
      category_raw = $null
      files       = New-Object System.Collections.Generic.List[string]
    }
  }
  $rec = $found[$key]
  if (-not $rec.files.Contains($RelFile)) { $rec.files.Add($RelFile) }
  if (-not $rec.url -and $Url -and ([string]$Url) -match '^https?://') { $rec.url = ([string]$Url).Trim() }
  if (-not $rec.category_raw -and $CategoryRaw) {
    $c = ([string]$CategoryRaw).Trim()
    if ($c -ne '' -and $c -ne '**') { $rec.category_raw = $c }
  }
}

function Walk-Node {
  param($Node, [string]$RelFile, [string]$ParentKey)
  if ($null -eq $Node) { return }

  if ($Node -is [System.Collections.IEnumerable] -and $Node -isnot [string]) {
    foreach ($item in $Node) { Walk-Node $item $RelFile $ParentKey }
    return
  }

  if ($Node -is [pscustomobject]) {
    $props = $Node.PSObject.Properties
    # Sibling url/website/category on the same object, so a name picks up its own URL.
    $siblingUrl = $null
    $siblingCat = $null
    foreach ($p in $props) {
      $ln = $p.Name.ToLowerInvariant()
      if (($ln -eq 'website' -or $ln -eq 'url' -or $ln -eq 'homepage') -and $p.Value -is [string]) { $siblingUrl = $p.Value }
      if ($ln -eq 'category' -and $p.Value -is [string]) { $siblingCat = $p.Value }
    }
    foreach ($p in $props) {
      $ln = $p.Name.ToLowerInvariant()
      if (($NAME_KEYS -contains $ln) -and ($p.Value -is [string])) {
        if ($SKIP_PARENT_KEYS -notcontains $ParentKey) {
          Add-Name $p.Value $RelFile $siblingUrl $siblingCat
        }
      } else {
        Walk-Node $p.Value $RelFile $ln
      }
    }
    return
  }
}

# ---------------------------------------------------------------------------
# Walk the reference clone
# ---------------------------------------------------------------------------
$refFull = (Resolve-Path $Reference).Path
$files = Get-ChildItem -Path $refFull -Recurse -File -Include *.json, *.csv -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\(\.git|node_modules)\\' }

# package-lock.json files are npm dependency trees. They contain thousands of package
# "name" keys and not one organisation, so including them would flood the union with
# noise. Skipped deliberately, not because they fail to parse -- they do fail (PowerShell
# rejects their duplicate/empty keys) and that failure would otherwise look like data loss.
$lockfiles = @($files | Where-Object { $_.Name -eq 'package-lock.json' })
$files = @($files | Where-Object { $_.Name -ne 'package-lock.json' })

'walking ' + $files.Count + ' json/csv files under ' + $refFull
'  (skipped ' + $lockfiles.Count + ' package-lock.json dependency trees by design)'
$jsonOk = 0; $csvOk = 0; $ndjsonOk = 0
$unrecovered = New-Object System.Collections.ArrayList

foreach ($f in $files) {
  $rel = $f.FullName.Substring($refFull.Length + 1)
  if ($f.Extension -eq '.json') {
    $raw = $null
    try { $raw = Get-Content $f.FullName -Raw -Encoding UTF8 } catch { }
    if ([string]::IsNullOrWhiteSpace($raw)) { continue }
    $parsed = $false
    try { Walk-Node ($raw | ConvertFrom-Json) $rel ''; $jsonOk++; $parsed = $true } catch { }
    if (-not $parsed) {
      # NDJSON fallback: one JSON object per line. logs\extractions\*.json is written
      # this way and holds real organisation names, so a whole-file parse failure there
      # would silently drop them.
      $lines = @(Get-Content $f.FullName -Encoding UTF8 | Where-Object { $_.Trim() -ne '' })
      $lineHits = 0
      foreach ($ln in $lines) {
        try { Walk-Node ($ln | ConvertFrom-Json) $rel ''; $lineHits++ } catch { }
      }
      if ($lineHits -gt 0) { $ndjsonOk++ } else { [void]$unrecovered.Add($rel) }
    }
  } else {
    try {
      $rows = Import-Csv $f.FullName -ErrorAction Stop
      foreach ($r in $rows) { Walk-Node $r $rel '' }
      $csvOk++
    } catch { [void]$unrecovered.Add($rel) }
  }
}

'  json parsed whole-file : ' + $jsonOk
'  json recovered as NDJSON: ' + $ndjsonOk
'  csv  parsed             : ' + $csvOk
'  UNRECOVERED             : ' + $unrecovered.Count
$unrecovered | ForEach-Object { '    ' + $_ }
'  distinct normalized names: ' + $found.Count

# ---------------------------------------------------------------------------
# Deletion list -- maintainer evidence, not proof
# ---------------------------------------------------------------------------
$deleteKeys = @{}
$delPath = Join-Path $refFull 'archive\2025-08-04-project-cleanup\cleanup-files\entries-to-delete.json'
if (Test-Path $delPath) {
  try {
    $delRaw = Get-Content $delPath -Raw -Encoding UTF8
    if (-not [string]::IsNullOrWhiteSpace($delRaw)) {
      $del = $delRaw | ConvertFrom-Json
      $tmp = @{}
      $script:__delNames = New-Object System.Collections.Generic.List[string]
      function Collect-DelNames { param($N)
        if ($null -eq $N) { return }
        if ($N -is [System.Collections.IEnumerable] -and $N -isnot [string]) { foreach ($i in $N) { Collect-DelNames $i }; return }
        if ($N -is [pscustomobject]) {
          foreach ($p in $N.PSObject.Properties) {
            if (($NAME_KEYS -contains $p.Name.ToLowerInvariant()) -and $p.Value -is [string]) {
              $script:__delNames.Add($p.Value)
            } else { Collect-DelNames $p.Value }
          }
        }
      }
      Collect-DelNames $del
      foreach ($n in $script:__delNames) { $deleteKeys[(Get-MatchKey (Get-CleanName $n))] = 1 }
      $null = $tmp
    }
  } catch { }
}
'  names on the maintainer deletion list: ' + $deleteKeys.Count

# ---------------------------------------------------------------------------
# Collisions
# ---------------------------------------------------------------------------
$all = @($found.Values)

$normCounts = @{}
foreach ($x in $all) {
  $n = $x.name.ToLowerInvariant()
  $n = $n -replace '\s*\([^)]*\)\s*', ' '
  $n = $n -replace '&', ' and '
  $n = $n -replace '\b(inc|llc|ltd|limited|corp|corporation|co|company|technologies|technology|labs|lab|solutions|systems|group|holdings|international|canada|bc)\b', ' '
  $n = ($n -replace '[^a-z0-9]+', ' ').Trim()
  $x | Add-Member -NotePropertyName _norm -NotePropertyValue $n -Force
  if ($n -ne '') { $normCounts[$n] = 1 + [int]$normCounts[$n] }
}
$domCounts = @{}
foreach ($x in $all) {
  $d = Get-RegisteredDomain $x.url
  $x | Add-Member -NotePropertyName _domain -NotePropertyValue $d -Force
  if ($d -and ($AGGREGATOR_DOMAINS -notcontains $d)) { $domCounts[$d] = 1 + [int]$domCounts[$d] }
}

# ---------------------------------------------------------------------------
# Flags -- extended closed set
# ---------------------------------------------------------------------------
$slugSeen = @{}
$out = New-Object System.Collections.ArrayList

foreach ($x in ($all | Sort-Object -Property @{Expression = { $_.name }})) {
  $f = New-Object System.Collections.ArrayList
  $raw = $x.name_raw
  $clean = $x.name

  if ($raw -match '\(\d+\)\s*$')                                   { [void]$f.Add('section-heading') }
  if ($raw -match '\*\*' -or $raw -match '^\s*\d+[\.\)]\s')         { [void]$f.Add('markdown-artifact') }
  if ($raw -match '\s/\s')                                          { [void]$f.Add('unmerged-duplicate') }
  if ($x._domain -eq 'linkedin.com')                                { [void]$f.Add('linkedin-as-website') }
  if ($x._norm -ne '' -and [int]$normCounts[$x._norm] -gt 1)        { [void]$f.Add('duplicate-name') }
  if ($x._domain -and [int]$domCounts[$x._domain] -gt 1)            { [void]$f.Add('duplicate-domain') }
  if (Test-AnyPattern $clean $NON_BC_PATTERNS)                      { [void]$f.Add('non-bc-suspected') }
  if (Test-AnyPattern $clean $DEFUNCT_PATTERNS)                     { [void]$f.Add('defunct-suspected') }
  if ($PRODUCT_NOT_ORG -contains $clean)                            { [void]$f.Add('product-not-org') }
  if (-not $x.url)                                                  { [void]$f.Add('no-url') }
  if (Test-SynthesizedUrl $clean $x.url)                            { [void]$f.Add('synthesized-url') }
  if ($deleteKeys.ContainsKey((Get-MatchKey $clean)))               { [void]$f.Add('marked-for-deletion') }

  # not-an-entity: the row is a line lifted out of a report, not an organisation.
  $isFragment = $false
  if ($clean -match ':\s*$') { $isFragment = $true }
  if ($clean -match '^\s*(19|20)\d{2}(\s*[-/]\s*(19|20)?\d{2})?\s*$') { $isFragment = $true }
  if ($clean -match '\.(json|md|csv|txt|js|xlsx)\s*$') { $isFragment = $true }
  if ($clean -cmatch '^(Deep dive|Track|Monitor|Add|Update|Review|Expand|Build|Create|Verify|Complete|Populate|Import|Research|Identify|Establish|Launch|Continue|Consider|Explore)\b') { $isFragment = $true }
  $schemaLabels = @(
    'Name','Website','LinkedIn','Email','Category','Region','City','Description','Year Founded',
    'Key People','Employee Count','Employee Counts','Valuation','Revenue','Funding','Last Verified',
    'Status','Logo','Phone','Address','Total Raised','Total Revenue','Total Employees','Average Revenue',
    'Average Team Size','Average Founder Age','Team Range','Revenue Range','Funding Range','Funding Data',
    'Funding Details','Market Data','People Data','Date Stamped','Cross-Referenced','High Confidence',
    'Medium Confidence','Before Addition','After Addition','Net Improvement','Series A','Year 1','Year 2','Year 3'
  )
  if ($schemaLabels -contains $clean) { $isFragment = $true }
  $reportNoun = '(?i)\b(intelligence|metrics|trends|assessment|analysis|recommendations|opportunities|priorities|readiness|positioning|penetration|velocity|distribution|diversity|progression|consolidation|maturity|differentiation|reinforcement|evolution|expansion|enhancement|generating|generation|mapping|tracking|targeting|monitoring|verification|standards|documentation|patterns|indicators|factors|themes|gaps|strategy|strategies|landscape|traction|reach|advantage|edge|position|state|levels|methods|sources|counts?|sizes?|ranges?|totals?)\b'
  $orgAnchor = '(?i)\b(inc|ltd|llc|corp|corporation|company|technolog\w*|labs?|solutions|systems|group|university|college|institute|centre|center|society|association|foundation|council|network|ventures|capital|partners|fund|studio\w*|works|media|digital|health|data|software|academy|school|hub|space|collective|agency|consulting|services|bank|clinic|hospital|museum|festival|conference|summit|program|initiative|project|alliance|chamber|board|authority|ministry|department|nation|robotics|energy|therapeutics|pharmaceuticals|sciences?|biologics|entertainment|analytics|ai)\b'
  if (-not $x.url -and $clean -match $reportNoun -and $clean -notmatch $orgAnchor) { $isFragment = $true }
  if ($isFragment) { [void]$f.Add('not-an-entity') }

  $base = Get-Slug $clean
  if ($base -eq '') { $base = 'unnamed' }
  $slug = $base; $n = 1
  while ($slugSeen.ContainsKey($slug)) { $n++; $slug = "$base-$n" }
  $slugSeen[$slug] = 1

  [void]$out.Add([ordered]@{
    id           = $slug
    name         = $clean
    name_raw     = $raw
    url          = $x.url
    url_kind     = $(if ($x._domain -eq 'linkedin.com') { 'linkedin' } elseif ($x.url) { 'website' } else { $null })
    category_raw = $x.category_raw
    source       = 'bc-ai--ecosystem-map@union-of-all-json-and-csv'
    source_files = @($x.files)
    status       = 'unverified'
    flags        = @($f)
  })
}

$outPath = Join-Path $Root 'research\union.json'
$json = $out | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($outPath, $json + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

''
'wrote ' + $outPath
'  records: ' + $out.Count
''
$FLAGSET = @('section-heading','markdown-artifact','unmerged-duplicate','linkedin-as-website',
             'duplicate-name','duplicate-domain','non-bc-suspected','defunct-suspected',
             'person-not-org','product-not-org','no-url','not-an-entity','synthesized-url',
             'marked-for-deletion')
'flag counts:'
foreach ($fl in $FLAGSET) {
  $c = @($out | Where-Object { $_.flags -contains $fl }).Count
  '  {0,-22} {1,5}' -f $fl, $c
}
$unflagged = @($out | Where-Object { $_.flags.Count -eq 0 }).Count
''
'records carrying no flag at all: ' + $unflagged
'records appearing in more than one source file: ' + @($out | Where-Object { $_.source_files.Count -gt 1 }).Count
