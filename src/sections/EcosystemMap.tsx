import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
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
import type { Preset } from '../data/preset';

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

/**
 * Two pin styles, because the dataset holds two kinds of coordinate.
 *
 * A filled dot is an 'address' pin: the source states a street address or a named
 * feature and the dot is that place. A hollow ring is a 'centroid' pin: the
 * coordinate is a municipal centroid from a gazetteer, so the dot is the city and
 * not the site. Drawing both the same way would assert a precision the dataset
 * does not have for most of its pins, with nothing on screen to tell them apart.
 *
 * The category colour carries over to the ring, so filtering still reads normally.
 */
function makeDot(color: string, active: boolean, precision: Organization['geoPrecision']) {
  const centroid = precision !== 'address';
  const cls = `bcac-marker${active ? ' is-active' : ''}${centroid ? ' is-centroid' : ''}`;
  // Centroid pins take the colour on the border; address pins take it as fill.
  const style = centroid ? `border-color:${color}` : `background:${color}`;
  return L.divIcon({
    className: 'bcac-marker-wrap',
    html: `<span class="${cls}" style="${style}"></span>`,
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
  });
}

/**
 * Cluster markers.
 *
 * `showCount` is false while a pathway is being traced. The count is correct — it
 * is how many records fall in that grid cell — but next to a stop list numbered
 * 001 to 007 a circled "4" reads as a stop number, and as a stop number it is both
 * wrong and out of order. During a trace the marker therefore carries no digit and
 * the numbered list is the single source of ordering. Route position was the other
 * option and was rejected: a cluster can hold two stops that are far apart in the
 * route, so any one number on it would be a lie about the other.
 *
 * Outside a trace the count is unambiguous and stays exactly as it was.
 */
function makeCluster(count: number, showCount: boolean) {
  const size = count < 10 ? 30 : count < 25 ? 36 : count < 60 ? 44 : 52;
  const inner = showCount ? String(count) : '';
  const cls = showCount ? 'bcac-cluster' : 'bcac-cluster is-untallied';
  return L.divIcon({
    className: 'bcac-cluster-wrap',
    html: `<span class="${cls}" style="width:${size}px;height:${size}px">${inner}</span>`,
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
/**
 * Flies the map to the selected organization. Restored from builderworkshop's
 * AssetMap (FlyTo), which this build dropped. One deliberate change from the
 * reference: zoom 13 instead of 16, because these pins are municipal centroids
 * from a gazetteer, not street addresses — zoom 16 on a centroid lands on an
 * arbitrary downtown block and looks like a wrong pin.
 */
function FlyTo({ target }: { target: Organization | null }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.lat !== undefined && target.lng !== undefined) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 13), { duration: 1.1 });
    }
  }, [target, map]);
  return null;
}

