<#
.SYNOPSIS
  Builds research\unverified.json -- every candidate that did not reach
  status:verified, with the reason recorded per record.

.DESCRIPTION
  Sources:
    1. research\seed.json (all 1,399 artifact-A rows)
    2. the artifact-C-only names listed in research\GAPS.md section 7
    3. the individually-checked organizations whose verification failed, with the
       specific finding recorded verbatim

  Three states are distinguished, because a future re-verification pass should
  retry the unreachable and not re-litigate the rejected:
    rejected   -- checked, and something was found that rules it out
    unverified -- could not be checked, or was not checked in this pass

  Never built into the site. Nothing in src\ imports it.

  Pure ASCII on purpose -- see Analyze-ArtifactA.ps1 for why.

.EXAMPLE
  powershell -NoProfile -File .\research\audit\Build-Unverified.ps1
#>
[CmdletBinding()]
param(
  [string]$Root = 'C:\Users\User\dev\BCAICompass'
)
$ErrorActionPreference = 'Stop'

$seedPath = Join-Path $Root 'research\seed.json'
$orgPath  = Join-Path $Root 'src\data\organizations.ts'
$outPath  = Join-Path $Root 'research\unverified.json'

$seed = Get-Content $seedPath -Raw -Encoding UTF8 | ConvertFrom-Json

# Names already published, so they are not carried here as unverified.
$orgSrc = Get-Content $orgPath -Raw -Encoding UTF8
$publishedNames = @([regex]::Matches($orgSrc, "(?m)^\s{4}name: '((?:[^']|\\')*)'") | ForEach-Object {
  $_.Groups[1].Value -replace "\\'", "'"
})
$publishedKey = @{}
foreach ($n in $publishedNames) { $publishedKey[$n.ToLowerInvariant()] = 1 }

