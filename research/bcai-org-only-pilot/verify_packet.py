import csv
import hashlib
import json
from pathlib import Path
import re


root = Path(__file__).resolve().parent
expected_files = {'README.md', 'DATA-NOTES.md', 'PILOT.md', 'PRIVACY-CHECK.md', 'ATTRIBUTION.md', 'LICENSE', 'release.json', 'verify_packet.py', 'data/organizations.json', 'data/organizations.csv', 'organization-crosswalk.csv', 'pilot-review-candidates.csv'}
assert {str(path.relative_to(root)) for path in root.rglob('*') if path.is_file()} == expected_files
release = json.loads((root / 'release.json').read_text())
for entry in release['files']:
    raw = (root / entry['path']).read_bytes()
    assert len(raw) == entry['bytes']
    assert hashlib.sha256(raw).hexdigest() == entry['sha256']

data = json.loads((root / 'data/organizations.json').read_text())
assert set(data) == {'schemaVersion', 'counts', 'organizations'}
assert data['schemaVersion'] == 'bc-ai-organizations-only-v1'
assert data['counts'] == release['counts'] == {'organizations': 900}
organizations = data['organizations']
assert len(organizations) == len({record['id'] for record in organizations}) == 900
fingerprint = hashlib.sha256(json.dumps(organizations, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
assert fingerprint == release['organizationArrayFingerprint'] == 'bf2554aff22de41db333e10d7187c135c0ea0247e05dcfcaca6e716cc9b453c8'
allowed = {'id', 'type', 'slug', 'name', 'summary', 'excerpt', 'profileUrl', 'lastUpdated', 'categories', 'locations', 'tags', 'websiteUrls'}
for record in organizations:
    assert set(record) <= allowed and record['type'] == 'organization'
    assert record['profileUrl'] == '/bc-ai-directory/organizations/' + record['slug']
    for value in record.values():
        for text in value if isinstance(value, list) else [value]:
            assert not re.search(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|/Users/|/private/tmp/|\b(?:whatsapp|notion|painbc|private member notes|source notes)\b|sources/', text, re.I)

with (root / 'data/organizations.csv').open(newline='') as file:
    reader = csv.DictReader(file)
    columns = reader.fieldnames
    rows = list(reader)
by_id = {record['id']: record for record in organizations}
assert len(rows) == 900 and {row['id'] for row in rows} == set(by_id)
for row in rows:
    for field in columns:
        value = by_id[row['id']].get(field, '')
        assert row[field] == ('|'.join(value) if isinstance(value, list) else str(value))

with (root / 'organization-crosswalk.csv').open(newline='') as file:
    mappings = list(csv.DictReader(file))
assert len(mappings) == len({row['compassId'] for row in mappings}) == 43
assert sum(row['relationship'] == 'same-entity' for row in mappings) == 36
assert sum(row['relationship'] == 'broader-record-coverage' for row in mappings) == 7
for row in mappings:
    record = by_id[row['canonicalId']]
    assert row['canonicalName'] == record['name']
    assert row['canonicalProfileUrl'] == 'https://kk-portal.vercel.app' + record['profileUrl']

with (root / 'pilot-review-candidates.csv').open(newline='') as file:
    pilot = list(csv.DictReader(file))
assert len(pilot) == len({row['compassId'] for row in pilot}) == 10
assert all(row['status'] == 'candidate-requires-current-source-and-identity-review' for row in pilot)
for path in root.rglob('*'):
    assert path.name not in {'people.csv', 'bc-ai-directory.json', '.env', '.git'}
    if path.is_file() and path.suffix in {'.md', '.json', '.csv'}:
        assert '/directory/people.csv' not in path.read_text()
        assert '/bc-ai-directory/people/' not in path.read_text()
print('PASS: 900 screened organizations, exact hashes and CSV parity, 43 mappings, ten pending candidates; no individual records or download links.')
