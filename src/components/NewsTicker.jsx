// src/components/NewsTicker.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFire, FaTv, FaFilm, FaUser, FaStar, FaArrowRight, FaSpinner
} from 'react-icons/fa';
import {
  fetchTrendingMovies,
  fetchTrendingTV,
  fetchTrendingPeople,
  tmdbImage,
} from '../lib/tmdb';

export default function NewsTicker({ movies = [] }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [movieRes, tvRes, peopleRes] = await Promise.all([
          fetchTrendingMovies('day'),
          fetchTrendingTV('day'),
          fetchTrendingPeople('day'),
        ]);

        if (cancelled) return;

        const topMovie = movieRes[0];
        const topTV = tvRes[0];
        const topPerson = peopleRes[0];

        const cards = [];

        if (topMovie) {
          cards.push({
            id: `movie-${topMovie.id}`,
            type: 'movie',
            tmdbId: topMovie.id,
            title: topMovie.title || topMovie.name,
            description: topMovie.overview,
            image: topMovie.backdrop_path || topMovie.poster_path,
            rating: topMovie.vote_average?.toFixed(1),
            year: (topMovie.release_date || '').slice(0, 4),
            category: 'Trending Movie',
            categoryIcon: FaFilm,
            badgeColor: 'from-emerald-600 to-teal-600',
          });
        }

        if (topTV) {
          cards.push({
            id: `tv-${topTV.id}`,
            type: 'series',
            tmdbId: topTV.id,
            title: topTV.name,
            description: topTV.overview,
            image: topTV.backdrop_path || topTV.poster_path,
            rating: topTV.vote_average?.toFixed(1),
            year: (topTV.first_air_date || '').slice(0, 4),
            category: 'Trending Series',
            categoryIcon: FaTv,
            badgeColor: 'from-teal-600 to-cyan-600',
          });
        }

        if (topPerson) {
          const knownFor = topPerson.known_for?.[0];
          cards.push({
            id: `person-${topPerson.id}`,
            type: 'person',
            tmdbId: topPerson.id,
            title: topPerson.name,
            description: knownFor
              ? `Known for: ${knownFor.title || knownFor.name}`
              : 'Popular actor right now',
            image: topPerson.profile_path,
            knownForTitle: knownFor?.title || knownFor?.name || '',
            category: 'Popular Actor',
            categoryIcon: FaUser,
            badgeColor: 'from-cyan-600 to-emerald-600',
          });
        }

        setItems(cards);
      } catch (err) {
        console.error('NewsTicker fetch failed:', err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCardClick = (card) => {
    // Try to find a local match first
    if (card.type !== 'person') {
      const localMatch = movies.find(
        (m) => m.title?.toLowerCase() === card.title?.toLowerCase()
      );
      if (localMatch) {
        if (localMatch.type === 'series') {
          navigate(`/series-player/${localMatch.id}`);
        } else {
          navigate(`/player/${localMatch.id}`);
        }
        return;
      }
    }

    if (card.type === 'person') {
      navigate(`/actor/${card.tmdbId}`);
    } else {
      // Fall back to search
      navigate(`/movies?search=${encodeURIComponent(card.title)}`);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-10">
          <FaSpinner className="text-emerald-500 text-2xl animate-spin" />
          <span className="text-gray-400 ml-3 text-sm">Loading news…</span>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <FaFire className="text-amber-500" />
          <span className="hidden xs:inline">What's Hot Right Now</span>
          <span className="xs:hidden">Trending</span>
        </h2>
        <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
          Live from TMDB
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((card) => {
          const Icon = card.categoryIcon;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="group relative text-left bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-emerald-900/30 overflow-hidden hover:border-emerald-500/50 hover:scale-[1.02] transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-900">
                {card.image ? (
                  <img
                    src={tmdbImage(card.image, card.type === 'person' ? 'w342' : 'w780')}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Icon className="text-5xl" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${card.badgeColor} text-black text-[10px] font-bold shadow-lg`}>
                    <Icon className="text-[9px]" />
                    {card.category}
                  </span>
                </div>

                {/* Rating badge */}
                {card.rating && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/30">
                      <FaStar className="text-[8px]" />
                      {card.rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm sm:text-base line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {card.title}
                </h3>

                {card.type !== 'person' && card.year && (
                  <p className="text-[10px] text-gray-500 mt-0.5">{card.year}</p>
                )}

                {card.description && (
                  <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                    {card.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold group-hover:gap-2 transition-all">
                  <span>
                    {card.type === 'person' ? 'View Profile' :
                     card.type === 'series' ? 'Watch Series' :
                     'Explore Movie'}
                  </span>
                  <FaArrowRight className="text-[8px]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}