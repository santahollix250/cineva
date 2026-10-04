// src/lib/tmdb.js
import { supabase } from './supabase';

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

/* ------------------------------------------------------------------
   Internal fetch helper
------------------------------------------------------------------- */
const fetchTmdb = async (path, params = {}) => {
  if (!TMDB_KEY) throw new Error('Missing VITE_TMDB_API_KEY in .env');
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v != null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
};

/* ------------------------------------------------------------------
   Search a movie or TV show by title
------------------------------------------------------------------- */
export async function searchTmdb(title, type = 'movie', year = '') {
  if (!title) return [];
  const params = { query: title };
  if (year) params.year = String(year);
  const data = await fetchTmdb(`/search/${type}`, params);
  return (data.results || []).slice(0, 8);
}

/* ------------------------------------------------------------------
   Fetch the top cast for a TMDB title
------------------------------------------------------------------- */
export async function fetchTmdbCredits(tmdbId, type = 'movie') {
  if (!tmdbId) throw new Error('Missing tmdbId');
  const data = await fetchTmdb(`/${type}/${tmdbId}/credits`);
  const cast = (data.cast || []).slice(0, 20);
  return cast.map((c, i) => ({
    tmdb_person_id: c.id,
    name: c.name,
    character_name: c.character || '',
    profile_path: c.profile_path || '',
    order_index: i,
  }));
}

/* ------------------------------------------------------------------
   Fetch an actor's details (bio, birthday, etc.)
------------------------------------------------------------------- */
export async function fetchPersonDetails(tmdbPersonId) {
  if (!tmdbPersonId) throw new Error('Missing person id');
  return await fetchTmdb(`/person/${tmdbPersonId}`);
}

/* ------------------------------------------------------------------
   Fetch every TMDB credit for an actor (movies + series)
------------------------------------------------------------------- */
export async function fetchPersonCredits(tmdbPersonId) {
  if (!tmdbPersonId) throw new Error('Missing person id');
  const data = await fetchTmdb(`/person/${tmdbPersonId}/combined_credits`);
  return data || { cast: [], crew: [] };
}

/* ------------------------------------------------------------------
   Build a full TMDB image URL
------------------------------------------------------------------- */
export function tmdbImage(path, size = 'w185') {
  if (!path) return '';
  return `${IMG_BASE}/${size}${path}`;
}

/* ------------------------------------------------------------------
   Save a cast list to Supabase (replaces existing for that movie)
------------------------------------------------------------------- */
export async function saveCastForMovie(movieId, castList) {
  await supabase.from('movie_cast').delete().eq('movie_id', String(movieId));

  if (!castList || castList.length === 0) return [];

  const rows = castList.map((c) => ({
    movie_id: String(movieId),
    tmdb_person_id: c.tmdb_person_id || null,
    name: c.name,
    character_name: c.character_name || '',
    profile_path: c.profile_path || '',
    order_index: c.order_index ?? 0,
  }));

  const { data, error } = await supabase
    .from('movie_cast')
    .insert(rows)
    .select();

  if (error) throw error;
  return data || [];
}

/* ------------------------------------------------------------------
   Load the cast of a movie from Supabase
------------------------------------------------------------------- */
export async function loadCastForMovie(movieId) {
  if (!movieId) return [];
  const { data, error } = await supabase
    .from('movie_cast')
    .select('*')
    .eq('movie_id', String(movieId))
    .order('order_index', { ascending: true });

  if (error) {
    console.warn('loadCastForMovie failed:', error.message);
    return [];
  }
  return data || [];
}

/* ------------------------------------------------------------------
   Given an actor's tmdb_person_id, find every movie in OUR library
   that also has them in its cast (via the movie_cast table).
------------------------------------------------------------------- */
export async function findLocalMoviesForActor(tmdbPersonId) {
  if (!tmdbPersonId) return [];
  const { data, error } = await supabase
    .from('movie_cast')
    .select('movie_id, character_name')
    .eq('tmdb_person_id', Number(tmdbPersonId));

  if (error) return [];
  return data || [];
}

/* ------------------------------------------------------------------
   Trending content for the News section
------------------------------------------------------------------- */
export async function fetchTrendingMovies(timeWindow = 'day') {
  const data = await fetchTmdb(`/trending/movie/${timeWindow}`);
  return (data.results || []).slice(0, 6);
}

export async function fetchTrendingTV(timeWindow = 'day') {
  const data = await fetchTmdb(`/trending/tv/${timeWindow}`);
  return (data.results || []).slice(0, 6);
}

export async function fetchTrendingPeople(timeWindow = 'day') {
  const data = await fetchTmdb(`/trending/person/${timeWindow}`);
  return (data.results || []).slice(0, 6);
}