import { useEffect, useState } from 'react';

const LINKS = [
  { n: '01', label: 'THE MAP', href: '#map' },
  { n: '02', label: 'THE DIRECTORY', href: '#directory' },
  { n: '03', label: 'THE REGIONS', href: '#regions' },
  { n: '04', label: 'THE METHOD', href: '#method' },
  { n: '05', label: 'CONTRIBUTE', href: '#contribute' },
];

export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Read the initial theme lazily, at first render, rather than in an effect.
  // The inline bootstrap in index.html stamps data-theme on <html> before React
  // mounts, so the value is already there — and syncing it in an effect would
  // cause a cascading render for no reason.
  const [theme, setTheme] = useState<string>(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('bcac-theme', next);
    } catch {
      /* private mode — the in-memory toggle still works for this session */
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={`site-nav fixed top-0 left-0 right-0 z-[1000] ${hidden && !open ? 'nav-hidden' : ''}`}>
        <div
          className={`mx-auto flex items-center justify-between px-5 md:px-10 py-4 transition-all duration-500 ${
            scrolled || open ? 'nav-scrolled' : ''
          }`}
        >
          <a href="#top" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
            <span className="block w-2.5 h-2.5 bg-[var(--brand)] group-hover:rotate-45 transition-transform duration-300" />
            <span className="font-display text-lg md:text-xl tracking-wide uppercase">BC AI Compass</span>
          </a>

          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono2 text-[10.5px] tracking-[0.16em] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contribute"
              className="font-mono2 text-[10.5px] tracking-[0.16em] bg-[var(--ink)] text-[var(--bg)] px-4 py-2 hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] transition-colors"
            >
              Send a source ↗
            </a>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Light' : 'Dark'}
            >
              {theme === 'dark' ? 'LIGHT ◐' : 'DARK ◑'}
            </button>
          </nav>

          <button
            className="md:hidden font-mono2 text-[11px] tracking-[0.18em] bg-[var(--ink)] text-[var(--bg)] px-3 py-2"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? 'CLOSE ✕' : 'MENU ☰'}
          </button>
        </div>
      </header>

      {/* full-screen mobile menu */}
      <div
        className={`fixed inset-0 z-[990] bg-[var(--bg)] flex flex-col justify-between px-5 pt-24 pb-8 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 py-3.5 border-t border-[var(--line)] last:border-b group"
            >
              <span className="font-mono2 text-[11px] text-[var(--accent)]">{l.n}</span>
              <span className="font-display uppercase text-3xl tracking-wide group-hover:text-[var(--accent)] transition-colors">
                {l.label}
              </span>
            </a>
          ))}
        </nav>
        <div>
          <div className="font-mono2 text-[9.5px] tracking-[0.2em] text-[var(--ink-faint)] uppercase mb-3">
            Open data
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="./ecosystem.json"
              className="font-mono2 text-[10px] tracking-[0.14em] text-[var(--ink-soft)] border border-[var(--line)] px-3 py-2.5"
            >
              ecosystem.json ↓
            </a>
            <a
              href="#contribute"
              onClick={() => setOpen(false)}
              className="font-mono2 text-[10px] tracking-[0.14em] bg-[var(--ink)] text-[var(--bg)] px-3 py-2.5"
            >
              Send a source ↗
            </a>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? 'LIGHT ◐' : 'DARK ◑'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
