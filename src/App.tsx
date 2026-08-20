import { useCallback, useEffect, useState } from 'react';
import Nav from './components/Nav';
import Marquee from './components/Marquee';
import Hero from './sections/Hero';
import Onramps from './sections/Onramps';
import EcosystemMap from './sections/EcosystemMap';
import Directory from './sections/Directory';
import Pathways from './sections/Pathways';
import Regions from './sections/Regions';
import Mission from './sections/Mission';
import Contribute from './sections/Contribute';
import Footer from './sections/Footer';
import type { Preset } from './data/preset';

export default function App() {
  /**
   * The active onramp or pathway, shared by the map and the directory so the two
   * always show the same slice. One slot, so an onramp and a pathway cannot both
   * be active — setting either replaces the other with no bookkeeping.
   */
  const [preset, setPreset] = useState<Preset>(null);
  const clearPreset = useCallback(() => setPreset(null), []);

  useEffect(() => {
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            fired = true;
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    // Resilience: if the observer never fires (old engines, embedded webviews),
    // do not leave the content permanently hidden.
    const t = setTimeout(() => {
      if (!fired) document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }, 2000);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    // ?flat=1 disables the reveal animation — also a reduced-motion escape hatch.
    if (window.location.search.includes('flat=1')) document.documentElement.classList.add('flat');
    // Honour deep links like /#map once the app has mounted.
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'instant' as ScrollBehavior }), 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Onramps onPreset={setPreset} />
        <EcosystemMap preset={preset} onClearPreset={clearPreset} />
        <Directory preset={preset} onClearPreset={clearPreset} />
        <Pathways onPreset={setPreset} />
        <Regions />
        <Mission />
        <Contribute />
      </main>
      <Footer />
    </div>
  );
}
