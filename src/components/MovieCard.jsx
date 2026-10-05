// src/components/MovieCard.jsx
import { FaPlay, FaStar, FaHeart, FaRegHeart, FaClock } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie, onSeriesClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const getMovieParts = (movie) => {
    if (!movie) return [];
    if (movie.parts && Array.isArray(movie.parts)) return movie.parts;
    if (movie.download) {
      try {
        const parsed = typeof movie.download === 'string' ? JSON.parse(movie.download) : movie.download;
        if (Array.isArray(parsed)) return parsed;
        else if (parsed && parsed.parts && Array.isArray(parsed.parts)) return parsed.parts;
      } catch (e) { /* Not JSON */ }
    }
    return [];
  };

  const hasPlayableContent = (movie) => {
    if (!movie) return false;
    if (movie.videoUrl || movie.streamLink) return true;
    const parts = getMovieParts(movie);
    if (parts.length > 0) return true;
    if (movie.embedCode) return true;
    return false;
  };

  const parts = getMovieParts(movie);
  const hasContent = hasPlayableContent(movie);

  const rating = movie?.rating || (movie?.vote_average ? Number(movie.vote_average).toFixed(1) : null);
  const translator = movie?.translator || '';
  const year = movie?.year || movie?.release_date?.split('-')[0] || '';
  const category = movie?.category?.split(',')[0]?.trim() || '';

  // ── Is this a "new" upload? (uploaded in the last 14 days) ──
  const uploadedDateStr = movie?.created_at || movie?.uploaded_at || movie?.timestamp;
  const isNewUpload = (() => {
    if (!uploadedDateStr) return false;
    try {
      const uploaded = new Date(uploadedDateStr);
      const now = new Date();
      const diffDays = (now - uploaded) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 14;
    } catch (e) {
      return false;
    }
  })();

  const formatUploadedTime = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));

      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      else if (diffHours < 24) return `${diffHours}h ago`;
      else if (diffDays === 1) return 'Yesterday';
      else if (diffDays < 7) return `${diffDays}d ago`;
      else if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) { return null; }
  };

  const uploadedTime = formatUploadedTime(uploadedDateStr);

  const handleWatchNow = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!hasContent) {
      alert("⚠️ Content not available yet");
      return;
    }

    if (movie?.type === 'series') {
      if (onSeriesClick) {
        onSeriesClick(movie);
      } else {
        const movieId = movie?.id || movie?._id || Date.now().toString();
        navigate(`/series-player/${movieId}`, { state: { series: movie } });
      }
      return;
    }

    const movieId = movie?.id || movie?._id || Date.now().toString();

    if (parts.length > 0) {
      navigate(`/player/${movieId}`, {
        state: {
          movie: {
            ...movie,
            parts: parts,
            hasParts: true,
            videoUrl: parts[0]?.videoUrl || movie.videoUrl,
            streamLink: parts[0]?.streamLink || movie.streamLink
          }
        }
      });
    } else {
      navigate(`/player/${movieId}`, {
        state: { movie: { ...movie, hasParts: false } }
      });
    }
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const posterUrl = imageError
    ? "https://via.placeholder.com/300x450?text=No+Poster"
    : (movie?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop");

  const isSeries = movie?.type === 'series';

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-300 ease-out
        w-full
        ${isHovered ? 'sm:-translate-y-1' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWatchNow}
    >
      {/* ═══════════ POSTER ═══════════ */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-900 shadow-lg shadow-black/40">

        <img
          src={posterUrl}
          alt={movie?.title}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            isHovered ? 'sm:scale-105' : 'scale-100'
          }`}
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Soft bottom gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* ─── HOVER OVERLAY (desktop only) ─── */}
        <div
          className={`hidden sm:flex absolute inset-0 items-center justify-center bg-black/50 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {hasContent ? (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500
              flex items-center justify-center shadow-2xl shadow-emerald-500/60 ring-2 ring-white/40">
              <FaPlay className="text-black text-base ml-0.5" />
            </div>
          ) : (
            <span className="text-black text-xs font-bold
              bg-gradient-to-r from-amber-400 to-yellow-400
              px-3 py-1.5 rounded-full shadow-lg">
              Coming Soon
            </span>
          )}
        </div>

        {/* ═══════════ TOP ROW: Type + NEW on left, Rating on right ═══════════ */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between gap-1 z-10">

          {/* Left cluster: Type + optional NEW */}
          <div className="flex items-center gap-1 min-w-0">
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px]
                font-black tracking-wider uppercase backdrop-blur-sm shadow flex-shrink-0
                ${isSeries
                  ? 'bg-emerald-500/95 text-black'
                  : 'bg-cyan-500/95 text-black'
                }`}
            >
              {isSeries ? 'Series' : 'Movie'}
            </span>

            {isNewUpload && (
              <span
                className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px]
                  font-black tracking-wider uppercase backdrop-blur-sm shadow flex-shrink-0
                  bg-gradient-to-r from-amber-400 to-yellow-400 text-black
                  animate-pulse"
                style={{ animationDuration: '2s' }}
              >
                New
              </span>
            )}
          </div>

          {/* Right cluster: Rating only */}
          {rating && (
            <span className="inline-flex items-center gap-0.5
              px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold
              bg-black/70 backdrop-blur-sm border border-amber-400/40 text-amber-300 shadow
              flex-shrink-0">
              <FaStar className="text-[7px] text-amber-400" />
              {rating}
            </span>
          )}
        </div>

        {/* ═══════════ BOTTOM ROW: Year on left, Like on right ═══════════ */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 z-10">

          {/* Year pill (or empty spacer so like stays right) */}
          {year ? (
            <span className="px-1.5 py-0.5 rounded
              text-[8px] sm:text-[9px] font-semibold text-white/90
              bg-black/60 backdrop-blur-sm">
              {year}
            </span>
          ) : (
            <span />
          )}

          {/* Like button */}
          <button
            onClick={toggleLike}
            aria-label="Like"
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0
              flex items-center justify-center transition-all duration-200
              ${liked
                ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                : 'bg-black/60 backdrop-blur-sm hover:bg-black/80'
              }`}
          >
            {liked ? (
              <FaHeart className="text-black text-[10px] sm:text-xs" />
            ) : (
              <FaRegHeart className="text-white text-[10px] sm:text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* ═══════════ INFO BELOW POSTER ═══════════ */}
      <div className="pt-2 sm:pt-2.5">

        {/* Title */}
        <h3 className="text-white text-[11px] xs:text-xs sm:text-sm font-semibold
          line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors duration-200">
          {movie?.title || 'Untitled'}
        </h3>

        {/* Translator — clear, prominent, full name */}
        {translator && (
          <p className="mt-1 text-[9px] xs:text-[10px] sm:text-[11px] font-medium
            text-emerald-400 truncate" title={translator}>
            {translator}
          </p>
        )}

        {/* Meta row: category • time */}
        {(category || uploadedTime) && (
          <div className="flex items-center gap-1 mt-0.5 text-[8px] xs:text-[9px] sm:text-[10px] text-gray-500">
            {category && (
              <span className="truncate">{category}</span>
            )}
            {category && uploadedTime && (
              <span className="text-gray-700">•</span>
            )}
            {uploadedTime && (
              <span className="inline-flex items-center gap-0.5 text-emerald-500/80 flex-shrink-0">
                <FaClock className="text-[7px]" />
                {uploadedTime}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}