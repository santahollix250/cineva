import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlay,
    FaInfoCircle,
    FaTv,
    FaStar,
    FaPlusCircle,
    FaChevronLeft,
    FaChevronRight,
    FaLanguage,
    FaFilm,
    FaFire,
    FaBolt
} from 'react-icons/fa';
import HeroCard from './HeroCard';

/* ------------------------------------------------------------------
   Smart image optimizer
------------------------------------------------------------------- */
const useSmartHeroImage = (backgroundUrl, posterUrl, isMobile) => {
    const [optimizedUrl, setOptimizedUrl] = useState(backgroundUrl || posterUrl);
    const [isLoading, setIsLoading] = useState(true);
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        if (!backgroundUrl && !posterUrl) {
            setIsLoading(false);
            return;
        }

        let primaryImage = isMobile ? (posterUrl || backgroundUrl) : (backgroundUrl || posterUrl);
        let fallbackImage = isMobile ? (backgroundUrl || posterUrl) : (posterUrl || backgroundUrl);
        let url = primaryImage || fallbackImage;

        if (url) {
            if (url.includes('tmdb.org') || url.includes('themoviedb')) {
                url = url.replace(/w[0-9]+/, isMobile ? 'w780' : 'original');
            }
            if (url.includes('cloudinary.com')) {
                const suffix = isMobile
                    ? 'c_fill,g_auto,q_auto:best,w=780,h=1200'
                    : 'c_fill,g_auto,q_auto:best,w=1920,h=1080';
                url = url.includes('?') ? `${url}&${suffix}` : `${url}?${suffix}`;
            }
        }

        const img = new Image();
        img.onload = () => {
            setOptimizedUrl(url);
            setIsLoading(false);
        };
        img.onerror = () => {
            if (primaryImage !== fallbackImage && fallbackImage && !useFallback) {
                setUseFallback(true);
            } else {
                setOptimizedUrl(fallbackImage || url);
                setIsLoading(false);
            }
        };
        img.src = url;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [backgroundUrl, posterUrl, isMobile, useFallback]);

    return { optimizedUrl, isLoading };
};

/* ------------------------------------------------------------------
   Smart Headline — Midnight Emerald palette
------------------------------------------------------------------- */
const getHeroHeadline = (item) => {
    if (!item) {
        return {
            text: 'Featured',
            icon: FaFire,
            color: 'from-emerald-400 to-teal-400',
        };
    }

    const isSeries = item?.type === 'series' || !!item?.latestEpisode;
    const hasNewEpisode = !!item?.latestEpisode;
    const totalSeasons = parseInt(item?.totalSeasons) || 0;

    if (isSeries) {
        if (hasNewEpisode && (totalSeasons === 0 || totalSeasons >= 2)) {
            return {
                text: 'Hot Season',
                icon: FaFire,
                color: 'from-emerald-400 via-teal-400 to-cyan-400',
            };
        }
        if (totalSeasons === 1 && !hasNewEpisode) {
            return {
                text: 'New Season',
                icon: FaBolt,
                color: 'from-emerald-400 to-teal-400',
            };
        }
        if (totalSeasons >= 2 && !hasNewEpisode) {
            return {
                text: 'Trending Series',
                icon: FaFire,
                color: 'from-teal-400 via-emerald-400 to-emerald-500',
            };
        }
        return {
            text: 'Featured Series',
            icon: FaFire,
            color: 'from-emerald-400 to-teal-400',
        };
    }

    return {
        text: 'Top Movie',
        icon: FaStar,
        color: 'from-amber-400 via-yellow-400 to-amber-500',
    };
};

