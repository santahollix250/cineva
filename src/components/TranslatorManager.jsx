// src/components/TranslatorManager.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  FaUser, FaSearch, FaCloudUploadAlt, FaTimes, FaFilm,
  FaTv, FaCheckCircle, FaEdit, FaSave, FaUndo, FaLanguage
} from "react-icons/fa";
import {
  getTranslatorsWithProfiles,
  upsertTranslatorProfile,
  uploadTranslatorPhoto,
  renameTranslatorInMovies,
} from "../lib/translators";

export default function TranslatorManager({ movies = [], addNotification, updateMovie, refreshMovies }) {
  const [translators, setTranslators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState({ display_name: "", photo_url: "" });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Load merged list
  const load = useCallback(async () => {
    setLoading(true);
    const list = await getTranslatorsWithProfiles(movies);
    setTranslators(list);
    setLoading(false);
  }, [movies]);

  useEffect(() => { load(); }, [load]);

  // Start editing → prefill with current data
  const startEdit = (t) => {
    setEditingName(t.name);
    setEditValue({
      display_name: t.display_name || t.name,
      photo_url: t.photo_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditValue({ display_name: "", photo_url: "" });
    setProgress(0);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setProgress(10);
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 12, 90));
      }, 180);

      const url = await uploadTranslatorPhoto(file);

      clearInterval(interval);
      setProgress(100);
      setEditValue((v) => ({ ...v, photo_url: url }));
      addNotification?.("success", "Photo uploaded");
    } catch (err) {
      addNotification?.("error", err.message || "Upload failed");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 400);
    }
  };

  const handleSave = async () => {
    if (!editingName) return;
    try {
      // 1. Save profile (photo + display_name)
      await upsertTranslatorProfile(editingName, {
        photo_url: editValue.photo_url || null,
        display_name: editValue.display_name?.trim() || editingName,
      });

      // 2. If name changed → rename across all movies
      const newName = editValue.display_name?.trim();
      if (newName && newName !== editingName && typeof updateMovie === 'function') {
        const count = await renameTranslatorInMovies(
          movies, editingName, newName, updateMovie
        );
        addNotification?.(
          "success",
          `Renamed in ${count} movie${count === 1 ? "" : "s"}`
        );
        refreshMovies?.();
      } else {
        addNotification?.("success", `Saved ${editingName}`);
      }

      cancelEdit();
      load();
    } catch (err) {
      console.error(err);
      addNotification?.("error", err.message || "Save failed");
    }
  };

  const filtered = translators.filter((t) =>
    (t.display_name || t.name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* ===== EDIT CARD (only when editing) ===== */}
      {editingName && (
        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/30 backdrop-blur-lg rounded-2xl border border-emerald-500/40 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaEdit className="text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold">
              Edit "{editingName}"
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/50 bg-gray-900">
                {editValue.photo_url ? (
                  <img
                    src={editValue.photo_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaUser className="text-4xl" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center gap-1 disabled:opacity-50 text-black font-semibold"
                >
                  <FaCloudUploadAlt /> Upload Photo
                </button>
                {editValue.photo_url && (
                  <button
                    type="button"
                    onClick={() => setEditValue((v) => ({ ...v, photo_url: "" }))}
                    className="px-3 py-1.5 text-xs bg-red-600/30 hover:bg-red-600/50 rounded-lg"
                  >
                    <FaTimes className="inline" /> Clear
                  </button>
                )}
              </div>

              {uploading && (
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <input
                type="text"
                value={editValue.photo_url}
                onChange={(e) =>
                  setEditValue((v) => ({ ...v, photo_url: e.target.value }))
                }
                placeholder="…or paste image URL"
                className="w-full p-2 text-xs bg-gray-800/70 border border-gray-700 rounded-lg"
              />
            </div>

            {/* Name + actions */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editValue.display_name}
                  onChange={(e) =>
                    setEditValue((v) => ({ ...v, display_name: e.target.value }))
                  }
                  className="w-full p-2.5 bg-gray-800/70 border border-gray-700 rounded-lg text-sm"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  ⚠️ Changing the name will also rename it on every movie tagged
                  with the old name.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-black"
                >
                  <FaSave /> Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex items-center gap-2 justify-center"
                >
                  <FaUndo /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LIST ===== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <FaLanguage className="text-emerald-400" />
            All Translators ({translators.length})
          </h3>
          <div className="relative">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search translators…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-sm w-full sm:w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading translators…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-xl">
            <FaLanguage className="text-5xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No translators found in your movies.</p>
            <p className="text-gray-500 text-xs mt-1">
              Translators appear here automatically once you assign them to movies.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((t) => (
              <div
                key={t.name}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-emerald-900/30 p-3 flex gap-3 items-center hover:border-emerald-500/40 transition-colors"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500/40 flex-shrink-0 bg-gray-800">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt={t.display_name || t.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <FaUser />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-sm truncate">
                      {t.display_name || t.name}
                    </h4>
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 rounded flex-shrink-0"
                      title="Edit photo & name"
                    >
                      <FaEdit className="text-cyan-400 text-xs" />
                    </button>
                  </div>

                  {/* Counts */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px] flex items-center gap-0.5">
                      <FaFilm className="text-[8px]" /> {t.movies}
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] flex items-center gap-0.5">
                      <FaTv className="text-[8px]" /> {t.series}
                    </span>
                    <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] flex items-center gap-0.5">
                      <FaCheckCircle className="text-[8px]" /> {t.total}
                    </span>
                  </div>

                  {t.photo_url ? (
                    <p className="text-[10px] text-emerald-400/70 mt-1 flex items-center gap-1">
                      <FaCheckCircle className="text-[8px]" /> Photo set
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-400/70 mt-1">
                      No photo yet — click ✏️ to add one
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}