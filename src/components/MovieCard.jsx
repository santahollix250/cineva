// src/components/MovieCard.jsx
import { FaPlay, FaStar, FaHeart, FaRegHeart, FaClock, FaLayerGroup } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie, onSeriesClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // ⭐ Bulletproof parts parser — handles every shape the DB might return
  const getMovieParts = (m) => {
    if (!m) return [];

    const tryParse = (value) => {
      if (!value) return null;
      let v = value;
      for (let i = 0; i < 3; i++) {
        if (typeof v === 'string') {
          try { v = JSON.parse(v); } catch { return null; }
        } else break;
      }
      return v;
    };

    // 1. Already an array on movie.parts
    if (Array.isArray(m.parts) && m.parts.length > 0) {
      return m.parts;
    }

    // 2. Parse from download
    const parsed = tryParse(m.download);
    if (parsed) {
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed.parts && Array.isArray(parsed.parts) && parsed.parts.length > 0) {
        return parsed.parts;
      }
      // ⭐ Single part object → wrap in array
      if (
        typeof parsed === 'object' &&
        (parsed.title || parsed.partNumber || parsed.videoUrl || parsed.download_link)
      ) {
        return [parsed];
      }
    }

    return [];
  };

  const hasPlayableContent = (m) => {
    if (!m) return false;
    if (m.videoUrl || m.streamLink) return true;
    const p = getMovieParts(m);
    if (p.length > 0) return true;
    if (m.embedCode) return true;
    return false;
  };

  const parts = getMovieParts(movie);
  const hasContent = hasPlayableContent(movie);

  const rating = movie?.rating || (movie?.vote_average ? Number(movie.vote_average).toFixed(1) : null);
  const translator = movie?.translator || '';
  const year = movie?.year || movie?.release_date?.split('-')[0] || '';
  const category = movie?.category?.split(',')[0]?.trim() || '';

  const isSeries = movie?.type === 'series';

  const latestEpisode = movie?.latestEpisode || null;
  const hasLatestEpisode = isSeries && !!latestEpisode;

  const effectivePoster = (() => {
    if (hasLatestEpisode && latestEpisode.thumbnail) return latestEpisode.thumbnail;
    return movie?.poster || movie?.background;
  })();

  const uploadedDateStr = (() => {
    if (hasLatestEpisode) {
      return latestEpisode.created_at || latestEpisode.airDate || movie?.created_at;
    }
    return movie?.created_at || movie?.uploaded_at || movie?.timestamp;
  })();

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
      if (hasLatestEpisode && onSeriesClick) {
        onSeriesClick(movie, latestEpisode);
        return;
      }
      if (onSeriesClick) {
        onSeriesClick(movie);
      } else {
        const movieId = movie?.id || movie?._id || Date.now().toString();
        navigate(`/series-player/${movieId}`, { state: { series: movie } });
      }
      return;
    }

    const movieId = movie?.id || movie?._id || Date.now().toString();

    // ⭐ Recompute parts locally so we always pass a proper array
    const partsToSend = getMovieParts(movie);
    const firstPart = partsToSend.length > 0 ? partsToSend[0] : null;
    const firstPartUrl = firstPart?.videoUrl || firstPart?.streamLink || "";

    const movieToPlay = {
      ...movie,
      parts: partsToSend,
      hasParts: partsToSend.length > 0,
      download: movie.download,
      videoUrl: movie.videoUrl || firstPartUrl || null,
      streamLink: movie.streamLink || firstPartUrl || null,
      download_link: movie.download_link || movie.download
    };

    navigate(`/player/${movieId}`, { state: { movie: movieToPlay } });
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const posterUrl = imageError || !effectivePoster
    ? "https://via.placeholder.com/300x450?text=No+Poster"
    : effectivePoster;

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
          {year ? (
            <span className="px-1.5 py-0.5 rounded
              text-[8px] sm:text-[9px] font-semibold text-white/90
              bg-black/60 backdrop-blur-sm">
              {year}
            </span>
          ) : (
            <span />
          )}

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
        <h3 className="text-white text-[11px] xs:text-xs sm:text-sm font-semibold
          line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors duration-200">
          {movie?.title || 'Untitled'}
        </h3>

        {hasLatestEpisode && latestEpisode?.title && (
          <p
            className="mt-0.5 text-[9px] xs:text-[10px] sm:text-[11px] font-medium
              text-cyan-400/90 truncate flex items-center gap-1"
            title={latestEpisode.title}
          >
            <FaLayerGroup className="text-[7px] flex-shrink-0 text-cyan-500" />
            <span className="truncate text-cyan-400/95">{latestEpisode.title}</span>
          </p>
        )}

        {translator && (
          <p className="mt-1 text-[9px] xs:text-[10px] sm:text-[11px] font-medium
            text-emerald-400 truncate" title={translator}>
            {translator}
          </p>
        )}

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