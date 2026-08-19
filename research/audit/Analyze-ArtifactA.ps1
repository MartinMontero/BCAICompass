<#
.SYNOPSIS
  Defect inventory for artifact A (bc-ai--ecosystem-map database-backup-2025-08-04.json).

.DESCRIPTION
  Reproduces every count quoted in research\AUDIT.md. Read-only: touches nothing in
  the reference clone and writes nothing anywhere. Emits a plain-text report to
  stdout; redirect it if you want it kept.

  NOTE: this file is deliberately pure ASCII. Windows PowerShell 5.1 decodes a
  BOM-less .ps1 as CP1252, which turns a UTF-8 em dash into U+201D -- and the 5.1
  lexer accepts U+201D as a string delimiter. Non-ASCII literals here silently
  break parsing. Characters that must be non-ASCII are built from [char] codes.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1
  powershell -NoProfile -File .\research\audit\Analyze-ArtifactA.ps1 -Section domains
#>
[CmdletBinding()]
param(
  [string]$ArtifactA = 'C:\Users\User\dev\ecomap-reference\archive\2025-08-04-project-cleanup\cleanup-files\database-backup-2025-08-04.json',
  [ValidateSet('all','fields','urls','names','categories','domains','fuzzy','filters')]
  [string]$Section = 'all'
)

$ErrorActionPreference = 'Stop'

# ---------- Levenshtein via Add-Type (pure PowerShell is too slow at 1399^2) ----------
if (-not ('BcAiCompass.Fuzzy' -as [type])) {
  Add-Type -TypeDefinition @'
namespace BcAiCompass {
  public static class Fuzzy {
    public static int Levenshtein(string a, string b) {
      if (string.IsNullOrEmpty(a)) return string.IsNullOrEmpty(b) ? 0 : b.Length;
      if (string.IsNullOrEmpty(b)) return a.Length;
      int[] prev = new int[b.Length + 1];
      int[] cur  = new int[b.Length + 1];
      for (int j = 0; j <= b.Length; j++) prev[j] = j;
      for (int i = 1; i <= a.Length; i++) {
        cur[0] = i;
        for (int j = 1; j <= b.Length; j++) {
          int cost = (a[i - 1] == b[j - 1]) ? 0 : 1;
          int del = prev[j] + 1;
          int ins = cur[j - 1] + 1;
          int sub = prev[j - 1] + cost;
          int m = del < ins ? del : ins;
          cur[j] = m < sub ? m : sub;
        }
        int[] t = prev; prev = cur; cur = t;
      }
      return prev[b.Length];
    }
  }
}
'@
}

# Non-ASCII characters this script needs, built without non-ASCII source bytes.
$CH_ELLIPSIS = [char]0x2026   # ...
$CH_REPL     = [char]0xFFFD   # replacement character
$MOJI_CHARS  = @([char]0x00C3, [char]0x00C2, [char]0x00E2, [char]0x0192, [char]0xFFFD)
$MOJI_RX     = '[' + ($MOJI_CHARS -join '') + ']'
$DASH        = '-' * 78

