<#
.SYNOPSIS
  Normalizes artifact A into research\seed.json -- a list of leads to check, not a
  publishable dataset. Also writes research\seed-summary.md.

.DESCRIPTION
  Reads only. The reference clone is never written to.

  Carries forward NO funding, description, keyPeople, focus-area, yearFounded, email
  or status value. Invents no region, coordinate or blurb. Missing is null, never an
  empty string and never a guess.

  Pure ASCII on purpose -- see Analyze-ArtifactA.ps1 for why.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Build-Seed.ps1
#>
[CmdletBinding()]
param(
  [string]$ArtifactA = 'C:\Users\User\dev\ecomap-reference\archive\2025-08-04-project-cleanup\cleanup-files\database-backup-2025-08-04.json',
  [string]$OutJson   = 'C:\Users\User\dev\BCAICompass\research\seed.json',
  [string]$OutSummary = 'C:\Users\User\dev\BCAICompass\research\seed-summary.md'
)
$ErrorActionPreference = 'Stop'

$SOURCE_TAG = 'bc-ai--ecosystem-map@database-backup-2025-08-04'

# Domains that many unrelated organisations legitimately share. A collision here is
# not evidence of duplication, so it does not earn the duplicate-domain flag.
$AGGREGATOR_DOMAINS = @('linkedin.com','meetup.com','eventbrite.ca','eventbrite.com','facebook.com','notion.site','github.io')

# Established out-of-scope entities, as anchored patterns rather than exact names --
# artifact A spells several of them more than one way (AUDIT.md 3.2), and an exact-name
# list flags one variant and misses the rest. Curated, not heuristic: "not in BC" is a
# claim that needs evidence, so each pattern below traces to a confirmed finding.
#   grammarly  : confirmed out of scope
#   sandboxaq  : confirmed out of scope. Matches "SandboxAQ",
#                "SandboxAQ (Good Chemistry Acquisition)" x2, "Good Chemistry -> SandboxAQ"
#   thales     : confirmed out of scope. Matches "Thales Canada" x2, "Thales / Thales Canada"
#   brainbox   : confirmed Montreal
#   flashforest: confirmed Ontario
#   techyukon  : Yukon is not British Columbia (artifact C only, retained for reuse)
$NON_BC_PATTERNS = @(
  '(?i)^grammarly$',
  '(?i)sandboxaq',
  '(?i)^thales(\s|$|\s*/)',
  '(?i)brainbox',
  '(?i)^flash\s*forest$',
  '(?i)^tech\s*yukon$'
)

# Established defunct / no-longer-independent entities. Same reasoning, same form.
#   mcloud   : Nasdaq delisting September 2023. Artifact A spells it "mCloud", not
#              "mCloud Technologies" -- the reason this list is patterns, not names.
#   nexii    : CCAA creditor protection January 2024; assets acquired by 3 Gates;
#              relaunched as Nexii Inc. with Dallas HQ
#   cohodata : defunct
#   canalyst : acquired, no longer an independent BC entity
$DEFUNCT_PATTERNS = @(
  '(?i)^mcloud(\s|$)',
  '(?i)^nexii(\s|$)',
  '(?i)^coho\s*data$',
  '(?i)^canalyst$'
)

function Test-AnyPattern {
  param([string]$Value, [string[]]$Patterns)
  foreach ($p in $Patterns) { if ($Value -match $p) { return $true } }
  return $false
}