function Clusters({
  items,
  selected,
  onOpen,
  onOpenGroup,
  tracing,
}: {
  items: Organization[];
  selected: Organization | null;
  /** Open the detail card for one record. */
  onOpen: (o: Organization) => void;
  /** Open the member list for records sharing one point. */
  onOpenGroup: (group: Organization[]) => void;
  /** True while a pathway preset is active. Suppresses cluster counts. */
  tracing: boolean;
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

  // The earlier design opened popups through per-marker refs, retried on every
  // pan and zoom. It could never work for most of this dataset: records sharing
  // one municipal centroid never de-cluster at ANY zoom, so their individual
  // markers never exist and their refs never fill. builderworkshop never met
  // this because every venue there has its own street address. The detail card
  // is now a controlled popup owned by the map component, opened at the
  // record's coordinate directly — no marker required.

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
              icon={makeDot(CATEGORY_COLORS[o.category], selected?.id === o.id, o.geoPrecision)}
              eventHandlers={{ click: () => onOpen(o) }}
            />
          );
        }

        const lat = group.reduce((s, o) => s + (o.lat as number), 0) / group.length;
        const lng = group.reduce((s, o) => s + (o.lng as number), 0) / group.length;
        const key = group.map((o) => o.id).join('|');
        return (
          <Marker
            key={key}
            position={[lat, lng]}
            icon={makeCluster(group.length, !tracing)}
            eventHandlers={{
              click: () => {
                const pts = group.map((o) => [o.lat as number, o.lng as number] as [number, number]);
                const bounds = L.latLngBounds(pts);
                const samePoint =
                  bounds.getNorth() === bounds.getSouth() && bounds.getEast() === bounds.getWest();
                // Records sharing one municipal centroid can never separate by
                // zooming — the old step-in-3-levels answer was a click that did
                // nothing visible. A same-point cluster now opens the member
                // list instead, and so does any cluster the zoom can no longer
                // split. Clusters that CAN separate still fly to their bounds.
                if (samePoint || map.getZoom() >= 16) {
                  onOpenGroup(group);
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
      {/* Said plainly, not as a warning. A city pin is a correct answer; it just
          is not the same answer as a building. */}
      {o.geoPrecision === 'centroid' && (
        <div className="font-mono2 text-[9.5px] text-[var(--ink-faint)] mt-1">
          This pin marks the city, not the site.
        </div>
      )}
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

/**
 * The member list for a cluster whose records share one coordinate. This is
 * the honest version of "spiderfying": rather than fanning invented offsets
 * around the shared point, the card says plainly that one municipal pin holds
 * several organizations and lets the reader pick one.
 */
function GroupBody({
  group,
  onPick,
}: {
  group: Organization[];
  onPick: (o: Organization) => void;
}) {
  const sorted = [...group].sort((a, b) => a.name.localeCompare(b.name));

  // React onClick cannot work in here. Leaflet stops event propagation at the
  // popup wrapper so map clicks don't fall through popups — and React's
  // synthetic events are delivered by that same bubble reaching the app root,
  // which it never does. The build, tsc and eslint all pass with onClick; the
  // buttons are simply dead in the browser. (The detail card's links survive
  // because an <a href> needs no handler.) So the picker is wired with a
  // NATIVE listener attached inside the wrapper, below Leaflet's stop. Same
  // failure family as pathOptions.className on the trail: declaratively
  // correct, silently inert, findable only by clicking the real thing.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef(group);
  const pickRef = useRef(onPick);
  useEffect(() => {
    groupRef.current = group;
    pickRef.current = onPick;
  }, [group, onPick]);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const hit = (e.target as HTMLElement).closest('button[data-org]');
      if (!hit) return;
      const o = groupRef.current.find((x) => x.id === hit.getAttribute('data-org'));
      if (o) pickRef.current(o);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, []);

  return (
    <div ref={rootRef}>
      <div className="font-mono2 text-[9px] tracking-[0.16em] uppercase text-[var(--ink-faint)] mb-1">
        {group.length} organizations · one pin
      </div>
      <div className="font-mono2 text-[9.5px] text-[var(--ink-faint)] mb-2">
        These records share a municipal coordinate. Pick one:
      </div>
      <div className="slim-scroll max-h-56 overflow-y-auto divide-y divide-[var(--line)]">
        {sorted.map((o) => (
          <button
            key={o.id}
            type="button"
            data-org={o.id}
            className="w-full text-left py-2 flex items-start gap-2 group"
          >
            <span
              className="mt-[5px] w-2 h-2 rounded-full shrink-0"
              style={{ background: CATEGORY_COLORS[o.category] }}
            />
            <span className="min-w-0">
              <span className="font-display uppercase text-[13px] tracking-wide block leading-tight group-hover:text-[var(--accent)] transition-colors">
                {o.name}
              </span>
              <span className="font-mono2 text-[9px] text-[var(--ink-faint)] block mt-0.5">
                {o.location}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EcosystemMap({
  preset,
  onClearPreset,
}: {
  preset: Preset;
  onClearPreset: () => void;
}) {
  const [cat, setCat] = useState<CatFilter>('All');
  const [reg, setReg] = useState<RegFilter>('All');
  const [selected, setSelected] = useState<Organization | null>(null);

  // The detail card and the shared-pin member list, as CONTROLLED popups owned
  // here and opened at a coordinate rather than through a marker. A marker-based
  // popup is unreachable for any record whose neighbours share its centroid —
  // which is most of Metro Vancouver — because identical coordinates never
  // de-cluster. At most one of these is non-null at a time. The nonce forces a
  // remount when the same record is clicked again after the reader closed the
  // popup with X or a map click, which Leaflet does without telling React.
  const [opened, setOpened] = useState<Organization | null>(null);
  const [openedGroup, setOpenedGroup] = useState<Organization[] | null>(null);
  const [openNonce, setOpenNonce] = useState(0);
  const openCard = useCallback((o: Organization) => {
    setOpenedGroup(null);
    setOpened(o);
    setSelected(o);
    setOpenNonce((n) => n + 1);
  }, []);
  const openGroup = useCallback((group: Organization[]) => {
    setOpened(null);
    setOpenedGroup(group);
    setOpenNonce((n) => n + 1);
  }, []);
  // Filters clear the whole selection surface: the flown-to record, the detail
  // card, and the member list. A card left open for a record a filter just
  // removed would show a thing the list no longer contains.
  const clearSelection = useCallback(() => {
    setSelected(null);
    setOpened(null);
    setOpenedGroup(null);
  }, []);

  // Region cards elsewhere on the page dispatch this to drive the map.
  useEffect(() => {
    const onRegion = (e: Event) => {
      setReg((e as CustomEvent<Region>).detail);
      setCat('All');
      clearSelection();
    };
    window.addEventListener('bcac:region', onRegion);
    return () => window.removeEventListener('bcac:region', onRegion);
  }, [clearSelection]);

  // Pathway stops dispatch this. It opens the record card through the same
  // openCard the list rows and markers use — one selection mechanism, several
  // ways to command it.
  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const target = ORGANIZATIONS.find((o) => o.id === id);
      if (target && target.lat !== undefined) openCard(target);
    };
    window.addEventListener('bcac:select', onSelect);
    return () => window.removeEventListener('bcac:select', onSelect);
  }, [openCard]);

  // An active preset takes over from the chips. Selecting any chip clears it
  // (see the chip handlers), so the two never compete for the same slice.
  const presetCats = useMemo(
    () => (preset?.kind === 'onramp' ? new Set<Category>(preset.categories) : null),
    [preset]
  );
  const presetStops = useMemo(
    () => (preset?.kind === 'pathway' ? preset.stops : null),
    [preset]
  );

  const filtered = useMemo(() => {
    // A pathway is an ordered route, so its stops are returned IN ROUTE ORDER
    // rather than in dataset order — the list beside the map then reads as the
    // itinerary it is, and the polyline below joins them in the same sequence.
    if (presetStops) {
      return presetStops
        .map((id) => MAPPED.find((o) => o.id === id))
        .filter((o): o is Organization => !!o);
    }
    return MAPPED.filter(
      (o) =>
        (presetCats ? presetCats.has(o.category) : cat === 'All' || o.category === cat) &&
        (reg === 'All' || o.region === reg)
    );
  }, [cat, reg, presetCats, presetStops]);

  /** Route line vertices, in stop order. Empty unless a pathway is being traced. */
  const trailPoints = useMemo(() => {
    if (!presetStops) return [] as [number, number][];
    return filtered
      .filter((o) => o.lat !== undefined && o.lng !== undefined)
      .map((o) => [o.lat as number, o.lng as number] as [number, number]);
  }, [presetStops, filtered]);

  /**
   * The trail's styling class, applied to the SVG path after commit.
   *
   * Not via pathOptions: browser checking showed the rendered path carrying only
   * Leaflet's own class and its default blue stroke, so the declarative prop was
   * not reaching the element in this react-leaflet version. Not via the ref
   * callback either — that fires when the layer instance is constructed, before
   * Leaflet has built the <path>, so getElement() is still undefined.
   *
   * By the time an effect runs, the layer is on the map and the element exists.
   * classList.add is idempotent, so re-running on every trail change is free.
   * The class carries the colour, which is why this matters: it is what lets the
   * stroke be var(--accent) and follow the theme toggle.
   */
  const trailRef = useRef<L.Polyline | null>(null);
  useEffect(() => {
    trailRef.current?.getElement()?.classList.add('bcac-trail');
  }, [trailPoints]);

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
            George. A filled dot is a street address the record's source states; a ring is a
            municipal centroid from the gazetteer named on the record — the city, not the site.
            {' '}{unmapped}{' '}
            {unmapped === 1 ? 'organization has' : 'organizations have'} a province-wide mandate and
            no single seat; they are in the directory below.
          </p>
        </div>

        {/* active preset — the one dismissible label, above the untouched filter rows */}
        {preset && (
          <div className="flex flex-wrap items-center gap-3 mb-4 reveal">
            <span className="font-mono2 text-[10.5px] tracking-[0.14em] uppercase bg-[var(--brand)] text-[var(--brand-ink)] px-3.5 py-2">
              {preset.kind === 'onramp'
                ? `Showing: ${preset.label} (${filtered.length})`
                : `Tracing: ${preset.name}`}
            </span>
            <button
              onClick={onClearPreset}
              className="font-mono2 text-[10.5px] tracking-[0.14em] uppercase text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
            >
              Clear
            </button>
          </div>
        )}

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
                  // Selecting a chip clears any preset: the visitor has taken
                  // manual control of the slice, so the onramp/pathway label goes.
                  onClearPreset();
                  setCat(c);
                  clearSelection();
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
                  onClearPreset();
                  setReg(r);
                  clearSelection();
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
                  onClick={() => openCard(o)}
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
                      onClearPreset();
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
              <span>
                {filtered.length} shown · hover a row to fly, click for the record · filled dot =
                address, ring = city centroid
              </span>
              {(cat !== 'All' || reg !== 'All' || preset) && (
                <button
                  onClick={() => {
                    onClearPreset();
                    setCat('All');
                    setReg('All');
                    clearSelection();
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
              <FlyTo target={selected} />
              {/*
                The route line. Colour and dash come from .bcac-trail in index.css
                so the stroke can be var(--accent) and follow the theme — a raw hex
                here would be the one place on the map that ignores the toggle.

                The class is also applied through the ref because pathOptions did
                NOT reach the rendered path: the element came back carrying only
                Leaflet's own class and its default blue stroke. Browser checking
                caught that; the declarative prop alone would have shipped a line
                in the wrong colour that no unit test would have noticed.

                A CSS declaration beats an SVG presentation attribute, so the
                stroke Leaflet writes inline is overridden rather than fought.
              */}
              {trailPoints.length > 1 && <Polyline ref={trailRef} positions={trailPoints} />}
              <Clusters
                items={filtered}
                selected={selected}
                onOpen={openCard}
                onOpenGroup={openGroup}
                tracing={presetStops !== null}
              />
              {/*
                autoPan stays off on both: FlyTo owns the camera, and a popup
                that pans against an in-flight flyTo judders. The nonce in each
                key remounts the popup when the same thing is opened twice in a
                row — Leaflet removes a closed popup without telling React, so
                without the nonce the second click would be a no-op.
              */}
              {opened && opened.lat !== undefined && opened.lng !== undefined && (
                <Popup
                  key={`card-${opened.id}-${openNonce}`}
                  position={[opened.lat, opened.lng]}
                  maxWidth={320}
                  autoPan={false}
                >
                  <PopupBody o={opened} />
                </Popup>
              )}
              {openedGroup && openedGroup.length > 0 && (
                <Popup
                  key={`group-${openedGroup[0].id}-${openNonce}`}
                  position={[openedGroup[0].lat as number, openedGroup[0].lng as number]}
                  maxWidth={300}
                  autoPan={false}
                >
                  <GroupBody group={openedGroup} onPick={openCard} />
                </Popup>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
