import { useEffect } from 'react';
import Nav from './components/Nav';
import Marquee from './components/Marquee';
import Hero from './sections/Hero';
import EcosystemMap from './sections/EcosystemMap';
import Directory from './sections/Directory';
import Regions from './sections/Regions';
import Mission from './sections/Mission';
import Contribute from './sections/Contribute';
import Footer from './sections/Footer';

export default function App() {
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
        <EcosystemMap />
        <Directory />
        <Regions />
        <Mission />
        <Contribute />
      </main>
      <Footer />
    </div>
  );
}
