// src/pages/ActorPage.jsx
import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaUser, FaSpinner, FaCalendar, FaGlobe,
  FaFilm, FaTv, FaStar, FaInfoCircle
} from 'react-icons/fa';
import { MoviesContext } from '../context/MoviesContext';
import { fetchPersonDetails, fetchPersonCredits, tmdbImage, findLocalMoviesForActor } from '../lib/tmdb';

export default function ActorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies = [] } = useContext(MoviesContext);

  const [person, setPerson] = useState(null);
  const [tmdbCredits, setTmdbCredits] = useState([]);
  const [localMovies, setLocalMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [details, credits, localCast] = await Promise.all([
          fetchPersonDetails(id),
          fetchPersonCredits(id),
          findLocalMoviesForActor(id),
        ]);

        if (cancelled) return;

        setPerson(details);
        const sorted = (credits.cast || [])
          .filter((c) => c.poster_path || c.backdrop_path)
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 30);
        setTmdbCredits(sorted);

        // Merge with local library
        const localIds = new Set((localCast || []).map((r) => String(r.movie_id)));
        const matched = movies.filter((m) => localIds.has(String(m.id)));
        setLocalMovies(matched);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load actor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, movies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <FaSpinner className="animate-spin text-3xl text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading actor…</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FaUser className="text-6xl text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Actor not found</h2>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg text-black text-sm font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors mb-6 text-sm font-medium group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
          {/* Photo */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 blur-2xl opacity-40" />
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-emerald-500/40 bg-gray-900 shadow-2xl">
                {person.profile_path ? (
                  <img
                    src={tmdbImage(person.profile_path, 'w342')}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaUser className="text-6xl" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">
              {person.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4 text-sm">
              {person.birthday && (
                <span className="flex items-center gap-1.5 text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-full">
                  <FaCalendar className="text-emerald-400" />
                  {new Date(person.birthday).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              )}
              {person.place_of_birth && (
                <span className="flex items-center gap-1.5 text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-full">
                  <FaGlobe className="text-teal-400" />
                  {person.place_of_birth}
                </span>
              )}
              {person.known_for_department && (
                <span className="flex items-center gap-1.5 text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-full">
                  <FaInfoCircle className="text-cyan-400" />
                  {person.known_for_department}
                </span>
              )}
            </div>

            {person.biography && (
              <div className="bg-gray-900/50 rounded-2xl p-5 border border-emerald-900/30">
                <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <FaInfoCircle /> Biography
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-6">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* In your library */}
        {localMovies.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <FaFilm className="text-emerald-500" />
              In Our Library
              <span className="text-sm text-gray-400 font-normal">({localMovies.length})</span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {localMovies.map((m) => (
                <Link
                  key={m.id}
                  to={m.type === 'series' ? `/series-player/${m.id}` : `/player/${m.id}`}
                  className="group"
                >
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-emerald-900/30 hover:border-emerald-500/50 transition-all group-hover:scale-105">
                    <img
                      src={m.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                      alt={m.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      {m.type === 'series' ? (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-black text-[9px] font-bold rounded">
                          <FaTv className="inline mr-0.5 text-[7px]" />SERIES
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-600 to-emerald-600 text-black text-[9px] font-bold rounded">
                          <FaFilm className="inline mr-0.5 text-[7px]" />MOVIE
                        </span>
                      )}
                    </div>
                    {m.rating && (
                      <div className="absolute top-2 right-2">
                        <span className="px-1.5 py-0.5 bg-black/70 text-amber-400 text-[9px] font-bold rounded">
                          <FaStar className="inline text-[7px] mr-0.5" />{m.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {m.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Full TMDB filmography */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <FaFilm className="text-teal-500" />
            Known For
            <span className="text-sm text-gray-400 font-normal">({tmdbCredits.length})</span>
          </h2>
          {tmdbCredits.length === 0 ? (
            <p className="text-gray-500 text-sm">No credits found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {tmdbCredits.map((c) => (
                <div key={`${c.id}-${c.credit_id}`} className="group">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-emerald-900/30 hover:border-emerald-500/50 transition-all group-hover:scale-105">
                    {c.poster_path ? (
                      <img
                        src={tmdbImage(c.poster_path, 'w300')}
                        alt={c.title || c.name}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                        <FaFilm className="text-3xl text-gray-700" />
                      </div>
                    )}
                    {c.character && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2">
                        <p className="text-[9px] text-emerald-300 line-clamp-1">
                          as {c.character}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-white line-clamp-2 group-hover:text-teal-400 transition-colors">
                    {c.title || c.name}
                  </p>
                  {(c.release_date || c.first_air_date) && (
                    <p className="text-[10px] text-gray-500">
                      {(c.release_date || c.first_air_date).slice(0, 4)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}