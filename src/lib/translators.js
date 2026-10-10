// src/lib/translators.js
import { supabase } from './supabase';

/* ------------------------------------------------------------------
   Fetch all translators (merged from movies + translator_profiles)
------------------------------------------------------------------- */
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

  // 3) Merge: start from movie-derived names, THEN add profile-only rows
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
  merged.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return (a.display_name || a.name).localeCompare(b.display_name || b.name);
  });
  return merged;
}

/* ------------------------------------------------------------------
   Upsert a translator profile (insert or update by name)
------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------
   Delete a translator profile by id
------------------------------------------------------------------- */
export async function deleteTranslatorProfile(id) {
  if (!id) throw new Error('Translator id is required');

  const { error } = await supabase
    .from('translator_profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/* ------------------------------------------------------------------
   ⭐ Delete by NAME (used by TranslatorManager to delete the profile
   even when we only have the name string, not the numeric id)
------------------------------------------------------------------- */
export async function deleteTranslatorProfileByName(name) {
  if (!name) throw new Error('Translator name is required');

  const { error } = await supabase
    .from('translator_profiles')
    .delete()
    .eq('name', name);

  if (error) {
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('0 rows') || msg.includes('no rows')) return true;
    throw error;
  }
  return true;
}

/* ------------------------------------------------------------------
   ⭐ Clear a translator name from all movies/series tagged with it
   Returns the number of rows updated.
------------------------------------------------------------------- */
export async function clearTranslatorFromMovies(name) {
  if (!name) return 0;

  // Find every movie tagged with this translator
  const { data: matched, error: selErr } = await supabase
    .from('movies')
    .select('id')
    .eq('translator', name);

  if (selErr) {
    console.warn('clearTranslatorFromMovies select failed:', selErr);
    return 0;
  }
  if (!matched || matched.length === 0) return 0;

  const ids = matched.map((r) => r.id);

  const { error: updErr } = await supabase
    .from('movies')
    .update({ translator: '' })
    .in('id', ids);

  if (updErr) {
    console.error('clearTranslatorFromMovies update failed:', updErr);
    throw updErr;
  }

  return ids.length;
}

/* ------------------------------------------------------------------
   Upload a translator photo to Supabase Storage
------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------
   Bulk-rename a translator inside all movies
------------------------------------------------------------------- */
export async function renameTranslatorInMovies(movies, oldName, newName, updateMovieFn) {
  if (!oldName || !newName || oldName.trim() === newName.trim()) return 0;

  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();

  const affected = movies.filter(
    (m) => (m?.translator || '').trim() === cleanOld
  );
  if (affected.length === 0) return 0;

  // Preferred: one bulk update
  try {
    const ids = affected.map((m) => m.id);
    const { error } = await supabase
      .from('movies')
      .update({ translator: cleanNew })
      .in('id', ids);
    if (error) throw error;
    return affected.length;
  } catch (bulkErr) {
    console.warn('Bulk rename failed, using per-movie fallback:', bulkErr);

    if (typeof updateMovieFn !== 'function') return 0;
    let count = 0;
    for (const movie of affected) {
      try {
        await updateMovieFn(movie.id, { translator: cleanNew });
        count++;
      } catch (err) {
        console.warn('rename fallback failed for', movie.id, err);
      }
    }
    return count;
  }
}