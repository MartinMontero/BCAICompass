// Places, not buzzwords. The point of the marquee here is that this is a
// province, and the reader can see the province go past.
const PLACES = [
  'VANCOUVER',
  'KAMLOOPS',
  'VICTORIA',
  'BURNABY',
  'MERRITT',
  'SURREY',
  'KELOWNA',
  'COMOX VALLEY',
  'PRINCE GEORGE',
  'FRASER VALLEY',
  'NANAIMO',
  'FORT ST. JOHN',
];

export default function Marquee() {
  const row = [...PLACES, ...PLACES];
  return (
    <div className="bg-[var(--brand)] text-[var(--brand-ink)] overflow-hidden border-y border-[var(--line-strong)] py-2.5 select-none">
      <div className="marquee-track" aria-hidden="true">
        {row.map((p, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="font-display uppercase text-lg md:text-xl tracking-[0.06em] px-5">{p}</span>
            <span className="block w-1.5 h-1.5 bg-[var(--brand-ink)] rotate-45 opacity-70" />
          </span>
        ))}
      </div>
      <span className="sr-only">
        Regions and communities represented in this dataset: {PLACES.join(', ')}.
      </span>
    </div>
  );
}