# A URL is name-derived when its registered domain equals the organisation name with
# all non-alphanumerics stripped, plus a common TLD. Such a URL carries NO evidence
# that anyone ever checked it -- see AUDIT.md section 2.3. The flag belongs on the
# record so a future pass sees it while working the row, not in a report it may never
# open. 4agrobotics.com carried this shape and turned out to be a parked domain.
function Test-SynthesizedUrl {
  param([string]$Name, $Url)
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

# not-an-entity: the row is a line lifted out of a scraped markdown report -- a field
# label, a metric heading, a to-do line, a bare year, a filename -- rather than an
# organisation. This is the LARGEST defect class in artifact A and the original closed
# flag set had no value for it, so seed.json understated the damage by design. Added
# 2026-08-19; the count now rides on the record instead of only in seed-summary.md.
function Test-NotAnEntity {
  param([string]$Name, $Url)
  $n = $Name.Trim()
  if ($n -match ':\s*$') { return $true }
  if ($n -match '^\s*(19|20)\d{2}(\s*[-/]\s*(19|20)?\d{2})?\s*$') { return $true }
  if ($n -match '\.(json|md|csv|txt|js|xlsx)\s*$') { return $true }
  if ($n -cmatch '^(Deep dive|Track|Monitor|Add|Update|Review|Expand|Build|Create|Verify|Complete|Populate|Import|Research|Identify|Establish|Launch|Continue|Consider|Explore)\b') { return $true }
  $schemaLabels = @(
    'Name','Website','LinkedIn','Email','Category','Region','City','Description','Year Founded',
    'Key People','Employee Count','Employee Counts','Valuation','Revenue','Funding','Last Verified',
    'Status','Logo','Phone','Address','Total Raised','Total Revenue','Total Employees','Average Revenue',
    'Average Team Size','Average Founder Age','Team Range','Revenue Range','Funding Range','Funding Data',
    'Funding Details','Market Data','People Data','Date Stamped','Cross-Referenced','High Confidence',
    'Medium Confidence','Before Addition','After Addition','Net Improvement','Series A','Year 1','Year 2','Year 3'
  )
  if ($schemaLabels -contains $n) { return $true }
  $reportNoun = '(?i)\b(intelligence|metrics|trends|assessment|analysis|recommendations|opportunities|priorities|readiness|positioning|penetration|velocity|distribution|diversity|progression|consolidation|maturity|differentiation|reinforcement|evolution|expansion|enhancement|generating|generation|mapping|tracking|targeting|monitoring|verification|standards|documentation|patterns|indicators|factors|themes|gaps|strategy|strategies|landscape|traction|reach|advantage|edge|position|state|levels|methods|sources|counts?|sizes?|ranges?|totals?)\b'
  $orgAnchor = '(?i)\b(inc|ltd|llc|corp|corporation|company|technolog\w*|labs?|solutions|systems|group|university|college|institute|centre|center|society|association|foundation|council|network|ventures|capital|partners|fund|studio\w*|works|media|digital|health|data|software|academy|school|hub|space|collective|agency|consulting|services|bank|clinic|hospital|museum|festival|conference|summit|program|initiative|project|alliance|chamber|board|authority|ministry|department|nation|robotics|energy|therapeutics|pharmaceuticals|sciences?|biologics|entertainment|analytics|ai)\b'
  if ([string]::IsNullOrWhiteSpace($Url) -and $n -match $reportNoun -and $n -notmatch $orgAnchor) { return $true }
  return $false
}

# Rows judged by eye to be a product rather than the organisation behind it.
# Curated, not pattern-matched: the pattern flagged CoPilot AI, which is a real company.
$PRODUCT_NOT_ORG = @(
  'Flento app (by Acrostrong)',
  'Swipe Right App',
  'ChildCare Services BC AI Platform',
  'Service BC AI Search Platform'
)

# Rows judged by eye to be a person rather than an organisation.
# AUDIT.md 2.6.5: reading all 122 heuristic candidates found no people at all.
# The set is empty, deliberately and on the record.
$PERSON_NOT_ORG = @()

function Get-CleanName {
  param([string]$Raw)
  $n = $Raw
  $n = $n -replace '^\s*\d+[\.\)]\s*', ''      # leading list numbering: "8. Foo" -> "Foo"
  $n = $n -replace '\*+', ''                    # markdown bold markers
  $n = $n -replace '\s{2,}', ' '
  return $n.Trim()
}

function Get-Slug {
  param([string]$Name)
  $s = $Name.ToLowerInvariant()
  $s = $s -replace '&', ' and '
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s -replace '-{2,}', '-'
  return $s.Trim('-')
}

function Get-NormKey {
  param([string]$Name)
  $n = $Name.ToLowerInvariant()
  $n = $n -replace '\s*\([^)]*\)\s*', ' '
  $n = $n -replace '&', ' and '
  $n = $n -replace '\b(inc|llc|ltd|limited|corp|corporation|co|company|technologies|technology|labs|lab|solutions|systems|group|holdings|international|canada|bc)\b', ' '
  $n = $n -replace '[^a-z0-9]+', ' '
  return ($n -replace '\s+', ' ').Trim()
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

# ---------------------------------------------------------------- load
$j = Get-Content $ArtifactA -Raw -Encoding UTF8 | ConvertFrom-Json
$rows = $j.entries
$total = $rows.Count

# ---------------------------------------------------------------- pass 1: normalise
$recs = New-Object System.Collections.ArrayList
foreach ($r in $rows) {
  $raw = [string]$r.properties.name
  $clean = Get-CleanName $raw

  $rawUrl = [string]$r.properties.website
  $url = $null
  $urlKind = $null
  if ($rawUrl -match '^https?://') {
    $url = $rawUrl.Trim()
    $d = Get-RegisteredDomain $url
    $urlKind = if ($d -eq 'linkedin.com') { 'linkedin' } else { 'website' }
  }

  $catRaw = [string]$r.properties.category
  if ($catRaw.Trim() -eq '' -or $catRaw.Trim() -eq '**') { $catRaw = $null } else { $catRaw = $catRaw.Trim() }

  [void]$recs.Add([pscustomobject]@{
    id           = $null
    name         = $clean
    name_raw     = $raw
    url          = $url
    url_kind     = $urlKind
    category_raw = $catRaw
    source       = $SOURCE_TAG
    status       = 'unverified'
    flags        = @()
    _norm        = (Get-NormKey $clean)
    _domain      = (Get-RegisteredDomain $url)
  })
}

# ---------------------------------------------------------------- pass 2: collisions
$normCounts = @{}
foreach ($x in $recs) { if ($x._norm -ne '') { $normCounts[$x._norm] = 1 + [int]$normCounts[$x._norm] } }

$domCounts = @{}
foreach ($x in $recs) {
  if ($x._domain -and ($AGGREGATOR_DOMAINS -notcontains $x._domain)) {
    $domCounts[$x._domain] = 1 + [int]$domCounts[$x._domain]
  }
}

# ---------------------------------------------------------------- pass 3: flags + ids
$slugSeen = @{}
foreach ($x in $recs) {
  $f = New-Object System.Collections.ArrayList

  if ($x.name_raw -match '\(\d+\)\s*$')                                      { [void]$f.Add('section-heading') }
  if ($x.name_raw -match '\*\*' -or $x.name_raw -match '^\s*\d+[\.\)]\s')     { [void]$f.Add('markdown-artifact') }
  if ($x.name_raw -match '\s/\s')                                            { [void]$f.Add('unmerged-duplicate') }
  if ($x.url_kind -eq 'linkedin')                                            { [void]$f.Add('linkedin-as-website') }
  if ($x._norm -ne '' -and [int]$normCounts[$x._norm] -gt 1)                 { [void]$f.Add('duplicate-name') }
  if ($x._domain -and [int]$domCounts[$x._domain] -gt 1)                     { [void]$f.Add('duplicate-domain') }
  if (Test-AnyPattern $x.name $NON_BC_PATTERNS)                              { [void]$f.Add('non-bc-suspected') }
  if (Test-AnyPattern $x.name $DEFUNCT_PATTERNS)                             { [void]$f.Add('defunct-suspected') }
  if ($PERSON_NOT_ORG -contains $x.name)                                     { [void]$f.Add('person-not-org') }
  if ($PRODUCT_NOT_ORG -contains $x.name)                                    { [void]$f.Add('product-not-org') }
  if ($null -eq $x.url)                                                      { [void]$f.Add('no-url') }
  if (Test-SynthesizedUrl $x.name $x.url)                                    { [void]$f.Add('synthesized-url') }
  if (Test-NotAnEntity $x.name $x.url)                                       { [void]$f.Add('not-an-entity') }

  $x.flags = @($f)

  $base = Get-Slug $x.name
  if ($base -eq '') { $base = 'unnamed' }
  $slug = $base
  $n = 1
  while ($slugSeen.ContainsKey($slug)) { $n++; $slug = "$base-$n" }
  $slugSeen[$slug] = 1
  $x.id = $slug
}

# ---------------------------------------------------------------- write seed.json
$sorted = @($recs | Sort-Object -Property @{Expression = { $_.name }}, @{Expression = { $_.id }})
$out = foreach ($x in $sorted) {
  [ordered]@{
    id           = $x.id
    name         = $x.name
    name_raw     = $x.name_raw
    url          = $x.url
    url_kind     = $x.url_kind
    category_raw = $x.category_raw
    source       = $x.source
    status       = $x.status
    flags        = @($x.flags)
  }
}
$json = $out | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($OutJson, $json + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
Write-Host ('wrote ' + $OutJson + ' with ' + $sorted.Count + ' records')

# ---------------------------------------------------------------- summary
$FLAGSET = @('section-heading','markdown-artifact','unmerged-duplicate','linkedin-as-website',
             'duplicate-name','duplicate-domain','non-bc-suspected','defunct-suspected',
             'person-not-org','product-not-org','no-url','not-an-entity','synthesized-url')

$flagCounts = [ordered]@{}
foreach ($fl in $FLAGSET) {
  $flagCounts[$fl] = @($sorted | Where-Object { $_.flags -contains $fl }).Count
}

$unflagged = @($sorted | Where-Object { $_.flags.Count -eq 0 }).Count
$cleanedDiffers = @($sorted | Where-Object { $_.name -cne $_.name_raw }).Count
$withUrl = @($sorted | Where-Object { $null -ne $_.url }).Count
$withWebsite = @($sorted | Where-Object { $_.url_kind -eq 'website' }).Count
$withCat = @($sorted | Where-Object { $null -ne $_.category_raw }).Count

# filter cascade over the seed
$s0 = $sorted
$s1 = @($s0 | Where-Object { $_.url_kind -eq 'website' })
$s2 = @($s1 | Where-Object { $_.flags -notcontains 'section-heading' })
$s3 = @($s2 | Where-Object { $_.flags -notcontains 'markdown-artifact' })
$s4 = @($s3 | Where-Object { $_.flags -notcontains 'unmerged-duplicate' })
$s5 = @($s4 | Where-Object { $_.flags -notcontains 'duplicate-name' })
$s6 = @($s5 | Where-Object { $_.flags -notcontains 'non-bc-suspected' -and $_.flags -notcontains 'defunct-suspected' })
$s7 = @($s6 | Where-Object { $_.flags -notcontains 'product-not-org' })

$sb = New-Object System.Text.StringBuilder
function A { param([string]$s) [void]$sb.AppendLine($s) }

A '# seed-summary'
A ''
A ('Generated by `research\audit\Build-Seed.ps1` from artifact A. Source tag on every record: `' + $SOURCE_TAG + '`.')
A ''
A '`research\seed.json` is **a list of names to go and check.** It is not a dataset,'
A 'it is not published, and nothing in it is built into the site. No `funding`,'
A '`description`, `keyPeople`, `yearFounded`, `email` or `status` value from artifact A'
A 'is carried forward. No region, coordinate or blurb is invented. Missing is `null`.'
A ''
A '## Totals'
A ''
A '| Measure | Count |'
A '|---|---:|'
A ('| rows in artifact A | ' + $total + ' |')
A ('| records in seed.json | ' + $sorted.Count + ' |')
A ('| records whose cleaned `name` differs from `name_raw` | ' + $cleanedDiffers + ' |')
A ('| records with any URL | ' + $withUrl + ' |')
A ('| records with a non-LinkedIn website URL | ' + $withWebsite + ' |')
A ('| records with a raw category | ' + $withCat + ' |')
A ('| records carrying no flag at all | ' + $unflagged + ' |')
A ''
A '**Nothing was dropped.** All ' + $total + ' artifact-A rows are present, including the'
A 'known non-entities. Silent deletion is how the predecessor lost 175 rows into a'
A '"better filtering of system/meta entries" note; attrition here is visible below.'
A ''
A '## Counts per flag'
A ''
A 'Flags are drawn only from the closed set the brief specifies. A record can carry'
A 'several, so these do not sum to the record count.'
A ''
A '| Flag | Records |'
A '|---|---:|'
foreach ($k in $flagCounts.Keys) { A ('| `' + $k + '` | ' + $flagCounts[$k] + ' |') }
A ''
A '### Notes on three of those counts'
A ''
A ('- **`person-not-org` = ' + $flagCounts['person-not-org'] + '.** Not an oversight. A personal-name heuristic returned 122')
A '  candidates; reading all 122 found no people at all -- only report fragments and'
A '  genuine two-word company names (`Moment Energy`, `General Fusion`). Artifact A'
A '  does not appear to contain person-rows. See AUDIT.md 2.6.5.'
A ('- **`product-not-org` = ' + $flagCounts['product-not-org'] + '.** Curated by eye, not pattern-matched. The pattern flagged 9,')
A '  of which 4 were report fragments already counted elsewhere and 1 (`CoPilot AI`)'
A '  is a real company. Only the 4 judged genuine products carry the flag.'
A ('- **`duplicate-domain` = ' + $flagCounts['duplicate-domain'] + '.** Excludes shared aggregator domains (' + ($AGGREGATOR_DOMAINS -join ', ') + '),')
A '  because many unrelated organisations legitimately share those and a collision'
A '  there is not evidence of duplication.'
A ''
A '## The largest defect class now rides on the record'
A ''
A ('**`not-an-entity` = ' + $flagCounts['not-an-entity'] + '.** These rows are lines lifted from a markdown report')
A 'rather than organisations -- `Headquarters:`, `CEO:`, `Team Size:`, `Talent Mapping`,'
A '`Year Founded`, `batch-15-formatted.json` (AUDIT.md 2.6.4). That class is larger than'
A 'every other defect class combined.'
A ''
A 'The originally specified closed flag set had **no value for it**, so the first version'
A 'of this file carried only `no-url` on those rows and deferred the real count to this'
A 'summary -- meaning seed.json understated the damage by design. `not-an-entity` was'
A 'added to the closed set on 2026-08-19 and the count now rides on the record, where a'
A 'future pass working the row will actually see it.'
A ''
A ('**`synthesized-url` = ' + $flagCounts['synthesized-url'] + '.** Added at the same time. The domain is derivable')
A 'character-for-character from the organisation name, so the URL carries no evidence'
A 'that anyone ever checked it. `4agrobotics.com` had this shape and turned out to be a'
A 'parked domain-sale page. A row with this flag needs its site resolved independently;'
A 'the URL is a hint, not an answer.'
A ''
A '## Surviving record counts at each filter stage'
A ''
A '| Stage | Filter | Surviving |'
A '|---|---|---:|'
A ('| 0 | all seed records | ' + $s0.Count + ' |')
A ('| 1 | + `url_kind` is `website` | ' + $s1.Count + ' |')
A ('| 2 | + not `section-heading` | ' + $s2.Count + ' |')
A ('| 3 | + not `markdown-artifact` | ' + $s3.Count + ' |')
A ('| 4 | + not `unmerged-duplicate` | ' + $s4.Count + ' |')
A ('| 5 | + not `duplicate-name` | ' + $s5.Count + ' |')
A ('| 6 | + not `non-bc-suspected` or `defunct-suspected` | ' + $s6.Count + ' |')
A ('| 7 | + not `product-not-org` | ' + $s7.Count + ' |')
A ''
A ('**' + $s7.Count + ' records reach stage 7.** That is not ' + $s7.Count + ' usable organizations. It is ' + $s7.Count + ' names')
A 'worth the cost of checking, which is all artifact A was ever able to provide.'
A 'AUDIT.md 2.3 found that 176 of the 403 URLs carry a domain derivable character for'
A 'character from the organization name, so **the URL on a stage-7 record is a hint,'
A 'not an answer.** Verification resolves each site independently.'
A ''
A '## Reproduce'
A ''
A '```powershell'
A 'powershell -NoProfile -File .\research\audit\Build-Seed.ps1'
A '```'
[System.IO.File]::WriteAllText($OutSummary, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host ('wrote ' + $OutSummary)

# ---------------------------------------------------------------- console echo
''
'flag counts:'
foreach ($k in $flagCounts.Keys) { '  {0,-22} {1,5}' -f $k, $flagCounts[$k] }
''
'cascade: {0} -> {1} -> {2} -> {3} -> {4} -> {5} -> {6} -> {7}' -f $s0.Count, $s1.Count, $s2.Count, $s3.Count, $s4.Count, $s5.Count, $s6.Count, $s7.Count
'unflagged records: ' + $unflagged
'cleaned name differs from raw: ' + $cleanedDiffers
