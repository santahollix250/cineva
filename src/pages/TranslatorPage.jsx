// src/pages/TranslatorPage.jsx
import { useContext, useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoviesContext } from '../context/MoviesContext';
import { getTranslatorsWithProfiles } from '../lib/translators';
import {
  FaFilm, FaTv, FaUser, FaSearch, FaLanguage, FaArrowLeft,
  FaStar, FaCheckCircle
} from 'react-icons/fa';

export default function TranslatorPage() {
  const { movies = [] } = useContext(MoviesContext);
  const location = useLocation();

  const [translators, setTranslators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState(null);

  // ✅ Auto-open from home page click
  useEffect(() => {
    if (location.state?.openTranslator) {
      setSelectedName(location.state.openTranslator);
    }
  }, [location.state]);

  // Load translators with profiles
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const list = await getTranslatorsWithProfiles(movies);
      if (!cancelled) {
        setTranslators(list);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [movies]);

  // Build map name -> {movies: [...], series: [...]}
  const byName = useMemo(() => {
    const map = new Map();
    translators.forEach((t) => map.set(t.name, { movies: [], series: [] }));
    movies.forEach((m) => {
      const name = (m?.translator || '').trim();
      if (!name) return;
      if (!map.has(name)) map.set(name, { movies: [], series: [] });
      const entry = map.get(name);
      if (m.type === 'movie') entry.movies.push(m);
      else if (m.type === 'series') entry.series.push(m);
    });
    return map;
  }, [movies, translators]);

  const filtered = useMemo(() => {
    if (!searchTerm) return translators;
    return translators.filter((t) =>
      (t.display_name || t.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [translators, searchTerm]);

  const selected = selectedName ? byName.get(selectedName) : null;
  const selectedProfile = selectedName
    ? translators.find((t) => t.name === selectedName)
    : null;

  // ---------- DETAIL VIEW ----------
  if (selected && selectedProfile) {
    const allContent = [...selected.movies, ...selected.series];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => setSelectedName(null)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all duration-300 hover:scale-105 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Translators
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-2xl p-6 mb-8 border border-emerald-500/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-500/50 shadow-2xl shadow-emerald-500/30 bg-gray-800 flex-shrink-0">
                {selectedProfile.photo_url ? (
                  <img
                    src={selectedProfile.photo_url}
                    alt={selectedProfile.display_name || selectedProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaUser className="text-4xl" />
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {selectedProfile.display_name || selectedProfile.name}
                </h1>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-xs">
                    <FaFilm /> {selected.movies.length} Movies
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs">
                    <FaTv /> {selected.series.length} Series
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-xs">
                    <FaCheckCircle /> Total: {allContent.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allContent.map((item) => (
              <Link
                key={item.id}
                to={
                  item.type === 'movie'
                    ? `/player/${item.id}`
                    : `/series-player/${item.id}`
                }
                className="group cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden bg-gray-800 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <img
                    src={
                      item.poster ||
                      'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'
                    }
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    {item.type === 'movie' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-cyan-600 to-emerald-600 text-black text-[10px] font-bold rounded-lg">
                        <FaFilm className="text-[9px]" /> MOVIE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-black text-[10px] font-bold rounded-lg">
                        <FaTv className="text-[9px]" /> SERIES
                      </span>
                    )}
                  </div>
                  {item.rating && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/30">
                        <FaStar className="text-[9px]" /> {item.rating}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.year && (
                    <p className="text-gray-400 text-xs">{item.year}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- LIST VIEW ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full mb-4 shadow-lg shadow-emerald-500/30">
            <FaLanguage className="text-3xl text-black" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Our Translators
          </h1>
          <p className="text-gray-400">
            Browse movies and series by the translator who made them
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search translator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading translators…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No translators found</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedName(t.name)}
                className="group flex flex-col items-center text-center bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 hover:border-emerald-500/50 hover:scale-105 transition-all duration-300"
              >
                <div className="relative mb-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-emerald-500/40 group-hover:border-emerald-500/80 transition-colors bg-gray-800">
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.display_name || t.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <FaUser className="text-3xl" />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {t.display_name || t.name}
                </h3>

                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {t.movies > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-cyan-600/20 text-cyan-400 rounded-full text-[10px]">
                      <FaFilm className="text-[8px]" /> {t.movies}
                    </span>
                  )}
                  {t.series > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-600/20 text-emerald-400 rounded-full text-[10px]">
                      <FaTv className="text-[8px]" /> {t.series}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-teal-600/20 text-teal-400 rounded-full text-[10px]">
                    <FaCheckCircle className="text-[8px]" /> {t.total}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}