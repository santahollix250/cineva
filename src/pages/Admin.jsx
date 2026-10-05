import { useContext, useState, useEffect } from "react";
import { MoviesContext } from "../context/MoviesContext";
import { supabase } from '../lib/supabase';
import { getTranslatorsWithProfiles } from '../lib/translators';
import { saveCastForMovie } from '../lib/tmdb';
import TranslatorManager from '../components/TranslatorManager';
import CastFetcher from '../components/CastFetcher';
import {
  FaEdit, FaTrash, FaFilm, FaTv, FaSave, FaUndo, FaPlus,
  FaLink, FaImage, FaGlobe, FaLanguage, FaSync, FaDatabase,
  FaCheckCircle, FaExclamationTriangle, FaTimes, FaList,
  FaDownload, FaSignOutAlt, FaVideo, FaCode,
  FaSearch, FaUpload,
  FaMountain, FaYoutube, FaPlayCircle,
  FaServer, FaCopy, FaFileVideo, FaCalendar, FaStar,
  FaClosedCaptioning, FaMicrophone, FaUser, FaTag,
  FaArrowLeft, FaLayerGroup, FaPlusCircle, FaCloudUploadAlt,
  FaMobileAlt, FaDesktop, FaMagic
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

  const VIDEO_PLATFORMS = {
    YOUTUBE: 'youtube',
    DIRECT: 'direct'
  };

  const platformConfig = {
    [VIDEO_PLATFORMS.YOUTUBE]: {
      name: 'YouTube',
      color: '#FF0000',
      icon: FaYoutube,
      description: 'Free video hosting',
      placeholder: 'https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID',
      embedPattern: 'https://www.youtube.com/embed/{id}'
    },
    [VIDEO_PLATFORMS.DIRECT]: {
      name: 'Direct Video',
      color: '#10b981',
      icon: FaFileVideo,
      description: 'Direct video file URL',
      placeholder: 'https://your-cdn.com/video.mp4 or .m3u8',
      embedPattern: null
    }
  };

  const emptyMovie = {
    title: "",
    description: "",
    poster: "",
    background: "",
    category: "",
    type: "movie",
    videoUrl: "",
    streamLink: "",
    download_link: "",
    nation: "",
    translator: "",
    totalSeasons: "",
    totalEpisodes: "",
    videoType: VIDEO_PLATFORMS.YOUTUBE,
    videoId: "",
    embedCode: "",
    duration: "",
    quality: "HD",
    videoFile: null,
    year: "",
    director: "",
    imdbRating: "",
    status: "completed",
    views: "0",
    download: "",
    parts: []
  };

  const emptyPart = {
    partNumber: 1,
    title: "",
    download_link: "",
    useMainVideo: true
  };

  const emptyEpisode = {
    id: null,
    seasonNumber: "1",
    episodeNumber: "1",
    title: "",
    description: "",
    download_link: "",
    thumbnail: "",
    airDate: new Date().toISOString().split('T')[0],
    useMainVideo: true
  };

  const [form, setForm] = useState(emptyMovie);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Online");
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
  const [imageUploadMethod, setImageUploadMethod] = useState({
    poster: 'link',
    background: 'link'
  });

  const [selectedMovieForParts, setSelectedMovieForParts] = useState(null);
  const [movieParts, setMovieParts] = useState([]);
  const [partForm, setPartForm] = useState(emptyPart);
  const [editingPart, setEditingPart] = useState(null);
  const [showPartForm, setShowPartForm] = useState(false);

  const [editingEpisode, setEditingEpisode] = useState(null);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);

  const [mainVideoUrl, setMainVideoUrl] = useState("");

  // ⭐ NEW: parts added inside the "Add/Edit Content" form.
  // Same shape as movieParts so both writers/readers stay in sync.
  const [formParts, setFormParts] = useState([]);          // list of saved-in-form parts
  const [formPartForm, setFormPartForm] = useState(emptyPart); // the mini "add part" form
  const [editingFormPart, setEditingFormPart] = useState(null); // part being edited in-form

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

  useEffect(() => {
    setSyncStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  const extractYoutubeId = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    return '';
  };

  const generateEmbedUrl = (videoId) => {
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const detectPlatform = (url) => {
    if (!url || typeof url !== 'string') return VIDEO_PLATFORMS.YOUTUBE;
    if (/youtube\.com/.test(url) || /youtu\.be/.test(url)) {
      return VIDEO_PLATFORMS.YOUTUBE;
    }
    if (/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) {
      return VIDEO_PLATFORMS.DIRECT;
    }
    return VIDEO_PLATFORMS.YOUTUBE;
  };

  const validateVideoUrl = (url, platform) => {
    if (!url) return { valid: false, message: 'URL is required' };
    if (platform === VIDEO_PLATFORMS.YOUTUBE) {
      const youtubeId = extractYoutubeId(url);
      if (!youtubeId) return { valid: false, message: 'Invalid YouTube URL' };
      return { valid: true, id: youtubeId };
    }
    if (platform === VIDEO_PLATFORMS.DIRECT) {
      if (!/\.(mp4|webm|mkv|avi|mov|m3u8|mpd|m4v|wmv|flv|ogg|ogv)$/i.test(url)) {
        return { valid: false, message: 'Invalid video file URL' };
      }
      return { valid: true, id: url };
    }
    return { valid: false, message: 'Unknown platform' };
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      addNotification("error", "Invalid image type. Please upload JPEG, PNG, WebP, or GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addNotification("error", "Image too large (max 5MB)");
      return;
    }

    if (!isOnline) {
      addNotification("error", "You are offline. Cannot upload images.");
      return;
    }

    if (type === 'poster') {
      setUploadingPoster(true);
      setPosterProgress(0);
    } else {
      setUploadingBackground(true);
      setBackgroundProgress(0);
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'poster') {
        setPosterPreview(previewUrl);
      } else {
        setBackgroundPreview(previewUrl);
      }

      const bucket = type === 'poster' ? 'posters' : 'backgrounds';
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const progressInterval = setInterval(() => {
        if (type === 'poster') {
          setPosterProgress(prev => Math.min(prev + 10, 90));
        } else {
          setBackgroundProgress(prev => Math.min(prev + 10, 90));
        }
      }, 200);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (type === 'poster') {
        setForm(prev => ({ ...prev, poster: publicUrl }));
        setUploadingPoster(false);
        setPosterProgress(100);
        setImageUploadMethod(prev => ({ ...prev, poster: 'upload' }));
        addNotification("success", `Poster uploaded successfully`);
      } else {
        setForm(prev => ({ ...prev, background: publicUrl }));
        setUploadingBackground(false);
        setBackgroundProgress(100);
        setImageUploadMethod(prev => ({ ...prev, background: 'upload' }));
        addNotification("success", `Background uploaded successfully`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      addNotification("error", `Failed to upload: ${error.message}`);

      if (type === 'poster') {
        if (posterPreview) URL.revokeObjectURL(posterPreview);
        setPosterPreview('');
        setUploadingPoster(false);
        setPosterProgress(0);
      } else {
        if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
        setBackgroundPreview('');
        setUploadingBackground(false);
        setBackgroundProgress(0);
      }
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      addNotification("error", "Invalid file type");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      addNotification("error", "File too large (max 500MB)");
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      const simulateUpload = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(simulateUpload);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);

      setForm(prev => ({
        ...prev,
        videoType: VIDEO_PLATFORMS.DIRECT,
        videoFile: file,
        videoUrl: previewUrl
      }));
      setMainVideoUrl(previewUrl);

      setTimeout(() => {
        clearInterval(simulateUpload);
        setUploadProgress(100);
        setUploadingFile(false);
        addNotification("success", `Video uploaded`);
      }, 2000);

    } catch (error) {
      addNotification("error", "Failed to upload video");
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    if (selectedSeries && typeof getEpisodesBySeries === 'function') {
      const loadedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      const sortedEpisodes = sortEpisodes(loadedEpisodes);
      setSeriesEpisodes(sortedEpisodes);

      if (selectedSeries.videoUrl) {
        setMainVideoUrl(selectedSeries.videoUrl);
      }

      if (loadedEpisodes.length > 0) {
        const lastEpisode = loadedEpisodes.reduce((prev, current) => {
          const prevNum = parseInt(prev.episodeNumber || 0);
          const currNum = parseInt(current.episodeNumber || 0);
          return prevNum > currNum ? prev : current;
        });

        setEpisodeForm({
          ...emptyEpisode,
          seasonNumber: (lastEpisode.seasonNumber || 1).toString(),
          episodeNumber: (parseInt(lastEpisode.episodeNumber || 0) + 1).toString(),
          useMainVideo: true
        });
      } else {
        setEpisodeForm({
          ...emptyEpisode,
          useMainVideo: true
        });
      }
    }
  }, [selectedSeries, getEpisodesBySeries]);

  useEffect(() => {
    if (selectedMovieForParts) {
      try {
        let parts = [];
        if (selectedMovieForParts.download) {
          try {
            const parsed = JSON.parse(selectedMovieForParts.download);
            if (Array.isArray(parsed)) {
              parts = parsed;
            } else if (parsed && parsed.parts) {
              parts = parsed.parts;
            }
          } catch (e) {
            parts = [];
          }
        }
        setMovieParts(parts.sort((a, b) => a.partNumber - b.partNumber));

        if (selectedMovieForParts.videoUrl) {
          setMainVideoUrl(selectedMovieForParts.videoUrl);
        }

        setPartForm({
          ...emptyPart,
          partNumber: parts.length + 1,
          useMainVideo: true
        });
      } catch (e) {
        setMovieParts([]);
      }
    }
  }, [selectedMovieForParts]);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [posterPreview, backgroundPreview, videoPreviewUrl]);

  const sortEpisodes = (episodesArray) => {
    if (!episodesArray || !Array.isArray(episodesArray)) return [];
    return [...episodesArray].sort((a, b) => {
      const aSeason = parseInt(a.seasonNumber) || 1;
      const bSeason = parseInt(b.seasonNumber) || 1;
      const aEpisode = parseInt(a.episodeNumber) || 1;
      const bEpisode = parseInt(b.episodeNumber) || 1;
      if (aSeason !== bSeason) return aSeason - bSeason;
      return aEpisode - bEpisode;
    });
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_auth_expiry');
      if (onLogout) onLogout();
    }
  };

  function addNotification(type, message) {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, message }]);
    return id;
  }

  function removeNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleCountrySelect = (countryName) => {
    setForm(prev => ({ ...prev, nation: countryName }));
    setShowCountryDropdown(false);
    setCountrySearchTerm("");
  };

  const handleCategorySelect = (category) => {
    setForm(prev => ({ ...prev, category: category }));
    setShowCategoryDropdown(false);
    setCategorySearchTerm("");
  };

  function handleChange(e) {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      if (name === 'videoFile') {
        const file = files[0];
        handleFileUpload(file);
      } else if (name === 'posterFile') {
        const file = files[0];
        handleImageUpload(file, 'poster');
      } else if (name === 'backgroundFile') {
        const file = files[0];
        handleImageUpload(file, 'background');
      }
    } else if (name === "videoUrl") {
      const detectedPlatform = detectPlatform(value);
      setForm((f) => ({
        ...f,
        [name]: value,
        videoType: detectedPlatform
      }));
      setMainVideoUrl(value);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleEpisodeChange(e) {
    const { name, value } = e.target;
    setEpisodeForm((f) => ({ ...f, [name]: value }));
  }

  function handlePartChange(e) {
    const { name, value } = e.target;
    setPartForm((f) => ({ ...f, [name]: value }));
  }

  // ⭐ NEW: form part change handler (mirrors handlePartChange but for the in-form mini form)
  function handleFormPartChange(e) {
    const { name, value } = e.target;
    setFormPartForm((f) => ({ ...f, [name]: value }));
  }

  function toggleUseMainVideoForEpisode() {
    setEpisodeForm(prev => ({
      ...prev,
      useMainVideo: !prev.useMainVideo
    }));
  }

  function toggleUseMainVideoForPart() {
    setPartForm(prev => ({
      ...prev,
      useMainVideo: !prev.useMainVideo
    }));
  }

  // ⭐ NEW: toggle for form part's "use main video"
  function toggleUseMainVideoForFormPart() {
    setFormPartForm(prev => ({
      ...prev,
      useMainVideo: !prev.useMainVideo
    }));
  }

  function toggleImageMethod(type) {
    setImageUploadMethod(prev => ({
      ...prev,
      [type]: prev[type] === 'link' ? 'upload' : 'link'
    }));

    if (type === 'poster') {
      setForm(prev => ({ ...prev, poster: '' }));
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
        setPosterPreview('');
      }
    } else {
      setForm(prev => ({ ...prev, background: '' }));
      if (backgroundPreview) {
        URL.revokeObjectURL(backgroundPreview);
        setBackgroundPreview('');
      }
    }
  }

  // ⭐ NEW: in-form parts — add / update / delete / edit
  function handleAddOrUpdateFormPart() {
    if (!formPartForm.title) {
      addNotification("error", "Part title is required");
      return;
    }

    let finalVideoUrl = "";
    if (formPartForm.useMainVideo) {
      finalVideoUrl = mainVideoUrl || form.videoUrl;
      if (!finalVideoUrl) {
        addNotification("error", "No main video URL yet. Add the main video URL first, or uncheck 'Use Main Video'.");
        return;
      }
    }

    setFormParts(prev => {
      const data = {
        partNumber: parseInt(formPartForm.partNumber) || (prev.length + 1),
        title: formPartForm.title,
        download_link: formPartForm.download_link || "",
        videoUrl: finalVideoUrl
      };

      let updated;
      if (editingFormPart) {
        updated = prev.map(p => p.partNumber === editingFormPart.partNumber ? { ...p, ...data } : p);
        addNotification("success", `Part ${data.partNumber} updated`);
      } else {
        updated = [...prev, data];
        addNotification("success", `Part ${data.partNumber} added`);
      }
      return updated.sort((a, b) => a.partNumber - b.partNumber);
    });

    setFormPartForm({
      ...emptyPart,
      partNumber: (formParts.length + 2),
      useMainVideo: true
    });
    setEditingFormPart(null);
  }

  function handleEditFormPart(part) {
    setEditingFormPart(part);
    setFormPartForm({
      partNumber: part.partNumber,
      title: part.title,
      download_link: part.download_link || "",
      useMainVideo: false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEditFormPart() {
    setEditingFormPart(null);
    setFormPartForm({
      ...emptyPart,
      partNumber: formParts.length + 1,
      useMainVideo: true
    });
  }

  function handleDeleteFormPart(partNumber, partTitle) {
    if (!window.confirm(`Remove part ${partNumber} - "${partTitle}"?`)) return;
    setFormParts(prev => {
      const filtered = prev.filter(p => p.partNumber !== partNumber);
      return filtered.map((p, i) => ({ ...p, partNumber: i + 1 }));
    });
    if (editingFormPart && editingFormPart.partNumber === partNumber) {
      handleCancelEditFormPart();
    }
    addNotification("success", `Part ${partNumber} removed`);
  }

  function startEdit(movie) {
    if (!movie) return;

    let parts = [];
    if (movie.download) {
      try {
        const parsed = JSON.parse(movie.download);
        if (Array.isArray(parsed)) {
          parts = parsed;
        } else if (parsed && parsed.parts) {
          parts = parsed.parts;
        }
      } catch (e) { /* ignore */ }
    }

    setEditingId(movie.id);
    setForm({
      ...emptyMovie,
      ...movie,
      videoUrl: movie.videoUrl || "",
      streamLink: movie.streamLink || "",
      videoId: movie.videoId || "",
      embedCode: movie.embedCode || "",
      videoType: movie.videoType || detectPlatform(movie.videoUrl || ""),
      category: movie.category || "",
      nation: movie.nation || "",
      translator: movie.translator || "",
      parts: parts
    });

    // ⭐ Load existing parts into the in-form list so they can be edited
    setFormParts(parts.sort((a, b) => a.partNumber - b.partNumber));
    setFormPartForm({
      ...emptyPart,
      partNumber: parts.length + 1,
      useMainVideo: true
    });
    setEditingFormPart(null);

    if (movie.videoUrl) setMainVideoUrl(movie.videoUrl);

    setStagedCast([]);
    setPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing: ${movie.title}`);
  }

  function startEditEpisode(episode) {
    if (!episode) return;

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
    addNotification("info", `Editing episode: ${episode.title}`);
  }

  function cancelEpisodeEdit() {
    setEditingEpisode(null);
    setEpisodeForm(emptyEpisode);
    setShowEpisodeForm(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyMovie);
    setEpisodeForm(emptyEpisode);
    setPartForm(emptyPart);
    setPreview(false);
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

    // ⭐ Reset in-form parts
    setFormParts([]);
    setFormPartForm(emptyPart);
    setEditingFormPart(null);

    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
      setPosterPreview('');
    }
    if (backgroundPreview) {
      URL.revokeObjectURL(backgroundPreview);
      setBackgroundPreview('');
    }

    setImageUploadMethod({ poster: 'link', background: 'link' });

    addNotification("info", "Form reset");
  }

  async function handleAddOrUpdate() {
    if (!form.title) {
      addNotification("error", "Title is required");
      return;
    }

    const existing = editingId ? movies.find(m => m.id === editingId) : null;

    const effectiveVideoUrl = form.videoUrl || existing?.videoUrl || "";
    const effectiveVideoType =
      form.videoUrl
        ? form.videoType
        : (existing?.videoType || form.videoType);

    if (!effectiveVideoUrl && !form.videoFile) {
      addNotification("error", "Video URL is required");
      return;
    }

    if (effectiveVideoUrl && effectiveVideoType !== VIDEO_PLATFORMS.DIRECT) {
      const validation = validateVideoUrl(effectiveVideoUrl, effectiveVideoType);
      if (!validation.valid) {
        addNotification("error", validation.message);
        return;
      }
    }

    let videoId = '';
    let streamLink = '';

    if (effectiveVideoType === VIDEO_PLATFORMS.YOUTUBE && effectiveVideoUrl) {
      videoId = extractYoutubeId(effectiveVideoUrl) || existing?.videoId || '';
      streamLink = generateEmbedUrl(videoId);
    } else if (effectiveVideoType === VIDEO_PLATFORMS.DIRECT) {
      videoId = effectiveVideoUrl;
      streamLink = effectiveVideoUrl;
    }

    // ⭐ Parts added in the create/edit form → stored in download JSON,
    // exactly like Manage Movie Parts does. Only if the admin actually added parts;
    // otherwise preserve whatever the movie already had in DB.
    const cleanedFormParts = formParts
      .filter(p => p && (p.title || "").trim() !== "")
      .map((p, i) => ({
        partNumber: i + 1,
        title: p.title,
        download_link: p.download_link || "",
        videoUrl: p.videoUrl || ""
      }));

    const downloadPayload =
      cleanedFormParts.length > 0
        ? JSON.stringify(cleanedFormParts)
        : (existing?.download || form.download || "");

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
      if (editingId) {
        await updateMovie(editingId, finalData);

        if (stagedCast.length > 0) {
          try {
            await saveCastForMovie(editingId, stagedCast);
            addNotification("success", `Cast updated (${stagedCast.length})`);
          } catch (castErr) {
            console.warn('Cast save failed:', castErr);
            addNotification("error", "Movie saved but cast update failed");
          }
        }

        addNotification("success", `${form.type === 'series' ? 'Series' : 'Movie'} updated`);
      } else {
        const created = await addMovie(finalData);
        addNotification("success", `${form.type === 'series' ? 'Series' : 'Movie'} added`);

        let newId = created?.id || created?.[0]?.id;
        if (!newId) {
          await refreshMovies();
          const found = (movies || []).find(m => m.title === finalData.title);
          newId = found?.id;
        }

        if (stagedCast.length > 0) {
          if (newId) {
            try {
              await saveCastForMovie(newId, stagedCast);
              addNotification("success", `Cast attached (${stagedCast.length})`);
            } catch (castErr) {
              console.warn('Cast attach failed:', castErr);
              addNotification("error", "Movie saved but cast attach failed");
            }
          } else {
            addNotification("info", "Cast staged but could not attach — open the movie and re-fetch");
          }
        }
      }

      refreshMovies();
      resetForm();
    } catch (err) {
      addNotification("error", `Error saving: ${err.message || "Please try again"}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    if (!window.confirm(`Delete "${movie.title}"?`)) return;

    try {
      await deleteMovie(id);
      addNotification("success", `"${movie.title}" deleted`);
      refreshMovies();
    } catch (error) {
      addNotification("error", "Error deleting item");
    }
  }

  function selectSeriesForEpisodes(series) {
    setSelectedSeries(series);
    setActiveTab("episodes");
    setShowEpisodeForm(false);
    setEditingEpisode(null);
    setMainVideoUrl(series.videoUrl || "");

    setEpisodeForm({
      ...emptyEpisode,
      useMainVideo: true
    });

    const loadedEpisodes = getEpisodesBySeries(series.id) || [];
    setSeriesEpisodes(sortEpisodes(loadedEpisodes));

    addNotification("info", `Managing episodes for: ${series.title}`);
  }

  function selectMovieForParts(movie) {
    setSelectedMovieForParts(movie);
    setActiveTab("parts");
    setShowPartForm(false);
    setEditingPart(null);
    setMainVideoUrl(movie.videoUrl || "");

    let parts = [];
    if (movie.download) {
      try {
        const parsed = JSON.parse(movie.download);
        if (Array.isArray(parsed)) {
          parts = parsed;
        } else if (parsed && parsed.parts) {
          parts = parsed.parts;
        }
      } catch (e) {
        parts = [];
      }
    }
    setMovieParts(parts);

    setPartForm({
      ...emptyPart,
      partNumber: parts.length + 1,
      useMainVideo: true
    });

    addNotification("info", `Managing parts for: ${movie.title}`);
  }

  function backToSeriesList() {
    setSelectedSeries(null);
    setSeriesEpisodes([]);
    setShowEpisodeForm(false);
    setEditingEpisode(null);
    setEpisodeForm(emptyEpisode);
    setMainVideoUrl("");
  }

  function backToMovieList() {
    setSelectedMovieForParts(null);
    setMovieParts([]);
    setShowPartForm(false);
    setEditingPart(null);
    setPartForm(emptyPart);
    setActiveTab("series");
    setMainVideoUrl("");
  }

  function startEditPart(part) {
    if (!part) return;

    setEditingPart(part);
    setPartForm({
      partNumber: part.partNumber,
      title: part.title,
      download_link: part.download_link || "",
      useMainVideo: false
    });
    setShowPartForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addNotification("info", `Editing part ${part.partNumber}: ${part.title}`);
  }

  function cancelPartEdit() {
    setEditingPart(null);
    setPartForm({
      ...emptyPart,
      partNumber: movieParts.length + 1,
      useMainVideo: true
    });
    setShowPartForm(false);
  }

  async function handleAddOrUpdatePart() {
    if (!selectedMovieForParts) {
      addNotification("error", "No movie selected");
      return;
    }

    if (!partForm.title) {
      addNotification("error", "Part title is required");
      return;
    }

    let finalVideoUrl = "";

    if (partForm.useMainVideo) {
      finalVideoUrl = mainVideoUrl;
      if (!finalVideoUrl) {
        addNotification("error", "No main video URL found for this movie. Please add a main video URL to the movie first.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const partData = {
        partNumber: parseInt(partForm.partNumber) || (movieParts.length + 1),
        title: partForm.title,
        download_link: partForm.download_link || "",
        videoUrl: finalVideoUrl
      };

      let updatedParts;

      if (editingPart) {
        updatedParts = movieParts.map(p =>
          p.partNumber === editingPart.partNumber ? { ...p, ...partData } : p
        );
        addNotification("success", `Part ${partData.partNumber} updated`);
      } else {
        updatedParts = [...movieParts, partData];
        addNotification("success", `Part ${partData.partNumber} added`);
      }

      updatedParts.sort((a, b) => a.partNumber - b.partNumber);

      const movieUpdate = {
        download: JSON.stringify(updatedParts)
      };

      await updateMovie(selectedMovieForParts.id, movieUpdate);
      setMovieParts(updatedParts);

      setPartForm({
        ...emptyPart,
        partNumber: updatedParts.length + 1,
        useMainVideo: true
      });

      setEditingPart(null);
      setShowPartForm(false);
      refreshMovies();

    } catch (err) {
      console.error("Error managing parts:", err);
      addNotification("error", editingPart ? "Error updating part" : "Error adding part");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePart(partNumber, partTitle) {
    if (!window.confirm(`Delete part ${partNumber} - "${partTitle}"?`)) return;

    try {
      const updatedParts = movieParts.filter(p => p.partNumber !== partNumber);
      const renumberedParts = updatedParts.map((p, index) => ({
        ...p,
        partNumber: index + 1
      }));

      const movieUpdate = {
        download: JSON.stringify(renumberedParts)
      };

      await updateMovie(selectedMovieForParts.id, movieUpdate);
      setMovieParts(renumberedParts);

      setPartForm({
        ...emptyPart,
        partNumber: renumberedParts.length + 1,
        useMainVideo: true
      });

      addNotification("success", `Part ${partNumber} deleted`);
      refreshMovies();

    } catch (error) {
      addNotification("error", "Error deleting part");
    }
  }

  async function handleAddOrUpdateEpisode() {
    if (!selectedSeries) {
      addNotification("error", "No series selected");
      return;
    }

    if (!episodeForm.title) {
      addNotification("error", "Episode title is required");
      return;
    }

    let finalVideoUrl = "";

    if (episodeForm.useMainVideo) {
      finalVideoUrl = mainVideoUrl;
      if (!finalVideoUrl) {
        addNotification("error", "No main video URL found for this series. Please add a main video URL to the series first.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const episodeData = {
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
        await updateEpisode(editingEpisode.id, episodeData);
        addNotification("success", `Episode "${episodeForm.title}" updated`);
      } else {
        await addEpisode(episodeData);
        addNotification("success", `Episode "${episodeForm.title}" added`);
      }

      setEpisodeForm({
        ...emptyEpisode,
        seasonNumber: episodeForm.seasonNumber,
        episodeNumber: (parseInt(episodeForm.episodeNumber || 1) + 1).toString(),
        useMainVideo: true
      });

      const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
      setSeriesEpisodes(sortEpisodes(updatedEpisodes));

      setEditingEpisode(null);
      setShowEpisodeForm(false);

    } catch (err) {
      console.error("Error managing episode:", err);
      addNotification("error", editingEpisode ? "Error updating episode" : "Error adding episode");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEpisode(episodeId, episodeTitle) {
    if (!window.confirm(`Delete episode "${episodeTitle}"?`)) return;

    try {
      await deleteEpisode(episodeId);
      addNotification("success", `Episode "${episodeTitle}" deleted`);

      if (selectedSeries) {
        const updatedEpisodes = getEpisodesBySeries(selectedSeries.id) || [];
        setSeriesEpisodes(sortEpisodes(updatedEpisodes));
      }
    } catch (error) {
      addNotification("error", "Error deleting episode");
    }
  }

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || movie.type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    const aTime = new Date(a.created_at || a.createdAt || 0).getTime() || 0;
    const bTime = new Date(b.created_at || b.createdAt || 0).getTime() || 0;
    if (bTime !== aTime) return bTime - aTime;
    return (a.title || "").localeCompare(b.title || "");
  });

  const seriesOnly = movies.filter(m => m.type === "series");
  const moviesOnly = movies.filter(m => m.type === "movie");

  const getPartsCount = (movie) => {
    if (!movie.download) return 0;
    try {
      const parsed = JSON.parse(movie.download);
      if (Array.isArray(parsed)) return parsed.length;
      if (parsed && parsed.parts) return parsed.parts.length;
    } catch (e) {
      return 0;
    }
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
          <button
            onClick={refreshMovies}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg text-black font-semibold w-full md:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-8 px-3 sm:px-4 md:px-6 pt-20 sm:pt-24">
      {/* Notifications */}
      <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-50 max-w-sm w-full mx-auto sm:mx-0 space-y-2 sm:space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-out text-sm sm:text-base ${notification.type === "success"
              ? "bg-green-900/90 border-l-4 border-green-500"
              : notification.type === "error"
                ? "bg-red-900/90 border-l-4 border-red-500"
                : "bg-blue-900/90 border-l-4 border-blue-500"
              } backdrop-blur-lg rounded-r-lg shadow-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" && <FaCheckCircle className="text-emerald-400 text-lg sm:text-xl" />}
              {notification.type === "error" && <FaExclamationTriangle className="text-red-400 text-lg sm:text-xl" />}
              {notification.type === "info" && <FaExclamationTriangle className="text-cyan-400 text-lg sm:text-xl" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white break-words">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-300 hover:text-white ml-1"
            >
              <FaTimes className="text-sm sm:text-base" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Video Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Manage content, episodes, parts, translators, and cast
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                refreshMovies();
                refreshEpisodes();
                addNotification("success", "Content refreshed!");
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg text-black font-semibold flex items-center justify-center gap-2 text-sm"
            >
              <FaSync className="text-xs sm:text-sm" />
              <span className="hidden xs:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm"
            >
              <FaSignOutAlt className="text-xs sm:text-sm" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <FaMobileAlt className="text-emerald-400 text-sm" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-300">
                <span className="font-bold text-emerald-400">Responsive Images:</span> On mobile devices, the hero section will automatically use the <strong className="text-emerald-400">Poster Image</strong> for better visibility. On desktop, it uses the <strong className="text-cyan-400">Background Image</strong> for a cinematic experience.
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                Tip: Upload a poster that looks good on mobile (centered subject) and a wide background for desktop.
              </p>
            </div>
            <div className="flex-shrink-0">
              <FaDesktop className="text-cyan-400 text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="flex border-b border-gray-700 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveTab("series")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === "series"
                ? "text-emerald-400 border-b-2 border-emerald-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <FaTv className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> Manage Content
            </button>
            <button
              onClick={() => setActiveTab("episodes")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === "episodes"
                ? "text-teal-400 border-b-2 border-teal-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <FaList className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> Manage Episodes
            </button>
            <button
              onClick={() => setActiveTab("parts")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === "parts"
                ? "text-cyan-400 border-b-2 border-cyan-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <FaLayerGroup className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> Manage Movie Parts
            </button>
            <button
              onClick={() => setActiveTab("translators")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === "translators"
                ? "text-emerald-400 border-b-2 border-emerald-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <FaLanguage className="inline mr-1 sm:mr-2 text-xs sm:text-sm" /> Translators
            </button>
          </div>
        </div>

        {/* ============ CONTENT MANAGEMENT TAB ============ */}
        {activeTab === "series" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-emerald-900/30 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FaPlus className="text-emerald-500 text-sm sm:text-base" />
                  {editingId ? "Edit Content" : "Add New Content"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${editingId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                    {editingId ? "Editing" : "Creating"}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${form.type === 'series' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                    {form.type === 'series' ? 'Series' : 'Movie'}
                  </span>
                </div>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "movie" })}
                  className={`p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center gap-1 sm:gap-2 ${form.type === "movie"
                    ? "bg-cyan-600/20 border-2 border-cyan-500/50"
                    : "bg-gray-800/50 border border-gray-700"
                    }`}
                >
                  <FaFilm className={`text-xl sm:text-2xl ${form.type === "movie" ? "text-cyan-400" : "text-gray-400"}`} />
                  <span className={`text-xs sm:text-sm font-medium ${form.type === "movie" ? "text-cyan-300" : "text-gray-300"}`}>
                    Movie
                  </span>
                </button>
                <button
                  onClick={() => setForm({ ...emptyMovie, type: "series" })}
                  className={`p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center gap-1 sm:gap-2 ${form.type === "series"
                    ? "bg-emerald-600/20 border-2 border-emerald-500/50"
                    : "bg-gray-800/50 border border-gray-700"
                    }`}
                >
                  <FaTv className={`text-xl sm:text-2xl ${form.type === "series" ? "text-emerald-400" : "text-gray-400"}`} />
                  <span className={`text-xs sm:text-sm font-medium ${form.type === "series" ? "text-emerald-300" : "text-gray-300"}`}>
                    Series
                  </span>
                </button>
              </div>

              {/* Platform Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">Video Platform:</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = form.videoType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(prev => {
                          if (prev.videoType === key) return prev;
                          return { ...prev, videoType: key, videoUrl: '' };
                        })}
                        className={`p-2 sm:p-3 rounded-xl flex items-center gap-2 sm:gap-3 ${isActive
                          ? 'border-2'
                          : 'border border-gray-700'
                          }`}
                        style={{
                          backgroundColor: isActive ? `${config.color}10` : 'rgb(31 41 55 / 0.5)',
                          borderColor: isActive ? config.color : ''
                        }}
                      >
                        <Icon className={`text-lg sm:text-xl flex-shrink-0 ${isActive ? '' : 'text-gray-400'}`}
                          style={isActive ? { color: config.color } : {}} />
                        <span className={`text-xs sm:text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {config.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Video Input */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-900/30 rounded-xl">
                <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3"
                  style={{ color: platformConfig[form.videoType]?.color }}>
                  {platformConfig[form.videoType]?.name} Settings
                </h3>

                {form.videoType === VIDEO_PLATFORMS.DIRECT ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
                          <input
                            type="file"
                            name="videoFile"
                            id="videoFile"
                            accept="video/*"
                            onChange={handleChange}
                            className="hidden"
                          />
                          <label htmlFor="videoFile" className="cursor-pointer block">
                            <FaUpload className="text-2xl sm:text-3xl text-gray-400 mx-auto mb-2 sm:mb-3" />
                            <div className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">Upload video</div>
                            <div className="text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-4">MP4, WebM, etc (max 500MB)</div>
                            {uploadingFile ? (
                              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 sm:h-2 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            ) : (
                              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs sm:text-sm">
                                Choose File
                              </div>
                            )}
                          </label>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-gray-900 text-gray-400">OR</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Video URL
                          </label>
                          <input
                            name="videoUrl"
                            value={form.videoUrl}
                            onChange={handleChange}
                            placeholder="https://cdn.com/video.mp4"
                            className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      YouTube URL *
                    </label>
                    <input
                      name="videoUrl"
                      value={form.videoUrl}
                      onChange={handleChange}
                      placeholder={platformConfig[form.videoType]?.placeholder}
                      className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Title *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* POSTER */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 sm:mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 flex items-center gap-1">
                      <FaMobileAlt className="text-emerald-400 text-xs" /> Poster Image <span className="text-emerald-400 text-[10px]">(Mobile Hero)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleImageMethod('poster')}
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 flex items-center gap-1 self-start"
                    >
                      {imageUploadMethod.poster === 'link' ? (
                        <><FaUpload className="text-[8px] sm:text-xs" /> Switch to Upload</>
                      ) : (
                        <><FaLink className="text-[8px] sm:text-xs" /> Switch to Link</>
                      )}
                    </button>
                  </div>
                  <p className="text-[8px] sm:text-[10px] text-emerald-400/70 mb-1">Used on mobile devices for hero background</p>

                  {imageUploadMethod.poster === 'link' ? (
                    <div className="relative">
                      <FaImage className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                      <input
                        name="poster"
                        value={form.poster}
                        onChange={handleChange}
                        placeholder="Poster image URL (used on mobile)"
                        className="w-full pl-7 sm:pl-10 p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-3 text-center">
                        <input
                          type="file"
                          name="posterFile"
                          id="posterFile"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                        <label htmlFor="posterFile" className="cursor-pointer block">
                          <FaCloudUploadAlt className="text-xl sm:text-2xl text-gray-400 mx-auto mb-1" />
                          <div className="text-[10px] sm:text-xs text-gray-300 mb-1">Click to upload poster</div>
                          <div className="text-[8px] sm:text-[10px] text-gray-400">Max 5MB</div>

                          {uploadingPoster && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-1">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full"
                                  style={{ width: `${posterProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {(posterPreview || form.poster) && (
                        <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-gray-800/50 rounded-lg">
                          <img
                            src={posterPreview || form.poster}
                            alt="Preview"
                            className="w-8 h-10 sm:w-12 sm:h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 truncate">Poster ready (mobile)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* BACKGROUND */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 sm:mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 flex items-center gap-1">
                      <FaDesktop className="text-cyan-400 text-xs" /> Background Image <span className="text-cyan-400 text-[10px]">(Desktop Hero)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleImageMethod('background')}
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 flex items-center gap-1 self-start"
                    >
                      {imageUploadMethod.background === 'link' ? (
                        <><FaUpload className="text-[8px] sm:text-xs" /> Switch to Upload</>
                      ) : (
                        <><FaLink className="text-[8px] sm:text-xs" /> Switch to Link</>
                      )}
                    </button>
                  </div>
                  <p className="text-[8px] sm:text-[10px] text-cyan-400/70 mb-1">Used on desktop devices for hero background</p>

                  {imageUploadMethod.background === 'link' ? (
                    <div className="relative">
                      <FaMountain className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                      <input
                        name="background"
                        value={form.background}
                        onChange={handleChange}
                        placeholder="Background image URL (used on desktop)"
                        className="w-full pl-7 sm:pl-10 p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-3 text-center">
                        <input
                          type="file"
                          name="backgroundFile"
                          id="backgroundFile"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                        <label htmlFor="backgroundFile" className="cursor-pointer block">
                          <FaCloudUploadAlt className="text-xl sm:text-2xl text-gray-400 mx-auto mb-1" />
                          <div className="text-[10px] sm:text-xs text-gray-300 mb-1">Click to upload background</div>
                          <div className="text-[8px] sm:text-[10px] text-gray-400">Max 5MB</div>

                          {uploadingBackground && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-700 rounded-full h-1">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1 rounded-full"
                                  style={{ width: `${backgroundProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {(backgroundPreview || form.background) && (
                        <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-gray-800/50 rounded-lg">
                          <img
                            src={backgroundPreview || form.background}
                            alt="Preview"
                            className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 truncate">Background ready (desktop)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaCalendar className="text-xs" /> Year
                  </label>
                  <input
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="e.g., 2024"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* Category */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaTag className="text-amber-400" /> Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm flex items-center justify-between hover:bg-gray-700/70 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {form.category ? (
                          <>
                            <FaTag className="text-amber-400 text-xs" />
                            <span className="truncate">{form.category}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">Select a category...</span>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showCategoryDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowCategoryDropdown(false)}
                        />
                        <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                          <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                            <input
                              type="text"
                              placeholder="Search category..."
                              value={categorySearchTerm}
                              onChange={(e) => setCategorySearchTerm(e.target.value)}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-xs sm:text-sm text-white placeholder-gray-400"
                              autoFocus
                            />
                          </div>
                          <div>
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((category) => (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => handleCategorySelect(category)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs sm:text-sm"
                                >
                                  <FaTag className="text-amber-400 text-xs" />
                                  <span>{category}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-gray-400 text-xs sm:text-sm">
                                No categories found
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Translator */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaLanguage className="text-emerald-400" /> Translator
                  </label>
                  <select
                    name="translator"
                    value={form.translator}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm text-white"
                  >
                    <option value="">— No translator —</option>
                    {adminTranslators.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.display_name || t.name}
                      </option>
                    ))}
                    {form.translator &&
                      !adminTranslators.find((t) => t.name === form.translator) && (
                        <option value={form.translator}>
                          {form.translator} (legacy — not in DB)
                        </option>
                      )}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Translators are auto-detected from movies. Add photos in the <span className="text-emerald-400">Translators</span> tab.
                  </p>
                </div>

                {/* Country */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <FaGlobe className="text-cyan-400" /> Country / Nation
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm flex items-center justify-between hover:bg-gray-700/70 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {form.nation ? (
                          <>
                            <span className="text-base sm:text-lg">
                              {countries.find(c => c.name === form.nation)?.flag || '🌍'}
                            </span>
                            <span className="truncate">{form.nation}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">Select a country...</span>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showCountryDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowCountryDropdown(false)}
                        />
                        <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                          <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                            <input
                              type="text"
                              placeholder="Search country..."
                              value={countrySearchTerm}
                              onChange={(e) => setCountrySearchTerm(e.target.value)}
                              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-xs sm:text-sm text-white placeholder-gray-400"
                              autoFocus
                            />
                          </div>
                          <div>
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => handleCountrySelect(country.name)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs sm:text-sm"
                                >
                                  <span className="text-base sm:text-lg">{country.flag}</span>
                                  <span>{country.name}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-gray-400 text-xs sm:text-sm">
                                No countries found
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows="2"
                    className="w-full p-2 sm:p-3 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* CAST — always visible for create + edit */}
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-700">
                  <CastFetcher
                    movie={form}
                    addNotification={addNotification}
                    stagedCast={stagedCast}
                    onCastStaged={setStagedCast}
                  />
                </div>

                {/* ⭐ PARTS — same features as Manage Movie Parts, right inside the form */}
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs sm:text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <FaLayerGroup className="text-cyan-400 text-xs" />
                      Movie Parts / Download Links
                      <span className="text-[10px] font-normal text-gray-500">(optional)</span>
                    </label>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-cyan-600/20 text-cyan-300 rounded-full">
                      {formParts.length} part(s)
                    </span>
                  </div>

                  {/* Mini "Add / Edit Part" form — mirrors Manage Movie Parts exactly */}
                  <div className="mb-4 p-3 sm:p-4 bg-cyan-900/15 rounded-xl border border-cyan-500/30">
                    <h4 className="text-xs sm:text-sm font-bold mb-3 text-cyan-300">
                      {editingFormPart ? `Edit Part ${editingFormPart.partNumber}` : "Add New Part"}
                    </h4>

                    <div className="mb-3 p-2 sm:p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPartForm.useMainVideo}
                          onChange={toggleUseMainVideoForFormPart}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] sm:text-xs font-medium text-cyan-300 flex items-center gap-2">
                            <FaVideo className="text-[10px]" /> Use Main Movie Video
                          </span>
                          <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 break-all">
                            Main video URL: {(mainVideoUrl || form.videoUrl) || "No main video set yet"}
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-gray-300 mb-1">Part Number</label>
                        <input
                          name="partNumber"
                          value={formPartForm.partNumber}
                          onChange={handleFormPartChange}
                          type="number"
                          min="1"
                          className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] sm:text-xs font-medium text-gray-300 mb-1">Part Title *</label>
                        <input
                          name="title"
                          value={formPartForm.title}
                          onChange={handleFormPartChange}
                          placeholder="e.g., Part 1: The Beginning"
                          className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] sm:text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                          <FaDownload className="text-[9px]" /> Download Link (Optional)
                        </label>
                        <input
                          name="download_link"
                          value={formPartForm.download_link}
                          onChange={handleFormPartChange}
                          placeholder="https://example.com/download/part1.mp4"
                          className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={handleAddOrUpdateFormPart}
                          className="w-full sm:flex-1 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-lg font-semibold text-xs text-black flex items-center justify-center gap-1"
                        >
                          <FaPlusCircle className="text-[10px]" />
                          {editingFormPart ? "Update Part" : "Add Part"}
                        </button>
                        {editingFormPart && (
                          <button
                            type="button"
                            onClick={handleCancelEditFormPart}
                            className="w-full sm:w-auto px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* List of parts added in this form */}
                  {formParts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] sm:text-xs text-cyan-300 font-medium">
                        Parts added to this movie ({formParts.length}):
                      </p>
                      {formParts.map((part) => (
                        <div
                          key={part.partNumber}
                          className="bg-gray-800/40 rounded-lg p-2.5 hover:bg-gray-800/60 transition-colors border border-gray-800"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-0.5">
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
                              <button
                                type="button"
                                onClick={() => handleEditFormPart(part)}
                                className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 rounded"
                                title="Edit part"
                              >
                                <FaEdit className="text-emerald-400 text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFormPart(part.partNumber, part.title)}
                                className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded"
                                title="Delete part"
                              >
                                <FaTrash className="text-red-400 text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] sm:text-xs text-gray-500 mt-3">
                    These parts are saved with the movie and appear in the same place as the ones you add in <span className="text-cyan-400">Manage Movie Parts</span>.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleAddOrUpdate}
                  disabled={submitting || uploadingFile || uploadingPoster || uploadingBackground}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm text-black"
                >
                  <FaSave className="text-xs sm:text-sm" />
                  {submitting ? "Processing..." : editingId ? "Update" : "Add"}
                </button>

                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <FaUndo className="text-xs sm:text-sm" />
                  Reset
                </button>
              </div>
            </div>

            {/* Content List */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FaTv className="text-emerald-500 text-sm sm:text-base" />
                  All Content ({movies.length})
                  <span className="text-[10px] sm:text-xs font-normal text-emerald-400 ml-1">newest first</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-7 sm:pl-10 pr-3 sm:pr-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white text-xs sm:text-sm"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-white text-xs sm:text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="series">Series</option>
                  </select>
                </div>
              </div>

              {sortedMovies.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-emerald-900/30 p-8 sm:p-12 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">No Content Found</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Add your first item to get started</p>
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
                          <div className="relative flex-shrink-0">
                            <img
                              src={movie.poster || 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400'}
                              alt={movie.title}
                              className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg"
                            />
                            {movie.background && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                                <FaDesktop className="text-[8px] text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1 mb-1 sm:mb-2">
                              <h3 className="font-bold text-xs sm:text-sm truncate">{movie.title}</h3>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => startEdit(movie)}
                                  className="p-1 bg-emerald-600/20 hover:bg-emerald-600/30 rounded"
                                  title="Edit"
                                >
                                  <FaEdit className="text-emerald-400 text-[10px] sm:text-xs" />
                                </button>
                                {movie.type === 'series' && (
                                  <button
                                    onClick={() => selectSeriesForEpisodes(movie)}
                                    className="p-1 bg-teal-600/20 hover:bg-teal-600/30 rounded"
                                    title="Manage Episodes"
                                  >
                                    <FaList className="text-teal-400 text-[10px] sm:text-xs" />
                                  </button>
                                )}
                                {movie.type === 'movie' && (
                                  <button
                                    onClick={() => selectMovieForParts(movie)}
                                    className="p-1 bg-cyan-600/20 hover:bg-cyan-600/30 rounded"
                                    title="Manage Parts"
                                  >
                                    <FaLayerGroup className="text-cyan-400 text-[10px] sm:text-xs" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(movie.id)}
                                  className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded"
                                  title="Delete"
                                >
                                  <FaTrash className="text-red-400 text-[10px] sm:text-xs" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] ${movie.type === 'series' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                {movie.type === 'series' ? 'Series' : 'Movie'}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px]"
                                style={{
                                  backgroundColor: `${platform.color}20`,
                                  color: platform.color
                                }}
                              >
                                {platform.name}
                              </span>
                              {movie.category && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-amber-600/20 text-amber-400 flex items-center gap-0.5">
                                  <FaTag className="text-[6px] sm:text-[8px]" /> {movie.category}
                                </span>
                              )}
                              {movie.translator && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-green-600/20 text-green-400 flex items-center gap-0.5">
                                  <FaLanguage className="text-[6px] sm:text-[8px]" /> {movie.translator}
                                </span>
                              )}
                              {movie.nation && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-cyan-600/20 text-cyan-400 flex items-center gap-0.5">
                                  <span className="text-[10px] sm:text-xs">{countryFlag}</span> {movie.nation}
                                </span>
                              )}
                              {movie.type === 'series' && episodeCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-teal-500/20 text-teal-400">
                                  {episodeCount} eps
                                </span>
                              )}
                              {movie.type === 'movie' && partsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] bg-green-500/20 text-green-400">
                                  {partsCount} {partsCount === 1 ? 'part' : 'parts'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-300 truncate">{movie.description}</p>
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

        {/* ============ EPISODES TAB ============ */}
        {activeTab === "episodes" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-emerald-900/30 p-4 sm:p-6">
              {!selectedSeries ? (
                <div className="text-center py-8 sm:py-12">
                  <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">Select a Series</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Choose a series to manage episodes</p>
                  {seriesOnly.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">No series available. Add a series first.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {seriesOnly.map(series => (
                        <button
                          key={series.id}
                          onClick={() => selectSeriesForEpisodes(series)}
                          className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                        >
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
                    <button
                      onClick={backToSeriesList}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <FaArrowLeft className="text-xs" /> Back to Series
                    </button>
                    <div className="text-center sm:text-right">
                      <h3 className="text-sm sm:text-lg font-bold text-teal-400 truncate max-w-[200px] sm:max-w-none">{selectedSeries.title}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-400">Managing episodes</p>
                    </div>
                  </div>

                  {(showEpisodeForm || editingEpisode) && (
                    <div className="mb-4 sm:mb-6 p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4">
                        {editingEpisode ? "Edit Episode" : "Add New Episode"}
                      </h3>

                      <div className="mb-4 p-3 bg-teal-900/20 rounded-lg border border-teal-500/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={episodeForm.useMainVideo}
                            onChange={toggleUseMainVideoForEpisode}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-teal-300 flex items-center gap-2">
                              <FaVideo className="text-xs" /> Use Main Series Video
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 break-all">
                              Main video URL: {mainVideoUrl || "No main video set for this series"}
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Season</label>
                          <input
                            name="seasonNumber"
                            value={episodeForm.seasonNumber}
                            onChange={handleEpisodeChange}
                            type="number"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Episode</label>
                          <input
                            name="episodeNumber"
                            value={episodeForm.episodeNumber}
                            onChange={handleEpisodeChange}
                            type="number"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Title *</label>
                          <input
                            name="title"
                            value={episodeForm.title}
                            onChange={handleEpisodeChange}
                            placeholder="Episode title"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <FaDownload className="text-[10px]" /> Download Link (Optional)
                          </label>
                          <input
                            name="download_link"
                            value={episodeForm.download_link}
                            onChange={handleEpisodeChange}
                            placeholder="https://example.com/download/episode.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Air Date</label>
                          <input
                            name="airDate"
                            value={episodeForm.airDate}
                            onChange={handleEpisodeChange}
                            type="date"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={episodeForm.description}
                            onChange={handleEpisodeChange}
                            placeholder="Episode description"
                            rows="2"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Thumbnail URL (Optional)
                          </label>
                          <input
                            name="thumbnail"
                            value={episodeForm.thumbnail}
                            onChange={handleEpisodeChange}
                            placeholder="https://example.com/thumbnail.jpg"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 mt-2">
                          <button
                            onClick={handleAddOrUpdateEpisode}
                            disabled={submitting}
                            className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 text-xs sm:text-sm text-black"
                          >
                            {submitting ? 'Processing...' : (editingEpisode ? 'Update Episode' : 'Add Episode')}
                          </button>
                          <button
                            onClick={cancelEpisodeEdit}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!editingEpisode && !showEpisodeForm && (
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          setEpisodeForm({
                            ...emptyEpisode,
                            seasonNumber: seriesEpisodes.length > 0
                              ? seriesEpisodes[seriesEpisodes.length - 1].seasonNumber?.toString() || "1"
                              : "1",
                            episodeNumber: seriesEpisodes.length > 0
                              ? (parseInt(seriesEpisodes[seriesEpisodes.length - 1].episodeNumber || 0) + 1).toString()
                              : "1",
                            useMainVideo: true
                          });
                          setShowEpisodeForm(true);
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm text-black"
                      >
                        <FaPlus className="text-xs" /> Add New Episode
                      </button>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm sm:text-lg font-bold mb-3">Episodes ({seriesEpisodes.length})</h3>
                    {seriesEpisodes.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-400">
                        No episodes yet. Click "Add New Episode" to create one.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sortEpisodes(seriesEpisodes).map((episode, index) => {
                          const platform = platformConfig[episode.videoType] || platformConfig[VIDEO_PLATFORMS.YOUTUBE];
                          return (
                            <div key={episode.id || index} className="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-teal-600/20 text-teal-400 rounded-full text-[10px] sm:text-xs">
                                      S{episode.seasonNumber}E{episode.episodeNumber}
                                    </span>
                                    <h4 className="font-medium text-xs sm:text-sm">{episode.title}</h4>
                                    <span
                                      className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px]"
                                      style={{
                                        backgroundColor: `${platform.color}20`,
                                        color: platform.color
                                      }}
                                    >
                                      {platform.name}
                                    </span>
                                    {episode.download_link && (
                                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] sm:text-[10px] flex items-center gap-0.5">
                                        <FaDownload className="text-[6px] sm:text-[8px]" /> DL
                                      </span>
                                    )}
                                  </div>
                                  {episode.description && (
                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-full sm:max-w-md">
                                      {episode.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 self-end sm:self-center">
                                  <button
                                    onClick={() => startEditEpisode(episode)}
                                    className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 rounded"
                                    title="Edit episode"
                                  >
                                    <FaEdit className="text-emerald-400 text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEpisode(episode.id, episode.title)}
                                    className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded"
                                    title="Delete episode"
                                  >
                                    <FaTrash className="text-red-400 text-xs" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ============ PARTS TAB (unchanged) ============ */}
        {activeTab === "parts" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl border border-emerald-900/30 p-4 sm:p-6">
              {!selectedMovieForParts ? (
                <div className="text-center py-8 sm:py-12">
                  <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">Select a Movie</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Choose a movie to manage its parts</p>
                  {moviesOnly.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">No movies available. Add a movie first.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {moviesOnly.map(movie => {
                        const partsCount = getPartsCount(movie);
                        return (
                          <button
                            key={movie.id}
                            onClick={() => selectMovieForParts(movie)}
                            className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                          >
                            <FaFilm className="text-xs" />
                            <span className="truncate max-w-[150px]">{movie.title}</span>
                            {partsCount > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 bg-cyan-600/20 text-cyan-400 rounded-full text-[8px] sm:text-[10px]">
                                {partsCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      onClick={backToMovieList}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <FaArrowLeft className="text-xs" /> Back to Movies
                    </button>
                    <div className="text-center sm:text-right">
                      <h3 className="text-sm sm:text-lg font-bold text-cyan-400 truncate max-w-[200px] sm:max-w-none">{selectedMovieForParts.title}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-400">Managing parts</p>
                    </div>
                  </div>

                  {(showPartForm || editingPart) && (
                    <div className="mb-4 sm:mb-6 p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4">
                        {editingPart ? `Edit Part ${editingPart.partNumber}` : "Add New Part"}
                      </h3>

                      <div className="mb-4 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={partForm.useMainVideo}
                            onChange={toggleUseMainVideoForPart}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                              <FaVideo className="text-xs" /> Use Main Movie Video
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 break-all">
                              Main video URL: {mainVideoUrl || "No main video set for this movie"}
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Part Number</label>
                          <input
                            name="partNumber"
                            value={partForm.partNumber}
                            onChange={handlePartChange}
                            type="number"
                            min="1"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1">Part Title *</label>
                          <input
                            name="title"
                            value={partForm.title}
                            onChange={handlePartChange}
                            placeholder="e.g., Part 1: The Beginning"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                            <FaDownload className="text-[10px]" /> Download Link (Optional)
                          </label>
                          <input
                            name="download_link"
                            value={partForm.download_link}
                            onChange={handlePartChange}
                            placeholder="https://example.com/download/part1.mp4"
                            className="w-full p-2 bg-gray-800/70 border border-gray-700 rounded-xl text-xs sm:text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleAddOrUpdatePart}
                            disabled={submitting}
                            className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-xl font-semibold disabled:opacity-50 text-xs sm:text-sm text-black"
                          >
                            {submitting ? 'Processing...' : (editingPart ? 'Update Part' : 'Add Part')}
                          </button>
                          <button
                            onClick={cancelPartEdit}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!editingPart && !showPartForm && (
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          setPartForm({
                            ...emptyPart,
                            partNumber: movieParts.length + 1,
                            useMainVideo: true
                          });
                          setShowPartForm(true);
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm text-black"
                      >
                        <FaPlusCircle className="text-xs" /> Add New Part
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm sm:text-lg font-bold">Parts ({movieParts.length})</h3>
                    </div>

                    {movieParts.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-400">
                        <FaLayerGroup className="text-2xl sm:text-4xl mx-auto mb-2 opacity-30" />
                        <p>No parts yet. Click "Add New Part" to create one.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {movieParts.map((part) => (
                          <div key={part.partNumber} className="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1">
                                  <span className="px-2 py-0.5 bg-cyan-600/20 text-cyan-400 rounded-full text-[10px] sm:text-xs font-bold">
                                    Part {part.partNumber}
                                  </span>
                                  <h4 className="font-medium text-xs sm:text-sm">{part.title}</h4>
                                </div>
                              </div>
                              <div className="flex gap-1 self-end sm:self-center">
                                <button
                                  onClick={() => startEditPart(part)}
                                  className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 rounded"
                                  title="Edit part"
                                >
                                  <FaEdit className="text-emerald-400 text-xs" />
                                </button>
                                <button
                                  onClick={() => handleDeletePart(part.partNumber, part.title)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded"
                                  title="Delete part"
                                >
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

        {/* ============ TRANSLATORS TAB ============ */}
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