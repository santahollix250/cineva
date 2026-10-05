// src/components/CastFetcher.jsx
import { useState, useEffect } from 'react';
import {
  FaMagic, FaSearch, FaUser, FaSpinner, FaInfoCircle, FaCheckCircle
} from 'react-icons/fa';
import {
  searchTmdb, fetchTmdbCredits, saveCastForMovie, loadCastForMovie, tmdbImage,
} from '../lib/tmdb';

export default function CastFetcher({
  movie,
  onCastSaved,
  addNotification,
  // New staging props:
  stagedCast = [],
  onCastStaged,
}) {
  const isStaging = !movie?.id;
  const [open, setOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [fetchingCast, setFetchingCast] = useState(false);
  const [currentCast, setCurrentCast] = useState([]); // DB cast (edit mode)
  const [loading, setLoading] = useState(false);

  // Load existing cast from DB when editing
  useEffect(() => {
    if (!movie?.id) {
      setCurrentCast([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const cast = await loadCastForMovie(movie.id);
      if (!cancelled) {
        setCurrentCast(cast);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [movie?.id]);

  // Sync search fields with the movie form
  useEffect(() => {
    if (movie?.title) setSearchTitle(movie.title);
    if (movie?.year) setSearchYear(String(movie.year));
    if (movie?.type) setSearchType(movie.type === 'series' ? 'tv' : 'movie');
  }, [movie?.title, movie?.year, movie?.type]);

  // The cast we display: DB cast when editing, staged cast when creating
  const displayCast = isStaging ? stagedCast : currentCast;

  const handleSearch = async () => {
    if (!searchTitle.trim()) {
      addNotification?.('error', 'Enter a title first');
      return;
    }
    setSearching(true);
    setResults([]);
    try {
      const list = await searchTmdb(searchTitle.trim(), searchType, searchYear.trim());
      setResults(list);
      if (list.length === 0) addNotification?.('info', 'No results on TMDB');
    } catch (err) {
      addNotification?.('error', err.message || 'TMDB search failed');
    } finally {
      setSearching(false);
    }
  };

  const handlePickResult = async (result) => {
    setSelected(result);
    setFetchingCast(true);
    try {
      const cast = await fetchTmdbCredits(result.id, searchType);
      if (cast.length === 0) {
        addNotification?.('info', 'No cast found');
        setFetchingCast(false);
        setSelected(null);
        return;
      }

      if (isStaging) {
        // Staging: don't write to DB — just hand it up to Admin
        onCastStaged?.(cast);
        addNotification?.('success', `${cast.length} cast members staged — save the movie to persist`);
      } else {
        // Editing: save straight to DB
        await saveCastForMovie(movie.id, cast);
        const fresh = await loadCastForMovie(movie.id);
        setCurrentCast(fresh);
        onCastSaved?.(fresh);
        addNotification?.('success', `Saved ${cast.length} cast members`);
      }
    } catch (err) {
      addNotification?.('error', err.message || 'Failed to fetch cast');
    } finally {
      setFetchingCast(false);
      setSelected(null);
    }
  };

  const handleClearCast = async () => {
    if (!window.confirm('Remove all cast for this movie?')) return;
    if (isStaging) {
      onCastStaged?.([]);
      addNotification?.('success', 'Staged cast cleared');
      return;
    }
    try {
      await saveCastForMovie(movie.id, []);
      setCurrentCast([]);
      onCastSaved?.([]);
      addNotification?.('success', 'Cast cleared');
    } catch (err) {
      addNotification?.('error', 'Failed to clear cast');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
          <FaMagic /> Cast ({displayCast.length})
          {isStaging && displayCast.length > 0 && (
            <span className="text-[10px] font-normal text-amber-400 flex items-center gap-1">
              <FaCheckCircle className="text-[9px]" /> staged
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          {displayCast.length > 0 && (
            <button
              type="button"
              onClick={handleClearCast}
              className="text-[11px] px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-[11px] px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg font-semibold flex items-center gap-1 text-black"
          >
            <FaMagic className="text-[9px]" />
            {open ? 'Close' : 'Auto-Fetch from TMDB'}
          </button>
        </div>
      </div>

      {isStaging && displayCast.length === 0 && (
        <div className="p-2 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-[11px] text-cyan-300 flex items-center gap-2">
          <FaInfoCircle className="flex-shrink-0" />
          You can fetch cast now — it will be attached automatically when you save.
        </div>
      )}

      {!isStaging && loading ? (
        <div className="text-center py-4 text-gray-400 text-xs">
          <FaSpinner className="animate-spin inline mr-1" /> Loading cast…
        </div>
      ) : displayCast.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {displayCast.map((c, idx) => (
            <div
              key={c.id || c.tmdb_person_id || `${c.name}-${idx}`}
              className="flex items-center gap-2 bg-gray-800/60 border border-emerald-900/30 rounded-lg px-2 py-1.5 min-w-[150px]"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-900 flex-shrink-0">
                {c.profile_path ? (
                  <img
                    src={tmdbImage(c.profile_path, 'w92')}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaUser className="text-xs" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">{c.name}</p>
                {c.character_name && (
                  <p className="text-[9px] text-emerald-300 truncate">as {c.character_name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-500 italic">
          No cast yet — click <strong>Auto-Fetch from TMDB</strong>.
        </p>
      )}

      {open && (
        <div className="p-3 bg-gray-900/60 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Movie title"
              className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-xs"
            />
            <input
              type="text"
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              placeholder="Year"
              className="w-full sm:w-20 p-2 bg-gray-800 border border-gray-700 rounded-lg text-xs"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-xs"
            >
              <option value="movie">Movie</option>
              <option value="tv">Series</option>
            </select>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50 text-black"
            >
              {searching ? <FaSpinner className="animate-spin text-[10px]" /> : <FaSearch className="text-[10px]" />}
              Search
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <p className="text-[10px] text-gray-400">
                Pick the correct title — cast will be {isStaging ? 'staged' : 'saved automatically'}.
              </p>
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handlePickResult(r)}
                  disabled={fetchingCast}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    selected?.id === r.id
                      ? 'bg-emerald-600/20 border border-emerald-500/50'
                      : 'bg-gray-800/60 hover:bg-gray-800 border border-transparent'
                  } disabled:opacity-50`}
                >
                  <div className="w-10 h-14 rounded-md overflow-hidden bg-gray-900 flex-shrink-0">
                    {r.poster_path ? (
                      <img
                        src={tmdbImage(r.poster_path, 'w92')}
                        alt={r.title || r.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {r.title || r.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {(r.release_date || r.first_air_date || '').slice(0, 4)}
                    </p>
                  </div>
                  {selected?.id === r.id && fetchingCast && (
                    <FaSpinner className="animate-spin text-emerald-400 text-xs" />
                  )}
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && !searching && (
            <p className="text-[10px] text-gray-500">
              Search a title on TMDB and click the right one. Cast downloads automatically.
            </p>
          )}
        </div>
      )}
    </div>
  );
}