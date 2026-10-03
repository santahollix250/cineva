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
    FaFilm
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
                    ? 'c_fill,g_auto,q_auto:best,w=780,h=780'
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
   Circular Card Slideshow (mobile) — softer "cave" curve, bigger cards
------------------------------------------------------------------- */
const CircularCardSlideshow = ({
    cards,
    activeIndex,
    onCardClick,
    onSwipeLeft,
    onSwipeRight,
    onCardSelect
}) => {
    const total = cards.length;

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchActive = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchActive.current = true;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!touchActive.current) return;
        const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
        const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
        if (dx > dy) e.preventDefault();
    };

    const handleTouchEnd = (e) => {
        if (!touchActive.current) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - touchStartX.current;
        const dy = endY - touchStartY.current;
        const threshold = 40;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
            if (dx < 0) onSwipeLeft && onSwipeLeft();
            else onSwipeRight && onSwipeRight();
        }
        touchActive.current = false;
        setIsDragging(false);
    };

    // ✅ Softer "cave" curve — less lift, less rotation, less scale drop
    const getCardTransform = (idx) => {
        let offset = idx - activeIndex;
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        const distance = Math.abs(offset);

        const horizontalStep = 42;   // a bit wider spread for bigger cards
        const verticalLift = 10;      // ✅ shallower cave (was 18)
        const rotationStep = 4;       // ✅ softer tilt (was 7)
        const scaleStep = 0.06;       // ✅ gentler shrink (was 0.1)
        const minScale = 0.82;        // ✅ side cards stay bigger (was 0.68)

        const x = offset * horizontalStep;
        const y = distance * 4 - verticalLift;
        const rotate = offset * rotationStep;
        const scale = Math.max(minScale, 1 - distance * scaleStep);
        const zIndex = 50 - distance;
        const opacity = distance === 0 ? 1 : Math.max(0.75, 0.95 - distance * 0.08);

        return { x, y, rotate, scale, zIndex, opacity, isActive: distance === 0 };
    };

    return (
        <div
            className="relative flex items-center justify-center select-none"
            style={{
                height: 210,       // ✅ shorter container (was 190 + more room)
                width: 300,        // ✅ wider for bigger cards
                paddingTop: 10,
                paddingBottom: 22,
                paddingLeft: 8,
                paddingRight: 8,
                perspective: '1000px',
                touchAction: 'pan-y',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {cards.map((movie, idx) => {
                const t = getCardTransform(idx);
                return (
                    <motion.div
                        key={movie?.id || movie?._id || idx}
                        data-card="true"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (t.isActive) onCardClick && onCardClick(movie);
                            else onCardSelect && onCardSelect(idx);
                        }}
                        animate={{
                            x: t.x,
                            y: t.y,
                            rotate: t.rotate,
                            scale: t.scale,
                            opacity: t.opacity,
                            zIndex: t.zIndex,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 240,
                            damping: 28,
                            mass: 0.9,
                        }}
                        className="absolute cursor-pointer"
                        style={{
                            transformStyle: 'preserve-3d',
                            // ✅ BIGGER cards
                            width: 108,       // was 88
                            height: 162,      // 2:3 aspect
                            pointerEvents: isDragging ? 'none' : 'auto',
                        }}
                    >
                        <div
                            className={`relative w-full h-full rounded-xl overflow-hidden transition-shadow duration-500 ${
                                t.isActive
                                    ? 'shadow-2xl shadow-purple-500/50 ring-2 ring-purple-500/70'
                                    : 'shadow-xl shadow-black/70 ring-1 ring-white/10'
                            }`}
                        >
                            <HeroCard movie={movie} />

                            {t.isActive && (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/60" />
                                    <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-pink-500/60" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-lg shadow-pink-500/60" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[9px] text-gray-400 pointer-events-none">
                <FaChevronLeft className="text-[7px]" />
                <span>swipe</span>
                <FaChevronRight className="text-[7px]" />
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------
   Horizontal Card Row (desktop) — bigger cards, softer arch
------------------------------------------------------------------- */
const HorizontalCardRow = ({
    cards,
    activeIndex,
    onCardClick,
    onCardSelect
}) => {
    return (
        <div className="relative w-full select-none">
            <div
                className="flex items-end gap-4 justify-end"
                style={{ scrollbarWidth: 'none' }}
            >
                {cards.map((movie, idx) => {
                    const isActive = idx === activeIndex;

                    // ✅ Gentle cave curve for desktop too (subtle lift + small tilt)
                    const offset = idx - activeIndex;
                    const distance = Math.abs(offset);
                    const lift = distance === 0 ? -10 : -4 + distance * 2; // active card rises more
                    const tilt = offset * 1.5; // gentle tilt

                    return (
                        <div
                            key={movie?.id || movie?._id || idx}
                            data-card="true"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isActive) onCardClick && onCardClick(movie);
                                else onCardSelect && onCardSelect(idx);
                            }}
                            className={`flex-shrink-0 cursor-pointer transition-all duration-500 ease-out origin-bottom ${
                                isActive
                                    ? 'scale-105 z-20'
                                    : 'scale-95 opacity-80 hover:opacity-100 hover:scale-100'
                            }`}
                            style={{
                                width: 190,     // ✅ bigger card width (was 175)
                                height: 285,    // 2:3 aspect
                                transform: `translateY(${lift}px) rotate(${tilt}deg) ${isActive ? 'scale(1.05)' : 'scale(0.95)'}`,
                            }}
                        >
                            <div
                                className={`relative w-full h-full rounded-xl overflow-hidden transition-shadow duration-500 ${
                                    isActive
                                        ? 'shadow-2xl shadow-purple-500/50 ring-2 ring-purple-500/70'
                                        : 'shadow-xl shadow-black/70 ring-1 ring-white/10'
                                }`}
                            >
                                <HeroCard movie={movie} />

                                {isActive && (
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/60" />
                                        <div className="w-4 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-pink-500/60" />
                                        <div className="w-2 h-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/60" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
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
    onCardSwipeLeft,
    onCardSwipeRight,
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

    const getBackgroundPosition = () => (isMobile ? 'center 30%' : 'center 20%');

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`absolute inset-0 ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
        >
            <div className="relative w-full h-full overflow-hidden">
                {/* BACKGROUND */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[2000ms] ease-out"
                    style={{
                        backgroundImage: `url(${optimizedUrl})`,
                        backgroundPosition: getBackgroundPosition(),
                        backgroundSize: 'cover',
                        filter: 'blur(1px) saturate(1.2) brightness(0.9)',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }}
                />

                {isLoading && isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black animate-pulse">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/30 hidden md:block" />

                {isMobile && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95" />
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent" />
                    </>
                )}

                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

                {/* MOBILE LAYOUT */}
                {isMobile && (
                    <div className="absolute inset-0 z-20 flex items-end p-3 pb-14">
                        <div className="w-full flex items-end justify-between gap-2">

                            {/* Info */}
                            <div className="flex-1 min-w-0 max-w-[52%]">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="flex flex-wrap gap-1 mb-1.5"
                                >
                                    <span className="px-1.5 py-0.5 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[8px]">
                                        {isSeries ? (
                                            <><FaTv className="inline mr-0.5 text-[6px]" /> SERIES</>
                                        ) : (
                                            <><FaFilm className="inline mr-0.5 text-[6px]" /> MOVIE</>
                                        )}
                                    </span>

                                    {hasTranslator && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold flex items-center gap-0.5 text-[8px]">
                                            <FaLanguage className="text-[6px]" />
                                            {item.translator}
                                        </span>
                                    )}

                                    {item?.rating && (
                                        <span className="flex items-center gap-0.5 text-yellow-400 bg-black/50 px-1.5 py-0.5 rounded-full text-[8px]">
                                            <FaStar className="text-[6px]" />
                                            {item.rating}
                                        </span>
                                    )}
                                </motion.div>

                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.35, duration: 0.5 }}
                                    className="font-bold text-white leading-tight drop-shadow-lg text-sm mb-1 line-clamp-2"
                                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
                                >
                                    {item?.title}
                                </motion.h1>

                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="text-gray-200 drop-shadow-md text-[9px] mb-2 line-clamp-2"
                                    style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                                >
                                    {hasNewEpisode && item.latestEpisode?.description
                                        ? item.latestEpisode.description
                                        : item?.description || 'Experience this amazing content.'}
                                </motion.p>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.45, duration: 0.5 }}
                                    className="flex gap-1.5"
                                >
                                    <button
                                        onClick={handlePlayClick}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold flex items-center gap-1 shadow-lg px-2.5 py-1.5 text-[10px] active:scale-95"
                                    >
                                        <FaPlay className="text-[8px]" />
                                        <span>{hasNewEpisode ? 'Watch' : 'Play'}</span>
                                    </button>
                                    <button
                                        onClick={handleInfoClick}
                                        className="bg-black/50 backdrop-blur-sm rounded-lg text-white font-semibold flex items-center gap-1 border border-white/20 px-2.5 py-1.5 text-[10px] active:scale-95"
                                    >
                                        <FaInfoCircle className="text-[8px]" />
                                        <span>Info</span>
                                    </button>
                                </motion.div>
                            </div>

                            {/* Cards bottom right */}
                            {latestCards.length > 0 && (
                                <motion.div
                                    initial={{ x: 30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="flex-shrink-0"
                                >
                                    <CircularCardSlideshow
                                        cards={latestCards}
                                        activeIndex={activeCardIndex}
                                        onCardClick={onCardClick}
                                        onSwipeLeft={onCardSwipeLeft}
                                        onSwipeRight={onCardSwipeRight}
                                        onCardSelect={onCardSelect}
                                    />
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                {/* DESKTOP LAYOUT */}
                {!isMobile && (
                    <div className="absolute inset-0 z-20 flex items-end p-6 md:p-10">
                        <div className="max-w-7xl mx-auto w-full">
                            <div className="flex flex-row items-end justify-between gap-10">

                                {/* Info left */}
                                <div className="max-w-xl lg:max-w-2xl flex-1">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3"
                                    >
                                        <span className="px-2 md:px-3.5 py-0.5 md:py-1 rounded-full font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] md:text-xs">
                                            {isSeries ? (
                                                <><FaTv className="inline mr-1 text-[9px]" /> SERIES</>
                                            ) : (
                                                <><FaFilm className="inline mr-1 text-[9px]" /> MOVIE</>
                                            )}
                                        </span>

                                        {hasTranslator && (
                                            <span className="px-2 md:px-3.5 py-0.5 md:py-1 rounded-full bg-blue-600 text-white font-semibold flex items-center gap-1 shadow-lg text-[11px] md:text-xs">
                                                <FaLanguage className="text-[9px]" />
                                                {item.translator}
                                            </span>
                                        )}

                                        {hasNewEpisode && (
                                            <span className="px-2 md:px-3.5 py-0.5 md:py-1 rounded-full bg-green-600 text-white font-semibold flex items-center gap-1 animate-pulse shadow-lg text-[11px] md:text-xs">
                                                <FaPlusCircle className="text-[9px]" />
                                                NEW EPISODE
                                            </span>
                                        )}

                                        {item?.rating && (
                                            <span className="flex items-center gap-1 text-yellow-400 bg-black/50 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-sm shadow-lg text-[11px] md:text-xs">
                                                <FaStar className="text-[9px]" />
                                                {item.rating}
                                            </span>
                                        )}
                                    </motion.div>

                                    <motion.h1
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="font-bold text-white leading-tight drop-shadow-lg text-3xl sm:text-4xl md:text-5xl mb-2"
                                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.85)' }}
                                    >
                                        {item?.title}
                                        {hasNewEpisode && (
                                            <span className="text-base md:text-lg ml-2 text-purple-400">- New Episode</span>
                                        )}
                                    </motion.h1>

                                    {hasNewEpisode && item.latestEpisode && (
                                        <motion.h2
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                            className="text-purple-300 font-medium drop-shadow-md text-sm md:text-base mb-2"
                                        >
                                            Latest: {item.latestEpisode.title}
                                        </motion.h2>
                                    )}

                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                        className="text-gray-100 drop-shadow-md leading-relaxed text-sm md:text-base mb-3 md:mb-4 line-clamp-2 md:line-clamp-3"
                                        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
                                    >
                                        {hasNewEpisode && item.latestEpisode?.description
                                            ? item.latestEpisode.description
                                            : item?.description || 'Experience this amazing content.'}
                                    </motion.p>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        className="flex gap-2 md:gap-3"
                                    >
                                        <button
                                            onClick={handlePlayClick}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold flex items-center gap-1.5 shadow-xl px-6 md:px-7 py-2 md:py-2.5 text-sm md:text-base hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
                                        >
                                            <FaPlay className="text-xs md:text-sm" />
                                            <span>{hasNewEpisode ? 'Watch Latest' : 'Watch Now'}</span>
                                        </button>
                                        <button
                                            onClick={handleInfoClick}
                                            className="bg-black/50 backdrop-blur-sm rounded-lg text-white font-semibold flex items-center gap-1.5 border border-white/20 px-6 md:px-7 py-2 md:py-2.5 text-sm md:text-base hover:bg-black/70 transform hover:scale-105 transition-all duration-300"
                                        >
                                            <FaInfoCircle className="text-xs md:text-sm" />
                                            <span>Info</span>
                                        </button>
                                    </motion.div>
                                </div>

                                {/* Cards right */}
                                {latestCards.length > 0 && (
                                    <motion.div
                                        initial={{ x: 40, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                        className="flex-shrink-0 max-w-[60%]"
                                    >
                                        <HorizontalCardRow
                                            cards={latestCards}
                                            activeIndex={activeCardIndex}
                                            onCardClick={onCardClick}
                                            onCardSelect={onCardSelect}
                                        />
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

    const latestFive = useMemo(() => {
        if (latestCards && latestCards.length > 0) {
            return latestCards.slice(0, 5);
        }
        return (items || []).slice(0, 5);
    }, [latestCards, items]);

    const slides = latestFive;

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
            }, 2000);
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

    const handleCardSwipeLeft = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        pauseAutoPlay();
    }, [slides.length, pauseAutoPlay]);

    const handleCardSwipeRight = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
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
            className={`relative overflow-hidden bg-black select-none ${isMobile ? 'h-[72vh] sm:h-[72vh]' : 'h-[78vh] md:h-[82vh]'}`}
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
                            latestCards={latestFive}
                            onCardClick={onCardClick}
                            activeCardIndex={currentIndex}
                            onCardSwipeLeft={handleCardSwipeLeft}
                            onCardSwipeRight={handleCardSwipeRight}
                            onCardSelect={handleCardSelect}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Dots */}
            {slides.length > 1 && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 flex gap-1.5 md:gap-2 ${isMobile ? 'bottom-4' : 'bottom-5 md:bottom-6'}`}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => goToSlide(index, e)}
                            className="group focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span
                                className={`block transition-all duration-300 rounded-full ${index === currentIndex
                                    ? isMobile
                                        ? 'w-4 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600'
                                        : 'w-6 md:w-8 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600'
                                    : isMobile
                                        ? 'w-1.5 h-0.5 bg-gray-500 group-hover:bg-gray-400'
                                        : 'w-2 md:w-3 h-0.5 bg-gray-500 group-hover:bg-gray-400'
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
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300 hover:scale-110 group focus:outline-none"
                        aria-label="Previous slide"
                    >
                        <FaChevronLeft className="text-white text-sm group-hover:text-purple-400 transition-colors" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300 hover:scale-110 group focus:outline-none"
                        aria-label="Next slide"
                    >
                        <FaChevronRight className="text-white text-sm group-hover:text-purple-400 transition-colors" />
                    </button>
                </>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800/50 z-30">
                <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-400 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
                />
            </div>

            {/* Counter */}
            {slides.length > 1 && (
                <div className={`absolute z-30 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 ${isMobile
                    ? 'top-2 right-2 px-1.5 py-0.5 text-[9px]'
                    : 'top-4 md:top-6 right-4 md:right-6 px-2 py-1 text-[11px] md:text-xs'
                    }`}>
                    <span className="text-purple-400 font-bold">{currentIndex + 1}</span>
                    <span className="text-white">/{slides.length}</span>
                </div>
            )}
        </section>
    );
};

export default HeroSlider;