# -------------------------------------------------------------------------
# Individually checked and NOT published. Reason text states what was actually
# observed on the page read, and the date. These are the expensive findings --
# each one cost a fetch, and each one is a fact about the world on 2026-08-19.
# -------------------------------------------------------------------------
$CHECKED = @(
  @{ name='AbCellera Biologics'; url='https://www.abcellera.com'; status='unverified'; reason='BC presence confirmed (Vancouver, 150 W 4th Ave; ~600 people stated). AI/ML materiality NOT stated on the homepage or on /technology, both read 2026-08-19 -- the company describes "biology, computation, and engineering". Needs a first-party AI statement before listing.' },
  @{ name='D-Wave Quantum'; url='https://www.dwavequantum.com'; status='rejected'; reason='AI materiality confirmed on its own site ("quantum AI solutions ... AI and machine learning workloads"). But its own /company/contact/ page, read 2026-08-19, lists headquarters as Palo Alto, California and Boca Raton, Florida. A Canadian R&D location appears with a BC 604 phone number but NO city is stated. BC headquarters is a widely repeated claim this check does not support.' },
  @{ name='Visier'; url='https://www.visier.com'; status='unverified'; reason='BC presence confirmed (Vancouver, Beatty Street; "600 employees and 7 office locations"). AI/ML NOT stated on /company, read 2026-08-19 -- the only reference is a 2022 acquisition of Yva.ai. Needs a first-party AI statement.' },
  @{ name='Picovoice'; url='https://picovoice.ai'; status='unverified'; reason='AI materiality confirmed verbatim ("On-device AI for real-time voice, language, and vision understanding"). No city or address on the homepage or /company/, both read 2026-08-19. BC presence not established from any page read.' },
  @{ name='Spexi'; url='https://www.spexi.com'; status='unverified'; reason='AI materiality confirmed verbatim ("physical AI systems", "Spatial AI model training"). No city or address on the homepage or /contact, both read 2026-08-19.' },
  @{ name='Gluxkind'; url='https://www.gluxkind.com'; status='unverified'; reason='AI materiality confirmed verbatim ("Glüxkind''s AI-powered smart stroller"). No city or address on the page read 2026-08-19.' },
  @{ name='Pani Energy'; url='https://pani.global/'; status='unverified'; reason='AI materiality confirmed verbatim ("Meet your AI process engineer"). Legal name Pani Energy Inc. from the footer. No headquarters city on the homepage or /about, both read 2026-08-19; /about mentions a founder studying at the University of Victoria, which is not a company location. Note: panienergy.com 301-redirects to pani.global.' },
  @{ name='Quandri'; url='https://www.quandri.io'; status='unverified'; reason='AI materiality confirmed verbatim ("AI-powered renewal intelligence"). Legal name Quandri Technologies, Inc. No city or address on the page read 2026-08-19.' },
  @{ name='Awake Labs'; url='https://awakelabs.com'; status='unverified'; reason='Page read 2026-08-19 references "a clinically validated algorithm" but does not name AI or machine learning. The only geographic signal in the footer is a 647 (Toronto) area code. Neither test passed.' },
  @{ name='Fintel Connect'; url='https://www.fintelconnect.com'; status='unverified'; reason='AI materiality confirmed verbatim ("AI-powered monitoring tool"). No city or street address on /about-us, read 2026-08-19.' },
  @{ name='Jane Software'; url='https://www.jane.app'; status='unverified'; reason='AI materiality is thin but present ("AI Scribe" feature). No BC city or address on /about, read 2026-08-19.' },
  @{ name='Ideon Technologies'; url='https://ideon.ai'; status='unverified'; reason='Muon tomography for subsurface imaging. AI/ML not stated on the page read 2026-08-19. BC presence is only implied by award names (Richmond Chamber of Commerce), which is not a stated location.' },
  @{ name='MistyWest'; url='https://www.mistywest.com'; status='unverified'; reason='BC presence confirmed (Vancouver, 554 East 15th Ave). AI/ML NOT stated on /about, read 2026-08-19 -- described as full-stack hardware product development.' },
  @{ name='4AG Robotics'; url='https://www.4agrobotics.com'; status='rejected'; reason='THE URL CARRIED BY ARTIFACT A NOW RESOLVES TO A DOMAIN-SALE PARKING PAGE. Read 2026-08-19: the page is a domain marketplace operated from 4600 East Washington Street, Phoenix, Arizona. This is exactly the failure the audit predicted for artifact A''s name-derived URLs -- the domain exists, so a naive check passes, and the organization is not there.' },
  @{ name='Lighthouse Labs'; url='https://www.lighthouselabs.ca'; status='rejected'; reason='lighthouselabs.ca 302-redirects off-domain to brileyfarber.com/engagements/uvaro/, a third-party consultant page, when read 2026-08-19. The organization''s own site no longer resolves at that domain. Not listed until a first-party site is found.' },
  @{ name='Ekona Power'; url='https://www.ekonapower.com'; status='unverified'; reason='BC presence confirmed (Burnaby, 8170 Winston Street). AI/ML NOT stated on the page read 2026-08-19 -- methane pyrolysis to hydrogen and carbon black.' },
  @{ name='Genome BC'; url='https://www.genomebc.ca'; status='unverified'; reason='BC presence confirmed (Vancouver, 400-575 West 8th Avenue; explicitly not-for-profit). AI/ML/data science NOT stated on /about, read 2026-08-19.' },
  @{ name="Canada's Michael Smith Genome Sciences Centre"; url='https://www.bcgsc.ca/'; status='unverified'; reason='Parent organization Provincial Health Services Authority. Page read 2026-08-19 states "analytical methods" and "scalable software and data solutions" but does not name AI or machine learning; no city is stated either. Calling this an AI organization from that wording would be inference, which this project does not publish.' },
  @{ name='Innovate BC'; url='https://www.innovatebc.ca'; status='unverified'; reason='BC presence confirmed (Vancouver, Four Bentall Centre, 1055 Dunsmuir Street, Suite 810). No AI-specific programme named on the page read 2026-08-19; listed programmes are BC Fast Pilot, Integrated Marketplace, Ignite, Accelerate IP, ScaleUp and the Venture Acceleration Program. Very likely belongs in the dataset -- needs one page where Innovate BC itself names AI.' },
  @{ name='Accelerate Okanagan'; url='https://accelerateokanagan.com'; status='unverified'; reason='BC presence confirmed (Kelowna, serving Osoyoos to Salmon Arm; explicitly non-profit, mostly government funded). No mention of AI on /about, read 2026-08-19.' },
  @{ name='Foresight Canada'; url='https://foresightcac.com'; status='unverified'; reason='Cleantech accelerator; footer references a Vancouver office but no street address. No mention of AI on /about, read 2026-08-19.' },
  @{ name='Launch Academy'; url='https://www.launchacademy.ca'; status='unverified'; reason='BC presence confirmed (Vancouver, per footer); non-profit tech incubator since 2012. The only AI reference on the page read 2026-08-19 is an online marketing course that includes AI prompts, which does not establish that AI work is material to the organization. Held to the same bar as everything else.' },
  @{ name='MetaOptima'; url='https://www.metaoptima.com'; status='unverified'; reason='Page read 2026-08-19 returned only "intelligent dermatology solutions" with no AI/ML statement and no city or address. Note that artifact A carried this organization twice, once as the unmerged duplicate "MetaOptima / MetaOptima (DermEngine)".' },
  @{ name='Semios'; url='https://semios.com'; status='unverified'; reason='HTTP 403 to automated fetch on /about-us, 2026-08-19. Could not be checked.' },
  @{ name='MineSense Technologies'; url='https://www.minesense.com'; status='unverified'; reason='Both the homepage and /contact/ returned no readable content to automated fetch, 2026-08-19. Could not be checked.' },
  @{ name='Sparkgeo'; url='https://sparkgeo.com'; status='unverified'; reason='HTTP 403 to automated fetch on /about/, 2026-08-19. Could not be checked. Of particular interest: this is one of very few candidates associated with Prince George, a region this dataset barely covers.' },
  @{ name='LlamaZOO'; url='https://www.llamazoo.com'; status='unverified'; reason='Connection reset (ECONNRESET) on automated fetch, 2026-08-19. Could not be checked.' },
  @{ name='Clio'; url='https://www.clio.com'; status='unverified'; reason='HTTP 403 to automated fetch on /about/, 2026-08-19. Could not be checked.' },
  @{ name='Thinkific'; url='https://www.thinkific.com'; status='unverified'; reason='HTTP 404 on /about-us/, 2026-08-19. Could not be checked at the URL tried.' },
  @{ name='Procurify'; url='https://www.procurify.com'; status='unverified'; reason='HTTP 404 on /about-us/, 2026-08-19. Could not be checked at the URL tried.' },
  @{ name='Iris Automation'; url='https://www.iris.io'; status='unverified'; reason='Page returned no readable content to automated fetch, 2026-08-19. Could not be checked.' },
  @{ name='BCIT Applied Research'; url='https://www.bcit.ca/applied-research/research-centres/'; status='unverified'; reason='BC presence confirmed (Burnaby, 3700 Willingdon Ave). Read 2026-08-19: BCIT publishes twelve named research centres and NOT ONE of their descriptions references AI, machine learning, data analytics or automation. No BCIT centre is listed rather than inferring an AI connection from centre names.' },
  @{ name='Thompson Rivers University research centres'; url='https://www.tru.ca/research.html'; status='unverified'; reason='Read 2026-08-19: TRU publishes three named research centres (Institute for Wildfire Science Resiliency and Adaption; All My Relations; Population Health and Aging Rural Research Centre) and none mentions AI, ML or data science. TRU itself IS published, sourced to the Bell AI Fabric facility it hosts -- but its research centres are not.' },
  @{ name='UBC Okanagan research centres'; url='https://ok.ubc.ca/research/'; status='unverified'; reason='Read 2026-08-19: the page states 6 research institutes and 26 UBC-funded clusters of research excellence but does not name them. One UBC Okanagan AI unit IS published (Digital Transparency Research Excellence Cluster), sourced to research.ubc.ca/ai. The remainder could not be enumerated.' },
  @{ name='Emily Carr University centres and labs'; url='https://www.ecuad.ca/academics/research-area/centres-lab'; status='unverified'; reason='HTTP 403 to automated fetch on two separate URLs, 2026-08-19. Could not be checked. Artifact C names "IM4 Lab (Emily Carr University)", which remains an unchecked lead.' },
  @{ name='UNBC research'; url='https://www.unbc.ca/research'; status='unverified'; reason='HTTP 403 to automated fetch, 2026-08-19. Could not be checked. UNBC is in Prince George, a region this dataset barely covers, so this is a priority for the next pass.' },
  @{ name='UBC Sauder research centres'; url='https://www.sauder.ubc.ca/faculty-research/research-centres'; status='unverified'; reason='HTTP 403 to automated fetch, 2026-08-19. Could not be checked. Artifact C names "UBC Sauder Data + AI Research Group", which remains an unchecked lead.' },
  @{ name='TrueNorth Sustainable Infrastructure'; url='https://www.bell.ca/Business/AI-Fabric'; status='unverified'; reason='Named as lead developer of Bell AI Fabric Kamloops 2 in coverage read 2026-08-19. No location is stated for the company itself, so no region could be assigned without guessing. The facility it is developing IS published.' },
  @{ name='Bell Canada'; url='https://www.bell.ca/Business/AI-Fabric'; status='rejected'; reason='Operator of four published BC AI Fabric facilities, but Bell Canada is not itself a British Columbia organization. Its BC facilities are listed individually; the parent company is not, on the same principle that keeps Groq, NVIDIA and Microsoft''s AI for Good Lab out of a BC directory.' },
  @{ name='Groq'; url='https://groq.com'; status='rejected'; reason='Named in Bell AI Fabric coverage as the LPU supplier for the Kamloops facility. Not a British Columbia organization. Appears inside the Bell facility record''s sourced description instead.' },
  @{ name='Prophet River First Nation data centre partnership'; url='https://thehub.ca/2026/05/29/why-first-nations-should-be-all-in-on-ai-data-centres/'; status='unverified'; reason='Reported 2026-05-29 to have advanced plans for a large-scale data-centre partnership near Fort St. John. Source is a third-party opinion column, not the Nation or its economic development corporation. Per PLAN.md section 1.1 this project does not publish an Indigenous-led attribution from a third-party source. Enters only when the Nation states it on its own site. This is the only lead for the entire Northeast region.' },
  @{ name='Nanaimo data centre proposal'; url='https://martlet.ca/data-centres-and-ai-infrastructure-are-coming-to-b-c/'; status='unverified'; reason='Reported at ~200,000 sq ft with water use peaking at 69,000 L/day. No proponent is named and no first-party or municipal source was read. An unnamed proponent is not a record.' },
  @{ name='Quantum Algorithms Institute (own site)'; url='https://www.quantumalgorithms.ca'; status='unverified'; reason='The institute IS published, but sourced to SFU rather than to itself: quantumalgorithms.ca presented an EXPIRED TLS CERTIFICATE when fetched on 2026-08-19. Recorded here so the next pass re-checks the certificate rather than assuming the earlier source still stands.' }
)

