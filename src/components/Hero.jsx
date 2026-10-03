import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import MovieCard from './MovieCard';

/* ------------------------------------------------------------------
   Helper: latest 3 movies from the hero list
------------------------------------------------------------------- */
const getLatestThree = (items) => {
  if (!items || items.length === 0) return [];
  return items.slice(0, 3);
};

/* ------------------------------------------------------------------
   Hero Slide
   Background sized for 3072x1728 (16:9) images — no zoom
------------------------------------------------------------------- */
const HeroSlide = ({
  item,
  isActive,
  onPlay,
  onInfo,
  isMobile,
  latestThree
}) => {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgError, setBgError] = useState(false);

  const rawBg = item?.background || item?.poster || '';
  const bgUrl = rawBg && !bgError ? rawBg : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop';

  const isSeries = item?.type === 'series' || item?.latestEpisode;
  const hasNewEpisode = !!item?.latestEpisode;
  const hasTranslator = !!item?.translator && item.translator.trim() !== '';

  const handlePlayClick = useCallback((e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (onPlay) onPlay(item, e);
  }, [item, onPlay]);

  const handleInfoClick = useCallback((e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (onInfo) onInfo(item, e);
  }, [item, onInfo]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={`absolute inset-0 ${isActive ? 'z-10' : 'z-0 pointer-events-none'}`}
    >
      <div className="relative w-full h-full overflow-hidden">

        {/* ================================================== */}
        {/* BACKGROUND — sized for 3072x1728 (16:9) images      */}
        {/*                                                     */}
        {/* Key settings:                                       */}
        {/*  • backgroundSize: 'cover'  → fills the whole hero  */}
        {/*  • backgroundPosition: 'center center' → centers    */}
        {/*    the image so the middle of your 3072x1728 is     */}
        {/*    always visible, edges may crop slightly          */}
        {/*  • NO transform, NO scale, NO blur → image shows    */}
        {/*    exactly as uploaded, no zoom                     */}
        {/* ================================================== */}
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            filter: 'none',
            transform: 'none',
            // Browser hint for smoother rendering at large sizes
            imageRendering: 'auto',
          }}
          onLoad={() => setBgLoaded(true)}
          onError={() => setBgError(true)}
        />

        {/* Loading skeleton */}
        {!bgLoaded && isActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Dark gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent hidden md:block" />

        {isMobile && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
          </>
        )}

        {/* ---------- CONTENT ---------- */}
        <div className={`absolute inset-0 z-20 flex items-center ${isMobile ? 'p-4' : 'p-6 md:p-10'}`}>
          <div className="max-w-7xl mx-auto w-full">
            <div className={`flex flex-col ${isMobile ? 'gap-4' : 'md:flex-row md:items-center md:justify-between gap-8'}`}>

              {/* LEFT — MOVIE INFO */}
              <div className={`w-full ${isMobile ? '' : 'md:w-1/2 lg:w-3/5'}`}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3"
                >
                  <span className={`px-2 md:px-3.5 py-0.5 md:py-1 rounded-full font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white ${isMobile ? 'text-[9px]' : 'text-[11px] md:text-xs'}`}>
                    {isSeries ? (
                      <><FaTv className="inline mr-1 text-[7px] md:text-[9px]" /> SERIES</>
                    ) : (
                      <><FaFilm className="inline mr-1 text-[7px] md:text-[9px]" /> MOVIE</>
                    )}
                  </span>

                  {hasTranslator && (
                    <span className={`px-2 md:px-3.5 py-0.5 md:py-1 rounded-full bg-blue-600 text-white font-semibold flex items-center gap-1 shadow-lg ${isMobile ? 'text-[9px]' : 'text-[11px] md:text-xs'}`}>
                      <FaLanguage className="text-[7px] md:text-[9px]" />
                      {item.translator}
                    </span>
                  )}

                  {hasNewEpisode && (
                    <span className={`px-2 md:px-3.5 py-0.5 md:py-1 rounded-full bg-green-600 text-white font-semibold flex items-center gap-1 animate-pulse shadow-lg ${isMobile ? 'text-[9px]' : 'text-[11px] md:text-xs'}`}>
                      <FaPlusCircle className="text-[7px] md:text-[9px]" />
                      {!isMobile && 'NEW EPISODE'}
                      {isMobile && 'NEW'}
                    </span>
                  )}

                  {item?.rating && (
                    <span className={`flex items-center gap-1 text-yellow-400 bg-black/50 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-sm shadow-lg ${isMobile ? 'text-[9px]' : 'text-[11px] md:text-xs'}`}>
                      <FaStar className="text-[7px] md:text-[9px]" />
                      {item.rating}
                    </span>
                  )}
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={`font-bold text-white leading-tight drop-shadow-lg ${isMobile ? 'text-2xl mb-1' : 'text-3xl sm:text-4xl md:text-5xl mb-2'}`}
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                >
                  {item?.title}
                </motion.h1>

                {hasNewEpisode && item.latestEpisode && (
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className={`text-purple-300 font-medium drop-shadow-md ${isMobile ? 'text-[10px] mb-1' : 'text-sm md:text-base mb-2'}`}
                  >
                    Latest: {item.latestEpisode.title}
                  </motion.h2>
                )}

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className={`text-gray-200 drop-shadow-md leading-relaxed ${isMobile ? 'text-[10px] mb-3 line-clamp-2' : 'text-sm md:text-base mb-4 line-clamp-3 max-w-xl'}`}
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
                    className={`bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold flex items-center gap-1.5 shadow-xl transition-all duration-300 active:scale-95 hover:shadow-lg ${isMobile ? 'px-4 py-2 text-[11px]' : 'px-6 md:px-7 py-2 md:py-2.5 text-sm md:text-base'} hover:from-purple-700 hover:to-pink-700 transform hover:scale-105`}
                  >
                    <FaPlay className={isMobile ? 'text-[9px]' : 'text-xs md:text-sm'} />
                    <span>{hasNewEpisode ? 'Watch Latest' : 'Watch Now'}</span>
                  </button>
                  <button
                    onClick={handleInfoClick}
                    className={`bg-black/50 backdrop-blur-sm rounded-lg text-white font-semibold flex items-center gap-1.5 border border-white/20 transition-all duration-300 active:scale-95 hover:bg-black/70 ${isMobile ? 'px-4 py-2 text-[11px]' : 'px-6 md:px-7 py-2 md:py-2.5 text-sm md:text-base'} transform hover:scale-105`}
                  >
                    <FaInfoCircle className={isMobile ? 'text-[9px]' : 'text-xs md:text-sm'} />
                    <span>Info</span>
                  </button>
                </motion.div>
              </div>

              {/* RIGHT — 3 LATEST MOVIE CARDS */}
              {!isMobile && latestThree.length > 0 && (
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="md:w-1/2 lg:w-2/5 flex items-center justify-end gap-3 lg:gap-4"
                >
                  {latestThree.map((movie, idx) => (
                    <div
                      key={movie?.id || movie?._id || idx}
                      className="transform transition-all duration-500 hover:scale-105"
                      style={{ transform: `rotate(${(idx - 1) * 1.5}deg)` }}
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Mobile cards */}
            {isMobile && latestThree.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex gap-2 mt-4 overflow-x-auto pb-2"
              >
                {latestThree.map((movie, idx) => (
                  <div key={movie?.id || movie?._id || idx} className="flex-shrink-0">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------
   Main HeroSlider
------------------------------------------------------------------- */
const HeroSlider = ({ items, onPlay, onInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayRef = useRef(null);
  const itemsRef = useRef(items);
  const isSwiping = useRef(false);

  const latestThree = useMemo(() => getLatestThree(items), [items]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isAutoPlaying && items.length > 1 && !isMobile) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 6000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, items.length, isMobile]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => {
      if (!isMobile) setIsAutoPlaying(true);
    }, 10000);
  }, [isMobile]);

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
    if (isInteractive) return;
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
      if (!isMobile) setIsAutoPlaying(true);
    }, 5000);
  }, [touchStart, touchEnd, nextSlide, prevSlide, isMobile]);

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

  if (!items || items.length === 0) return null;

  return (
    <section
      className={`relative overflow-hidden bg-black select-none ${isMobile ? 'h-[80vh] sm:h-[85vh]' : 'h-[85vh] md:h-[90vh] lg:h-[95vh]'}`}
      onMouseEnter={() => !isMobile && setIsAutoPlaying(false)}
      onMouseLeave={() => !isMobile && setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <HeroSlide
              key={item?.id || item?._id || index}
              item={item}
              isActive={index === currentIndex}
              onPlay={handlePlayClick}
              onInfo={handleInfoClick}
              isMobile={isMobile}
              latestThree={latestThree}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 flex gap-1.5 md:gap-2 ${isMobile ? 'bottom-4' : 'bottom-5 md:bottom-6'}`}>
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              className="group focus:outline-none"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block transition-all duration-300 rounded-full ${index === currentIndex
                  ? isMobile ? 'w-4 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600' : 'w-6 md:w-8 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600'
                  : isMobile ? 'w-1.5 h-0.5 bg-gray-500 group-hover:bg-gray-400' : 'w-2 md:w-3 h-0.5 bg-gray-500 group-hover:bg-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Arrows */}
      {items.length > 1 && !isMobile && (
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
          style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* Counter */}
      {items.length > 1 && (
        <div className={`absolute z-30 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 ${isMobile ? 'top-2 right-2 px-1.5 py-0.5 text-[9px]' : 'top-4 md:top-6 right-4 md:right-6 px-2 py-1 text-[11px] md:text-xs'}`}>
          <span className="text-purple-400 font-bold">{currentIndex + 1}</span>
          <span className="text-white">/{items.length}</span>
        </div>
      )}
    </section>
  );
};

export default HeroSlider;