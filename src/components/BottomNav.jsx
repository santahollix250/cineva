// src/components/BottomNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaFire,
  FaFilm,
  FaTv,
  FaLanguage,
  FaGlobe,
} from 'react-icons/fa';

/* ═══════════════════════════════════════════════════════════
   Correct mapping:
   Home        → "/"           (homepage with hero + sections)
   Latest      → "/movies"     (latest content)
   Movies      → "/category"   (movies grouped by category)
   TV Series   → "/series"     (series/season pages)
   Translators → "/translator"
   Nation      → "/nation"
═══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: 'home',        label: 'Home',        icon: FaHome,      path: '/' },
  { id: 'latest',      label: 'Latest',      icon: FaFire,      path: '/movies' },
  { id: 'category',      label: 'category',      icon: FaFilm,      path: '/category' },
  { id: 'series',      label: 'TV Series',   icon: FaTv,        path: '/series' },
  { id: 'translators', label: 'Translators', icon: FaLanguage,  path: '/translator' },
  { id: 'nation',      label: 'Nation',      icon: FaGlobe,     path: '/nation' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  /* Highlight the item that matches the current route */
  const isActive = (item) => {
    const path = location.pathname;
    if (item.id === 'home')        return path === '/';
    if (item.id === 'latest')      return path === '/movies';
    if (item.id === 'movies')      return path === '/category';
    if (item.id === 'series')      return path === '/series' ||
                                          path.startsWith('/series-player');
    if (item.id === 'translators') return path === '/translator';
    if (item.id === 'nation')      return path === '/nation';
    return false;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-black/95 backdrop-blur-xl
                 border-t border-emerald-900/50
                 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-7xl mx-auto px-1 sm:px-4">
        {/* 6 items — evenly spaced */}
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex-1 h-full flex flex-col items-center justify-center gap-0.5
                           transition-all duration-200 group"
                aria-label={item.label}
              >
                {/* Active glow */}
                {active && (
                  <motion.span
                    layoutId="bottomnav-active-glow"
                    className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full
                               bg-gradient-to-br from-emerald-500/30 to-teal-500/20 blur-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <span
                  className={`relative z-10 flex items-center justify-center
                              transition-all duration-300
                              ${active ? 'scale-110' : 'group-hover:scale-105'}`}
                >
                  <Icon
                    className={`transition-colors duration-200 text-[16px] sm:text-[18px]
                                ${active
                                  ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]'
                                  : 'text-gray-500 group-hover:text-gray-300'
                                }`}
                  />
                </span>

                {/* Label — smaller font so 6 items fit */}
                <span
                  className={`relative z-10 text-[9px] sm:text-[10px] font-semibold tracking-wide
                              transition-colors duration-200
                              ${active
                                ? 'text-emerald-400'
                                : 'text-gray-500 group-hover:text-gray-300'
                              }`}
                >
                  {item.label}
                </span>

                {/* Active underline dot */}
                {active && (
                  <motion.span
                    layoutId="bottomnav-active-dot"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2
                               w-1 h-1 rounded-full bg-emerald-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}