import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  MAPPED,
  ORGANIZATIONS,
  ORG_TYPE_LABELS,
  REGIONS,
  type Category,
  type Organization,
  type Region,
} from '../data/organizations';

type CatFilter = 'All' | Category;
type RegFilter = 'All' | Region;

// British Columbia, corner to corner. Used only when the dataset has fewer than
// two mapped points, so the map is never centred on a hardcoded city.
const BC_BOUNDS: [[number, number], [number, number]] = [
  [48.2, -139.1],
  [60.0, -114.0],
];

// Pixel grid for clustering. A pixel grid, not a degree grid: cluster density
// then stays constant on screen at every zoom, which is the property that
// actually matters across BC's 12 degrees of latitude.
const GRID_PX = 56;

function makeDot(color: string, active: boolean) {
  return L.divIcon({
    className: 'bcac-marker-wrap',
    html: `<span class="bcac-marker${active ? ' is-active' : ''}" style="background:${color}"></span>`,
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
  });
}

function makeCluster(count: number) {
  const size = count < 10 ? 30 : count < 25 ? 36 : count < 60 ? 44 : 52;
  return L.divIcon({
    className: 'bcac-cluster-wrap',
    html: `<span class="bcac-cluster" style="width:${size}px;height:${size}px">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Fits the view to whatever is currently filtered in. No hardcoded centre. */
function FitToData({ items }: { items: Organization[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = items
      .filter((o) => o.lat !== undefined && o.lng !== undefined)
      .map((o) => [o.lat as number, o.lng as number] as [number, number]);
    if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts), { padding: [56, 56] });
    } else if (pts.length === 1) {
      map.setView(pts[0], 10);
    } else {
      map.fitBounds(L.latLngBounds(BC_BOUNDS), { padding: [24, 24] });
    }
  }, [items, map]);
  return null;
}

/**
 * Grid clustering. Recomputed on every pan and zoom; one marker per occupied
 * cell. A cell holding one record renders its category dot, a cell holding more
 * renders a count that flies to that group's bounds on click.
 *
 * Hand-rolled rather than pulling in leaflet.markercluster and its React
 * wrapper: this dataset is a few hundred points in one province, the wrapper's
 * peer range against React 19 / react-leaflet 5 is a build risk the project's
 * hardest gate cannot afford, and the dependency surface is a stated project
 * value. See research/PLAN.md section 3.1.
 */
function Clusters({
  items,
  selected,
  onSelect,
}: {
  items: Organization[];
  selected: Organization | null;
  onSelect: (o: Organization) => void;
}) {
  const map = useMap();

  // Clustering depends on the projection, which changes on every pan and zoom.
  // Bumping this counter from the map's own event callbacks re-renders the
  // component; the grouping below is then a plain computation performed during
  // render. That is deliberate: memoising it would require declaring the
  // projection as a dependency, and the projection is not a value React can see.
  // At a few hundred points the recomputation is trivial and always correct.
  const [, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);
  useMapEvents({ moveend: bump, zoomend: bump, resize: bump });

  const cells = new Map<string, Organization[]>();
  for (const o of items) {
    if (o.lat === undefined || o.lng === undefined) continue;
    const p = map.latLngToContainerPoint([o.lat, o.lng]);
    const key = `${Math.floor(p.x / GRID_PX)}:${Math.floor(p.y / GRID_PX)}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(o);
    else cells.set(key, [o]);
  }
  const groups = [...cells.values()];

  return (
    <>
      {groups.map((group) => {
        if (group.length === 1) {
          const o = group[0];
          return (
            <Marker
              key={o.id}
              position={[o.lat as number, o.lng as number]}
              icon={makeDot(CATEGORY_COLORS[o.category], selected?.id === o.id)}
              eventHandlers={{ click: () => onSelect(o) }}
            >
              <Popup>
                <PopupBody o={o} />
              </Popup>
            </Marker>
          );
        }

        const lat = group.reduce((s, o) => s + (o.lat as number), 0) / group.length;
        const lng = group.reduce((s, o) => s + (o.lng as number), 0) / group.length;
        const key = group.map((o) => o.id).join('|');
        return (
          <Marker
            key={key}
            position={[lat, lng]}
            icon={makeCluster(group.length)}
            eventHandlers={{
              click: () => {
                const pts = group.map((o) => [o.lat as number, o.lng as number] as [number, number]);
                const bounds = L.latLngBounds(pts);
                // Points sharing one municipal centroid produce a zero-area
                // bounds; step in a fixed amount instead of jumping to max zoom.
                if (bounds.getNorth() === bounds.getSouth() && bounds.getEast() === bounds.getWest()) {
                  map.setView([lat, lng], Math.min(map.getZoom() + 3, 13));
                } else {
                  map.flyToBounds(bounds, { padding: [48, 48], duration: 0.9 });
                }
              },
            }}
          />
        );
      })}
    </>
  );
}

function PopupBody({ o }: { o: Organization }) {
  return (
    <div>
      <div
        className="font-mono2 text-[9px] tracking-[0.16em] uppercase mb-1.5"
        style={{ color: CATEGORY_COLORS[o.category] }}
      >
        {o.category}
      </div>
      <div className="font-display uppercase text-lg tracking-wide leading-tight">{o.name}</div>
      <div className="font-mono2 text-[10px] text-[var(--ink-faint)] mt-1.5">
        {o.location} · {ORG_TYPE_LABELS[o.orgType]}
      </div>
      {o.description && (
        <p className="text-[12.5px] leading-relaxed text-[var(--ink-soft)] mt-2">{o.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={o.url}
          target="_blank"
          rel="noreferrer"
          className="font-mono2 text-[10.5px] tracking-[0.14em] text-[var(--accent)] hover:text-[var(--ink)]"
        >
          Website ↗
        </a>
        <a
          href={o.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="stamp hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
          title={`Verified against ${o.sourceUrl} on ${o.sourceDate}`}
        >
          verified {o.verified} ↗
        </a>
      </div>
    </div>
  );
}

export default function EcosystemMap() {
  const [cat, setCat] = useState<CatFilter>('All');
  const [reg, setReg] = useState<RegFilter>('All');
  const [selected, setSelected] = useState<Organization | null>(null);

  // Region cards elsewhere on the page dispatch this to drive the map.
  useEffect(() => {
    const onRegion = (e: Event) => {
      setReg((e as CustomEvent<Region>).detail);
      setCat('All');
      setSelected(null);
    };
    window.addEventListener('bcac:region', onRegion);
    return () => window.removeEventListener('bcac:region', onRegion);
  }, []);

  const filtered = useMemo(
    () =>
      MAPPED.filter(
        (o) => (cat === 'All' || o.category === cat) && (reg === 'All' || o.region === reg)
      ),
    [cat, reg]
  );

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { All: MAPPED.length };
    for (const k of CATEGORIES) c[k] = MAPPED.filter((o) => o.category === k).length;
    return c;
  }, []);

  const regCounts = useMemo(() => {
    const c: Record<string, number> = { All: MAPPED.length };
    for (const k of REGIONS) c[k] = MAPPED.filter((o) => o.region === k).length;
    return c;
  }, []);

  // Counts across the WHOLE dataset, not just mapped records. Used to tell
  // "has records but none with coordinates" apart from "nobody has looked here".
  const allRegionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const k of REGIONS) c[k] = ORGANIZATIONS.filter((o) => o.region === k).length;
    return c;
  }, []);

  const unmapped = ORGANIZATIONS.length - MAPPED.length;
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <section id="map" className="relative bg-[var(--bg-raise)] py-20 md:py-28">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10 reveal">
          <div>
            <div className="eyebrow mb-4">THE MAP</div>
            <h2 className="font-display uppercase text-5xl md:text-7xl leading-[0.95]">
              The whole
              <br />
              province.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            {MAPPED.length} verified organizations with sourced locations, from Victoria to Prince
            George. Pins are municipal, not street-level — the city comes from the record's source,
            the coordinates from the gazetteer named on the record. {unmapped}{' '}
            {unmapped === 1 ? 'organization has' : 'organizations have'} a province-wide mandate and
            no single seat; they are in the directory below.
          </p>
        </div>

        {/* category filters */}
        <div className="flex flex-wrap gap-2 mb-3 reveal">
          {/*
            Zero-count categories are rendered, disabled, reading "not yet surveyed"
            rather than hidden. Hiding them would quietly assert the category is empty
            when in fact nobody has searched it.
          */}
          {(['All', ...CATEGORIES] as CatFilter[]).map((c) => {
            const active = cat === c;
            const n = catCounts[c] ?? 0;
            const empty = c !== 'All' && n === 0;
            const color = c === 'All' ? 'var(--ink)' : CATEGORY_COLORS[c as Category];
            return (
              <button
                key={c}
                onClick={() => {
                  if (empty) return;
                  setCat(c);
                  setSelected(null);
                }}
                disabled={empty}
                title={empty ? 'Not yet surveyed — nobody has searched this category to a conclusion' : undefined}
                className={`font-mono2 text-[10.5px] tracking-[0.12em] uppercase px-3.5 py-2 border transition-all duration-300 ${
                  empty
                    ? 'border-dashed border-[var(--line)] text-[var(--ink-faint)] cursor-not-allowed'
                    : active
                      ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]'
                      : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                  style={{ background: active && !empty ? 'var(--bg)' : color, opacity: empty ? 0.4 : 1 }}
                />
                {c}{' '}
                <span className="opacity-60">{empty ? '(not yet surveyed)' : `(${n})`}</span>
              </button>
            );
          })}
        </div>

        {/* region filters — the row that replaced the reference's equipment filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6 reveal">
          <span className="font-mono2 text-[9.5px] tracking-[0.2em] text-[var(--ink-faint)] uppercase mr-1">
            Region:
          </span>
          {/*
            Every region is rendered. A region with no record ANYWHERE in the dataset
            is disabled and reads "not yet surveyed"; a region that has records but
            none with coordinates shows (0) and stays clickable, because those records
            exist and are in the directory. Hiding either would let the map assert
            emptiness nobody has established.
          */}
          {(['All', ...REGIONS] as RegFilter[]).map((r) => {
            const active = reg === r;
            const mapped = regCounts[r] ?? 0;
            const surveyed = r === 'All' || (allRegionCounts[r] ?? 0) > 0;
            return (
              <button
                key={r}
                onClick={() => {
                  if (!surveyed) return;
                  setReg(r);
                  setSelected(null);
                }}
                disabled={!surveyed}
                title={!surveyed ? 'Not yet surveyed — nobody has searched this region to a conclusion' : undefined}
                className={`font-mono2 text-[9.5px] tracking-[0.1em] uppercase px-3 py-1.5 border transition-all duration-300 ${
                  !surveyed
                    ? 'border-dashed border-[var(--line)] text-[var(--ink-faint)] cursor-not-allowed'
                    : active
                      ? 'bg-[var(--brand)] text-[var(--brand-ink)] border-[var(--brand)]'
                      : 'border-[var(--line)] text-[var(--ink-faint)] hover:border-[var(--brand)] hover:text-[var(--accent)]'
                }`}
              >
                {r}{' '}
                <span className="opacity-60">{surveyed ? `(${mapped})` : '(not yet surveyed)'}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-4 reveal">
          {/* list */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div
              ref={listRef}
              className="slim-scroll border border-[var(--line)] lg:h-[72vh] lg:overflow-y-auto divide-y divide-[var(--line)]"
            >
              {filtered.map((o, i) => (
                <button
                  key={o.id}
                  onClick={() => setSelected(o)}
                  onMouseEnter={() => setSelected(o)}
                  className={`map-row w-full text-left px-4 py-3.5 border-l-2 border-transparent flex items-start gap-3.5 ${
                    selected?.id === o.id ? 'is-active' : ''
                  }`}
                >
                  <span className="font-mono2 text-[10px] text-[var(--ink-faint)] pt-1.5 shrink-0">
                    {String(i + 1).padStart(3, '0')}
                  </span>
                  <span
                    className="mt-[7px] w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: CATEGORY_COLORS[o.category] }}
                  />
                  <span className="min-w-0">
                    <span className="font-display uppercase text-base tracking-wide block leading-tight">
                      {o.name}
                    </span>
                    <span className="font-mono2 text-[10px] tracking-[0.06em] text-[var(--ink-faint)] block mt-1">
                      {o.location}
                    </span>
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-8">
                  <p className="font-mono2 text-[11px] tracking-[0.05em] text-[var(--ink-soft)] leading-relaxed">
                    Nothing verified matches that combination yet. Loosen a filter — or this is a real
                    gap in the dataset, and we would rather show you the gap than fill it with a guess.
                  </p>
                  <button
                    onClick={() => {
                      setCat('All');
                      setReg('All');
                    }}
                    className="mt-4 font-mono2 text-[10px] tracking-[0.14em] border border-[var(--accent)] text-[var(--accent)] px-4 py-2 hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] transition-colors"
                  >
                    Clear both filters
                  </button>
                </div>
              )}
            </div>
            <div className="font-mono2 text-[10px] tracking-[0.08em] text-[var(--ink-faint)] mt-3 px-1 flex items-center justify-between gap-3">
              <span>{filtered.length} shown · click a count to zoom in</span>
              {(cat !== 'All' || reg !== 'All') && (
                <button
                  onClick={() => {
                    setCat('All');
                    setReg('All');
                    setSelected(null);
                  }}
                  className="font-mono2 text-[10px] tracking-[0.14em] text-[var(--accent)] hover:text-[var(--ink)] transition-colors shrink-0"
                >
                  Reset ✕
                </button>
              )}
            </div>
          </div>

          {/* map */}
          <div
            className="lg:col-span-8 order-1 lg:order-2 border border-[var(--line)] relative"
            role="region"
            aria-label="Interactive map of verified British Columbia AI organizations, on OpenStreetMap"
          >
            <MapContainer
              bounds={L.latLngBounds(BC_BOUNDS)}
              className="h-[52vh] lg:h-[72vh] w-full"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              <FitToData items={filtered} />
              <Clusters items={filtered} selected={selected} onSelect={setSelected} />
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