# Artifact-C-only names (GAPS.md section 7). Leads, none checked in this pass.
$C_ONLY = @(
  '3 Lions AI Solutions','Above Sensing Ltd.','AccessAI','ADG Tech','AI Tinkerers Vancouver - Profile',
  'AIM Lab - Artificial Intelligence in Medicine Lab','Ainome Inc.','Audette','Avigilon (Motorola Solutions)',
  'Be Pacific','Borealis AI (RBC Research Lab)','BrainBox AI','Cascadia Scientific',
  'Central Interior Business Accelerator','Circles of AI','Cisco Systems Vancouver','DaoAI',
  'Digital Democracies Institute - SFU','Digital Democracies Institute (SFU)','Fuelix AI','FYBR Solutions',
  'Geco Strategic Weed Management','GeologicAI','Gluxkind (artifact C spelling)','Health & Climate Data Lab (UBC)',
  'IM4 Lab (Emily Carr University)','Immersio Learning Inc.','InBC Investment Corp','Indigenous Tech Symposium',
  'Innovation Island','Insporos','Intelautomatics','Intronic','Intuitive AI','Iris AI','Langbase.com',
  'Legible AI','Lunar AI','Mindstone Community','Ministry JEDI','MyAni EdTech','NCellular AI','New Ventures BC',
  'NordAI','Northern Innovation Network','Novatone Consulting Ltd.','PacifiCan Regional AI Initiative',
  'Quartech Systems Ltd.','Revela Systems','Segev LLP','SensorUp Inc.','SFU','SFU Big Data Hub',
  'SFU Metacreation Lab','Skyward Wildfire','SmartLumber AI','Softmax Data','Spexi Geospatial','Tech Yukon',
  'Technocrat AI','UBC Cognitive Systems','UBC Neuroethics','UBC Sauder Data + AI Research Group',
  'UBC Space Centre','UVic Advanced Control and Intelligent Systems Lab','Vodasafe','Zero Inbox Technologies'
)

