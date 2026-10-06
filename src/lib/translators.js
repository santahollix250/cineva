// src/lib/translators.js
import { supabase } from './supabase';

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

  // 2) Load ALL profile rows (photos + display names)
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

  // ⭐ 3) Merge: start from movie-derived names, THEN add any profile-only rows
  const mergedMap = new Map();

  // 3a) Movie-derived translators
  Array.from(map.values()).forEach((t) => {
    const profile = profilesByName[t.name];
    mergedMap.set(t.name, {
      ...t,
      id: profile?.id || `legacy-${t.name}`,
      photo_url: profile?.photo_url || '',
      display_name: profile?.display_name || t.name,
    });
  });

  // 3b) Profile-only translators (new ones just created — count = 0)
  Object.values(profilesByName).forEach((profile) => {
    if (!mergedMap.has(profile.name)) {
      mergedMap.set(profile.name, {
        name: profile.name,
        movies: 0,
        series: 0,
        total: 0,
        id: profile.id || `profile-${profile.name}`,
        photo_url: profile.photo_url || '',
        display_name: profile.display_name || profile.name,
      });
    }
  });

  const merged = Array.from(mergedMap.values());
  // Sort: most translated first, then alphabetical for ties (new ones at a stable spot)
  merged.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return (a.display_name || a.name).localeCompare(b.display_name || b.name);
  });
  return merged;
}

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

export async function renameTranslatorInMovies(movies, oldName, newName, updateMovieFn) {
  const affected = movies.filter(
    (m) => (m?.translator || '').trim() === oldName.trim()
  );
  for (const movie of affected) {
    await updateMovieFn(movie.id, { translator: newName });
  }
  return affected.length;
}