import { useEffect, useState } from 'react';

const LINKS = [
  { n: '01', label: 'ASK THE MAP', href: '#ask', short: 'ASK' },
  { n: '02', label: 'ACTION PLAN', href: '#planner', short: 'PLAN' },
  { n: '03', label: 'REGIONAL ATLAS', href: '#regions', short: 'ATLAS' },
  { n: '04', label: 'THE MAP', href: '#map', short: 'MAP' },
  { n: '05', label: 'THE DIRECTORY', href: '#directory', short: 'DIRECTORY' },
  { n: '06', label: 'COMPARE', href: '#shortlist', short: 'COMPARE' },
  { n: '07', label: 'PLAYBOOKS', href: '#playbooks', short: 'PLAYBOOKS' },
  { n: '08', label: 'THE METHOD', href: '#method', short: 'METHOD' },
  { n: '09', label: 'CONTRIBUTE', href: '#contribute', short: 'CONTRIBUTE' },
];

const DESKTOP_LINKS = LINKS.filter((link) => ['#ask', '#planner', '#regions', '#map', '#directory', '#playbooks', '#method'].includes(link.href));

export default function Nav({ savedCount }: { savedCount: number }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => document.documentElement.getAttribute('data-theme') || 'light');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('bcac-theme', next);
    } catch {
      // The in-memory theme still works when storage is unavailable.
    }
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > lastY && y > 300) setHidden(true);
      else setHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className={`site-nav fixed top-0 left-0 right-0 z-[1000] ${hidden && !open ? 'nav-hidden' : ''}`}>
        <div className={`mx-auto flex items-center justify-between px-5 md:px-8 py-4 transition-all duration-300 ${scrolled || open ? 'nav-scrolled' : ''}`}>
          <a href="#top" className="flex items-center gap-3 group shrink-0" onClick={() => setOpen(false)}>
            <span className="block w-2.5 h-2.5 bg-[var(--brand)] group-hover:rotate-45 transition-transform duration-200" />
            <span className="font-display text-lg md:text-xl tracking-wide uppercase">BC AI Compass</span>
          </a>

          <nav className="hidden lg:flex items-center gap-4" aria-label="Primary">
            {DESKTOP_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="font-mono2 text-[9.5px] tracking-[0.1em] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
                {link.short}
              </a>
            ))}
            <a href="#shortlist" className="min-h-11 inline-flex items-center font-mono2 text-[9.5px] tracking-[0.1em] border border-[var(--line-strong)] px-3 text-[var(--ink)] hover:border-[var(--brand)] transition-colors" aria-label={`Open shortlist, ${savedCount} saved`}>
              SAVED <span className="ml-2 text-[var(--accent)]">{savedCount}</span>
            </a>
            <button onClick={toggleTheme} className="theme-toggle" aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title={theme === 'dark' ? 'Light' : 'Dark'}>
              {theme === 'dark' ? 'LIGHT ◐' : 'DARK ◑'}
            </button>
          </nav>

          <button
            className="lg:hidden min-h-11 font-mono2 text-[11px] tracking-[0.18em] bg-[var(--ink)] text-[var(--bg)] px-4 py-2"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? 'CLOSE ✕' : 'MENU ☰'}
          </button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        inert={!open}
        className={`fixed inset-0 z-[990] bg-[var(--bg)] overflow-y-auto px-5 pt-24 pb-8 transition-opacity duration-200 lg:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-2.5 border-t border-[var(--line)] last:border-b group">
              <span className="font-mono2 text-[10px] text-[var(--accent)]">{link.n}</span>
              <span className="font-display uppercase text-2xl tracking-wide group-hover:text-[var(--accent)] transition-colors">{link.label}</span>
              {link.href === '#shortlist' && <span className="ml-auto font-mono2 text-[11px] text-[var(--ink-soft)]">{savedCount}</span>}
            </a>
          ))}
        </nav>
        <div className="mt-8">
          <div className="font-mono2 text-[9.5px] tracking-[0.2em] text-[var(--ink-faint)] uppercase mb-3">Open data</div>
          <div className="flex flex-wrap gap-2">
            <a href="./ecosystem.json" className="font-mono2 text-[10px] tracking-[0.14em] text-[var(--ink-soft)] border border-[var(--line)] px-3 py-2.5">ecosystem.json ↓</a>
            <a href="#contribute" onClick={() => setOpen(false)} className="font-mono2 text-[10px] tracking-[0.14em] bg-[var(--ink)] text-[var(--bg)] px-3 py-2.5">Send a source ↗</a>
            <button onClick={toggleTheme} className="theme-toggle" aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              {theme === 'dark' ? 'LIGHT ◐' : 'DARK ◑'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