$out = New-Object System.Collections.ArrayList
$seenName = @{}

function Add-Record {
  param(
    [string]$Id, [string]$Name, [string]$NameRaw, $Url, $UrlKind, $CategoryRaw,
    [string]$Source, [string]$Status, [string]$Reason, [string[]]$Flags
  )
  $key = $Name.ToLowerInvariant()
  if ($seenName.ContainsKey($key)) { return }
  $seenName[$key] = 1
  [void]$out.Add([ordered]@{
    id           = $Id
    name         = $Name
    name_raw     = $NameRaw
    url          = $Url
    url_kind     = $UrlKind
    category_raw = $CategoryRaw
    source       = $Source
    status       = $Status
    reason       = $Reason
    flags        = @($Flags)
  })
}

function Get-Slug {
  param([string]$Name)
  $s = $Name.ToLowerInvariant() -replace '&', ' and '
  $s = $s -replace '[^a-z0-9]+', '-'
  return ($s -replace '-{2,}', '-').Trim('-')
}

# 1. individually checked failures first -- the expensive, specific findings
foreach ($c in $CHECKED) {
  Add-Record -Id (Get-Slug $c.name) -Name $c.name -NameRaw $c.name -Url $c.url -UrlKind 'website' `
    -CategoryRaw $null -Source 'checked-2026-08-19' -Status $c.status -Reason $c.reason -Flags @()
}

# 2. artifact-C-only leads
foreach ($n in $C_ONLY) {
  if ($publishedKey.ContainsKey($n.ToLowerInvariant())) { continue }
  Add-Record -Id (Get-Slug $n) -Name $n -NameRaw $n -Url $null -UrlKind $null -CategoryRaw $null `
    -Source 'bc-ai--ecosystem-map@database-quality-2025-10-19' -Status 'unverified' `
    -Reason 'Name appears in the 2025-10-19 quality report and not in the 2025-08-04 dump, so it was added to the source database between those dates. No URL, no location and no field values are available anywhere in the reference repository. Not checked in this pass.' `
    -Flags @('no-url')
}

