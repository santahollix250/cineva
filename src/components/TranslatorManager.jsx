// src/components/TranslatorManager.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  FaUser, FaSearch, FaCloudUploadAlt, FaTimes, FaFilm,
  FaTv, FaCheckCircle, FaEdit, FaSave, FaUndo, FaLanguage,
  FaPlusCircle, FaMagic, FaLink, FaTrash, FaSpinner
} from "react-icons/fa";
import {
  getTranslatorsWithProfiles,
  upsertTranslatorProfile,
  uploadTranslatorPhoto,
  renameTranslatorInMovies,
  deleteTranslatorProfileByName,
  clearTranslatorFromMovies,
} from "../lib/translators";

export default function TranslatorManager({
  movies = [],
  addNotification,
  updateMovie,
  refreshMovies,
}) {
  const [translators, setTranslators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ⭐ Delete state
  const [deletingName, setDeletingName] = useState(null);

  // EDIT state
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState({ display_name: "", photo_url: "" });

  // ADD state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addValue, setAddValue] = useState({
    display_name: "",
    photo_url: "",
  });

  // Image method (upload vs link)
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageMethod, setImageMethod] = useState({ edit: "upload", add: "upload" });

  const editFileRef = useRef(null);
  const addFileRef = useRef(null);

  // ---- Load merged list ----
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getTranslatorsWithProfiles(movies);
      setTranslators(list);
    } catch (e) {
      console.error(e);
      addNotification?.("error", "Failed to load translators");
    } finally {
      setLoading(false);
    }
  }, [movies, addNotification]);

  useEffect(() => {
    load();
  }, [load]);

  // ================================================================
  //  EDIT EXISTING TRANSLATOR
  // ================================================================
  const startEdit = (t) => {
    setEditingName(t.name);
    setEditValue({
      display_name: t.display_name || t.name,
      photo_url: t.photo_url || "",
    });
    setImageMethod((m) => ({ ...m, edit: "upload" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditValue({ display_name: "", photo_url: "" });
    setProgress(0);
  };

  const handleEditPhotoUpload = async (file) => {
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

  const handleSaveEdit = async () => {
    if (!editingName) return;
    try {
      await upsertTranslatorProfile(editingName, {
        photo_url: editValue.photo_url || null,
        display_name: editValue.display_name?.trim() || editingName,
      });

      const newName = editValue.display_name?.trim();
      if (
        newName &&
        newName !== editingName &&
        typeof updateMovie === "function"
      ) {
        const count = await renameTranslatorInMovies(
          movies,
          editingName,
          newName,
          updateMovie
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

  // ================================================================
  //  ADD NEW TRANSLATOR
  // ================================================================
  const handleAddPhotoUpload = async (file) => {
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
      setAddValue((v) => ({ ...v, photo_url: url }));
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

  const handleSaveNew = async () => {
    const displayName = (addValue.display_name || "").trim();
    if (!displayName) {
      addNotification?.("error", "Translator name is required");
      return;
    }
    if (!addValue.photo_url) {
      addNotification?.("error", "Translator photo is required");
      return;
    }

    const slug = displayName.toLowerCase().replace(/\s+/g, "_");

    try {
      await upsertTranslatorProfile(slug, {
        photo_url: addValue.photo_url,
        display_name: displayName,
      });

      addNotification?.("success", `Translator "${displayName}" saved`);

      setAddValue({ display_name: "", photo_url: "" });
      setImageMethod((m) => ({ ...m, add: "upload" }));
      setShowAddForm(false);

      load();
    } catch (err) {
      console.error(err);
      addNotification?.("error", err.message || "Save failed");
    }
  };

  const cancelAdd = () => {
    setAddValue({ display_name: "", photo_url: "" });
    setImageMethod((m) => ({ ...m, add: "upload" }));
    setProgress(0);
    setShowAddForm(false);
  };

  // ================================================================
  //  ⭐ DELETE TRANSLATOR
  // ================================================================
  const handleDelete = async (t) => {
    const name = t?.name;
    if (!name) return;

    const taggedCount = (movies || []).filter(
      (m) => (m.translator || "").trim() === name
    ).length;

    const ok = window.confirm(
      `Delete translator "${t.display_name || name}"?\n\n` +
      `This will remove the translator from ${taggedCount} ` +
      `movie${taggedCount === 1 ? "" : "s"}/series and delete their profile.\n\n` +
      `This cannot be undone. Continue?`
    );
    if (!ok) return;

    setDeletingName(name);
    try {
      // STEP A — Clear the translator from all tagged movies
      let cleared = 0;
      try {
        cleared = await clearTranslatorFromMovies(name);
      } catch (clearErr) {
        console.warn("Clear translator from movies failed:", clearErr);
      }

      // STEP B — Delete the profile by name
      await deleteTranslatorProfileByName(name);

      addNotification?.(
        "success",
        `Translator "${t.display_name || name}" deleted` +
        (cleared > 0
          ? ` (removed from ${cleared} item${cleared === 1 ? "" : "s"})`
          : "")
      );

      // STEP C — If it was being edited, cancel
      if (editingName === name) cancelEdit();

      // STEP D — Refresh local list + parent context
      await load();
      refreshMovies?.();
    } catch (err) {
      console.error("Delete translator error:", err);
      addNotification?.("error", err.message || "Delete failed");
    } finally {
      setDeletingName(null);
    }
  };

  // ================================================================
  //  FILTER
  // ================================================================
  const filtered = translators.filter((t) =>
    (t.display_name || t.name).toLowerCase().includes(search.toLowerCase())
  );

  // ================================================================
  //  RENDER
  // ================================================================
  return (
    <div className="space-y-5">
      {/* ========== ADD NEW FORM ========== */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/30 backdrop-blur-lg rounded-2xl border border-emerald-500/40 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaMagic className="text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold">Add New Translator</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/50 bg-gray-900">
                {addValue.photo_url ? (
                  <img
                    src={addValue.photo_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaUser className="text-4xl" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setImageMethod((m) => ({
                      ...m,
                      add: m.add === "upload" ? "link" : "upload",
                    }))
                  }
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-1"
                >
                  {imageMethod.add === "upload" ? (
                    <><FaLink /> Use Link</>
                  ) : (
                    <><FaCloudUploadAlt /> Use Upload</>
                  )}
                </button>
                {addValue.photo_url && (
                  <button
                    type="button"
                    onClick={() => setAddValue((v) => ({ ...v, photo_url: "" }))}
                    className="px-3 py-1.5 text-xs bg-red-600/30 hover:bg-red-600/50 rounded-lg"
                  >
                    <FaTimes className="inline" /> Clear
                  </button>
                )}
              </div>

              {imageMethod.add === "upload" ? (
                <>
                  <input
                    ref={addFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddPhotoUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => addFileRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center gap-1 disabled:opacity-50 text-black font-semibold"
                  >
                    <FaCloudUploadAlt /> Upload Photo
                  </button>
                </>
              ) : (
                <input
                  type="text"
                  value={addValue.photo_url}
                  onChange={(e) =>
                    setAddValue((v) => ({ ...v, photo_url: e.target.value }))
                  }
                  placeholder="Paste image URL"
                  className="w-full p-2 text-xs bg-gray-800/70 border border-gray-700 rounded-lg"
                />
              )}

              {uploading && (
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Name + actions */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Translator Name *
                </label>
                <input
                  type="text"
                  value={addValue.display_name}
                  onChange={(e) =>
                    setAddValue((v) => ({ ...v, display_name: e.target.value }))
                  }
                  placeholder="e.g., Netflix Subtitles"
                  className="w-full p-2.5 bg-gray-800/70 border border-gray-700 rounded-lg text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSaveNew}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-black disabled:opacity-50"
                >
                  <FaSave /> Save Translator
                </button>
                <button
                  onClick={cancelAdd}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex items-center gap-2 justify-center"
                >
                  <FaUndo /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== EDIT FORM ========== */}
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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setImageMethod((m) => ({
                      ...m,
                      edit: m.edit === "upload" ? "link" : "upload",
                    }))
                  }
                  className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-1"
                >
                  {imageMethod.edit === "upload" ? (
                    <><FaLink /> Use Link</>
                  ) : (
                    <><FaCloudUploadAlt /> Use Upload</>
                  )}
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

              {imageMethod.edit === "upload" ? (
                <>
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleEditPhotoUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center gap-1 disabled:opacity-50 text-black font-semibold"
                  >
                    <FaCloudUploadAlt /> Upload Photo
                  </button>
                </>
              ) : (
                <input
                  type="text"
                  value={editValue.photo_url}
                  onChange={(e) =>
                    setEditValue((v) => ({ ...v, photo_url: e.target.value }))
                  }
                  placeholder="Paste image URL"
                  className="w-full p-2 text-xs bg-gray-800/70 border border-gray-700 rounded-lg"
                />
              )}

              {uploading && (
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
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
                  onClick={handleSaveEdit}
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

      {/* ========== LIST ========== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <FaLanguage className="text-emerald-400" />
            All Translators ({translators.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (showAddForm) cancelAdd();
                else setShowAddForm(true);
              }}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg font-semibold text-sm text-black flex items-center gap-2"
            >
              <FaPlusCircle className="text-xs" />
              {showAddForm ? "Close" : "Add New Translator"}
            </button>
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
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading translators…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-xl">
            <FaLanguage className="text-5xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No translators found.</p>
            <p className="text-gray-500 text-xs mt-1">
              Click <span className="text-emerald-400">Add New Translator</span> above to create one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((t) => {
              const isDeleting = deletingName === t.name;

              return (
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
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(t)}
                          className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 rounded"
                          title="Edit photo & name"
                        >
                          <FaEdit className="text-cyan-400 text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          disabled={isDeleting}
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 rounded disabled:opacity-50"
                          title="Delete translator"
                        >
                          {isDeleting ? (
                            <FaSpinner className="text-red-400 text-xs animate-spin" />
                          ) : (
                            <FaTrash className="text-red-400 text-xs" />
                          )}
                        </button>
                      </div>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}