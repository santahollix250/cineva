// src/lib/translators.js
import { supabase } from './supabase';

/**
 * Get every translator that appears in movies/series.
 * Merges with any profile info (photo) stored in `translator_profiles`.
 */
export async function getTranslatorsWithProfiles(movies = []) {
  // 1) Collect unique translator names + counts from movies
  const map = new Map();

  movies.forEach((item) => {
    const name = (item?.translator || '').trim();
    if (!name) return;
    if (!map.has(name)) {
      map.set(name, { name, movies: 0, series: 0, total: 0 });
    }
    const entry = map.get(name);
    if (item.type === 'movie') entry.movies += 1;
    else if (item.type === 'series') entry.series += 1;
    entry.total = entry.movies + entry.series;
  });

  // 2) Load profile rows (photos)
  let profilesByName = {};
  try {
    const { data, error } = await supabase
      .from('translator_profiles')
      .select('*');
    if (!error && data) {
      profilesByName = data.reduce((acc, row) => {
        acc[row.name] = row;
        return acc;
      }, {});
    }
  } catch (e) {
    console.warn('translator_profiles fetch failed:', e);
  }

  // 3) Merge
  const merged = Array.from(map.values()).map((t) => ({
    ...t,
    id: profilesByName[t.name]?.id || `legacy-${t.name}`,
    photo_url: profilesByName[t.name]?.photo_url || '',
    display_name: profilesByName[t.name]?.display_name || t.name,
  }));

  // Sort: most translated first
  merged.sort((a, b) => b.total - a.total);
  return merged;
}

/**
 * Upsert a profile (photo + display name) keyed by translator name.
 * Creates the row if it doesn't exist.
 */
export async function upsertTranslatorProfile(name, { photo_url, display_name }) {
  const payload = {
    name,
    photo_url: photo_url ?? null,
    display_name: display_name ?? name,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('translator_profiles')
    .upsert(payload, { onConflict: 'name' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTranslatorProfile(id) {
  const { error } = await supabase
    .from('translator_profiles')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function uploadTranslatorPhoto(file) {
  if (!file) throw new Error('No file');

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image type. Use JPEG, PNG, or WebP');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image too large (max 5MB)');
  }

  const ext = file.name.split('.').pop();
  const fileName = `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('translator-photos')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('translator-photos')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Rename a translator across all movies that use the old name.
 * Call this when you want to fix a typo in the name.
 */
export async function renameTranslatorInMovies(movies, oldName, newName, updateMovieFn) {
  const affected = movies.filter(
    (m) => (m?.translator || '').trim() === oldName.trim()
  );
  for (const movie of affected) {
    await updateMovieFn(movie.id, { translator: newName });
  }
  return affected.length;
}