# 3. the whole seed list
foreach ($s in $seed) {
  if ($publishedKey.ContainsKey($s.name.ToLowerInvariant())) { continue }

  $reason = $null
  $status = 'unverified'

  if ($s.flags -contains 'section-heading') {
    $status = 'rejected'
    $reason = 'Not an organization: this row is a section heading from the source document, imported as a database row. Its name ends in a bracketed count.'
  } elseif ($s.flags -contains 'non-bc-suspected') {
    $status = 'rejected'
    $reason = 'Confirmed out of scope: not a British Columbia organization.'
  } elseif ($s.flags -contains 'defunct-suspected') {
    $status = 'rejected'
    $reason = 'Confirmed defunct, acquired, or no longer an independent British Columbia entity. A record for it would mislead.'
  } elseif ($s.flags -contains 'unmerged-duplicate') {
    $status = 'rejected'
    $reason = 'Not a single organization: the name conflates two entities with a slash separator. Needs splitting by hand before either half can be checked.'
  } elseif ($s.flags -contains 'product-not-org') {
    $status = 'rejected'
    $reason = 'This row names a product rather than the organization that makes it.'
  } elseif ($s.name -match ':\s*$') {
    $status = 'rejected'
    $reason = 'Not an organization: the name is a field label ending in a colon, lifted line-by-line out of a scraped markdown report. See AUDIT.md section 2.6.4.'
  } elseif ($s.name -match '^\s*(19|20)\d{2}(\s*[-/]\s*(19|20)?\d{2})?\s*$') {
    $status = 'rejected'
    $reason = 'Not an organization: the name is a bare year or year range.'
  } elseif ($s.name -match '\.(json|md|csv|txt|js|xlsx)\s*$') {
    $status = 'rejected'
    $reason = 'Not an organization: the name is a filename.'
  } elseif ($s.flags -contains 'markdown-artifact') {
    $reason = 'Carried markdown or list-numbering damage in the source name, now stripped into the cleaned name. The underlying organization may be real and has not been checked in this pass.'
  } elseif ($s.flags -contains 'linkedin-as-website') {
    $reason = 'The only URL in the source is a LinkedIn company page, which is a hint rather than the organization''s own site. Not checked in this pass; verification would require finding the real site independently.'
  } elseif ($s.flags -contains 'duplicate-domain') {
    $reason = 'Shares a registered domain with at least one other candidate, so it may be a duplicate or a sub-unit of another record. Needs a human decision before checking.'
  } elseif ($s.flags -contains 'duplicate-name') {
    $reason = 'Its normalized name collides with at least one other candidate. Needs de-duplication by hand before checking.'
  } elseif ($s.flags -contains 'no-url') {
    $reason = 'No usable http(s) URL in the source, so there was nothing to resolve. Not checked in this pass.'
  } else {
    $reason = 'Structurally intact candidate with a website URL, not reached in this verification pass. Note that AUDIT.md section 2.3 found the source URL for 176 of 403 such rows to be derivable character-for-character from the organization name, so the URL is a hint and must be re-resolved independently, not trusted.'
  }

  Add-Record -Id $s.id -Name $s.name -NameRaw $s.name_raw -Url $s.url -UrlKind $s.url_kind `
    -CategoryRaw $s.category_raw -Source $s.source -Status $status -Reason $reason -Flags $s.flags
}

$sorted = @($out | Sort-Object -Property @{Expression = { $_.name }})
$json = $sorted | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($outPath, $json + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

'wrote ' + $outPath
'  records            : ' + $sorted.Count
'  rejected           : ' + @($sorted | Where-Object { $_.status -eq 'rejected' }).Count
'  unverified         : ' + @($sorted | Where-Object { $_.status -eq 'unverified' }).Count
'  individually checked: ' + @($sorted | Where-Object { $_.source -eq 'checked-2026-08-19' }).Count
'  published (excluded from this file): ' + $publishedNames.Count
