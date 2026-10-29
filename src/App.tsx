import { useCallback, useEffect, useMemo, useState } from 'react';
import Nav from './components/Nav';
import Marquee from './components/Marquee';
import Hero from './sections/Hero';
import AskTheMap from './sections/AskTheMap';
import Onramps from './sections/Onramps';
import ActionPlanner from './sections/ActionPlanner';
import EcosystemMap from './sections/EcosystemMap';
import Directory from './sections/Directory';
import Shortlist from './components/Shortlist';
import Pathways from './sections/Pathways';
import Playbooks from './sections/Playbooks';
import Regions from './sections/Regions';
import Mission from './sections/Mission';
import Contribute from './sections/Contribute';
import Footer from './sections/Footer';
import type { Preset } from './data/preset';
import { useShortlist } from './hooks/useShortlist';

export default function App() {
  const [preset, setPreset] = useState<Preset>(null);
  const clearPreset = useCallback(() => setPreset(null), []);
  const shortlist = useShortlist();
  const savedIds = useMemo(() => new Set(shortlist.ids), [shortlist.ids]);

  useEffect(() => {
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fired = true;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    document.querySelectorAll('.reveal').forEach((element) => io.observe(element));
    const timeout = setTimeout(() => {
      if (!fired) document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
    }, 2000);
    return () => {
      io.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (window.location.search.includes('flat=1')) document.documentElement.classList.add('flat');
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) setTimeout(() => element.scrollIntoView({ behavior: 'instant' as ScrollBehavior }), 300);
    }
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--ink)]">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Nav savedCount={shortlist.count} />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Marquee />
        <AskTheMap savedIds={savedIds} onToggle={shortlist.toggle} />
        <Onramps onPreset={setPreset} />
        <ActionPlanner savedIds={savedIds} onToggle={shortlist.toggle} onPreset={setPreset} />
        <EcosystemMap preset={preset} onClearPreset={clearPreset} />
        <Directory preset={preset} onClearPreset={clearPreset} savedIds={savedIds} onToggle={shortlist.toggle} />
        <Shortlist shortlist={shortlist} />
        <Pathways onPreset={setPreset} />
        <Playbooks />
        <Regions />
        <Mission />
        <Contribute />
      </main>
      <Footer />
    </div>
  );
}
