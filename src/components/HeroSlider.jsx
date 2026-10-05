import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    FaPlay,
    FaInfoCircle,
    FaTv,
    FaStar,
    FaPlusCircle,
    FaFilm,
    FaFire,
    FaBolt,
    FaUser
} from 'react-icons/fa';
import HeroCard from './HeroCard';
import { getTranslatorsWithProfiles } from '../lib/translators';

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
   Smart Headline
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
   Translator Chip
------------------------------------------------------------------- */
const TranslatorChip = ({ name, profile, isMobile }) => {
    if (!name) return null;

    const displayName = profile?.display_name || profile?.name || name;
    const photoUrl = profile?.photo_url;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full
                bg-black/70 backdrop-blur-md border border-emerald-500/40
                shadow-lg shadow-emerald-500/10
                ${isMobile ? 'pl-0.5 pr-2.5 py-0.5' : 'pl-1 pr-3 py-1'}
            `}
        >
            <span
                className={`relative flex-shrink-0 rounded-full overflow-hidden
                    ring-1 ring-emerald-400/60 bg-emerald-950
                    ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}
                `}
            >
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <span className="w-full h-full flex items-center justify-center">
                        <FaUser className={`text-emerald-400 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`} />
                    </span>
                )}
            </span>

            <span
                className={`text-emerald-200 font-bold truncate
                    ${isMobile ? 'text-[10px] max-w-[90px]' : 'text-xs max-w-[140px]'}
                `}
                title={displayName}
            >
                {displayName}
            </span>
        </span>
    );
};

/* ------------------------------------------------------------------
   Reorder helper — tap a card, it goes to center
------------------------------------------------------------------- */
const reorderWithClickedInCenter = (cards, clickedIdx) => {
    if (!Array.isArray(cards) || cards.length === 0) return cards;
    if (cards.length === 1) return cards;
    if (cards.length === 2) {
        return clickedIdx === 0 ? cards : [cards[1], cards[0]];
    }
    const clicked = cards[clickedIdx];
    const others = cards.filter((_, i) => i !== clickedIdx);
    return [others[0], clicked, ...others.slice(1)];
};

/* ------------------------------------------------------------------
   Rotate helper — natural "next" direction
------------------------------------------------------------------- */
const rotateCards = (cards, direction = 1) => {
    if (!Array.isArray(cards) || cards.length <= 1) return cards;
    if (direction >= 0) {
        return [...cards.slice(1), cards[0]];
    } else {
        return [cards[cards.length - 1], ...cards.slice(0, cards.length - 1)];
    }
};

/* ------------------------------------------------------------------
   Hero Slide — receives the CENTER item as `item`
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
    onCardSelect,
    translatorProfile,
    onSwipeLeft,
    onSwipeRight,
    onUserInteract
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

    // ─── Swipe tracking ───
    const dragStartX = useRef(0);
    const dragStartY = useRef(0);
    const dragging = useRef(false);

    const handlePointerDown = (e) => {
        dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        dragStartY.current = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        dragging.current = true;
    };
    const handlePointerUp = (e) => {
        if (!dragging.current) return;
        dragging.current = false;
        const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStartX.current;
        const endY = e.clientY ?? e.changedTouches?.[0]?.clientY ?? dragStartY.current;
        const dx = endX - dragStartX.current;
        const dy = endY - dragStartY.current;

        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;

        onUserInteract && onUserInteract();
        if (dx < 0) onSwipeLeft && onSwipeLeft();
        else onSwipeRight && onSwipeRight();
    };

    const handlePlayClick = useCallback((e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        onUserInteract && onUserInteract();
        if (itemRef.current && onPlay) onPlay(itemRef.current, e);
    }, [onPlay, onUserInteract]);

    const handleInfoClick = useCallback((e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        onUserInteract && onUserInteract();
        if (itemRef.current && onInfo) onInfo(itemRef.current, e);
    }, [onInfo, onUserInteract]);

    const handleCardTap = useCallback((idx) => {
        onUserInteract && onUserInteract();
        onCardSelect && onCardSelect(idx);
    }, [onCardSelect, onUserInteract]);

    const description = hasNewEpisode && item.latestEpisode?.description
        ? item.latestEpisode.description
        : item?.description || 'Experience this amazing content.';

    return (
        <motion.div
            key={item?.id || item?._id || 'hero-slide'}
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-10"
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
        >
            <div className="relative w-full h-full overflow-hidden">

                {/* BLURRED BACKGROUND */}
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

                <div className="absolute inset-0 bg-gradient-to-t from-[#060d0a] via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

                {/* HEADLINE BADGE */}
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
                {/* MOBILE LAYOUT                                */}
                {/* =========================================== */}
                {isMobile && (
                    <div className="absolute inset-0 z-20 flex flex-col px-3 pt-14 pb-10">
                        <div className="max-w-md mx-auto w-full h-full flex flex-col">

                            <div className="flex-1" />

                            {/* CARDS */}
                            {latestCards.length > 0 && (
                                <LayoutGroup id="mobile-cards">
                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="w-full flex justify-center items-end"
                                    >
                                        <div className="flex items-end justify-center gap-3.5">
                                            {latestCards.map((movie, idx) => {
                                                const isActiveCard = idx === activeCardIndex;
                                                const key = movie?.id || movie?._id || `card-${idx}`;
                                                return (
                                                    <motion.button
                                                        layout
                                                        key={key}
                                                        data-card="true"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCardTap(idx);
                                                        }}
                                                        transition={{
                                                            layout: {
                                                                type: 'spring',
                                                                stiffness: 180,
                                                                damping: 26,
                                                                mass: 1.0,
                                                                restDelta: 0.001
                                                            }
                                                        }}
                                                        animate={{
                                                            scale: isActiveCard ? 1.05 : 0.95,
                                                            y: isActiveCard ? -12 : 0,
                                                            opacity: isActiveCard ? 1 : 0.65,
                                                            zIndex: isActiveCard ? 20 : 1
                                                        }}
                                                        whileTap={{ scale: 0.96 }}
                                                        whileHover={{ opacity: 1 }}
                                                        className={`relative flex-shrink-0 rounded-xl overflow-hidden origin-bottom ${
                                                            isActiveCard
                                                                ? 'w-[155px] ring-2 ring-emerald-400 shadow-2xl shadow-emerald-500/60'
                                                                : 'w-[120px]'
                                                        }`}
                                                        style={{ aspectRatio: '2 / 3' }}
                                                    >
                                                        <HeroCard movie={movie} />

                                                        <AnimatePresence>
                                                            {isActiveCard && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 8, scale: 0.6 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: 8, scale: 0.6 }}
                                                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                                    <div className="w-4 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        <AnimatePresence>
                                                            {isActiveCard && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: [0, 0.7, 0] }}
                                                                    transition={{ duration: 1.1, ease: 'easeOut' }}
                                                                    className="absolute inset-0 pointer-events-none"
                                                                >
                                                                    <div className="absolute inset-0 ring-2 ring-emerald-300/60 rounded-xl" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                </LayoutGroup>
                            )}

                            <div className="flex-1" />

                            {/* INFO — always matches the CENTER card */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={item?.id || item?._id || 'info'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="w-full text-center pb-2"
                                >
                                    <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                                        <span className="px-3 py-1 rounded-full font-bold shadow-lg text-xs text-black bg-gradient-to-r from-emerald-400 to-teal-400">
                                            {isSeries ? (
                                                <><FaTv className="inline mr-1 text-[10px]" /> SERIES</>
                                            ) : (
                                                <><FaFilm className="inline mr-1 text-[10px]" /> MOVIE</>
                                            )}
                                        </span>

                                        {hasTranslator && (
                                            <TranslatorChip
                                                name={item.translator}
                                                profile={translatorProfile}
                                                isMobile={true}
                                            />
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
                                    </div>

                                    <h1
                                        className="font-black text-white leading-tight mb-2 text-2xl xs:text-3xl line-clamp-2"
                                        style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
                                    >
                                        {item?.title}
                                    </h1>

                                    {hasNewEpisode && item.latestEpisode && (
                                        <h2 className="text-emerald-300 font-semibold text-xs mb-2 line-clamp-1">
                                            ▶ {item.latestEpisode.title}
                                        </h2>
                                    )}

                                    <p
                                        className="text-gray-200 leading-relaxed mx-auto mb-4 text-xs line-clamp-2 max-w-xs"
                                        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                                    >
                                        {description}
                                    </p>

                                    <div className="flex gap-2 justify-center">
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
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* =========================================== */}
                {/* DESKTOP / TABLET LAYOUT                      */}
                {/* =========================================== */}
                {!isMobile && (
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-10 pb-16">
                        <div className="max-w-7xl mx-auto w-full">
                            <div className="flex items-end justify-between gap-8">

                                <div className="flex-1 max-w-2xl">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={item?.id || item?._id || 'desktop-info'}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                        >
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="px-3.5 py-1 rounded-full font-bold shadow-lg text-xs text-black bg-gradient-to-r from-emerald-400 to-teal-400">
                                                    {isSeries ? (
                                                        <><FaTv className="inline mr-1 text-[10px]" /> SERIES</>
                                                    ) : (
                                                        <><FaFilm className="inline mr-1 text-[10px]" /> MOVIE</>
                                                    )}
                                                </span>

                                                {hasTranslator && (
                                                    <TranslatorChip
                                                        name={item.translator}
                                                        profile={translatorProfile}
                                                        isMobile={false}
                                                    />
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
                                            </div>

                                            <h1
                                                className="font-black text-white leading-tight mb-2 text-3xl sm:text-4xl md:text-5xl line-clamp-2"
                                                style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
                                            >
                                                {item?.title}
                                            </h1>

                                            {hasNewEpisode && item.latestEpisode && (
                                                <h2 className="text-emerald-300 font-semibold text-sm mb-2 line-clamp-1">
                                                    ▶ {item.latestEpisode.title}
                                                </h2>
                                            )}

                                            <p
                                                className="text-gray-200 leading-relaxed mb-4 text-sm md:text-base line-clamp-3 max-w-xl"
                                                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                                            >
                                                {description}
                                            </p>

                                            <div className="flex gap-3">
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
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {latestCards.length > 0 && (
                                    <LayoutGroup id="desktop-cards">
                                        <motion.div
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.25, duration: 0.5 }}
                                            className="flex-shrink-0 flex items-end justify-end gap-4 lg:gap-5"
                                        >
                                            {latestCards.map((movie, idx) => {
                                                const isActiveCard = idx === activeCardIndex;
                                                const key = movie?.id || movie?._id || `dcard-${idx}`;
                                                return (
                                                    <motion.button
                                                        layout
                                                        key={key}
                                                        data-card="true"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCardTap(idx);
                                                        }}
                                                        transition={{
                                                            layout: {
                                                                type: 'spring',
                                                                stiffness: 180,
                                                                damping: 26,
                                                                mass: 1.0,
                                                                restDelta: 0.001
                                                            }
                                                        }}
                                                        animate={{
                                                            scale: isActiveCard ? 1.05 : 0.95,
                                                            y: isActiveCard ? -16 : 0,
                                                            opacity: isActiveCard ? 1 : 0.7,
                                                            zIndex: isActiveCard ? 20 : 1
                                                        }}
                                                        whileTap={{ scale: 0.97 }}
                                                        whileHover={{ opacity: 1, scale: isActiveCard ? 1.06 : 0.98 }}
                                                        className={`relative flex-shrink-0 rounded-xl overflow-hidden origin-bottom ${
                                                            isActiveCard
                                                                ? 'w-[178px] lg:w-[200px] ring-2 ring-emerald-400 shadow-2xl shadow-emerald-500/60'
                                                                : 'w-[147px] lg:w-[163px]'
                                                        }`}
                                                        style={{ aspectRatio: '2 / 3' }}
                                                    >
                                                        <HeroCard movie={movie} />

                                                        <AnimatePresence>
                                                            {isActiveCard && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 8, scale: 0.6 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: 8, scale: 0.6 }}
                                                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1"
                                                                >
                                                                    <div className="w-2 h-1.5 rounded-full bg-emerald-400" />
                                                                    <div className="w-5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                                                                    <div className="w-2 h-1.5 rounded-full bg-teal-400" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        <AnimatePresence>
                                                            {isActiveCard && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: [0, 0.7, 0] }}
                                                                    transition={{ duration: 1.1, ease: 'easeOut' }}
                                                                    className="absolute inset-0 pointer-events-none"
                                                                >
                                                                    <div className="absolute inset-0 ring-2 ring-emerald-300/60 rounded-xl" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.button>
                                                );
                                            })}
                                        </motion.div>
                                    </LayoutGroup>
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
    const [isMobile, setIsMobile] = useState(false);
    const [translatorProfiles, setTranslatorProfiles] = useState({});
    const [orderedCards, setOrderedCards] = useState([]);
    const [isPaused, setIsPaused] = useState(false);

    const autoRotateRef = useRef(null);
    const userPauseRef = useRef(false);

    // 🔑 The 3 cards we show in the hero
    const baseLatestThree = useMemo(() => {
        if (latestCards && latestCards.length > 0) {
            return latestCards.slice(0, 3);
        }
        return (items || []).slice(0, 3);
    }, [latestCards, items]);

    useEffect(() => {
        setOrderedCards(baseLatestThree);
    }, [baseLatestThree]);

    // 🔑 CURRENT HERO ITEM = the CENTER card (index 1)
    const centerCard = useMemo(() => {
        if (!orderedCards || orderedCards.length === 0) return null;
        const centerIdx = Math.min(1, orderedCards.length - 1);
        return orderedCards[centerIdx];
    }, [orderedCards]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const list = await getTranslatorsWithProfiles(items || []);
                if (cancelled || !Array.isArray(list)) return;
                const map = {};
                list.forEach((t) => {
                    if (t?.name) {
                        map[t.name] = {
                            display_name: t.display_name || t.name,
                            photo_url: t.photo_url || ''
                        };
                    }
                });
                setTranslatorProfiles(map);
            } catch (err) {
                console.warn('HeroSlider: failed to load translator profiles', err);
            }
        })();
        return () => { cancelled = true; };
    }, [items]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ⭐ AUTO-ROTATE every 6 seconds
    useEffect(() => {
        if (isPaused) return;
        if (!orderedCards || orderedCards.length <= 1) return;

        autoRotateRef.current = setInterval(() => {
            if (userPauseRef.current) {
                userPauseRef.current = false;
                return;
            }
            setOrderedCards((prev) =>
                prev && prev.length > 1 ? rotateCards(prev, 1) : prev
            );
        }, 6000);

        return () => {
            if (autoRotateRef.current) clearInterval(autoRotateRef.current);
        };
    }, [isPaused, orderedCards?.length]);

    // Register user interaction → pause auto for 7s
    const registerUserInteraction = useCallback(() => {
        userPauseRef.current = true;
        setTimeout(() => { userPauseRef.current = false; }, 7000);
    }, []);

    // Card tap
    const handleCardSelect = useCallback((idx) => {
        if (!orderedCards || orderedCards.length === 0) return;

        const centerIdx = Math.min(1, orderedCards.length - 1);
        const clickedCard = orderedCards[idx];
        const centeredCard = orderedCards[centerIdx];

        if (!clickedCard) return;

        // Tapping the center card = play it
        if (clickedCard === centeredCard) {
            if (onCardClick) onCardClick(clickedCard);
            return;
        }

        // Otherwise, swap clicked card to center
        const reordered = reorderWithClickedInCenter(orderedCards, idx);
        setOrderedCards(reordered);
    }, [orderedCards, onCardClick]);

    const goNext = useCallback(() => {
        setOrderedCards((prev) =>
            prev && prev.length > 1 ? rotateCards(prev, 1) : prev
        );
    }, []);

    const goPrev = useCallback(() => {
        setOrderedCards((prev) =>
            prev && prev.length > 1 ? rotateCards(prev, -1) : prev
        );
    }, []);

    const handlePlayClick = useCallback((item, event) => {
        if (onPlay) onPlay(item, event);
    }, [onPlay]);

    const handleInfoClick = useCallback((item, event) => {
        if (onInfo) onInfo(item, event);
    }, [onInfo]);

    if (!orderedCards || orderedCards.length === 0 || !centerCard) return null;

    const activeCardIndex = Math.min(1, orderedCards.length - 1);

    return (
        <section
            className={`relative overflow-hidden bg-black select-none -mt-px ${
                isMobile
                    ? 'h-[92vh] min-h-[620px] max-h-[780px]'
                    : 'h-[88vh] min-h-[620px] max-h-[820px]'
            }`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative w-full h-full">
                {/* 🔑 Only ONE HeroSlide is rendered — for the CENTER card.
                    Its content always matches the centered card. */}
                <HeroSlide
                    key={centerCard?.id || centerCard?._id || 'hero-center'}
                    item={centerCard}
                    isActive={true}
                    onPlay={handlePlayClick}
                    onInfo={handleInfoClick}
                    isMobile={isMobile}
                    latestCards={orderedCards}
                    onCardClick={onCardClick}
                    activeCardIndex={activeCardIndex}
                    onCardSelect={handleCardSelect}
                    translatorProfile={
                        centerCard?.translator ? translatorProfiles[centerCard.translator] : null
                    }
                    onSwipeLeft={goNext}
                    onSwipeRight={goPrev}
                    onUserInteract={registerUserInteraction}
                />
            </div>

            {/* Dots */}
            {orderedCards.length > 1 && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 flex gap-1.5 md:gap-2 ${
                    isMobile ? 'bottom-3' : 'bottom-5 md:bottom-6'
                }`}>
                    {orderedCards.map((card, index) => (
                        <button
                            key={card?.id || card?._id || index}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                registerUserInteraction();
                                setOrderedCards((prev) =>
                                    prev && prev.length > 1
                                        ? reorderWithClickedInCenter(prev, index)
                                        : prev
                                );
                            }}
                            className="group focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span
                                className={`block transition-all duration-300 rounded-full ${
                                    index === activeCardIndex
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

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800/40 z-30">
                <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
                    style={{ width: `${((activeCardIndex + 1) / orderedCards.length) * 100}%` }}
                />
            </div>

            {/* Counter */}
            {orderedCards.length > 1 && (
                <div className={`absolute z-30 bg-black/60 backdrop-blur-sm rounded-full border border-emerald-500/30 ${
                    isMobile
                        ? 'bottom-3 right-3 px-2 py-0.5 text-[10px]'
                        : 'bottom-5 md:bottom-6 right-4 md:right-6 px-3 py-1 text-xs'
                }`}>
                    <span className="text-emerald-400 font-bold">{activeCardIndex + 1}</span>
                    <span className="text-white">/{orderedCards.length}</span>
                </div>
            )}
        </section>
    );
};

export default HeroSlider;