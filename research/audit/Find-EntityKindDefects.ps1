<#
.SYNOPSIS
  Isolates the "this row is not an organization" defect families in artifact A:
  report fragments, people, products, and bare years / filenames.

.DESCRIPTION
  Read-only. Pure ASCII on purpose. Every pattern list below is explicit so the
  classification is auditable rather than a black box.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Find-EntityKindDefects.ps1
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

# A row has "no usable payload" when every field except name is empty or the '**' placeholder.
function Test-NoPayload {
  param($Row)
  foreach ($f in @('website','category','yearFounded','keyPeople','funding','email','status')) {
    $v = ([string]$Row.properties.$f).Trim()
    if ($v -ne '' -and $v -ne '**') { return $false }
  }
  return $true
}

$noPayload = @($rows | Where-Object { Test-NoPayload $_ })

Write-Head 'CLASS: LABEL-TERMINATED FRAGMENT (name ends in a colon)'
$colon = @($rows | Where-Object { $_.properties.name -match ':\s*$' })
'count: ' + $colon.Count
'of which carry no payload beyond the name: ' + @($colon | Where-Object { Test-NoPayload $_ }).Count
'verbatim examples:'
$colon | Select-Object -First 3 | ForEach-Object { '    [{0}]' -f $_.properties.name }

Write-Head 'CLASS: BARE YEAR OR YEAR RANGE AS ORGANISATION NAME'
$yr = @($rows | Where-Object { $_.properties.name -match '^\s*(19|20)\d{2}(\s*[-/]\s*(19|20)?\d{2})?\s*$' })
'count: ' + $yr.Count
$yr | ForEach-Object { '    [{0}]' -f $_.properties.name }

Write-Head 'CLASS: FILENAME AS ORGANISATION NAME'
$fn = @($rows | Where-Object { $_.properties.name -match '\.(json|md|csv|txt|js|xlsx)\s*$' })
'count: ' + $fn.Count
$fn | ForEach-Object { '    [{0}]' -f $_.properties.name }

Write-Head 'CLASS: DATABASE SCHEMA FIELD LABEL AS ORGANISATION NAME'
# Exactly the field labels the maintainers' own reports use as table headers.
$schemaLabels = @(
  'Name','Website','LinkedIn','Email','Category','Region','City','Description',
  'Year Founded','Key People','Employee Count','Employee Counts','Valuation',
  'Revenue','Funding','Last Verified','Status','Logo','Phone','Address',
  'Total Raised','Total Revenue','Total Employees','Average Revenue',
  'Average Team Size','Average Founder Age','Team Range','Revenue Range',
  'Funding Range','Funding Data','Funding Details','Market Data','People Data',
  'Date Stamped','Cross-Referenced','High Confidence','Medium Confidence',
  'Before Addition','After Addition','Net Improvement','Series A','Year 1','Year 2','Year 3'
)
$schema = @($rows | Where-Object { $schemaLabels -contains ([string]$_.properties.name).Trim() })
'count: ' + $schema.Count
$schema | ForEach-Object { '    [{0}]' -f $_.properties.name }

