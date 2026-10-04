// src/components/MovieCast.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { loadCastForMovie, tmdbImage } from '../lib/tmdb';

export default function MovieCast({ movieId, max = 12 }) {
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const list = await loadCastForMovie(movieId);
      if (!cancelled) {
        setCast((list || []).slice(0, max));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [movieId, max]);

  const scrollBy = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  const handleActorClick = (member) => {
    if (!member?.tmdb_person_id) return;
    navigate(`/actor/${member.tmdb_person_id}`);
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-gray-500 text-sm">Loading cast…</div>
    );
  }

  if (cast.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
            <FaUser className="text-white text-xs" />
          </span>
          Top Cast
          <span className="text-xs text-gray-500 font-normal">({cast.length})</span>
        </h2>

        <div className="hidden sm:flex gap-1">
          <button
            onClick={() => scrollBy('left')}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white"
            aria-label="Scroll left"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          <button
            onClick={() => scrollBy('right')}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white"
            aria-label="Scroll right"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {cast.map((member, idx) => (
          <button
            key={member.id || `${member.name}-${idx}`}
            onClick={() => handleActorClick(member)}
            className="flex-shrink-0 w-[100px] sm:w-[120px] flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="relative mb-2">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 blur-md opacity-0 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-pink-500/40 group-hover:border-pink-500/80 transition-colors bg-gray-900">
                {member.profile_path ? (
                  <img
                    src={tmdbImage(member.profile_path, 'w185')}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaUser className="text-3xl" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
              {member.name}
            </p>
            {member.character_name && (
              <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                as {member.character_name}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}