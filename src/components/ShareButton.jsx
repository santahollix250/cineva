// src/components/ShareButton.jsx
import { useState } from 'react';
import { FaShare, FaWhatsapp, FaFacebook, FaTwitter, FaTelegram, FaLink, FaCheck, FaTimes } from 'react-icons/fa';

const DEFAULT_POSTER = 'https://irafilms.store/og-default.jpg';

function normalizeImage(raw) {
  if (!raw || typeof raw !== 'string') return DEFAULT_POSTER;
  const t = raw.trim();
  if (!t) return DEFAULT_POSTER;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  if (t.startsWith('/')) return `https://irafilms.store${t}`;
  return t;
}

export default function ShareButton({ title, poster, url, isMobile = false, accent = 'emerald' }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareTitle = title || 'Watch on Irafilms';
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareImage = normalizeImage(poster);

  const accentColors = {
    emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
    cyan: 'from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700',
  };
  const accentClass = accentColors[accent] || accentColors.emerald;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    }
    return false;
  };

  const handleShareClick = async () => {
    const shared = await handleNativeShare();
    if (!shared) setShowMenu(!showMenu);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareTo = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedImage = encodeURIComponent(shareImage);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    };

    window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=500');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShareClick}
        className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r ${accentClass} rounded-full text-black font-medium shadow-lg transition-all duration-200 transform hover:scale-105 text-xs md:text-sm`}
        title="Share"
      >
        <FaShare className="text-xs" />
        <span>Share</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-gray-800 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-300">Share via</p>
              <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-white">
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="p-2">
              <button
                onClick={() => shareTo('whatsapp')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                <FaWhatsapp className="text-green-500 text-lg" />
                <span className="text-sm text-white">WhatsApp</span>
              </button>

              <button
                onClick={() => shareTo('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                <FaFacebook className="text-blue-500 text-lg" />
                <span className="text-sm text-white">Facebook</span>
              </button>

              <button
                onClick={() => shareTo('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                <FaTwitter className="text-sky-400 text-lg" />
                <span className="text-sm text-white">Twitter / X</span>
              </button>

              <button
                onClick={() => shareTo('telegram')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                <FaTelegram className="text-sky-500 text-lg" />
                <span className="text-sm text-white">Telegram</span>
              </button>

              <div className="border-t border-gray-800 my-1" />

              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                {copied ? (
                  <>
                    <FaCheck className="text-emerald-500 text-lg" />
                    <span className="text-sm text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <FaLink className="text-gray-400 text-lg" />
                    <span className="text-sm text-white">Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}