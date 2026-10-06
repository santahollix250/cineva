import { useContext, useState, useEffect } from "react";
import { MoviesContext } from "../context/MoviesContext";
import { supabase } from '../lib/supabase';
import { getTranslatorsWithProfiles } from '../lib/translators';
import { saveCastForMovie } from '../lib/tmdb';
import TranslatorManager from '../components/TranslatorManager';
import CastFetcher from '../components/CastFetcher';
import {
  FaEdit, FaTrash, FaFilm, FaTv, FaSave, FaUndo, FaPlus,
  FaLink, FaImage, FaGlobe, FaLanguage, FaSync,
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaList,
  FaDownload, FaSignOutAlt, FaVideo,
  FaSearch, FaUpload,
  FaMountain, FaYoutube, FaFileVideo, FaCalendar, FaTag,
  FaArrowLeft, FaLayerGroup, FaPlusCircle, FaCloudUploadAlt,
  FaMobileAlt, FaDesktop
} from "react-icons/fa";

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
];

const categories = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
  "Music", "Musical", "Mystery", "Romance", "Sci-Fi", "Sport",
  "Thriller", "War", "Western", "Anime", "Reality TV", "Talk Show"
];

function Admin({ onLogout }) {
  const context = useContext(MoviesContext);

  if (!context) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center text-white p-8">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Movies Context Not Available</h1>
          <p className="text-gray-400">Make sure MoviesProvider is wrapping your app</p>
        </div>
      </div>
    );
  }

  const {
    movies = [],
    episodes = [],
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    getEpisodesBySeries = () => [],
    refreshMovies,
    refreshEpisodes,
    isOnline
  } = context;

  const VIDEO_PLATFORMS = { YOUTUBE: 'youtube', DIRECT: 'direct' };

  const platformConfig = {
    [VIDEO_PLATFORMS.YOUTUBE]: {
      name: 'YouTube', color: '#FF0000', icon: FaYoutube,
      placeholder: 'https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID',
    },
    [VIDEO_PLATFORMS.DIRECT]: {
      name: 'Direct Video', color: '#10b981', icon: FaFileVideo,
      placeholder: 'https://your-cdn.com/video.mp4 or .m3u8',
    }
  };

  const emptyMovie = {
    title: "", description: "", poster: "", background: "", category: "",
    type: "movie", videoUrl: "", streamLink: "", download_link: "",
    nation: "", translator: "", totalSeasons: "", totalEpisodes: "",
    videoType: VIDEO_PLATFORMS.YOUTUBE, videoId: "", embedCode: "",
    duration: "", quality: "HD", videoFile: null, year: "", director: "",
    imdbRating: "", status: "completed", views: "0", download: "",
    parts: []
  };

  const emptyPart = { partNumber: 1, title: "", download_link: "", useMainVideo: true };

  const emptyEpisode = {
    id: null, seasonNumber: "1", episodeNumber: "1", title: "",
    description: "", download_link: "", thumbnail: "",
    airDate: new Date().toISOString().split('T')[0], useMainVideo: true
  };

  const emptyFormEpisode = {
    tempId: null, seasonNumber: "1", episodeNumber: "1", title: "",
    description: "", download_link: "", thumbnail: "",
    airDate: new Date().toISOString().split('T')[0], useMainVideo: true
  };

  const [form, setForm] = useState(emptyMovie);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState([]);
  const [episodeForm, setEpisodeForm] = useState(emptyEpisode);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("series");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [adminTranslators, setAdminTranslators] = useState([]);
  const [stagedCast, setStagedCast] = useState([]);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [posterPreview, setPosterPreview] = useState("");
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [posterProgress, setPosterProgress] = useState(0);
  const [backgroundProgress, setBackgroundProgress] = useState(0);
  const [imageUploadMethod, setImageUploadMethod] = useState({ poster: 'link', background: 'link' });
  const [selectedMovieForParts, setSelectedMovieForParts] = useState(null);
  const [movieParts, setMovieParts] = useState([]);
  const [partForm, setPartForm] = useState(emptyPart);
  const [editingPart, setEditingPart] = useState(null);
  const [showPartForm, setShowPartForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [mainVideoUrl, setMainVideoUrl] = useState("");

  // ⭐ In-form episodes (series only)
  const [formEpisodes, setFormEpisodes] = useState([]);
  const [formEpisodeForm, setFormEpisodeForm] = useState(emptyFormEpisode);
  const [editingFormEpisode, setEditingFormEpisode] = useState(null);

  // ⭐ In-form parts (movies only — restored)
  const [formParts, setFormParts] = useState([]);
  const [formPartForm, setFormPartForm] = useState(emptyPart);
  const [editingFormPart, setEditingFormPart] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await getTranslatorsWithProfiles(movies);
        if (!cancelled) setAdminTranslators(list || []);
      } catch (e) {
        console.error('Failed to load translators:', e);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeTab, movies]);

  const extractYoutubeId = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };
  const generateEmbedUrl = (videoId) =>
    videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : '';

  const detectPlatform = (url) => {
    if (!url || typeof url !== 'string') return VIDEO_PLATFORMS.YOUTUBE;
    if (/youtube\.com|youtu\.be/.test(url)) return VIDEO_PLATFORMS.YOUTUBE;
    if (/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) return VIDEO_PLATFORMS.DIRECT;
    return VIDEO_PLATFORMS.YOUTUBE;
  };

  const validateVideoUrl = (url, platform) => {
    if (!url) return { valid: false, message: 'URL is required' };
    if (platform === VIDEO_PLATFORMS.YOUTUBE) {
      const id = extractYoutubeId(url);
      if (!id) return { valid: false, message: 'Invalid YouTube URL' };
      return { valid: true, id };
    }
    if (!/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url))
      return { valid: false, message: 'Invalid video file URL' };
    return { valid: true, id: url };
  };

  const sortEpisodes = (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      const aS = parseInt(a.seasonNumber) || 1, bS = parseInt(b.seasonNumber) || 1;
      const aE = parseInt(a.episodeNumber) || 1, bE = parseInt(b.episodeNumber) || 1;
      return aS !== bS ? aS - bS : aE - bE;
    });
  };

  const addNotification = (type, message) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, message }]);
  };
  const removeNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  useEffect(() => {
    if (notifications.length > 0) {
      const t = setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
      return () => clearTimeout(t);
    }
  }, [notifications]);

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) return addNotification("error", "Invalid image type");
    if (file.size > 5 * 1024 * 1024) return addNotification("error", "Image too large (max 5MB)");
    if (!isOnline) return addNotification("error", "You are offline");

    if (type === 'poster') { setUploadingPoster(true); setPosterProgress(0); }
    else { setUploadingBackground(true); setBackgroundProgress(0); }

    try {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'poster') setPosterPreview(previewUrl);
      else setBackgroundPreview(previewUrl);

      const bucket = type === 'poster' ? 'posters' : 'backgrounds';
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const interval = setInterval(() => {
        if (type === 'poster') setPosterProgress(prev => Math.min(prev + 10, 90));
        else setBackgroundProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { error } = await supabase.storage.from(bucket).upload(fileName, file, { cacheControl: '3600', upsert: false });
      clearInterval(interval);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

      if (type === 'poster') {
        setForm(prev => ({ ...prev, poster: publicUrl }));
        setUploadingPoster(false); setPosterProgress(100);
        setImageUploadMethod(prev => ({ ...prev, poster: 'upload' }));
        addNotification("success", "Poster uploaded");
      } else {
        setForm(prev => ({ ...prev, background: publicUrl }));
        setUploadingBackground(false); setBackgroundProgress(100);
        setImageUploadMethod(prev => ({ ...prev, background: 'upload' }));
        addNotification("success", "Background uploaded");
      }
    } catch (err) {
      addNotification("error", `Upload failed: ${err.message}`);
      if (type === 'poster') { setUploadingPoster(false); setPosterProgress(0); }
      else { setUploadingBackground(false); setBackgroundProgress(0); }
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) return addNotification("error", "File too large (max 500MB)");

    setUploadingFile(true); setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => prev >= 100 ? (clearInterval(interval), 100) : prev + 10);
    }, 200);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(previewUrl);
    setForm(prev => ({ ...prev, videoType: VIDEO_PLATFORMS.DIRECT, videoFile: file, videoUrl: previewUrl }));
    setMainVideoUrl(previewUrl);
    setTimeout(() => { clearInterval(interval); setUploadProgress(100); setUploadingFile(false); addNotification("success", "Video uploaded"); }, 2000);
  };

  // ===== IN-FORM EPISODES =====
  const handleFormEpisodeChange = (e) => {
    const { name, value } = e.target;
    setFormEpisodeForm(f => ({ ...f, [name]: value }));
  };
  const toggleUseMainVideoForFormEpisode = () =>
    setFormEpisodeForm(f => ({ ...f, useMainVideo: !f.useMainVideo }));

  const handleAddOrUpdateFormEpisode = () => {
    if (!formEpisodeForm.title) return addNotification("error", "Episode title is required");
    let finalVideoUrl = "";
    if (formEpisodeForm.useMainVideo) {
      finalVideoUrl = mainVideoUrl || form.videoUrl;
      if (!finalVideoUrl) return addNotification("error", "No main video URL yet");
    }
    setFormEpisodes(prev => {
      const data = {
        tempId: editingFormEpisode?.tempId || `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        seasonNumber: parseInt(formEpisodeForm.seasonNumber) || 1,
        episodeNumber: parseInt(formEpisodeForm.episodeNumber) || 1,
        title: formEpisodeForm.title,
        description: formEpisodeForm.description || "",
        videoUrl: finalVideoUrl,
        download_link: formEpisodeForm.download_link || "",
        thumbnail: formEpisodeForm.thumbnail || form.poster || "",
        airDate: formEpisodeForm.airDate || new Date().toISOString().split('T')[0]
      };
      let updated = editingFormEpisode
        ? prev.map(e => e.tempId === editingFormEpisode.tempId ? { ...e, ...data } : e)
        : [...prev, data];
      return updated.sort((a, b) =>
        a.seasonNumber !== b.seasonNumber ? a.seasonNumber - b.seasonNumber : a.episodeNumber - b.episodeNumber
      );
    });
    addNotification("success", editingFormEpisode ? "Episode updated" : "Episode added");
    const nextEp = (parseInt(formEpisodeForm.episodeNumber) || 1) + 1;
    setFormEpisodeForm({
      ...emptyFormEpisode,
      seasonNumber: formEpisodeForm.seasonNumber,
      episodeNumber: nextEp.toString(),
      useMainVideo: true
    });
    setEditingFormEpisode(null);
  };

  const handleEditFormEpisode = (ep) => {
    setEditingFormEpisode(ep);
    setFormEpisodeForm({
      tempId: ep.tempId,
      seasonNumber: ep.seasonNumber?.toString() || "1",
      episodeNumber: ep.episodeNumber?.toString() || "1",
      title: ep.title || "",
      description: ep.description || "",
      download_link: ep.download_link || "",
      thumbnail: ep.thumbnail || "",
      airDate: ep.airDate || new Date().toISOString().split('T')[0],
      useMainVideo: false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleCancelEditFormEpisode = () => {
    setEditingFormEpisode(null);
    setFormEpisodeForm({ ...emptyFormEpisode, episodeNumber: (formEpisodes.length + 1).toString(), useMainVideo: true });
  };
  const handleDeleteFormEpisode = (tempId) => {
    if (!window.confirm("Remove this episode?")) return;
    setFormEpisodes(prev => prev.filter(e => e.tempId !== tempId));
    if (editingFormEpisode?.tempId === tempId) handleCancelEditFormEpisode();
  };

  // ===== IN-FORM PARTS (movies only — restored) =====
  const handleFormPartChange = (e) => {
    const { name, value } = e.target;
    setFormPartForm(f => ({ ...f, [name]: value }));
  };
  const toggleUseMainVideoForFormPart = () =>
    setFormPartForm(f => ({ ...f, useMainVideo: !f.useMainVideo }));

  const handleAddOrUpdateFormPart = () => {
    if (!formPartForm.title) return addNotification("error", "Part title is required");
    let finalVideoUrl = "";
    if (formPartForm.useMainVideo) {
      finalVideoUrl = mainVideoUrl || form.videoUrl;
      if (!finalVideoUrl) return addNotification("error", "No main video URL yet");
    }
    setFormParts(prev => {
      const data = {
        partNumber: parseInt(formPartForm.partNumber) || (prev.length + 1),
        title: formPartForm.title,
        download_link: formPartForm.download_link || "",
        videoUrl: finalVideoUrl
      };
      let updated = editingFormPart
        ? prev.map(p => p.partNumber === editingFormPart.partNumber ? { ...p, ...data } : p)
        : [...prev, data];
      return updated.sort((a, b) => a.partNumber - b.partNumber);
    });
    addNotification("success", editingFormPart ? "Part updated" : "Part added");
    setFormPartForm({ ...emptyPart, partNumber: formParts.length + 2, useMainVideo: true });
    setEditingFormPart(null);
  };

  const handleEditFormPart = (part) => {
    setEditingFormPart(part);
    setFormPartForm({ partNumber: part.partNumber, title: part.title, download_link: part.download_link || "", useMainVideo: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleCancelEditFormPart = () => {
    setEditingFormPart(null);
    setFormPartForm({ ...emptyPart, partNumber: formParts.length + 1, useMainVideo: true });
  };
  const handleDeleteFormPart = (partNumber, partTitle) => {
    if (!window.confirm(`Remove part ${partNumber} - "${partTitle}"?`)) return;
    setFormParts(prev => prev.filter(p => p.partNumber !== partNumber).map((p, i) => ({ ...p, partNumber: i + 1 })));
    if (editingFormPart?.partNumber === partNumber) handleCancelEditFormPart();
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'videoFile') handleFileUpload(files[0]);
      else if (name === 'posterFile') handleImageUpload(files[0], 'poster');
      else if (name === 'backgroundFile') handleImageUpload(files[0], 'background');
    } else if (name === "videoUrl") {
      setForm(f => ({ ...f, [name]: value, videoType: detectPlatform(value) }));
      setMainVideoUrl(value);
    } else setForm(f => ({ ...f, [name]: value }));
  };

  const handleEpisodeChange = (e) => setEpisodeForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePartChange = (e) => setPartForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggleUseMainVideoForEpisode = () => setEpisodeForm(f => ({ ...f, useMainVideo: !f.useMainVideo }));
  const toggleUseMainVideoForPart = () => setPartForm(f => ({ ...f, useMainVideo: !f.useMainVideo }));

  const toggleImageMethod = (type) => {
    setImageUploadMethod(prev => ({ ...prev, [type]: prev[type] === 'link' ? 'upload' : 'link' }));
    if (type === 'poster') {
      setForm(prev => ({ ...prev, poster: '' }));
      if (posterPreview) { URL.revokeObjectURL(posterPreview); setPosterPreview(''); }
    } else {
      setForm(prev => ({ ...prev, background: '' }));
      if (backgroundPreview) { URL.revokeObjectURL(backgroundPreview); setBackgroundPreview(''); }
    }
  };

  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearchTerm.toLowerCase()));
  const filteredCategories = categories.filter(c => c.toLowerCase().includes(categorySearchTerm.toLowerCase()));

  const handleCountrySelect = (name) => { setForm(p => ({ ...p, nation: name })); setShowCountryDropdown(false); setCountrySearchTerm(""); };
  const handleCategorySelect = (cat) => { setForm(p => ({ ...p, category: cat })); setShowCategoryDropdown(false); setCategorySearchTerm(""); };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyMovie);
    setEpisodeForm(emptyEpisode);
    setPartForm(emptyPart);
    setSelectedSeries(null);
    setSeriesEpisodes([]);
    setVideoPreviewUrl("");
    setEditingEpisode(null);
    setShowEpisodeForm(false);
    setSelectedMovieForParts(null);
    setMovieParts([]);
    setEditingPart(null);
    setShowPartForm(false);
    setMainVideoUrl("");
    setShowCountryDropdown(false);
    setCountrySearchTerm("");
    setShowCategoryDropdown(false);
    setCategorySearchTerm("");
    setStagedCast([]);
    setFormEpisodes([]); setFormEpisodeForm(emptyFormEpisode); setEditingFormEpisode(null);
    setFormParts([]); setFormPartForm(emptyPart); setEditingFormPart(null);
    if (posterPreview) URL.revokeObjectURL(posterPreview); setPosterPreview('');
    if (backgroundPreview) URL.revokeObjectURL(backgroundPreview); setBackgroundPreview('');
    setImageUploadMethod({ poster: 'link', background: 'link' });
    addNotification("info", "Form reset");
  };

  const startEdit = (movie) => {
    if (!movie) return;

    let parts = [];
    if (movie.download) {
      try {
        const parsed = JSON.parse(movie.download);
        if (Array.isArray(parsed)) parts = parsed;
        else if (parsed?.parts) parts = parsed.parts;
      } catch (e) { /* ignore */ }
    }

    setEditingId(movie.id);
    setForm({
      ...emptyMovie, ...movie,
      videoUrl: movie.videoUrl || "",
      videoType: movie.videoType || detectPlatform(movie.videoUrl || ""),
      category: movie.category || "",
      nation: movie.nation || "",
      translator: movie.translator || "",
      parts
    });
    setFormParts(parts.sort((a, b) => a.partNumber - b.partNumber));
    setFormPartForm({ ...emptyPart, partNumber: parts.length + 1, useMainVideo: true });
    setEditingFormPart(null);

    if (movie.type === 'series' && typeof getEpisodesBySeries === 'function') {
      const existingEps = getEpisodesBySeries(movie.id) || [];
      const mapped = sortEpisodes(existingEps).map((ep, i) => ({
        tempId: ep.id || `existing_${i}_${Date.now()}`,
        seasonNumber: parseInt(ep.seasonNumber) || 1,
        episodeNumber: parseInt(ep.episodeNumber) || 1,
        title: ep.title || "",
        description: ep.description || "",
        videoUrl: ep.videoUrl || "",
        download_link: ep.download_link || "",
        thumbnail: ep.thumbnail || "",
        airDate: ep.airDate || new Date().toISOString().split('T')[0]
      }));
      setFormEpisodes(mapped);
      setFormEpisodeForm({
        ...emptyFormEpisode,
        seasonNumber: mapped.length ? String(mapped[mapped.length - 1].seasonNumber) : "1",
        episodeNumber: mapped.length ? String(mapped[mapped.length - 1].episodeNumber + 1) : "1",
        useMainVideo: true
      });
    } else {
      setFormEpisodes([]);
      setFormEpisodeForm(emptyFormEpisode);
    }
    setEditingFormEpisode(null);

    if (movie.videoUrl) setMainVideoUrl(movie.videoUrl);
    setStagedCast([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing: ${movie.title}`);
  };

  const startEditEpisode = (episode) => {
    setEditingEpisode(episode);
    setEpisodeForm({
      id: episode.id,
      seasonNumber: episode.seasonNumber?.toString() || "1",
      episodeNumber: episode.episodeNumber?.toString() || "1",
      title: episode.title || "",
      description: episode.description || "",
      download_link: episode.download_link || "",
      thumbnail: episode.thumbnail || "",
      airDate: episode.airDate || new Date().toISOString().split('T')[0],
      useMainVideo: false
    });
    setShowEpisodeForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEpisodeEdit = () => { setEditingEpisode(null); setEpisodeForm(emptyEpisode); setShowEpisodeForm(false); };

  const handleAddOrUpdate = async () => {
    if (!form.title) return addNotification("error", "Title is required");

    const existing = editingId ? movies.find(m => m.id === editingId) : null;
    const effectiveVideoUrl = form.videoUrl || existing?.videoUrl || "";
    const effectiveVideoType = form.videoUrl ? form.videoType : (existing?.videoType || form.videoType);

    if (!effectiveVideoUrl && !form.videoFile) return addNotification("error", "Video URL is required");
    if (effectiveVideoUrl && effectiveVideoType !== VIDEO_PLATFORMS.DIRECT) {
      const v = validateVideoUrl(effectiveVideoUrl, effectiveVideoType);
      if (!v.valid) return addNotification("error", v.message);
    }

    let videoId = '', streamLink = '';
    if (effectiveVideoType === VIDEO_PLATFORMS.YOUTUBE && effectiveVideoUrl) {
      videoId = extractYoutubeId(effectiveVideoUrl) || existing?.videoId || '';
      streamLink = generateEmbedUrl(videoId);
    } else if (effectiveVideoType === VIDEO_PLATFORMS.DIRECT) {
      videoId = effectiveVideoUrl;
      streamLink = effectiveVideoUrl;
    }

    // ⭐ For MOVIES: save in-form parts. For SERIES: keep existing download untouched.
    let downloadPayload = existing?.download || form.download || "";
    if (form.type === 'movie') {
      const cleanedParts = formParts
        .filter(p => p && (p.title || "").trim() !== "")
        .map((p, i) => ({ partNumber: i + 1, title: p.title, download_link: p.download_link || "", videoUrl: p.videoUrl || "" }));
      if (cleanedParts.length > 0) {
        downloadPayload = JSON.stringify(cleanedParts);
      }
    }

    const finalData = {
      title: form.title,
      description: form.description,
      poster: form.poster || "",
      background: form.background || form.poster || "",
      category: form.category || "",
      type: form.type,
      videoUrl: effectiveVideoUrl,
      streamLink: streamLink || existing?.streamLink || "",
      download_link: form.download_link || "",
      nation: form.nation || "",
      translator: form.translator || "",
      videoType: effectiveVideoType,
      videoId: videoId || existing?.videoId || "",
      embedCode: form.embedCode || existing?.embedCode || "",
      duration: form.duration || "",
      quality: form.quality || "HD",
      year: form.year || "",
      director: form.director || "",
      imdbRating: form.imdbRating || null,
      status: form.status || "completed",
      views: parseInt(form.views) || 0,
      download: downloadPayload
    };
    if (form.type === "series") {
      finalData.totalSeasons = form.totalSeasons || null;
      finalData.totalEpisodes = form.totalEpisodes || null;
    }

    setSubmitting(true);
    try {
      let savedMovieId = editingId;

      if (editingId) {
        await updateMovie(editingId, finalData);
        if (stagedCast.length > 0) {
          try { await saveCastForMovie(editingId, stagedCast); } catch (e) { console.warn(e); }
        }
        addNotification("success", `${form.type === 'series' ? 'Series' : 'Movie'} updated`);
      } else {
        const created = await addMovie(finalData);
        let newId = created?.id || created?.[0]?.id;
        if (!newId) {
          await refreshMovies();
          newId = (movies || []).find(m => m.title === finalData.title)?.id;
        }
        savedMovieId = newId;
        if (stagedCast.length > 0 && newId) {
          try { await saveCastForMovie(newId, stagedCast); } catch (e) { console.warn(e); }
        }
        addNotification("success", `${form.type === 'series' ? 'Series' : 'Movie'} added`);
      }

      // ⭐ Save in-form episodes (series only)
      if (form.type === 'series' && formEpisodes.length > 0) {
        if (!savedMovieId) {
          addNotification("error", "Could not resolve series ID for episodes");
        } else {
          let ok = 0, fail = 0;
          for (const ep of formEpisodes) {
            try {
              const epPayload = {
                seriesId: savedMovieId,
                seriesTitle: form.title,
                seasonNumber: parseInt(ep.seasonNumber) || 1,
                episodeNumber: parseInt(ep.episodeNumber) || 1,
                title: ep.title,
                description: ep.description || "",
                videoUrl: ep.videoUrl || effectiveVideoUrl || "",
                download_link: ep.download_link || "",
                thumbnail: ep.thumbnail || form.poster || "",
                airDate: ep.airDate || new Date().toISOString().split('T')[0],
                videoType: effectiveVideoType,
                videoId: videoId || "",
                embedCode: form.embedCode || ""
              };
              const isExisting = ep.tempId && !String(ep.tempId).startsWith('temp_') && !String(ep.tempId).startsWith('existing_');
              if (isExisting) await updateEpisode(ep.tempId, epPayload);
              else await addEpisode(epPayload);
              ok++;
            } catch (e) { console.error("Episode save failed:", e); fail++; }
          }
          if (ok > 0) addNotification("success", `Saved ${ok} episode(s)${fail ? `, ${fail} failed` : ''}`);
          if (fail > 0) addNotification("error", `${fail} episode(s) failed`);
        }
      }

      refreshMovies();
      refreshEpisodes && refreshEpisodes();
      resetForm();
    } catch (err) {
      addNotification("error", `Error saving: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const movie = movies.find(m => m.id === id);
    if (!movie || !window.confirm(`Delete "${movie.title}"?`)) return;
    try {
      await deleteMovie(id);
      addNotification("success", `"${movie.title}" deleted`);
      refreshMovies();
    } catch (err) { addNotification("error", "Error deleting item"); }
  };

  const selectSeriesForEpisodes = (series) => {
    setSelectedSeries(series);
    setActiveTab("episodes");
    setShowEpisodeForm(false);
    setEditingEpisode(null);
    setMainVideoUrl(series.videoUrl || "");
    setEpisodeForm({ ...emptyEpisode, useMainVideo: true });
    const loaded = getEpisodesBySeries(series.id) || [];
    setSeriesEpisodes(sortEpisodes(loaded));
    addNotification("info", `Managing episodes for: ${series.title}`);
  };

  const backToSeriesList = () => {
    setSelectedSeries(null); setSeriesEpisodes([]);
    setShowEpisodeForm(false); setEditingEpisode(null);
    setEpisodeForm(emptyEpisode); setMainVideoUrl("");
  };

  const handleAddOrUpdateEpisode = async () => {
    if (!selectedSeries) return addNotification("error", "No series selected");
    if (!episodeForm.title) return addNotification("error", "Episode title is required");
    let finalVideoUrl = "";
    if (episodeForm.useMainVideo) {
      finalVideoUrl = mainVideoUrl;
      if (!finalVideoUrl) return addNotification("error", "No main video URL");
    }
    setSubmitting(true);
    try {
      const payload = {
        seriesId: selectedSeries.id,
        seriesTitle: selectedSeries.title,
        seasonNumber: parseInt(episodeForm.seasonNumber) || 1,
        episodeNumber: parseInt(episodeForm.episodeNumber) || 1,
        title: episodeForm.title,
        description: episodeForm.description || "",
        videoUrl: finalVideoUrl,
        download_link: episodeForm.download_link || "",
        thumbnail: episodeForm.thumbnail || selectedSeries.poster || "",
        airDate: episodeForm.airDate || new Date().toISOString().split('T')[0],
        videoType: selectedSeries.videoType || VIDEO_PLATFORMS.YOUTUBE,
        videoId: selectedSeries.videoId || "",
        embedCode: selectedSeries.embedCode || ""
      };
      if (editingEpisode) {
        await updateEpisode(editingEpisode.id, payload);
        addNotification("success", `Episode updated`);
      } else {
        await addEpisode(payload);
        addNotification("success", `Episode added`);
      }
      setEpisodeForm({
        ...emptyEpisode,
        seasonNumber: episodeForm.seasonNumber,
        episodeNumber: (parseInt(episodeForm.episodeNumber || 1) + 1).toString(),
        useMainVideo: true
      });
      setSeriesEpisodes(sortEpisodes(getEpisodesBySeries(selectedSeries.id) || []));
      setEditingEpisode(null); setShowEpisodeForm(false);
    } catch (err) {
      addNotification("error", editingEpisode ? "Error updating episode" : "Error adding episode");
    } finally { setSubmitting(false); }
  };

  const handleDeleteEpisode = async (episodeId, title) => {
    if (!window.confirm(`Delete episode "${title}"?`)) return;
    try {
      await deleteEpisode(episodeId);
      addNotification("success", `Episode deleted`);
      if (selectedSeries) setSeriesEpisodes(sortEpisodes(getEpisodesBySeries(selectedSeries.id) || []));
    } catch (err) { addNotification("error", "Error deleting episode"); }
  };

  const selectMovieForParts = (movie) => {
    setSelectedMovieForParts(movie);
    setActiveTab("parts");
    setShowPartForm(false); setEditingPart(null);
    setMainVideoUrl(movie.videoUrl || "");
    let parts = [];
    if (movie.download) {
      try {
        const parsed = JSON.parse(movie.download);
        if (Array.isArray(parsed)) parts = parsed;
        else if (parsed?.parts) parts = parsed.parts;
      } catch (e) { parts = []; }
    }
    setMovieParts(parts);
    setPartForm({ ...emptyPart, partNumber: parts.length + 1, useMainVideo: true });
    addNotification("info", `Managing parts for: ${movie.title}`);
  };

  const backToMovieList = () => {
    setSelectedMovieForParts(null); setMovieParts([]);
    setShowPartForm(false); setEditingPart(null);
    setPartForm(emptyPart); setActiveTab("series"); setMainVideoUrl("");
  };

  const startEditPart = (part) => {
    setEditingPart(part);
    setPartForm({ partNumber: part.partNumber, title: part.title, download_link: part.download_link || "", useMainVideo: false });
    setShowPartForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelPartEdit = () => {
    setEditingPart(null);
    setPartForm({ ...emptyPart, partNumber: movieParts.length + 1, useMainVideo: true });
    setShowPartForm(false);
  };

  const handleAddOrUpdatePart = async () => {
    if (!selectedMovieForParts) return addNotification("error", "No movie selected");
    if (!partForm.title) return addNotification("error", "Part title is required");
    let finalVideoUrl = "";
    if (partForm.useMainVideo) {
      finalVideoUrl = mainVideoUrl;
      if (!finalVideoUrl) return addNotification("error", "No main video URL");
    }
    setSubmitting(true);
    try {
      const partData = {
        partNumber: parseInt(partForm.partNumber) || (movieParts.length + 1),
        title: partForm.title,
        download_link: partForm.download_link || "",
        videoUrl: finalVideoUrl
      };
      let updatedParts = editingPart
        ? movieParts.map(p => p.partNumber === editingPart.partNumber ? { ...p, ...partData } : p)
        : [...movieParts, partData];
      updatedParts.sort((a, b) => a.partNumber - b.partNumber);
      await updateMovie(selectedMovieForParts.id, { download: JSON.stringify(updatedParts) });
      setMovieParts(updatedParts);
      setPartForm({ ...emptyPart, partNumber: updatedParts.length + 1, useMainVideo: true });
      setEditingPart(null); setShowPartForm(false);
      refreshMovies();
      addNotification("success", editingPart ? "Part updated" : "Part added");
    } catch (err) {
      addNotification("error", "Error saving part");
    } finally { setSubmitting(false); }
  };

  const handleDeletePart = async (partNumber, title) => {
    if (!window.confirm(`Delete part ${partNumber} - "${title}"?`)) return;
    try {
      const updatedParts = movieParts.filter(p => p.partNumber !== partNumber).map((p, i) => ({ ...p, partNumber: i + 1 }));
      await updateMovie(selectedMovieForParts.id, { download: JSON.stringify(updatedParts) });
      setMovieParts(updatedParts);
      setPartForm({ ...emptyPart, partNumber: updatedParts.length + 1, useMainVideo: true });
      addNotification("success", `Part deleted`);
      refreshMovies();
    } catch (err) { addNotification("error", "Error deleting part"); }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || movie.type === filterType;
    return matchesSearch && matchesType;
  });
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    const aT = new Date(a.created_at || a.createdAt || 0).getTime() || 0;
    const bT = new Date(b.created_at || b.createdAt || 0).getTime() || 0;
    if (bT !== aT) return bT - aT;
    return (a.title || "").localeCompare(b.title || "");
  });
  const seriesOnly = movies.filter(m => m.type === "series");
  const moviesOnly = movies.filter(m => m.type === "movie");
  const getPartsCount = (movie) => {
    if (!movie.download) return 0;
    try {
      const p = JSON.parse(movie.download);
      if (Array.isArray(p)) return p.length;
      if (p?.parts) return p.parts.length;
    } catch (e) { return 0; }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 flex items-center justify-center px-4">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl mb-2">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md p-8">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Database Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refreshMovies} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg text-black font-semibold w-full md:w-auto">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-8 px-3 sm:px-4 md:px-6 pt-20 sm:pt-24">
      <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-50 max-w-sm w-full mx-auto sm:mx-0 space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`backdrop-blur-lg rounded-r-lg shadow-2xl p-3 sm:p-4 flex items-start gap-2 border-l-4 ${
            n.type === "success" ? "bg-green-900/90 border-green-500" :
            n.type === "error" ? "bg-red-900/90 border-red-500" : "bg-blue-900/90 border-blue-500"
          }`}>
            <div className="flex-shrink-0">
              {n.type === "success" && <FaCheckCircle className="text-emerald-400" />}
              {n.type === "error" && <FaExclamationTriangle className="text-red-400" />}
              {n.type === "info" && <FaExclamationTriangle className="text-cyan-400" />}
            </div>
            <p className="text-xs sm:text-sm flex-1 break-words">{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="text-gray-300 hover:text-white">
              <FaTimes className="text-sm" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Video Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage content, episodes, parts, translators</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => { refreshMovies(); refreshEpisodes(); addNotification("success", "Refreshed!"); }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg text-black font-semibold flex items-center justify-center gap-2 text-sm">
              <FaSync /> <span className="hidden xs:inline">Refresh</span>
            </button>
            <button onClick={() => { if (window.confirm("Logout?")) { localStorage.removeItem('admin_auth'); localStorage.removeItem('admin_auth_expiry'); onLogout && onLogout(); } }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm">
              <FaSignOutAlt /> <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="flex border-b border-gray-700 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: "series", label: "Manage Content", icon: FaTv, activeColor: "text-emerald-400 border-emerald-500" },
              { id: "episodes", label: "Manage Episodes", icon: FaList, activeColor: "text-teal-400 border-teal-500" },
              { id: "parts", label: "Manage Movie Parts", icon: FaLayerGroup, activeColor: "text-cyan-400 border-cyan-500" },
              { id: "translators", label: "Translators", icon: FaLanguage, activeColor: "text-emerald-400 border-emerald-500" }
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base border-b-2 ${
                  activeTab === t.id ? t.activeColor : "text-gray-400 hover:text-gray-300 border-transparent"
                }`}>
                <t.icon className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "series" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-emerald-900/30 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FaPlus className="text-emerald-500 text-sm sm:text-base" />
                  {editingId ? "Edit Content" : "Add New Content"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${editingId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-500/20 text-green-400'}`}>
                    {editingId ? "Editing" : "Creating"}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${form.type === 'series' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {form.type === 'series' ? 'Series' : 'Movie'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button onClick={() => setForm({ ...emptyMovie, type: "movie" })}
                  className={`p-3 sm:p-4 rounded-xl flex flex-col items-center gap-1 sm:gap-2 ${form.type === "movie" ? "bg-cyan-600/20 border-2 border-cyan-500/50" : "bg-gray-800/50 border border-gray-700"}`}>
                  <FaFilm className={`text-xl sm:text-2xl ${form.type === "movie" ? "text-cyan-400" : "text-gray-400"}`} />
                  <span className={`text-xs sm:text-sm font-medium ${form.type === "movie" ? "text-cyan-300" : "text-gray-300"}`}>Movie</span>
                </button>
                <button onClick={() => setForm({ ...emptyMovie, type: "series" })}
                  className={`p-3 sm:p-4 rounded-xl flex flex-col items-center gap-1 sm:gap-2 ${form.type === "series" ? "bg-emerald-600/20 border-2 border-emerald-500/50" : "bg-gray-800/50 border border-gray-700"}`}>
                  <FaTv className={`text-xl sm:text-2xl ${form.type === "series" ? "text-emerald-400" : "text-gray-400"}`} />
                  <span className={`text-xs sm:text-sm font-medium ${form.type === "series" ? "text-emerald-300" : "text-gray-300"}`}>Series</span>
                </button>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">Video Platform:</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = form.videoType === key;
                    return (
                      <button key={key} type="button"
                        onClick={() => setForm(prev => prev.videoType === key ? prev : { ...prev, videoType: key, videoUrl: '' })}
                        className={`p-2 sm:p-3 rounded-xl flex items-center gap-2 sm:gap-3 ${isActive ? 'border-2' : 'border border-gray-700'}`}
                        style={{ backgroundColor: isActive ? `${config.color}10` : 'rgb(31 41 55 / 0.5)', borderColor: isActive ? config.color : '' }}>
                        <Icon className={`text-lg sm:text-xl ${isActive ? '' : 'text-gray-400'}`} style={isActive ? { color: config.color } : {}} />
                        <span className={`text-xs sm:text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>{config.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-900/30 rounded-xl">
                <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3" style={{ color: platformConfig[form.videoType]?.color }}>
                  {platformConfig[form.videoType]?.name} Settings
                </h3>
                {form.videoType === VIDEO_PLATFORMS.DIRECT ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
                      <input type="file" name="videoFile" id="videoFile" accept="video/*" onChange={handleChange} className="hidden" />
                      <label htmlFor="videoFile" className="cursor-pointer block">
                        <FaUpload className="text-2xl sm:text-3xl text-gray-400 mx-auto mb-2 sm:mb-3" />
                        <div className="text-xs sm:text-sm text-gray-300 mb-1">Upload video</div>
                        <div className="text-[10px] text-gray-400 mb-2">MP4, WebM (max 500MB)</div>
                        {uploadingFile ? (
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        ) : <div className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs">Choose File</div>}
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                      <div className="relative flex justify-center text-xs"><span className="px-2 bg-gray-900 text-gray-400">OR</span></div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Video URL</label>
                      <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://cdn.com/video.mp4"
                        className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">YouTube URL *</label>
                    <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder={platformConfig[form.videoType]?.placeholder}
                      className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Enter title"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-300 flex items-center gap-1">
                      <FaMobileAlt className="text-emerald-400 text-xs" /> Poster <span className="text-emerald-400 text-[10px]">(Mobile)</span>
                    </label>
                    <button type="button" onClick={() => toggleImageMethod('poster')}
                      className="text-[10px] px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 flex items-center gap-1">
                      {imageUploadMethod.poster === 'link' ? <><FaUpload className="text-[8px]" /> Upload</> : <><FaLink className="text-[8px]" /> Link</>}
                    </button>
                  </div>
                  {imageUploadMethod.poster === 'link' ? (
                    <div className="relative">
                      <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                      <input name="poster" value={form.poster} onChange={handleChange} placeholder="Poster URL"
                        className="w-full pl-9 p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-3 text-center">
                        <input type="file" name="posterFile" id="posterFile" accept="image/*" onChange={handleChange} className="hidden" />
                        <label htmlFor="posterFile" className="cursor-pointer block">
                          <FaCloudUploadAlt className="text-xl text-gray-400 mx-auto mb-1" />
                          <div className="text-[10px] text-gray-300">Click to upload poster</div>
                          {uploadingPoster && (
                            <div className="mt-2"><div className="w-full bg-gray-700 rounded-full h-1">
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full" style={{ width: `${posterProgress}%` }} />
                            </div></div>
                          )}
                        </label>
                      </div>
                      {(posterPreview || form.poster) && (
                        <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                          <img src={posterPreview || form.poster} alt="" className="w-10 h-14 object-cover rounded" />
                          <p className="text-[10px] text-gray-400">Poster ready</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-300 flex items-center gap-1">
                      <FaDesktop className="text-cyan-400 text-xs" /> Background <span className="text-cyan-400 text-[10px]">(Desktop)</span>
                    </label>
                    <button type="button" onClick={() => toggleImageMethod('background')}
                      className="text-[10px] px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 flex items-center gap-1">
                      {imageUploadMethod.background === 'link' ? <><FaUpload className="text-[8px]" /> Upload</> : <><FaLink className="text-[8px]" /> Link</>}
                    </button>
                  </div>
                  {imageUploadMethod.background === 'link' ? (
                    <div className="relative">
                      <FaMountain className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                      <input name="background" value={form.background} onChange={handleChange} placeholder="Background URL"
                        className="w-full pl-9 p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-3 text-center">
                        <input type="file" name="backgroundFile" id="backgroundFile" accept="image/*" onChange={handleChange} className="hidden" />
                        <label htmlFor="backgroundFile" className="cursor-pointer block">
                          <FaCloudUploadAlt className="text-xl text-gray-400 mx-auto mb-1" />
                          <div className="text-[10px] text-gray-300">Click to upload background</div>
                          {uploadingBackground && (
                            <div className="mt-2"><div className="w-full bg-gray-700 rounded-full h-1">
                              <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1 rounded-full" style={{ width: `${backgroundProgress}%` }} />
                            </div></div>
                          )}
                        </label>
                      </div>
                      {(backgroundPreview || form.background) && (
                        <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                          <img src={backgroundPreview || form.background} alt="" className="w-14 h-9 object-cover rounded" />
                          <p className="text-[10px] text-gray-400">Background ready</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <FaCalendar className="text-xs" /> Year
                  </label>
                  <input name="year" value={form.year} onChange={handleChange} placeholder="2024"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm" />
                </div>

                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <FaTag className="text-amber-400" /> Category
                  </label>
                  <button type="button" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm flex items-center justify-between">
                    <span className={form.category ? "" : "text-gray-400"}>{form.category || "Select a category..."}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCategoryDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                      <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                        <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                          <input type="text" placeholder="Search..." value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-xs text-white" autoFocus />
                        </div>
                        {filteredCategories.map(c => (
                          <button key={c} type="button" onClick={() => handleCategorySelect(c)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-700 text-xs sm:text-sm flex items-center gap-2">
                            <FaTag className="text-amber-400 text-xs" /> {c}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <FaLanguage className="text-emerald-400" /> Translator
                  </label>
                  <select name="translator" value={form.translator} onChange={handleChange}
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm text-white">
                    <option value="">— No translator —</option>
                    {adminTranslators.map(t => (
                      <option key={t.name} value={t.name}>{t.display_name || t.name}</option>
                    ))}
                    {form.translator && !adminTranslators.find(t => t.name === form.translator) && (
                      <option value={form.translator}>{form.translator} (legacy)</option>
                    )}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Need a new translator? Add it in the <span className="text-emerald-400">Translators</span> tab.
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <FaGlobe className="text-cyan-400" /> Country / Nation
                  </label>
                  <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {form.nation ? (
                        <><span>{countries.find(c => c.name === form.nation)?.flag || '🌍'}</span><span className="truncate">{form.nation}</span></>
                      ) : <span className="text-gray-400">Select a country...</span>}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCountryDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCountryDropdown(false)} />
                      <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                        <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                          <input type="text" placeholder="Search..." value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-xs text-white" autoFocus />
                        </div>
                        {filteredCountries.map(c => (
                          <button key={c.code} type="button" onClick={() => handleCountrySelect(c.name)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-700 text-xs sm:text-sm flex items-center gap-2">
                            <span>{c.flag}</span> <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="2"
                    placeholder="Enter description"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm" />
                </div>

                <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-700">
                  <CastFetcher movie={form} addNotification={addNotification}
                    stagedCast={stagedCast} onCastStaged={setStagedCast} />
                </div>

                {/* ⭐ IN-FORM PARTS — ONLY for type === "movie" (restored) */}
                {form.type === 'movie' && (
                  <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-200 flex items-center gap-2">
                        <FaLayerGroup className="text-cyan-400 text-xs" />
                        Movie Parts / Download Links
                        <span className="text-[10px] text-gray-500">(optional — for full movies)</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 bg-cyan-600/20 text-cyan-300 rounded-full">
                        {formParts.length} part(s)
                      </span>
                    </div>

                    <div className="mb-4 p-3 sm:p-4 bg-cyan-900/15 rounded-xl border border-cyan-500/30">
                      <h4 className="text-xs sm:text-sm font-bold mb-3 text-cyan-300">
                        {editingFormPart ? `Edit Part ${editingFormPart.partNumber}` : "Add New Part"}
                      </h4>

                      <div className="mb-3 p-2 sm:p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={formPartForm.useMainVideo}
                            onChange={toggleUseMainVideoForFormPart}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-cyan-300 flex items-center gap-2">
                              <FaVideo className="text-[10px]" /> Use Main Movie Video
                            </span>
                            <p className="text-[9px] text-gray-400 mt-0.5 break-all">
                              Main: {(mainVideoUrl || form.videoUrl) || "No main video set yet"}
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Part Number</label>
                          <input name="partNumber" value={formPartForm.partNumber} onChange={handleFormPartChange}
                            type="number" min="1"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Part Title *</label>
                          <input name="title" value={formPartForm.title} onChange={handleFormPartChange}
                            placeholder="e.g., Part 1: The Beginning"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <FaDownload className="text-[9px]" /> Download Link (Optional)
                          </label>
                          <input name="download_link" value={formPartForm.download_link} onChange={handleFormPartChange}
                            placeholder="https://example.com/download/part1.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                          <button type="button" onClick={handleAddOrUpdateFormPart}
                            className="w-full sm:flex-1 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-lg font-semibold text-xs text-black flex items-center justify-center gap-1">
                            <FaPlusCircle className="text-[10px]" />
                            {editingFormPart ? "Update Part" : "Add Part"}
                          </button>
                          {editingFormPart && (
                            <button type="button" onClick={handleCancelEditFormPart}
                              className="w-full sm:w-auto px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-xs">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {formParts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-cyan-300 font-medium">Parts added ({formParts.length}):</p>
                        {formParts.map((part) => (
                          <div key={part.partNumber} className="bg-gray-800/40 rounded-lg p-2.5 border border-gray-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                                  <span className="px-2 py-0.5 bg-cyan-600/20 text-cyan-400 rounded-full text-[10px] font-bold">
                                    Part {part.partNumber}
                                  </span>
                                  <h4 className="font-medium text-xs truncate">{part.title}</h4>
                                  {part.download_link && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] flex items-center gap-0.5">
                                      <FaDownload className="text-[6px]" /> Link
                                    </span>
                                  )}
                                  {part.videoUrl && (
                                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[8px] flex items-center gap-0.5">
                                      <FaVideo className="text-[6px]" /> Video
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 self-end sm:self-center">
                                <button type="button" onClick={() => handleEditFormPart(part)}
                                  className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 rounded" title="Edit">
                                  <FaEdit className="text-emerald-400 text-xs" />
                                </button>
                                <button type="button" onClick={() => handleDeleteFormPart(part.partNumber, part.title)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded" title="Delete">
                                  <FaTrash className="text-red-400 text-xs" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-500 mt-3">
                      These parts are saved with the movie and appear in the same place as the ones you add in <span className="text-cyan-400">Manage Movie Parts</span>.
                    </p>
                  </div>
                )}

                {/* ⭐ IN-FORM EPISODES — only for series */}
                {form.type === 'series' && (
                  <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-200 flex items-center gap-2">
                        <FaList className="text-teal-400 text-xs" />
                        Series Episodes
                        <span className="text-[10px] text-gray-500">(add multiple before saving)</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 bg-teal-600/20 text-teal-300 rounded-full">
                        {formEpisodes.length} episode(s)
                      </span>
                    </div>

                    <div className="mb-4 p-3 sm:p-4 bg-teal-900/15 rounded-xl border border-teal-500/30">
                      <h4 className="text-xs sm:text-sm font-bold mb-3 text-teal-300">
                        {editingFormEpisode
                          ? `Edit Episode S${editingFormEpisode.seasonNumber}E${editingFormEpisode.episodeNumber}`
                          : "Add New Episode"}
                      </h4>

                      <div className="mb-3 p-2 sm:p-3 bg-teal-900/20 rounded-lg border border-teal-500/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={formEpisodeForm.useMainVideo}
                            onChange={toggleUseMainVideoForFormEpisode}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-600 focus:ring-teal-500" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-teal-300 flex items-center gap-2">
                              <FaVideo className="text-[10px]" /> Use Main Series Video
                            </span>
                            <p className="text-[9px] text-gray-400 mt-0.5 break-all">
                              Main: {(mainVideoUrl || form.videoUrl) || "No main video set yet"}
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Season</label>
                          <input name="seasonNumber" value={formEpisodeForm.seasonNumber} onChange={handleFormEpisodeChange}
                            type="number" min="1"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Episode</label>
                          <input name="episodeNumber" value={formEpisodeForm.episodeNumber} onChange={handleFormEpisodeChange}
                            type="number" min="1"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Episode Title *</label>
                          <input name="title" value={formEpisodeForm.title} onChange={handleFormEpisodeChange}
                            placeholder="e.g., The Beginning"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <FaDownload className="text-[9px]" /> Download Link (Optional)
                          </label>
                          <input name="download_link" value={formEpisodeForm.download_link} onChange={handleFormEpisodeChange}
                            placeholder="https://example.com/download/ep1.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Air Date</label>
                          <input name="airDate" value={formEpisodeForm.airDate} onChange={handleFormEpisodeChange}
                            type="date"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Thumbnail (optional)</label>
                          <input name="thumbnail" value={formEpisodeForm.thumbnail} onChange={handleFormEpisodeChange}
                            placeholder="https://example.com/thumb.jpg"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-medium text-gray-300 mb-1">Description</label>
                          <textarea name="description" value={formEpisodeForm.description} onChange={handleFormEpisodeChange}
                            rows="2" placeholder="Episode description"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs" />
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                          <button type="button" onClick={handleAddOrUpdateFormEpisode}
                            className="w-full sm:flex-1 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg font-semibold text-xs text-black flex items-center justify-center gap-1">
                            <FaPlusCircle className="text-[10px]" />
                            {editingFormEpisode ? "Update Episode" : "Add Episode"}
                          </button>
                          {editingFormEpisode && (
                            <button type="button" onClick={handleCancelEditFormEpisode}
                              className="w-full sm:w-auto px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-xs">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {formEpisodes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-teal-300 font-medium">Episodes queued ({formEpisodes.length}):</p>
                        {formEpisodes.map((ep) => (
                          <div key={ep.tempId} className="bg-gray-800/40 rounded-lg p-2.5 border border-gray-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                                  <span className="px-2 py-0.5 bg-teal-600/20 text-teal-400 rounded-full text-[10px] font-bold">
                                    S{ep.seasonNumber}E{ep.episodeNumber}
                                  </span>
                                  <h4 className="font-medium text-xs truncate">{ep.title}</h4>
                                  {ep.download_link && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] flex items-center gap-0.5">
                                      <FaDownload className="text-[6px]" /> Link
                                    </span>
                                  )}
                                </div>
                                {ep.description && (
                                  <p className="text-[10px] text-gray-400 truncate">{ep.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1 self-end sm:self-center">
                                <button type="button" onClick={() => handleEditFormEpisode(ep)}
                                  className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 rounded" title="Edit">
                                  <FaEdit className="text-emerald-400 text-xs" />
                                </button>
                                <button type="button" onClick={() => handleDeleteFormEpisode(ep.tempId)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded" title="Delete">
                                  <FaTrash className="text-red-400 text-xs" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-500 mt-3">
                      Episodes are saved automatically when you click <span className="text-teal-400">Add</span>/<span className="text-teal-400">Update</span>.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button onClick={handleAddOrUpdate} disabled={submitting || uploadingFile || uploadingPoster || uploadingBackground}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm text-black">
                  <FaSave className="text-xs sm:text-sm" />
                  {submitting ? "Processing..." : editingId ? "Update" : "Add"}
                </button>
                <button onClick={resetForm}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                  <FaUndo className="text-xs sm:text-sm" /> Reset
                </button>
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FaTv className="text-emerald-500 text-sm sm:text-base" />
                  All Content ({movies.length})
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white text-xs sm:text-sm" />
                  </div>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white text-xs sm:text-sm">
                    <option value="all">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="series">Series</option>
                  </select>
                </div>
              </div>

              {sortedMovies.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-emerald-900/30 p-8 sm:p-12 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">No Content Found</h2>
                  <p className="text-xs sm:text-sm text-gray-400">Add your first item to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {sortedMovies.map((movie) => {
                    const episodeCount = movie.type === 'series' ? getEpisodesBySeries(movie.id).length : 0;
                    const partsCount = movie.type === 'movie' ? getPartsCount(movie) : 0;
                    const platform = platformConfig[movie.videoType] || platformConfig[VIDEO_PLATFORMS.YOUTUBE];
                    const countryFlag = countries.find(c => c.name === movie.nation)?.flag || '🌍';

                    return (
                      <div key={movie.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-emerald-900/30 p-3 sm:p-4">
                        <div className="flex gap-2 sm:gap-3">
                          <img src={movie.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                            alt={movie.title} className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1 mb-1">
                              <h3 className="font-bold text-xs sm:text-sm truncate">{movie.title}</h3>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => startEdit(movie)} className="p-1 bg-emerald-600/20 hover:bg-emerald-600/30 rounded" title="Edit">
                                  <FaEdit className="text-emerald-400 text-[10px]" />
                                </button>
                                {movie.type === 'series' && (
                                  <button onClick={() => selectSeriesForEpisodes(movie)} className="p-1 bg-teal-600/20 hover:bg-teal-600/30 rounded" title="Manage Episodes">
                                    <FaList className="text-teal-400 text-[10px]" />
                                  </button>
                                )}
                                {movie.type === 'movie' && (
                                  <button onClick={() => selectMovieForParts(movie)} className="p-1 bg-cyan-600/20 hover:bg-cyan-600/30 rounded" title="Manage Parts">
                                    <FaLayerGroup className="text-cyan-400 text-[10px]" />
                                  </button>
                                )}
                                <button onClick={() => handleDelete(movie.id)} className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded" title="Delete">
                                  <FaTrash className="text-red-400 text-[10px]" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${movie.type === 'series' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                {movie.type === 'series' ? 'Series' : 'Movie'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-[8px]" style={{ backgroundColor: `${platform.color}20`, color: platform.color }}>
                                {platform.name}
                              </span>
                              {movie.category && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-amber-600/20 text-amber-400 flex items-center gap-0.5">
                                  <FaTag className="text-[6px]" /> {movie.category}
                                </span>
                              )}
                              {movie.translator && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-green-600/20 text-green-400 flex items-center gap-0.5">
                                  <FaLanguage className="text-[6px]" /> {movie.translator}
                                </span>
                              )}
                              {movie.nation && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-cyan-600/20 text-cyan-400 flex items-center gap-0.5">
                                  <span>{countryFlag}</span> {movie.nation}
                                </span>
                              )}
                              {movie.type === 'series' && episodeCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-teal-500/20 text-teal-400">
                                  {episodeCount} eps
                                </span>
                              )}
                              {movie.type === 'movie' && partsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-green-500/20 text-green-400">
                                  {partsCount} parts
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-300 truncate">{movie.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "episodes" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-emerald-900/30 p-4 sm:p-6">
              {!selectedSeries ? (
                <div className="text-center py-8 sm:py-12">
                  <h3 className="text-base sm:text-xl font-bold mb-3">Select a Series</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-6">Choose a series to manage episodes</p>
                  {seriesOnly.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">No series available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {seriesOnly.map(series => (
                        <button key={series.id} onClick={() => selectSeriesForEpisodes(series)}
                          className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                          <FaTv className="text-xs" />
                          <span className="truncate max-w-[150px]">{series.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button onClick={backToSeriesList}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs sm:text-sm">
                      <FaArrowLeft className="text-xs" /> Back to Series
                    </button>
                    <div className="text-center sm:text-right">
                      <h3 className="text-sm sm:text-lg font-bold text-teal-400 truncate">{selectedSeries.title}</h3>
                      <p className="text-[10px] text-gray-400">Managing episodes</p>
                    </div>
                  </div>

                  {(showEpisodeForm || editingEpisode) && (
                    <div className="mb-4 sm:mb-6 p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-sm sm:text-lg font-bold mb-3">
                        {editingEpisode ? "Edit Episode" : "Add New Episode"}
                      </h3>
                      <div className="mb-4 p-3 bg-teal-900/20 rounded-lg border border-teal-500/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={episodeForm.useMainVideo} onChange={toggleUseMainVideoForEpisode}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-600" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-teal-300 flex items-center gap-2">
                              <FaVideo className="text-xs" /> Use Main Series Video
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 break-all">Main: {mainVideoUrl || "No main video"}</p>
                          </div>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Season</label>
                          <input name="seasonNumber" value={episodeForm.seasonNumber} onChange={handleEpisodeChange}
                            type="number" className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Episode</label>
                          <input name="episodeNumber" value={episodeForm.episodeNumber} onChange={handleEpisodeChange}
                            type="number" className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Title *</label>
                          <input name="title" value={episodeForm.title} onChange={handleEpisodeChange}
                            placeholder="Episode title"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Download Link</label>
                          <input name="download_link" value={episodeForm.download_link} onChange={handleEpisodeChange}
                            placeholder="https://example.com/ep.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Air Date</label>
                          <input name="airDate" value={episodeForm.airDate} onChange={handleEpisodeChange} type="date"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                          <textarea name="description" value={episodeForm.description} onChange={handleEpisodeChange}
                            rows="2" className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Thumbnail</label>
                          <input name="thumbnail" value={episodeForm.thumbnail} onChange={handleEpisodeChange}
                            placeholder="https://example.com/thumb.jpg"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                          <button onClick={handleAddOrUpdateEpisode} disabled={submitting}
                            className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 text-xs text-black">
                            {submitting ? 'Processing...' : (editingEpisode ? 'Update Episode' : 'Add Episode')}
                          </button>
                          <button onClick={cancelEpisodeEdit}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-xs">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!editingEpisode && !showEpisodeForm && (
                    <div className="mb-4">
                      <button onClick={() => {
                        setEpisodeForm({
                          ...emptyEpisode,
                          seasonNumber: seriesEpisodes.length > 0
                            ? seriesEpisodes[seriesEpisodes.length - 1].seasonNumber?.toString() || "1" : "1",
                          episodeNumber: seriesEpisodes.length > 0
                            ? (parseInt(seriesEpisodes[seriesEpisodes.length - 1].episodeNumber || 0) + 1).toString() : "1",
                          useMainVideo: true
                        });
                        setShowEpisodeForm(true);
                      }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs text-black">
                        <FaPlus className="text-xs" /> Add New Episode
                      </button>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm sm:text-lg font-bold mb-3">Episodes ({seriesEpisodes.length})</h3>
                    {seriesEpisodes.length === 0 ? (
                      <div className="text-center py-6 text-xs sm:text-sm text-gray-400">
                        No episodes yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sortEpisodes(seriesEpisodes).map((episode, index) => (
                          <div key={episode.id || index} className="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-1.5 mb-1">
                                  <span className="px-2 py-0.5 bg-teal-600/20 text-teal-400 rounded-full text-[10px]">
                                    S{episode.seasonNumber}E{episode.episodeNumber}
                                  </span>
                                  <h4 className="font-medium text-xs">{episode.title}</h4>
                                  {episode.download_link && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] flex items-center gap-0.5">
                                      <FaDownload className="text-[6px]" /> DL
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 self-end sm:self-center">
                                <button onClick={() => startEditEpisode(episode)} className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 rounded">
                                  <FaEdit className="text-emerald-400 text-xs" />
                                </button>
                                <button onClick={() => handleDeleteEpisode(episode.id, episode.title)} className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded">
                                  <FaTrash className="text-red-400 text-xs" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "parts" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-emerald-900/30 p-4 sm:p-6">
              {!selectedMovieForParts ? (
                <div className="text-center py-8 sm:py-12">
                  <h3 className="text-base sm:text-xl font-bold mb-3">Select a Movie</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-6">Choose a movie to manage its parts</p>
                  {moviesOnly.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">No movies available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {moviesOnly.map(movie => (
                        <button key={movie.id} onClick={() => selectMovieForParts(movie)}
                          className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                          <FaFilm className="text-xs" />
                          <span className="truncate max-w-[150px]">{movie.title}</span>
                          {getPartsCount(movie) > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-cyan-600/20 text-cyan-400 rounded-full text-[8px]">
                              {getPartsCount(movie)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button onClick={backToMovieList}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs sm:text-sm">
                      <FaArrowLeft className="text-xs" /> Back to Movies
                    </button>
                    <div className="text-center sm:text-right">
                      <h3 className="text-sm sm:text-lg font-bold text-cyan-400 truncate">{selectedMovieForParts.title}</h3>
                      <p className="text-[10px] text-gray-400">Managing parts</p>
                    </div>
                  </div>

                  {(showPartForm || editingPart) && (
                    <div className="mb-4 sm:mb-6 p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-sm sm:text-lg font-bold mb-3">
                        {editingPart ? `Edit Part ${editingPart.partNumber}` : "Add New Part"}
                      </h3>
                      <div className="mb-4 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={partForm.useMainVideo} onChange={toggleUseMainVideoForPart}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-600" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                              <FaVideo className="text-xs" /> Use Main Movie Video
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 break-all">Main: {mainVideoUrl || "No main video"}</p>
                          </div>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Part Number</label>
                          <input name="partNumber" value={partForm.partNumber} onChange={handlePartChange}
                            type="number" min="1" className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Part Title *</label>
                          <input name="title" value={partForm.title} onChange={handlePartChange}
                            placeholder="e.g., Part 1: The Beginning"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <FaDownload className="text-[10px]" /> Download Link
                          </label>
                          <input name="download_link" value={partForm.download_link} onChange={handlePartChange}
                            placeholder="https://example.com/part1.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs" />
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                          <button onClick={handleAddOrUpdatePart} disabled={submitting}
                            className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 text-xs text-black">
                            {submitting ? 'Processing...' : (editingPart ? 'Update Part' : 'Add Part')}
                          </button>
                          <button onClick={cancelPartEdit}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-xs">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!editingPart && !showPartForm && (
                    <div className="mb-4">
                      <button onClick={() => {
                        setPartForm({ ...emptyPart, partNumber: movieParts.length + 1, useMainVideo: true });
                        setShowPartForm(true);
                      }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs text-black">
                        <FaPlusCircle className="text-xs" /> Add New Part
                      </button>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm sm:text-lg font-bold mb-3">Parts ({movieParts.length})</h3>
                    {movieParts.length === 0 ? (
                      <div className="text-center py-6 text-xs sm:text-sm text-gray-400">
                        <FaLayerGroup className="text-2xl mx-auto mb-2 opacity-30" />
                        <p>No parts yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {movieParts.map((part) => (
                          <div key={part.partNumber} className="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span className="px-2 py-0.5 bg-cyan-600/20 text-cyan-400 rounded-full text-[10px] font-bold">
                                  Part {part.partNumber}
                                </span>
                                <h4 className="font-medium text-xs">{part.title}</h4>
                              </div>
                              <div className="flex gap-1 self-end sm:self-center">
                                <button onClick={() => startEditPart(part)} className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 rounded">
                                  <FaEdit className="text-emerald-400 text-xs" />
                                </button>
                                <button onClick={() => handleDeletePart(part.partNumber, part.title)} className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded">
                                  <FaTrash className="text-red-400 text-xs" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "translators" && (
          <TranslatorManager
            movies={movies}
            addNotification={addNotification}
            updateMovie={updateMovie}
            refreshMovies={refreshMovies}
          />
        )}
      </div>
    </main>
  );
}

export default Admin;