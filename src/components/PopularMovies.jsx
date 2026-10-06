// src/components/PopularMovies.jsx
import { useContext, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MoviesContext } from "../context/MoviesContext";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";
import NewsTicker from "../components/NewsTicker";
import { getTranslatorsWithProfiles } from "../lib/translators";
import {
  FaSearch,
  FaFilter,
  FaFire,
  FaStar,
  FaTimes,
  FaChevronRight,
  FaPlay,
  FaChevronDown,
  FaFilm,
  FaTv,
  FaSortAmountDown,
  FaSortAmountUp,
  FaHeart,
  FaBolt,
  FaMagic,
  FaSpinner,
  FaUpload,
  FaPlusCircle,
  FaLanguage,
  FaSkull,
  FaLaugh,
  FaHeart as FaHeartIcon,
  FaRocket,
  FaMask,
  FaGlobe,
  FaBabyCarriage,
  FaGhost,
  FaSpaceShuttle,
  FaBrain,
  FaTree,
  FaMusic,
  FaFootballBall,
  FaGavel,
  FaUser,
  FaCamera,
  FaTheaterMasks
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
  🎨 "Emerald C Play" logo — matches the navbar
═══════════════════════════════════════════════════════════ */
const EmeraldCPlayLogo = ({ size = 110 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="spBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="55%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="spArc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="45%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
      <linearGradient id="spPlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <radialGradient id="spGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#spBg)" />
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#spGlow)" />
    <rect x="2" y="2" width="60" height="60" rx="16" fill="none" stroke="url(#spArc)" strokeWidth="1.5" opacity="0.7" />
    {[
      { x: 12, y: 32 }, { x: 15, y: 20 }, { x: 22, y: 12 }, { x: 32, y: 8 },
      { x: 42, y: 12 }, { x: 49, y: 20 }, { x: 52, y: 32 }, { x: 49, y: 44 },
      { x: 42, y: 52 }, { x: 32, y: 56 }, { x: 22, y: 52 }, { x: 15, y: 44 },
    ].map((d, i) => (
      <circle key={i} cx={d.x} cy={d.y} r="1.2" fill="url(#spArc)" opacity={i % 2 === 0 ? 0.9 : 0.55} />
    ))}
    <path d="M 44 20 A 16 16 0 1 0 44 44" stroke="url(#spArc)" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M 42 20 A 16 16 0 0 0 26 15" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
    <path d="M 26 24 L 40 32 L 26 40 Z" fill="url(#spPlay)" stroke="#065f46" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M 28 27 L 28 37 L 35 32 Z" fill="#ecfdf5" opacity="0.35" />
    <circle cx="20" cy="18" r="1" fill="#a7f3d0" opacity="0.9" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
  🎬 Cinematic splash
═══════════════════════════════════════════════════════════ */
const CinematicLoading = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing CINEVA...");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const steps = [
      { text: "Initializing CINEVA...", duration: 700 },
      { text: "Loading content library...", duration: 900 },
      { text: "Preparing your experience...", duration: 800 },
      { text: "Almost ready...", duration: 500 },
      { text: "Welcome!", duration: 400 },
    ];

    let currentStep = 0;
    let timerId;

    const tick = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setLoadingText(step.text);
        const total = steps.reduce((sum, s) => sum + s.duration, 0);
        const elapsed = steps.slice(0, currentStep + 1).reduce((sum, s) => sum + s.duration, 0);
        setProgress(Math.min(99, (elapsed / total) * 100));
        currentStep++;
        if (currentStep === steps.length) {
          setTimeout(() => {
            setProgress(100);
            setLoadingText("Ready to stream!");
          }, 400);
        } else {
          timerId = setTimeout(tick, step.duration);
        }
      }
    };

    timerId = setTimeout(tick, steps[0].duration);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#060d0a] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a2218_0%,_#060d0a_45%,_#000_100%)]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[520px] h-[520px] bg-emerald-500/15 rounded-full blur-[120px] animate-pulse-slow" />
      </div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[380px] h-[380px] bg-teal-500/10 rounded-full blur-[120px] animate-blob" />
      <div className="absolute top-[-15%] left-[-10%] w-[380px] h-[380px] bg-cyan-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          animation: "grain 8s steps(10) infinite",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />

      <div className="relative z-10 text-center px-6 w-full max-w-md">
        <div
          className={`relative mx-auto mb-8 flex items-center justify-center transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="absolute w-[180px] h-[180px] rounded-full border border-emerald-500/20" />
          <div
            className="absolute w-[180px] h-[180px] rounded-full border-t-2 border-emerald-400 animate-spin"
            style={{ animationDuration: "3s" }}
          />
          <div className="absolute w-[140px] h-[140px] rounded-full border border-teal-500/20" />
          <div
            className="absolute w-[140px] h-[140px] rounded-full border-b-2 border-teal-400 animate-spin-reverse"
            style={{ animationDuration: "2.5s" }}
          />
          <div className="absolute w-[140px] h-[140px] bg-emerald-500/40 rounded-full blur-3xl animate-pulse-slow" />
          <div className="relative drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]">
            <EmeraldCPlayLogo size={110} />
          </div>
          <div className="absolute w-[180px] h-[180px] animate-orbit">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          </div>
        </div>

        <div
          className={`transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-5xl sm:text-6xl font-black tracking-[0.22em] leading-none">
            <span
              className="bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
              style={{ textShadow: "0 0 30px rgba(52,211,153,0.5), 0 0 60px rgba(20,184,166,0.25)" }}
            >
              CINEVA
            </span>
          </h1>
          <p
            className="mt-3 text-[10px] sm:text-xs font-semibold tracking-[0.35em] uppercase bg-gradient-to-r from-emerald-500/80 via-teal-400/80 to-emerald-500/80 bg-clip-text text-transparent animate-pulse-slow"
            style={{ textShadow: "0 0 12px rgba(16,185,129,0.4), 0 1px 2px rgba(0,0,0,0.9)" }}
          >
            Premium Streaming
          </p>
        </div>

        <div
          className={`mt-6 mb-6 mx-auto h-px max-w-[220px] transition-all duration-1000 delay-400 ${
            mounted ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
          style={{ background: "linear-gradient(90deg, transparent, #10b981 40%, #14b8a6 60%, transparent)" }}
        />

        <div
          className={`transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-sm text-emerald-200/90 font-medium mb-3 h-5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {loadingText}
          </p>

          <div className="w-full max-w-[320px] mx-auto">
            <div className="relative h-1 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-900/60">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/25 blur-sm" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-mono">
              <span className="text-emerald-700/80 tracking-widest">LOADING</span>
              <span className="text-emerald-400 font-bold tracking-widest">{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>

        <div
          className={`mt-8 grid grid-cols-3 gap-2 max-w-[340px] mx-auto transition-all duration-1000 delay-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            { label: "4K HDR", sub: "Ultra HD" },
            { label: "No Ads", sub: "Pure cinema" },
            { label: "Offline", sub: "Download" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl py-2.5 px-2 bg-emerald-950/40 border border-emerald-900/50 backdrop-blur-sm">
              <div className="text-[11px] font-bold text-emerald-300 tracking-wide">{f.label}</div>
              <div className="text-[9px] text-gray-500 mt-0.5 tracking-wider uppercase">{f.sub}</div>
            </div>
          ))}
        </div>

        <div
          className={`mt-10 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-emerald-700/70 transition-all duration-1000 delay-1000 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          CINEVA • {new Date().getFullYear()}
        </div>
      </div>

      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-2%, 0); }
          40% { transform: translate(2%, 2%); }
          50% { transform: translate(-1%, 2%); }
          60% { transform: translate(2%, -1%); }
          70% { transform: translate(-2%, 1%); }
          80% { transform: translate(2%, -1%); }
          90% { transform: translate(-1%, -2%); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.94); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-blob { animation: blob 9s ease-in-out infinite; }
        .animate-spin-reverse { animation: spin-reverse 2.5s linear infinite; }
        .animate-orbit { animation: orbit 8s linear infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
  Main Movies component
═══════════════════════════════════════════════════════════ */
export default function Movies() {
  const {
    movies = [],
    episodes = [],
    loading = false,
    globalSearchQuery
  } = useContext(MoviesContext);

  const location = useLocation();
  const navigate = useNavigate();
  const isNavigating = useRef(false);

  const [displayCount, setDisplayCount] = useState(24);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';

  useEffect(() => {
    if (globalSearchQuery && location.pathname === '/movies') {
      navigate(`/search?search=${encodeURIComponent(globalSearchQuery)}`);
    }
  }, [globalSearchQuery, location.pathname, navigate]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewMovie, setQuickViewMovie] = useState(null);

  const [translators, setTranslators] = useState([]);
  const [translatorsLoading, setTranslatorsLoading] = useState(true);

  const getEpisodesForSeries = useCallback((seriesId) => {
    return episodes.filter(ep => ep.seriesId === seriesId);
  }, [episodes]);

  const sortEpisodes = useCallback((episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    return [...episodesArray].sort((a, b) => {
      const seasonA = parseInt(a.seasonNumber) || parseInt(a.season_number) || 1;
      const seasonB = parseInt(b.seasonNumber) || parseInt(b.season_number) || 1;
      const episodeA = parseInt(a.episodeNumber) || parseInt(a.episode_number) || 1;
      const episodeB = parseInt(b.episodeNumber) || parseInt(b.episode_number) || 1;
      if (seasonA !== seasonB) return seasonA - seasonB;
      return episodeA - episodeB;
    });
  }, []);

  const getMovieParts = useCallback((movie) => {
    if (!movie) return [];
    if (movie.parts && Array.isArray(movie.parts)) return movie.parts;
    if (movie.download) {
      try {
        const parsed = typeof movie.download === 'string' ? JSON.parse(movie.download) : movie.download;
        if (Array.isArray(parsed)) return parsed;
        else if (parsed && parsed.parts && Array.isArray(parsed.parts)) return parsed.parts;
      } catch (e) { /* not JSON */ }
    }
    return [];
  }, []);

  const getOptimizedImageUrl = useCallback((url, isBackground = true, forMobile = false) => {
    if (!url) return null;
    if (window.innerWidth <= 768 || forMobile) {
      if (isBackground) {
        if (url.includes('tmdb.org') || url.includes('themoviedb')) {
          return url.replace(/w[0-9]+/, 'original');
        }
        if (url.includes('cloudinary.com')) {
          return url.includes('?')
            ? `${url}&q_auto:best&c_fill&g_auto&w=${window.innerWidth}&h=${window.innerHeight * 0.8}`
            : `${url}?q_auto:best&c_fill&g_auto&w=${window.innerWidth}&h=${window.innerHeight * 0.8}`;
        }
      }
      if (url.includes('tmdb.org') || url.includes('themoviedb')) {
        return url.replace(/w[0-9]+/, 'w780');
      }
      if (url.includes('cloudinary.com')) {
        return url.includes('?') ? `${url}&q_auto:good&c_fill&w=400` : `${url}?q_auto:good&c_fill&w=400`;
      }
    }
    if (isBackground && window.innerWidth > 1024) {
      if (url.includes('tmdb.org') || url.includes('themoviedb')) {
        return url.replace(/w[0-9]+/, 'original');
      }
      if (url.includes('cloudinary.com')) {
        return url.includes('?') ? `${url}&q_auto:best&c_fill&g_auto` : `${url}?q_auto:best&c_fill&g_auto`;
      }
    }
    return url;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setTranslatorsLoading(true);
      try {
        const list = await getTranslatorsWithProfiles(movies);
        if (!cancelled) setTranslators((list || []).filter(t => t.total > 0));
      } catch (e) {
        console.error('Failed to load translators:', e);
        if (!cancelled) setTranslators([]);
      } finally {
        if (!cancelled) setTranslatorsLoading(false);
      }
    };
    if (movies.length > 0) load();
    else setTranslatorsLoading(false);
    return () => { cancelled = true; };
  }, [movies]);

  // ===== HERO CONTENT =====
  const heroContent = useMemo(() => {
    const latestMovies = movies
      .filter(item => item?.type === "movie")
      .map(movie => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        background: movie.background || movie.poster,
        poster: movie.poster,
        type: 'movie',
        rating: movie.rating,
        year: movie.year,
        translator: movie.translator || '',
        videoUrl: movie.videoUrl,
        download: movie.download,
        category: movie.category,
        nation: movie.nation,
        created_at: movie.created_at || new Date().toISOString()
      }))
      .sort((a, b) => {
        const dateA = a?.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b?.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });

    const seriesWithEpisodes = movies
      .filter(item => item?.type === "series")
      .map(series => {
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);
        if (seriesEpisodes.length === 0) {
          return {
            id: series.id,
            title: series.title,
            description: series.description,
            background: series.background || series.poster,
            poster: series.poster,
            type: 'series',
            rating: series.rating,
            year: series.year,
            translator: series.translator || '',
            category: series.category,
            nation: series.nation,
            totalSeasons: series.totalSeasons || 0,
            created_at: series.created_at || new Date().toISOString()
          };
        }
        const latestEpisode = seriesEpisodes.sort((a, b) => {
          const dateA = a?.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b?.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA;
        })[0];

        const uniqueSeasons = new Set(seriesEpisodes.map(ep => parseInt(ep.seasonNumber) || 1));
        const computedTotalSeasons = series.totalSeasons || uniqueSeasons.size;

        return {
          id: series.id,
          title: series.title,
          description: series.description,
          background: series.background || series.poster,
          poster: series.poster,
          type: 'series',
          rating: series.rating,
          year: series.year,
          translator: series.translator || '',
          category: series.category,
          nation: series.nation,
          totalSeasons: computedTotalSeasons,
          latestEpisode: {
            id: latestEpisode.id,
            title: latestEpisode.title,
            seasonNumber: latestEpisode.seasonNumber,
            episodeNumber: latestEpisode.episodeNumber,
            description: latestEpisode.description || series.description,
            videoUrl: latestEpisode.videoUrl,
            duration: latestEpisode.duration,
            created_at: latestEpisode.created_at
          },
          hasNewEpisode: true,
          episodeCount: seriesEpisodes.length,
          lastUpdated: latestEpisode.created_at,
          created_at: latestEpisode.created_at || series.created_at || new Date().toISOString()
        };
      });

    return [...latestMovies, ...seriesWithEpisodes]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  }, [movies, episodes]);

  const heroLatestCards = useMemo(() => {
    const allContent = [
      ...movies.filter(m => m?.type === "movie"),
      ...movies.filter(m => m?.type === "series")
    ];
    return allContent
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 3)
      .map(item => ({
        ...item,
        id: item.id || item._id,
        title: item.title || item.name,
        description: item.description || item.overview,
        poster: item.poster || item.poster_path,
        background: item.background || item.backdrop_path || item.poster,
        type: item.type || (item.first_air_date ? 'series' : 'movie'),
        rating: item.rating || (item.vote_average ? item.vote_average.toFixed(1) : null),
        translator: item.translator || '',
        category: item.category || item.genre || '',
        year: item.year || (item.release_date || item.first_air_date || '').split('-')[0],
        totalSeasons: item.totalSeasons || 0,
        created_at: item.created_at || item.uploaded_at
      }));
  }, [movies]);

  const latestSeriesOnly = useMemo(() => {
    return movies
      .filter(item => item?.type === "series")
      .map(series => {
        const seriesEpisodes = episodes.filter(ep => ep.seriesId === series.id);
        if (seriesEpisodes.length === 0) return null;
        const latestEpisode = seriesEpisodes.sort((a, b) =>
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )[0];
        return { ...series, latestEpisode, episodeCount: seriesEpisodes.length, lastUpdated: latestEpisode.created_at };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 12);
  }, [movies, episodes]);

  const latestMoviesOnly = useMemo(() => {
    return movies
      .filter(movie => movie?.type === "movie")
      .map(movie => ({
        ...movie,
        uploadType: 'movie',
        displayDate: movie?.created_at || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
      .slice(0, 16);
  }, [movies]);

  const dynamicCategories = useMemo(() => {
    const categoryMap = new Map();
    movies.forEach(movie => {
      if (movie?.type === "movie" && movie?.category) {
        const categories = movie.category.split(',').map(cat => cat.trim().toLowerCase());
        categories.forEach(cat => {
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, {
              id: cat,
              name: cat.charAt(0).toUpperCase() + cat.slice(1),
              count: 0,
              movies: []
            });
          }
          categoryMap.get(cat).count++;
          categoryMap.get(cat).movies.push(movie);
        });
      }
    });
    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [movies]);

  // ⭐ Unified site theme — all categories use emerald/teal/cyan
  const getCategoryIconAndColor = (categoryName) => {
    const categoryLower = categoryName.toLowerCase();

    // Each category keeps its own ICON for distinction,
    // but every one uses the site's emerald/teal/cyan palette.
    const iconMap = {
      action: <FaBolt />,
      horror: <FaSkull />,
      comedy: <FaLaugh />,
      drama: <FaTheaterMasks />,
      romance: <FaHeartIcon />,
      scifi: <FaRocket />,
      "sci-fi": <FaRocket />,
      fantasy: <FaMagic />,
      thriller: <FaMask />,
      cartoon: <FaBabyCarriage />,
      animation: <FaBabyCarriage />,
      adventure: <FaGlobe />,
      mystery: <FaGhost />,
      crime: <FaGavel />,
      documentary: <FaCamera />,
      music: <FaMusic />,
      sport: <FaFootballBall />,
      science: <FaBrain />,
      space: <FaSpaceShuttle />,
      nature: <FaTree />,
      history: <FaFilm />,
      war: <FaMask />,
      western: <FaGlobe />,
      family: <FaHeartIcon />,
      biography: <FaUser />,
      musical: <FaMusic />,
    };

    const icon = iconMap[categoryLower] || <FaFilm />;

    return {
      icon: <span className="text-emerald-400">{icon}</span>,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-900/20",
      borderColor: "border-emerald-500/30",
    };
  };

  const getMoviesByCategory = useCallback((categoryName) => {
    return movies
      .filter(movie => movie?.type === "movie" &&
        movie?.category?.toLowerCase().split(',').map(c => c.trim()).includes(categoryName.toLowerCase()))
      .sort((a, b) => (parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0))
      .slice(0, 12);
  }, [movies]);

  const handleMovieClick = useCallback((movie) => {
    if (!movie || !movie.id || isNavigating.current) return;
    isNavigating.current = true;
    const parts = getMovieParts(movie);
    const movieToPlay = {
      ...movie,
      parts,
      hasParts: parts.length > 0,
      videoUrl: movie.videoUrl || (parts.length > 0 ? parts[0]?.videoUrl : null),
      streamLink: movie.streamLink || (parts.length > 0 ? parts[0]?.streamLink || parts[0]?.videoUrl : null),
      download_link: movie.download_link || movie.download,
      download: movie.download
    };
    navigate(`/player/${movie.id}`, { state: { movie: movieToPlay } });
    setTimeout(() => { isNavigating.current = false; }, 1000);
  }, [navigate, getMovieParts]);

  const handleSeriesClick = useCallback((series) => {
    if (!series || !series.id || isNavigating.current) return;
    isNavigating.current = true;
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const targetEpisode = sortedEpisodes.length > 0 ? sortedEpisodes[0] : null;
    if (targetEpisode) {
      navigate(`/series-player/${series.id}`, {
        state: { series, episode: targetEpisode, episodes: sortedEpisodes, episodeIndex: 0 }
      });
    } else {
      alert('No episodes available for this series yet.');
      isNavigating.current = false;
    }
    setTimeout(() => { isNavigating.current = false; }, 1000);
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  const handleSeriesClickWithEpisode = useCallback((series, episode) => {
    if (!series || !series.id || !episode || isNavigating.current) return;
    isNavigating.current = true;
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const episodeIndex = sortedEpisodes.findIndex(ep => ep && ep.id === episode.id);
    navigate(`/series-player/${series.id}`, {
      state: { series, episode, episodes: sortedEpisodes, episodeIndex: episodeIndex >= 0 ? episodeIndex : 0 }
    });
    setTimeout(() => { isNavigating.current = false; }, 1000);
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  const handleUpdatedSeriesClick = useCallback((series) => {
    if (!series || !series.id || isNavigating.current) return;
    isNavigating.current = true;
    const allSeriesEpisodes = getEpisodesForSeries(series.id);
    const sortedEpisodes = sortEpisodes(allSeriesEpisodes);
    const latestEpisode = sortedEpisodes.length > 0 ? sortedEpisodes[sortedEpisodes.length - 1] : null;
    if (latestEpisode) {
      const episodeIndex = sortedEpisodes.findIndex(ep => ep && ep.id === latestEpisode.id);
      navigate(`/series-player/${series.id}`, {
        state: { series, episode: latestEpisode, episodes: sortedEpisodes, episodeIndex }
      });
    } else {
      alert('No episodes available for this series yet.');
      isNavigating.current = false;
    }
    setTimeout(() => { isNavigating.current = false; }, 1000);
  }, [navigate, getEpisodesForSeries, sortEpisodes]);

  const handleHeroPlayClick = useCallback((item, event) => {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    if (isNavigating.current) return;
    if (!item || !item.id) return;

    const isSeriesWithNew = !!item?.latestEpisode;
    const isSeries = item?.type === "series";

    setTimeout(() => {
      if (isSeriesWithNew) handleSeriesClickWithEpisode(item, item.latestEpisode);
      else if (isSeries) handleSeriesClick(item);
      else handleMovieClick(item);
      setTimeout(() => { isNavigating.current = false; }, 500);
    }, 50);
  }, [handleSeriesClickWithEpisode, handleSeriesClick, handleMovieClick]);

  const handleHeroInfoClick = useCallback((item, event) => {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    if (!item) return;
    setQuickViewMovie(item);
    setShowQuickView(true);
  }, []);

  const handleHeroCardClick = useCallback((movie) => {
    if (!movie) return;
    if (movie.type === 'series') handleSeriesClick(movie);
    else handleMovieClick(movie);
  }, [handleMovieClick, handleSeriesClick]);

  const handleTranslatorClick = useCallback((translator) => {
    navigate('/translator', { state: { openTranslator: translator.name } });
  }, [navigate]);

  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie => movie?.type === "movie");

    if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "featured") {
      filtered = filtered.filter(movie =>
        movie?.category?.toLowerCase().split(',').map(c => c.trim()).includes(selectedCategory.toLowerCase())
      );
    }
    if (selectedCategory === "featured") {
      filtered = filtered.filter(movie => movie?.background || (movie?.rating && parseFloat(movie.rating) >= 8));
    }

    filtered.sort((a, b) => {
      const order = sortOrder === "desc" ? -1 : 1;
      switch (sortBy) {
        case "rating":
          return ((parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0)) * order;
        case "year":
          return ((parseInt(b?.year) || 0) - (parseInt(a?.year) || 0)) * order;
        case "title":
          return (a?.title || '').localeCompare(b?.title || '') * (sortOrder === "desc" ? 1 : -1);
        default:
          const ratingDiff = ((parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0)) * order;
          return ratingDiff !== 0 ? ratingDiff : ((b?.id || 0) - (a?.id || 0)) * order;
      }
    });

    return filtered;
  }, [movies, selectedCategory, sortBy, sortOrder]);

  const displayedMovies = useMemo(() => {
    return filteredMovies.slice(0, displayCount);
  }, [filteredMovies, displayCount]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return;
    if (displayCount >= filteredMovies.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 24, filteredMovies.length));
      setIsLoadingMore(false);
    }, 400);
  }, [displayCount, filteredMovies.length, isLoadingMore]);

  useEffect(() => {
    setDisplayCount(24);
  }, [selectedCategory, sortBy, sortOrder]);

  const featuredMovies = useMemo(() => {
    return movies
      .filter(movie => movie?.type === "movie" && (movie?.background || (movie?.rating && parseFloat(movie.rating) >= 8.5)))
      .sort((a, b) => (parseFloat(b?.rating) || 0) - (parseFloat(a?.rating) || 0))
      .slice(0, 12);
  }, [movies]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return date.toLocaleDateString();
    } catch (e) { return 'Recently'; }
  }, []);

  useEffect(() => {
    return () => { isNavigating.current = false; };
  }, []);

  if (loading) return <CinematicLoading />;
  if (globalSearchQuery) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#060d0a] via-black to-[#060d0a] pt-20">
      {/* Hero Slider */}
      {heroContent.length > 0 && (
        <HeroSlider
          items={heroContent}
          onPlay={handleHeroPlayClick}
          onInfo={handleHeroInfoClick}
          latestCards={heroLatestCards}
          onCardClick={handleHeroCardClick}
        />
      )}

      {/* ═══════════ LATEST SERIES ═══════════ */}
      {latestSeriesOnly.length > 0 && (
        <section className="container mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaTv className="text-emerald-400 text-sm sm:text-base" />
              <span>Latest Series</span>
            </h2>
            <span className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/40 px-2 py-1 rounded-full">
              {latestSeriesOnly.length}
            </span>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-5">
            {latestSeriesOnly.map(series => (
              <MovieCard key={series?.id} movie={series} onSeriesClick={handleUpdatedSeriesClick} />
            ))}
          </div>

          <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {latestSeriesOnly.map(series => (
              <div key={series?.id} className="flex-none w-[150px]">
                <MovieCard movie={series} onSeriesClick={handleUpdatedSeriesClick} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ LATEST MOVIES ═══════════ */}
      {latestMoviesOnly.length > 0 && (
        <section className="container mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaFilm className="text-emerald-400 text-sm sm:text-base" />
              <span>Latest Movies</span>
            </h2>
            <span className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/40 px-2 py-1 rounded-full">
              {latestMoviesOnly.length}
            </span>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-5">
            {latestMoviesOnly.map(movie => (
              <MovieCard key={movie?.id} movie={movie} />
            ))}
          </div>

          <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {latestMoviesOnly.map(movie => (
              <div key={movie?.id} className="flex-none w-[150px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ TRANSLATORS ═══════════ */}
      {!translatorsLoading && translators.length > 0 && (
        <section className="container mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaLanguage className="text-emerald-400 text-sm sm:text-base" />
              <span>Our Translators</span>
            </h2>
            <button onClick={() => navigate('/translator')} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
              View All <FaChevronRight className="text-[8px]" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {translators.map((t) => (
              <button key={t.name} onClick={() => handleTranslatorClick(t)}
                className="group flex-shrink-0 flex flex-col items-center text-center bg-gradient-to-br from-[#0a1614] to-[#060d0a] rounded-2xl border border-emerald-900/40 p-4 w-[130px] sm:w-[150px] hover:border-emerald-500/60 hover:scale-105 transition-all duration-300"
                title={`${t.total} translation${t.total === 1 ? '' : 's'}`}
              >
                <div className="relative mb-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur-md opacity-0 group-hover:opacity-70 transition-opacity" />
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-emerald-500/40 group-hover:border-emerald-400/80 transition-colors bg-[#060d0a]">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.display_name || t.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-800">
                        <FaUser className="text-3xl" />
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-white text-xs font-semibold line-clamp-1 group-hover:text-emerald-400 transition-colors w-full">
                  {t.display_name || t.name}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] border border-emerald-500/30">
                    <FaFilm className="text-[8px]" />
                    {t.total}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ DYNAMIC CATEGORIES (unified theme) ═══════════ */}
      {dynamicCategories.map((category) => {
        const categoryMovies = getMoviesByCategory(category.id);
        if (categoryMovies.length === 0) return null;
        const { icon, color, bgColor, borderColor } = getCategoryIconAndColor(category.id);

        return (
          <section key={category.id} className="container mx-auto px-4 py-8 sm:py-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center border ${borderColor}`}>
                  {icon}
                </div>
                <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  {category.name}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full ml-2">
                  {categoryMovies.length}
                </span>
              </div>
              <button onClick={() => setSelectedCategory(category.id)} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                View All <FaChevronRight className="text-[8px]" />
              </button>
            </div>

            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-5">
              {categoryMovies.slice(0, 12).map(movie => (
                <MovieCard key={movie?.id} movie={movie} />
              ))}
            </div>

            <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {categoryMovies.slice(0, 8).map(movie => (
                <div key={movie?.id} className="flex-none w-[150px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* ═══════════ FEATURED MOVIES ═══════════ */}
      {selectedCategory === "all" && featuredMovies.length > 0 && (
        <section className="container mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FaFire className="text-emerald-400 text-sm sm:text-base" />
              <span>Featured Movies</span>
            </h2>
          </div>

          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-5">
            {featuredMovies.slice(0, 12).map(movie => (
              <MovieCard key={movie?.id} movie={movie} />
            ))}
          </div>

          <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {featuredMovies.slice(0, 8).map(movie => (
              <div key={movie?.id} className="flex-none w-[150px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ FILTER BAR ═══════════ */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-[#0a1614]/80 rounded-xl border border-emerald-900/40 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-900/40 text-white text-sm transition-colors">
              <FaFilter className={showFilters ? 'text-emerald-400' : ''} /> Filters
            </button>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-emerald-950/60 border border-emerald-900/40 text-white text-sm focus:outline-none focus:border-emerald-500">
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
            </select>

            <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-900/40 text-white transition-colors">
              {sortOrder === "desc" ? <FaSortAmountDown className="text-sm" /> : <FaSortAmountUp className="text-sm" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
              <label className="block text-xs font-medium text-emerald-300/80 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${selectedCategory === "all" ? 'bg-emerald-500 text-black font-bold' : 'bg-emerald-950/60 text-gray-300 hover:bg-emerald-900/40'}`}>
                  All
                </button>
                <button onClick={() => setSelectedCategory("featured")}
                  className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${selectedCategory === "featured" ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold' : 'bg-emerald-950/60 text-gray-300 hover:bg-emerald-900/40'}`}>
                  <FaFire className="text-[10px]" /> Featured
                </button>
                {dynamicCategories.map(cat => {
                  const { icon: catIcon } = getCategoryIconAndColor(cat.id);
                  return (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${selectedCategory === cat.id ? 'bg-emerald-500 text-black font-bold' : 'bg-emerald-950/60 text-gray-300 hover:bg-emerald-900/40'}`}>
                      {catIcon}
                      <span className="capitalize">{cat.name}</span>
                      <span className="text-[10px] opacity-70">{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ ALL MOVIES ═══════════ */}
      <section className="container mx-auto px-4 pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <FaFilm className="text-black text-sm" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              All Movies
            </h2>
          </div>
          <span className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/40 px-3 py-1 rounded-full">
            {filteredMovies.length}
          </span>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === "all" ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold shadow-lg shadow-emerald-500/40' : 'bg-emerald-950/40 border border-emerald-900/40 text-gray-300 hover:bg-emerald-900/40'}`}>
            All
          </button>
          <button onClick={() => setSelectedCategory("featured")}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-all duration-300 ${selectedCategory === "featured" ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-lg shadow-amber-500/40' : 'bg-emerald-950/40 border border-emerald-900/40 text-gray-300 hover:bg-emerald-900/40'}`}>
            <FaFire className="text-xs" /> Featured
          </button>
          {dynamicCategories.slice(0, 12).map(category => {
            const { icon: catIcon, color } = getCategoryIconAndColor(category.id);
            return (
              <button key={category.id} onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap transition-all duration-300 ${selectedCategory === category.id ? `bg-gradient-to-r ${color} text-black font-bold shadow-lg shadow-emerald-500/40` : 'bg-emerald-950/40 border border-emerald-900/40 text-gray-300 hover:bg-emerald-900/40'}`}>
                {catIcon}
                <span className="capitalize">{category.name}</span>
              </button>
            );
          })}
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-16 bg-emerald-950/20 rounded-xl border border-emerald-900/30">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-lg font-bold text-white mb-2">No movies found</h3>
            <p className="text-sm text-gray-400 mb-4">Try different category or filter</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-4 md:gap-5 lg:gap-6">
              {displayedMovies.map(movie => (
                <MovieCard key={movie?.id} movie={movie} />
              ))}
            </div>

            {displayCount < filteredMovies.length ? (
              <div className="flex flex-col items-center justify-center mt-12 gap-3">
                <p className="text-xs text-emerald-300/70">
                  Showing <span className="text-emerald-400 font-bold">{displayCount}</span> of <span className="text-emerald-400 font-bold">{filteredMovies.length}</span> movies
                </p>
                <button onClick={handleLoadMore} disabled={isLoadingMore}
                  className="group relative px-10 py-3.5 rounded-full font-bold text-sm sm:text-base text-black
                            bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500
                            hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600
                            shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60
                            transform hover:scale-105 active:scale-95
                            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                            transition-all duration-300 flex items-center gap-2">
                  {isLoadingMore ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Loading…</span>
                    </>
                  ) : (
                    <>
                      <FaChevronDown className="text-sm group-hover:translate-y-0.5 transition-transform" />
                      <span>Load More Movies</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-950/40 border border-emerald-900/40 rounded-full">
                  <span className="text-emerald-400">✨</span>
                  <p className="text-xs text-emerald-300/80">You've reached the end — {filteredMovies.length} movies</p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <NewsTicker />

      {/* Quick View Modal */}
      {showQuickView && quickViewMovie && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowQuickView(false)}>
          <div className="w-full md:max-w-2xl bg-[#0a1614] rounded-t-2xl md:rounded-2xl border border-emerald-900/40 shadow-2xl shadow-emerald-950/50" onClick={e => e.stopPropagation()}>
            <div className="relative h-32 md:h-56">
              <img src={getOptimizedImageUrl(quickViewMovie?.background || quickViewMovie?.poster, true, window.innerWidth <= 768)}
                alt={quickViewMovie?.title} className="w-full h-full object-cover object-center"
                onError={(e) => { if (e.target.src !== quickViewMovie?.poster && quickViewMovie?.poster) e.target.src = quickViewMovie.poster; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1614] via-transparent to-transparent" />
              <button onClick={() => setShowQuickView(false)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-emerald-900/60 transition-all duration-300 border border-emerald-900/40">
                <FaTimes className="text-white text-xs sm:text-sm" />
              </button>
              {quickViewMovie.latestEpisode && (
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full">Latest</span>
                  <span className="px-2 py-1 bg-teal-500 text-black text-xs font-bold rounded-full">
                    S{quickViewMovie.latestEpisode.seasonNumber}:E{quickViewMovie.latestEpisode.episodeNumber}
                  </span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-base sm:text-xl font-bold text-white mb-1">{quickViewMovie?.title}</h2>
              {quickViewMovie.latestEpisode && (
                <h3 className="text-sm text-emerald-400 mb-1 line-clamp-1">{quickViewMovie.latestEpisode.title}</h3>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
                {quickViewMovie?.rating && (<span className="flex items-center gap-1"><FaStar className="text-amber-400 text-xs" /> {quickViewMovie.rating}</span>)}
                {quickViewMovie?.year && <span>{quickViewMovie.year}</span>}
                {quickViewMovie.lastUpdated && (<span className="text-emerald-400">{formatDate(quickViewMovie.lastUpdated)}</span>)}
                {quickViewMovie.episodeCount && (<span className="text-teal-400">{quickViewMovie.episodeCount} eps</span>)}
              </div>
              <p className="text-xs text-gray-300 mb-4 line-clamp-2 sm:line-clamp-3">
                {quickViewMovie.latestEpisode?.description || quickViewMovie?.description}
              </p>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (quickViewMovie.latestEpisode) handleSeriesClickWithEpisode(quickViewMovie, quickViewMovie.latestEpisode);
                  else if (quickViewMovie.type === "series") handleUpdatedSeriesClick(quickViewMovie);
                  else handleMovieClick(quickViewMovie);
                  setShowQuickView(false);
                }} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-2 rounded-lg text-black text-sm font-bold flex items-center justify-center gap-1 transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-500/40">
                  <FaPlay className="text-xs" /> {quickViewMovie.latestEpisode ? 'Watch Latest' : 'Watch'}
                </button>
                <button onClick={() => setShowQuickView(false)} className="flex-1 bg-emerald-950/60 border border-emerald-900/40 py-2 rounded-lg text-white text-sm font-semibold hover:bg-emerald-900/40 transition-all duration-300">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}