Write-Head 'CLASS: ANALYTICAL / REPORT-SECTION PHRASE AS ORGANISATION NAME'
# Rows with no payload whose name is a report-prose phrase: it contains an analysis
# noun but no organisation-shaped token and no proper-noun anchor.
$reportNoun = '(?i)\b(intelligence|metrics|trends|assessment|analysis|recommendations|opportunities|priorities|readiness|positioning|penetration|velocity|distribution|diversity|progression|consolidation|maturity|differentiation|reinforcement|evolution|expansion|enhancement|generating|generation|mapping|tracking|targeting|monitoring|verification|standards|documentation|patterns|indicators|factors|themes|gaps|strategy|strategies|landscape|traction|reach|advantage|edge|position|state|levels|methods|sources|counts?|sizes?|ranges?|totals?)\b'
$orgAnchor = '(?i)\b(inc|ltd|llc|corp|corporation|company|technolog\w*|labs?|solutions|systems|group|university|college|institute|centre|center|society|association|foundation|council|network|ventures|capital|partners|fund|studio\w*|works|media|digital|health|data|software|academy|school|hub|space|collective|agency|consulting|services|bank|clinic|hospital|museum|festival|conference|summit|program|initiative|project|alliance|chamber|board|authority|ministry|department|nation|robotics|energy|therapeutics|pharmaceuticals|sciences?|biologics|entertainment|analytics|ai)\b'
$reportPhrase = @($noPayload | Where-Object {
  $n = ([string]$_.properties.name).Trim()
  $n -notmatch ':\s*$' -and $n -match $reportNoun -and $n -notmatch $orgAnchor
})
'count (restricted to rows with no payload): ' + $reportPhrase.Count
'verbatim examples:'
$reportPhrase | Select-Object -First 3 | ForEach-Object { '    [{0}]' -f $_.properties.name }
'full list:'
$reportPhrase | ForEach-Object { '    [{0}]' -f $_.properties.name }

Write-Head 'CLASS: IMPERATIVE TASK / TO-DO LINE AS ORGANISATION NAME'
$todo = @($noPayload | Where-Object {
  ([string]$_.properties.name).Trim() -cmatch '^(Deep dive|Track|Monitor|Add|Update|Review|Expand|Build|Create|Verify|Complete|Populate|Import|Research|Identify|Establish|Launch|Continue|Consider|Explore)\b'
})
'count: ' + $todo.Count
$todo | ForEach-Object { '    [{0}]' -f $_.properties.name }

Write-Head 'CLASS: PERSON, NOT ORGANISATION'
# A personal name: 2-3 capitalised words, optionally with an honorific or a
# parenthetical role, and no organisation-shaped token anywhere.
$honorific = '^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s'
$person = @($rows | Where-Object {
  $n = ([string]$_.properties.name).Trim()
  ($n -cmatch '^[A-Z][a-z]+(\s+[A-Z]\.?)?\s+[A-Z][a-z]+(-[A-Z][a-z]+)?$' -or $n -match $honorific) -and
  $n -notmatch $orgAnchor -and $n -notmatch $reportNoun
})
'count (heuristic candidates): ' + $person.Count
$person | ForEach-Object { '    [{0}]  cat=[{1}]  web=[{2}]' -f $_.properties.name, $_.properties.category, $_.properties.website }

Write-Head 'CLASS: PRODUCT, NOT ORGANISATION'
$productRx = '(?i)(\bapp\b|\bplatform\b|\bsuite\b|\btoolkit\b|\bapi\b|\bsdk\b|\bplugin\b|\bextension\b|\bchatbot\b|\bcopilot\b|\bgpt\b|\(by\s)'
$product = @($rows | Where-Object { $_.properties.name -match $productRx })
'count (heuristic candidates): ' + $product.Count
$product | ForEach-Object { '    [{0}]  cat=[{1}]  web=[{2}]' -f $_.properties.name, $_.properties.category, $_.properties.website }

Write-Head 'ROLL-UP'
$union = New-Object System.Collections.Generic.HashSet[string]
foreach ($set in @($colon, $yr, $fn, $schema, $reportPhrase, $todo)) {
  foreach ($r in $set) { [void]$union.Add($r.id) }
}
'rows with no payload beyond the name                 : ' + $noPayload.Count
'rows machine-classified as NOT AN ENTITY (union)     : ' + $union.Count
'  of those, rows that carry an http(s) website       : ' + @($rows | Where-Object { $union.Contains($_.id) -and $_.properties.website -match '^https?://' }).Count
$residual = @($noPayload | Where-Object { -not $union.Contains($_.id) })
'no-payload rows NOT machine-classified (residual)    : ' + $residual.Count
''
'The residual is the honest limit of automated classification. Full residual list'
'so a human can settle each one:'
$residual | ForEach-Object { '    [{0}]' -f $_.properties.name }
''
'total rows: ' + $total