function Get-NormalizedName {
  param([string]$Name)
  if ($null -eq $Name) { return '' }
  $n = $Name.ToLowerInvariant()
  $n = $n -replace '^\s*\d+[\.\)]\s*', ''            # leading list numbering
  $n = $n -replace '\*+', ''                          # markdown bold markers
  $n = $n -replace '\s*\([^)]*\)\s*', ' '             # parentheticals
  $n = $n -replace '&', ' and '
  $n = $n -replace '\b(inc|llc|ltd|limited|corp|corporation|co|company|technologies|technology|labs|lab|solutions|systems|group|holdings|international|canada|bc)\b', ' '
  $n = $n -replace '[^a-z0-9]+', ' '
  $n = ($n -replace '\s+', ' ').Trim()
  return $n
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

function Write-Head {
  param([string]$T)
  ''
  '=' * 78
  $T
  '=' * 78
}

# ---------- load ----------
$j = Get-Content $ArtifactA -Raw -Encoding UTF8 | ConvertFrom-Json
$rows = $j.entries
$total = $rows.Count

Write-Head ('ARTIFACT A -- ' + $ArtifactA)
'backupDate      : ' + $j.backupDate
'databaseId      : ' + $j.databaseId
'totalEntries    : ' + $j.totalEntries
'entries.Count   : ' + $total

# ---------- field presence ----------
if ($Section -eq 'all' -or $Section -eq 'fields') {
  Write-Head 'FIELD PRESENCE'
  $fieldNames = @('name','website','category','yearFounded','keyPeople','funding','email','status')
  foreach ($f in $fieldNames) {
    $present = ($rows | Where-Object { $null -ne $_.properties.$f -and ([string]$_.properties.$f).Trim() -ne '' }).Count
    $pct = [math]::Round(100 * $present / $total, 1)
    '{0,-12} present {1,5}  ({2,5}%)  missing {3,5}' -f $f, $present, $pct, ($total - $present)
  }
  $observed = @{}
  foreach ($r in $rows) { foreach ($p in $r.properties.PSObject.Properties.Name) { $observed[$p] = 1 } }
  'properties keys observed across all rows: ' + (($observed.Keys | Sort-Object) -join ', ')

  $nameOnly = ($rows | Where-Object {
    $p = $_.properties
    $c = 0
    foreach ($f in @('website','category','yearFounded','keyPeople','funding','email','status')) {
      $v = ([string]$p.$f).Trim()
      if ($v -ne '' -and $v -ne '**') { $c++ }
    }
    $c -eq 0
  }).Count
  'rows carrying a name and NOTHING else usable: ' + $nameOnly
}

# ---------- url analysis ----------
if ($Section -eq 'all' -or $Section -eq 'urls') {
  Write-Head 'URL / WEBSITE FIELD'
  $nonEmpty = $rows | Where-Object { $null -ne $_.properties.website -and ([string]$_.properties.website).Trim() -ne '' }
  'non-empty website values      : ' + $nonEmpty.Count
  $http = $nonEmpty | Where-Object { $_.properties.website -match '^https?://' }
  'http(s) values                : ' + $http.Count
  $nonHttp = $nonEmpty | Where-Object { $_.properties.website -notmatch '^https?://' }
  'non-http values               : ' + $nonHttp.Count
  '  distinct non-http values:'
  $nonHttp | ForEach-Object { $_.properties.website } | Group-Object |
    Sort-Object Count -Descending | ForEach-Object { '    {0,5}x [{1}]' -f $_.Count, $_.Name }
  $li = $http | Where-Object { $_.properties.website -match 'linkedin\.com' }
  'linkedin.com in website field : ' + $li.Count
  $li | ForEach-Object { '    {0}  ->  {1}' -f $_.properties.name, $_.properties.website }
  'rows with NO usable http(s) url: ' + ($total - $http.Count)
  'insecure http:// scheme       : ' + ($http | Where-Object { $_.properties.website -match '^http://' }).Count
  $ws = $http | Where-Object { $_.properties.website -match '^\s|\s$' }
  'urls with leading/trailing whitespace: ' + $ws.Count
  $social = $http | Where-Object { (Get-RegisteredDomain $_.properties.website) -match '^(facebook\.com|twitter\.com|x\.com|instagram\.com|medium\.com|github\.com|github\.io|eventbrite\.ca|eventbrite\.com|meetup\.com|crunchbase\.com|notion\.site|notion\.so|wixsite\.com|squarespace\.com|substack\.com)$' }
  'other social/aggregator URLs in website field: ' + $social.Count
  $social | ForEach-Object { '    {0}  ->  {1}' -f $_.properties.name, $_.properties.website }
}

# ---------- name defects ----------
if ($Section -eq 'all' -or $Section -eq 'names') {
  Write-Head 'NAME-FIELD DEFECTS'

  $heading = $rows | Where-Object { $_.properties.name -match '\(\d+\)\s*$' }
  'section headings imported as organizations (name ends in "(N)"): ' + $heading.Count
  $heading | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $md = $rows | Where-Object { $_.properties.name -match '\*\*' -or $_.properties.name -match '^\s*\d+[\.\)]\s' }
  'markdown / list-numbering artifacts in name: ' + $md.Count
  $md | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $slash = $rows | Where-Object { $_.properties.name -match '\s/\s' }
  'names containing " / " (unmerged-duplicate candidates): ' + $slash.Count
  $slash | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $moji = $rows | Where-Object { $_.properties.name -match $MOJI_RX }
  'encoding-damaged names (mojibake / replacement char): ' + $moji.Count
  $moji | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $nonAscii = $rows | Where-Object { $_.properties.name -match '[^\x00-\x7F]' }
  'names containing non-ASCII characters: ' + $nonAscii.Count
  $nonAscii | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $truncRx = '(\.\.\.|' + $CH_ELLIPSIS + ')\s*$'
  $trunc = $rows | Where-Object { $_.properties.name -match $truncRx -or $_.properties.name -match '[-,:/&(]\s*$' }
  'truncated / dangling-punctuation names: ' + $trunc.Count
  $trunc | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $placeholderRx = '^\s*(\*+|n/?a|tbd|tba|unknown|none|null|-+|\?+|test|untitled|new page|placeholder|example|todo)\s*$'
  $ph = $rows | Where-Object { $_.properties.name -match $placeholderRx }
  'placeholder names: ' + $ph.Count
  $ph | ForEach-Object { '    [{0}]' -f $_.properties.name }

  ''
  'placeholder "**" by field:'
  foreach ($f in @('name','website','category','yearFounded','keyPeople','funding','email','status')) {
    $c = ($rows | Where-Object { ([string]$_.properties.$f).Trim() -eq '**' }).Count
    if ($c -gt 0) { '    {0,-12} {1,5}' -f $f, $c }
  }

  $short = $rows | Where-Object { ([string]$_.properties.name).Trim().Length -le 3 }
  ''
  'names of 3 characters or fewer: ' + $short.Count
  $short | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $long = $rows | Where-Object { ([string]$_.properties.name).Trim().Length -ge 55 }
  'names of 55 characters or more (sentence/description imported as name): ' + $long.Count
  $long | ForEach-Object { '    [{0}]' -f $_.properties.name }

  $wsn = $rows | Where-Object { $_.properties.name -cne ([string]$_.properties.name).Trim() -or $_.properties.name -match '\s{2,}' }
  'names with leading/trailing/doubled whitespace: ' + $wsn.Count
  $wsn | ForEach-Object { '    [{0}]' -f $_.properties.name }

  # person-not-org heuristic
  $orgToken = 'inc|ltd|llc|corp|company|technolog|labs?\b|solutions|systems|group|university|college|institute|centre|center|society|association|foundation|council|network|ventures|capital|partners|fund|studio|works|media|digital|health|\bai\b|data|software|academy|school|hub|space|collective|agency|consulting|services|bank|clinic|hospital|museum|festival|conference|summit|program|initiative|project|alliance|chamber|board|authority|ministry|department|nation|band|tribe|\.com|\.ca|\.ai|\.io|\.org'
  $person = $rows | Where-Object {
    $n = [string]$_.properties.name
    $n -cmatch '^[A-Z][a-z' + "'" + '\-]+(\s+[A-Z][a-z' + "'" + '\-\.]+){1,2}$' -and $n -notmatch $orgToken
  }
  ''
  'person-not-org candidates (heuristic, eyeballed downstream): ' + $person.Count
  $person | ForEach-Object { '    [{0}]  keyPeople=[{1}]' -f $_.properties.name, $_.properties.keyPeople }

  # product-not-org heuristic: name matches a known-product shape or the row's own
  # keyPeople/category says product; surfaced for eyeballing, not auto-classified.
  $productRx = '(?i)\b(platform|app\b|suite|toolkit|api\b|sdk\b|model|dataset|plugin|extension|chatbot|assistant|gpt|copilot)\b'
  $product = $rows | Where-Object { $_.properties.name -match $productRx }
  'product-not-org candidates (heuristic, eyeballed downstream): ' + $product.Count
  $product | ForEach-Object { '    [{0}]  category=[{1}]' -f $_.properties.name, $_.properties.category }
}

# ---------- categories ----------
if ($Section -eq 'all' -or $Section -eq 'categories') {
  Write-Head 'RAW CATEGORY LABELS (full list, with row counts)'
  $cats = $rows | ForEach-Object {
    $c = [string]$_.properties.category
    if ($c.Trim() -eq '') { '(no category)' } else { $c }
  } | Group-Object | Sort-Object -Property @{Expression='Count';Descending=$true}, @{Expression='Name';Descending=$false}
  'distinct labels incl. "(no category)": ' + $cats.Count
  'distinct labels excl. "(no category)": ' + ($cats | Where-Object { $_.Name -ne '(no category)' }).Count
  $cats | ForEach-Object { '{0,5}  {1}' -f $_.Count, $_.Name }
}

# ---------- domains ----------
if ($Section -eq 'all' -or $Section -eq 'domains') {
  Write-Head 'REGISTERED-DOMAIN COLLISIONS'
  $withDomain = foreach ($r in $rows) {
    $d = Get-RegisteredDomain $r.properties.website
    if ($d) { [pscustomobject]@{ Name = $r.properties.name; Domain = $d; Url = $r.properties.website } }
  }
  'rows resolving to a registered domain: ' + $withDomain.Count
  'distinct registered domains          : ' + ($withDomain | Select-Object -ExpandProperty Domain -Unique).Count
  $dupDom = $withDomain | Group-Object Domain | Where-Object { $_.Count -gt 1 } | Sort-Object -Property @{Expression='Count';Descending=$true}, @{Expression='Name';Descending=$false}
  'domains carried by more than one row : ' + $dupDom.Count
  'rows involved in a domain collision  : ' + ($dupDom | Measure-Object Count -Sum).Sum
  foreach ($g in $dupDom) {
    '  {0}   [{1} rows]' -f $g.Name, $g.Count
    $g.Group | ForEach-Object { '      [{0}]  {1}' -f $_.Name, $_.Url }
  }
}

# ---------- duplicate + fuzzy names ----------
if ($Section -eq 'all' -or $Section -eq 'fuzzy') {
  Write-Head 'NAME COLLISIONS -- EXACT, NORMALIZED, FUZZY'
  $exact = $rows | Group-Object { ([string]$_.properties.name).Trim() } | Where-Object { $_.Count -gt 1 } | Sort-Object -Property @{Expression='Count';Descending=$true}, @{Expression='Name';Descending=$false}
  'exact duplicate name groups: ' + $exact.Count + '   rows involved: ' + ($exact | Measure-Object Count -Sum).Sum
  $exact | ForEach-Object { '  {0,3}x [{1}]' -f $_.Count, $_.Name }

  $norm = $rows | ForEach-Object {
    [pscustomobject]@{ Name = [string]$_.properties.name; Norm = (Get-NormalizedName ([string]$_.properties.name)) }
  }
  $normDup = $norm | Where-Object { $_.Norm -ne '' } | Group-Object Norm | Where-Object { $_.Count -gt 1 } | Sort-Object -Property @{Expression='Count';Descending=$true}, @{Expression='Name';Descending=$false}
  ''
  'normalized duplicate groups (case/punctuation/legal-suffix insensitive): ' + $normDup.Count + '   rows involved: ' + ($normDup | Measure-Object Count -Sum).Sum
  foreach ($g in $normDup) {
    $variants = @($g.Group | Select-Object -ExpandProperty Name -Unique)
    '  [{0}] <- {1}' -f $g.Name, (($variants | ForEach-Object { '"' + $_ + '"' }) -join ' | ')
  }

  Write-Head 'FUZZY NAME PAIRS (Levenshtein on normalized name, blocked by first letter)'
  $uniqNorm = $norm | Where-Object { $_.Norm.Length -ge 4 } |
    Group-Object Norm | ForEach-Object {
      [pscustomobject]@{ Norm = $_.Name; Names = @($_.Group | Select-Object -ExpandProperty Name -Unique) }
    }
  'distinct normalized names of length >= 4: ' + $uniqNorm.Count
  $blocks = $uniqNorm | Group-Object { $_.Norm.Substring(0,1) }
  $pairs = New-Object System.Collections.ArrayList
  foreach ($b in $blocks) {
    $arr = @($b.Group)
    for ($i = 0; $i -lt $arr.Count; $i++) {
      for ($k = $i + 1; $k -lt $arr.Count; $k++) {
        $x = $arr[$i].Norm; $y = $arr[$k].Norm
        if ([math]::Abs($x.Length - $y.Length) -gt 3) { continue }
        $d = [BcAiCompass.Fuzzy]::Levenshtein($x, $y)
        $maxLen = [math]::Max($x.Length, $y.Length)
        $ratio = 1 - ($d / $maxLen)
        if ($d -le 3 -and $ratio -ge 0.82) {
          [void]$pairs.Add([pscustomobject]@{
            A = ($arr[$i].Names -join ' | ')
            B = ($arr[$k].Names -join ' | ')
            Dist = $d
            Ratio = [math]::Round($ratio, 3)
          })
        }
      }
    }
  }
  'fuzzy pairs at Levenshtein <= 3 and similarity >= 0.82: ' + $pairs.Count
  $pairs | Sort-Object Dist, A | ForEach-Object { '  d={0} r={1}  [{2}]  ~  [{3}]' -f $_.Dist, $_.Ratio, $_.A, $_.B }

  $contain = New-Object System.Collections.ArrayList
  $sorted = @($uniqNorm | Sort-Object { $_.Norm.Length })
  for ($i = 0; $i -lt $sorted.Count; $i++) {
    if ($sorted[$i].Norm.Length -lt 6) { continue }
    for ($k = $i + 1; $k -lt $sorted.Count; $k++) {
      $s = $sorted[$i].Norm; $l = $sorted[$k].Norm
      if ($l -eq $s) { continue }
      if ($l.StartsWith($s + ' ')) {
        [void]$contain.Add([pscustomobject]@{
          Short = ($sorted[$i].Names -join ' | ')
          Long  = ($sorted[$k].Names -join ' | ')
        })
      }
    }
  }
  ''
  'containment pairs (one normalized name is a token-prefix of another, >=6 chars): ' + $contain.Count
  $contain | ForEach-Object { '  [{0}]  <  [{1}]' -f $_.Short, $_.Long }
}

# ---------- filter cascade ----------
if ($Section -eq 'all' -or $Section -eq 'filters') {
  Write-Head 'FILTER CASCADE (the four established filters, applied in order)'
  $s0 = $rows
  '0. all rows                                  : ' + $s0.Count
  $s1 = $s0 | Where-Object { $_.properties.website -match '^https?://' }
  '1. + has an http(s) website value            : ' + $s1.Count
  $s2 = $s1 | Where-Object { $_.properties.website -notmatch 'linkedin\.com' }
  '2. + website is not a LinkedIn company page  : ' + $s2.Count
  $s3 = $s2 | Where-Object { $_.properties.name -notmatch '\(\d+\)\s*$' }
  '3. + name is not a section heading           : ' + $s3.Count
  $s4 = $s3 | Where-Object { $_.properties.name -notmatch '\*\*' -and $_.properties.name -notmatch '^\s*\d+[\.\)]\s' }
  '4. + name carries no markdown/list artifact  : ' + $s4.Count
  $s5 = $s4 | Where-Object { $_.properties.name -notmatch '\s/\s' }
  '5. + name is not an unmerged duplicate       : ' + $s5.Count
  ''
  'Overlap note: the defect classes intersect. Counting each class against the full'
  '1,399 rows and summing will overstate the damage; this cascade is the honest'
  'arithmetic because each stage is applied to the survivors of the previous one.'
}

''
'done.'
