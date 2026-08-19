<#
.SYNOPSIS
  Computes the CSP sha256 hash for every inline <script> in index.html.

.DESCRIPTION
  public\_headers pins script-src to 'self' plus explicit hashes. Change the
  inline theme bootstrap in index.html and the hash changes, so re-run this and
  update _headers or the script is blocked and the page loads unthemed.

  Hashing rule: the browser hashes the EXACT bytes between <script> and </script>,
  including leading and trailing newlines and indentation. Nothing is trimmed.

  Pure ASCII on purpose -- see Analyze-ArtifactA.ps1 for why.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Get-CspHash.ps1
#>
[CmdletBinding()]
param(
  [string]$IndexHtml = 'C:\Users\User\dev\BCAICompass\index.html'
)
$ErrorActionPreference = 'Stop'

$html = [System.IO.File]::ReadAllText($IndexHtml)
$rx = [regex]'(?s)<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>'
$matches_ = $rx.Matches($html)

if ($matches_.Count -eq 0) {
  'No inline scripts found in ' + $IndexHtml
  'script-src needs no hashes.'
  exit 0
}

'Inline scripts in ' + $IndexHtml + ': ' + $matches_.Count
''
$sha = [System.Security.Cryptography.SHA256]::Create()
$i = 0
foreach ($m in $matches_) {
  $i++
  $body = $m.Groups[1].Value
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
  $hash = [Convert]::ToBase64String($sha.ComputeHash($bytes))
  '  script ' + $i + ':'
  '    bytes  : ' + $bytes.Length
  '    csp    : ' + "'sha256-" + $hash + "'"
  ''
}
$sha.Dispose()

'Paste the csp value(s) into the script-src directive in public\_headers.'