/* ------------------------------------------------------------------
   Hero Slide
------------------------------------------------------------------- */
const HeroSlide = ({
    item,
    isActive,
    onPlay,
    onInfo,
    isMobile,
    latestCards = [],
    onCardClick,
    activeCardIndex,
    onCardSelect
}) => {
    const { optimizedUrl, isLoading } = useSmartHeroImage(
        item?.background,
        item?.poster,
        isMobile
    );

    const isSeries = item?.type === 'series' || item?.latestEpisode;
    const hasNewEpisode = !!item?.latestEpisode;
    const hasTranslator = !!item?.translator && item.translator.trim() !== '';
    const year = item?.year || '';
    const headline = getHeroHeadline(item);

    const itemRef = useRef(item);
    useEffect(() => { itemRef.current = item; }, [item]);

    const handlePlayClick = useCallback((e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (itemRef.current && onPlay) onPlay(itemRef.current, e);
    }, [onPlay]);

    const handleInfoClick = useCallback((e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (itemRef.current && onInfo) onInfo(itemRef.current, e);
    }, [onInfo]);

    const description = hasNewEpisode && item.latestEpisode?.description
        ? item.latestEpisode.description
        : item?.description || 'Experience this amazing content.';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`absolute inset-0 ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
        >
            <div className="relative w-full h-full overflow-hidden">

                {/* =========================================== */}
                {/* BLURRED BACKGROUND                          */}
                {/* =========================================== */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${optimizedUrl})`,
                        backgroundPosition: 'center 20%',
                        backgroundSize: 'cover',
                        filter: 'blur(40px) saturate(1.3) brightness(0.4)',
                        transform: 'scale(1.15)',
                    }}
                />

                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-overlay"
                    style={{
                        backgroundImage: `url(${optimizedUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        filter: 'blur(60px) saturate(1.4)',
                        transform: 'scale(1.2)',
                    }}
                />

                {isLoading && isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#060d0a] to-black animate-pulse">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                )}

                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060d0a] via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

                {/* =========================================== */}
                {/* HEADLINE BADGE — TOP RIGHT                  */}
                {/* =========================================== */}
                {isActive && (
                    <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                        className="absolute z-30 top-2 right-2 sm:top-3 sm:right-4 md:top-4 md:right-6"
                    >
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/25 shadow-lg shadow-emerald-500/20">
                            <div className="relative flex-shrink-0">
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${headline.color} blur-md opacity-70 animate-pulse`} />
                                <div className={`relative w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${headline.color} flex items-center justify-center shadow-lg`}>
                                    <headline.icon className="text-black text-[8px] sm:text-[10px]" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className={`text-[10px] sm:text-xs font-black tracking-wider bg-gradient-to-r ${headline.color} bg-clip-text text-transparent uppercase`}>
                                    {headline.text}
                                </span>
                                <motion.span
                                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 1.8, repeat: Infinity }}
                                    className="text-amber-400 text-[8px] sm:text-[10px]"
                                >
                                    ✦
                                </motion.span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* =========================================== */}
                {/* MOBILE LAYOUT — Cards pushed up ~20%         */}
                {/* =========================================== */}
                {isMobile && (
                    <div className="absolute inset-0 z-20 flex flex-col px-3 pt-14 pb-10">
                        <div className="max-w-md mx-auto w-full h-full flex flex-col">

                            {/* Top spacer — larger, pushes cards up */}
                            <div className="flex-[1.2]" />

                            {/* ============ CARDS ============ */}
                            {latestCards.length > 0 && (
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="w-full flex justify-center items-end"
                                >
                                    <div className="flex items-end justify-center gap-3">
                                        {latestCards.map((movie, idx) => {
                                            const isActiveCard = idx === activeCardIndex;
                                            return (
                                                <button
                                                    key={movie?.id || movie?._id || idx}
                                                    data-card="true"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isActiveCard) onCardClick && onCardClick(movie);
                                                        else onCardSelect && onCardSelect(idx);
                                                    }}
                                                    className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-500 origin-bottom ${
                                                        isActiveCard
                                                            ? 'w-[130px] scale-105 -translate-y-3 z-20 ring-2 ring-emerald-400 shadow-2xl shadow-emerald-500/60'
                                                            : 'w-[100px] scale-95 opacity-65 hover:opacity-100'
                                                    }`}
                                                    style={{ aspectRatio: '2 / 3' }}
                                                >
                                                    <HeroCard movie={movie} />
                                                    {isActiveCard && (
                                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                            <div className="w-4 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Big gap between cards and info */}
                            <div className="flex-[0.8]" />

                            {/* ============ INFO BELOW ============ */}
                            <div className="w-full text-center pb-2">

                                {/* Badges */}
                                <motion.div
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                    className="flex flex-wrap items-center justify-center gap-2 mb-3"
                                >
                                    <span className="px-3 py-1 rounded-full font-bold shadow-lg text-xs text-black bg-gradient-to-r from-emerald-400 to-teal-400">
                                        {isSeries ? (
                                            <><FaTv className="inline mr-1 text-[10px]" /> SERIES</>
                                        ) : (
                                            <><FaFilm className="inline mr-1 text-[10px]" /> MOVIE</>
                                        )}
                                    </span>

                                    {hasTranslator && (
                                        <span className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                            <FaLanguage className="text-[10px]" />
                                            <span className="max-w-[90px] truncate">{item.translator}</span>
                                        </span>
                                    )}

                                    {hasNewEpisode && (
                                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/50 animate-pulse">
                                            <FaPlusCircle className="text-[10px]" /> NEW
                                        </span>
                                    )}

                                    {item?.rating && (
                                        <span className="flex items-center gap-1 text-amber-400 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
                                            <FaStar className="text-[10px]" />
                                            {item.rating}
                                        </span>
                                    )}
                                </motion.div>

                                {/* Title */}
                                <motion.h1
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.35, duration: 0.4 }}
                                    className="font-black text-white leading-tight mb-2 text-2xl xs:text-3xl line-clamp-2"
                                    style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
                                >
                                    {item?.title}
                                </motion.h1>

                                {hasNewEpisode && item.latestEpisode && (
                                    <motion.h2
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4, duration: 0.4 }}
                                        className="text-emerald-300 font-semibold text-xs mb-2 line-clamp-1"
                                    >
                                        ▶ {item.latestEpisode.title}
                                    </motion.h2>
                                )}

                                <motion.p
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.45, duration: 0.4 }}
                                    className="text-gray-200 leading-relaxed mx-auto mb-4 text-xs line-clamp-2 max-w-xs"
                                    style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                                >
                                    {description}
                                </motion.p>

                                {/* Buttons */}
                                <motion.div
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.4 }}
                                    className="flex gap-2 justify-center"
                                >
                                    <button
                                        onClick={handlePlayClick}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full text-black font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105 active:scale-95 px-6 py-2.5 text-xs"
                                    >
                                        <FaPlay className="text-[10px]" />
                                        <span>{hasNewEpisode ? 'Watch Latest' : 'Watch Now'}</span>
                                    </button>
                                    <button
                                        onClick={handleInfoClick}
                                        className="bg-emerald-950/60 backdrop-blur-md border border-emerald-900/60 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-emerald-900/60 hover:scale-105 active:scale-95 px-6 py-2.5 text-xs"
                                    >
                                        <FaInfoCircle className="text-[10px]" />
                                        <span>More Info</span>
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================== */}
                {/* DESKTOP/TABLET LAYOUT                       */}
                {/* =========================================== */}
                {!isMobile && (
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10 pb-16">
                        <div className="max-w-7xl mx-auto w-full">
                            <div className="flex items-end justify-between gap-8">

                                {/* LEFT: MOVIE INFO */}
                                <div className="flex-1 max-w-2xl">

                                    <motion.div
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                        className="flex flex-wrap items-center gap-2 mb-3"
                                    >
                                        <span className="px-3.5 py-1 rounded-full font-bold shadow-lg text-xs text-black bg-gradient-to-r from-emerald-400 to-teal-400">
                                            {isSeries ? (
                                                <><FaTv className="inline mr-1 text-[10px]" /> SERIES</>
                                            ) : (
                                                <><FaFilm className="inline mr-1 text-[10px]" /> MOVIE</>
                                            )}
                                        </span>

                                        {hasTranslator && (
                                            <span className="px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                                <FaLanguage className="text-[10px]" />
                                                <span className="max-w-[120px] truncate">{item.translator}</span>
                                            </span>
                                        )}

                                        {hasNewEpisode && (
                                            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/50 animate-pulse">
                                                <FaPlusCircle className="text-[10px]" /> NEW
                                            </span>
                                        )}

                                        {item?.rating && (
                                            <span className="flex items-center gap-1 text-amber-400 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
                                                <FaStar className="text-[10px]" />
                                                {item.rating}
                                            </span>
                                        )}

                                        {year && (
                                            <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-emerald-900/40">
                                                {year}
                                            </span>
                                        )}
                                    </motion.div>

                                    <motion.h1
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.35, duration: 0.4 }}
                                        className="font-black text-white leading-tight mb-2 text-3xl sm:text-4xl md:text-5xl line-clamp-2"
                                        style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
                                    >
                                        {item?.title}
                                    </motion.h1>

                                    {hasNewEpisode && item.latestEpisode && (
                                        <motion.h2
                                            initial={{ y: 15, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4, duration: 0.4 }}
                                            className="text-emerald-300 font-semibold text-sm mb-2 line-clamp-1"
                                        >
                                            ▶ {item.latestEpisode.title}
                                        </motion.h2>
                                    )}

                                    <motion.p
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.45, duration: 0.4 }}
                                        className="text-gray-200 leading-relaxed mb-4 text-sm md:text-base line-clamp-3 max-w-xl"
                                        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                                    >
                                        {description}
                                    </motion.p>

                                    <motion.div
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.4 }}
                                        className="flex gap-3"
                                    >
                                        <button
                                            onClick={handlePlayClick}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full text-black font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105 active:scale-95 px-8 py-3 text-sm md:text-base"
                                        >
                                            <FaPlay className="text-xs md:text-sm" />
                                            <span>{hasNewEpisode ? 'Watch Latest' : 'Watch Now'}</span>
                                        </button>
                                        <button
                                            onClick={handleInfoClick}
                                            className="bg-emerald-950/60 backdrop-blur-md border border-emerald-900/60 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-emerald-900/60 hover:scale-105 active:scale-95 px-8 py-3 text-sm md:text-base"
                                        >
                                            <FaInfoCircle className="text-xs md:text-sm" />
                                            <span>More Info</span>
                                        </button>
                                    </motion.div>
                                </div>

                                {/* RIGHT: 3 LARGE CARDS */}
                                {latestCards.length > 0 && (
                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.25, duration: 0.5 }}
                                        className="flex-shrink-0 flex items-end justify-end gap-4 lg:gap-5"
                                    >
                                        {latestCards.map((movie, idx) => {
                                            const isActiveCard = idx === activeCardIndex;
                                            return (
                                                <button
                                                    key={movie?.id || movie?._id || idx}
                                                    data-card="true"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isActiveCard) onCardClick && onCardClick(movie);
                                                        else onCardSelect && onCardSelect(idx);
                                                    }}
                                                    className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-500 origin-bottom ${
                                                        isActiveCard
                                                            ? 'w-[170px] lg:w-[190px] scale-105 -translate-y-4 z-20 ring-2 ring-emerald-400 shadow-2xl shadow-emerald-500/60'
                                                            : 'w-[140px] lg:w-[155px] scale-95 opacity-70 hover:opacity-100'
                                                    }`}
                                                    style={{ aspectRatio: '2 / 3' }}
                                                >
                                                    <HeroCard movie={movie} />
                                                    {isActiveCard && (
                                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                                            <div className="w-2 h-1.5 rounded-full bg-emerald-400" />
                                                            <div className="w-5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                                                            <div className="w-2 h-1.5 rounded-full bg-teal-400" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ------------------------------------------------------------------
   Main HeroSlider
------------------------------------------------------------------- */
const HeroSlider = ({ items, onPlay, onInfo, latestCards = [], onCardClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const autoPlayRef = useRef(null);
    const itemsRef = useRef(items);
    const isSwiping = useRef(false);

    const latestThree = useMemo(() => {
        if (latestCards && latestCards.length > 0) {
            return latestCards.slice(0, 3);
        }
        return (items || []).slice(0, 3);
    }, [latestCards, items]);

    const slides = latestThree;

    useEffect(() => {
        itemsRef.current = slides;
    }, [slides]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isAutoPlaying && slides.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % slides.length);
            }, 4000);
        }
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isAutoPlaying, slides.length]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [slides.length]);

    const pauseAutoPlay = useCallback(() => {
        setIsAutoPlaying(false);
        setTimeout(() => {
            setIsAutoPlaying(true);
        }, 8000);
    }, []);

    const goToCard = useCallback((idx) => {
        if (slides.length === 0) return;
        const next = ((idx % slides.length) + slides.length) % slides.length;
        setCurrentIndex(next);
        pauseAutoPlay();
    }, [slides.length, pauseAutoPlay]);

    const handleCardSelect = useCallback((idx) => {
        goToCard(idx);
    }, [goToCard]);

    const nextSlide = useCallback((e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (itemsRef.current && itemsRef.current.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % itemsRef.current.length);
            pauseAutoPlay();
        }
    }, [pauseAutoPlay]);

    const prevSlide = useCallback((e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (itemsRef.current && itemsRef.current.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + itemsRef.current.length) % itemsRef.current.length);
            pauseAutoPlay();
        }
    }, [pauseAutoPlay]);

    const handleTouchStart = useCallback((e) => {
        const target = e.target;
        const isInteractive = target.closest('button') || target.closest('a') || target.closest('[role="button"]');
        const isCard = target.closest('[data-card]');
        if (isInteractive || isCard) return;
        setTouchStart(e.touches[0].clientX);
        setIsAutoPlaying(false);
        isSwiping.current = true;
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isSwiping.current) return;
        const touchDelta = Math.abs(e.touches[0].clientX - touchStart);
        if (touchDelta > 10) e.preventDefault();
        setTouchEnd(e.touches[0].clientX);
    }, [touchStart]);

    const handleTouchEnd = useCallback(() => {
        if (!isSwiping.current) {
            setTouchStart(0);
            setTouchEnd(0);
            return;
        }
        const swipeDistance = touchStart - touchEnd;
        const minSwipeDistance = 50;
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) nextSlide();
            else prevSlide();
        }
        setTouchStart(0);
        setTouchEnd(0);
        isSwiping.current = false;
        setTimeout(() => {
            setIsAutoPlaying(true);
        }, 5000);
    }, [touchStart, touchEnd, nextSlide, prevSlide]);

    const goToSlide = useCallback((index, e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (index >= 0 && index < itemsRef.current.length) {
            setCurrentIndex(index);
            pauseAutoPlay();
        }
    }, [pauseAutoPlay]);

    const handlePlayClick = useCallback((item, event) => {
        if (onPlay) onPlay(item, event);
    }, [onPlay]);

    const handleInfoClick = useCallback((item, event) => {
        if (onInfo) onInfo(item, event);
    }, [onInfo]);

    if (!slides || slides.length === 0) return null;

    return (
        <section
            className={`relative overflow-hidden bg-black select-none ${
                isMobile
                    ? 'h-[92vh] min-h-[620px] max-h-[780px]'
                    : 'h-[88vh] min-h-[620px] max-h-[820px]'
            }`}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="relative w-full h-full">
                <AnimatePresence initial={false}>
                    {slides.map((item, index) => (
                        <HeroSlide
                            key={item?.id || item?._id || index}
                            item={item}
                            isActive={index === currentIndex}
                            onPlay={handlePlayClick}
                            onInfo={handleInfoClick}
                            isMobile={isMobile}
                            latestCards={latestThree}
                            onCardClick={onCardClick}
                            activeCardIndex={currentIndex}
                            onCardSelect={handleCardSelect}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Dots */}
            {slides.length > 1 && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 flex gap-1.5 md:gap-2 ${
                    isMobile ? 'bottom-3' : 'bottom-5 md:bottom-6'
                }`}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => goToSlide(index, e)}
                            className="group focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span
                                className={`block transition-all duration-300 rounded-full ${
                                    index === currentIndex
                                        ? isMobile
                                            ? 'w-5 h-1 bg-gradient-to-r from-emerald-400 to-teal-400'
                                            : 'w-8 h-1 bg-gradient-to-r from-emerald-400 to-teal-400'
                                        : isMobile
                                            ? 'w-2 h-1 bg-white/40'
                                            : 'w-3 h-1 bg-white/30'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Arrows */}
            {slides.length > 1 && !isMobile && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300 hover:scale-110 group focus:outline-none border border-emerald-500/20"
                        aria-label="Previous slide"
                    >
                        <FaChevronLeft className="text-white text-sm group-hover:text-emerald-400 transition-colors" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300 hover:scale-110 group focus:outline-none border border-emerald-500/20"
                        aria-label="Next slide"
                    >
                        <FaChevronRight className="text-white text-sm group-hover:text-emerald-400 transition-colors" />
                    </button>
                </>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800/40 z-30">
                <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
                />
            </div>

            {/* Counter */}
            {slides.length > 1 && (
                <div className={`absolute z-30 bg-black/60 backdrop-blur-sm rounded-full border border-emerald-500/30 ${
                    isMobile
                        ? 'bottom-3 right-3 px-2 py-0.5 text-[10px]'
                        : 'bottom-5 md:bottom-6 right-4 md:right-6 px-3 py-1 text-xs'
                }`}>
                    <span className="text-emerald-400 font-bold">{currentIndex + 1}</span>
                    <span className="text-white">/{slides.length}</span>
                </div>
            )}
        </section>
    );
};

export default HeroSlider;