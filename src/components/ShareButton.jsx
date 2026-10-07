// src/components/ShareButton.jsx
import { useState, useEffect } from 'react';
import {
    FaShare, FaWhatsapp, FaFacebook, FaTwitter, FaTelegram,
    FaCopy, FaCheck, FaTimes, FaLink
} from 'react-icons/fa';

const ShareButton = ({ title, poster, url, isMobile = false, accent = 'emerald' }) => {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const accentClasses = {
        emerald: {
            button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-black',
            ring: 'border-emerald-500/40',
            text: 'text-emerald-400',
        },
        cyan: {
            button: 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-black',
            ring: 'border-cyan-500/40',
            text: 'text-cyan-400',
        },
    };

    const a = accentClasses[accent] || accentClasses.emerald;

    // ⭐ The exact message format you wanted
    const message = `Watch ${title} on Irafilms — ${url} ✔️😍✔️😍 Dore website shyashya twakuraho flm byoroshye zishyashya mumbaze mbayobore`;
    const encodedUrl = encodeURIComponent(url);
    const encodedMessage = encodeURIComponent(message);
    const encodedTitle = encodeURIComponent(`Watch ${title} on Irafilms`);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = message;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Watch ${title} on Irafilms`,
                    text: message,
                    url,
                });
                setOpen(false);
            } catch (err) { /* cancelled */ }
        } else {
            handleCopy();
        }
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: FaWhatsapp,
            color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
            onClick: () => {
                // ⭐ URL is embedded inside the text so WhatsApp's crawler fetches the preview
                window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
                setOpen(false);
            },
        },
        {
            name: 'Facebook',
            icon: FaFacebook,
            color: 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
            onClick: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
                setOpen(false);
            },
        },
        {
            name: 'Twitter / X',
            icon: FaTwitter,
            color: 'bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700',
            onClick: () => {
                window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
                setOpen(false);
            },
        },
        {
            name: 'Telegram',
            icon: FaTelegram,
            color: 'bg-gradient-to-br from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600',
            onClick: () => {
                window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
                setOpen(false);
            },
        },
    ];

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={`${a.button} rounded-full font-medium shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm`}
                title="Share"
            >
                <FaShare className="text-xs md:text-sm" />
                <span>Share</span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <div className="flex items-center gap-2">
                                <FaShare className={a.text} />
                                <h3 className="text-base md:text-lg font-bold text-white">Share this</h3>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex gap-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
                                {poster && (
                                    <img
                                        src={poster}
                                        alt={title}
                                        className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Irafilms</p>
                                    <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">{title}</h4>
                                    <p className="text-xs text-gray-400 line-clamp-2 break-all">{url}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                            {shareOptions.map((opt) => (
                                <button
                                    key={opt.name}
                                    onClick={opt.onClick}
                                    className={`${opt.color} rounded-xl p-3 flex items-center gap-2 transition-all duration-200 transform hover:scale-[1.02] text-white`}
                                >
                                    <opt.icon className="text-lg flex-shrink-0" />
                                    <span className="text-xs md:text-sm font-medium">{opt.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 pt-0">
                            <button
                                onClick={handleCopy}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
                                    copied
                                        ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300'
                                        : 'bg-gray-800/60 hover:bg-gray-800 border-gray-700 text-white'
                                }`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {copied ? <FaCheck className="flex-shrink-0" /> : <FaLink className="flex-shrink-0 text-gray-400" />}
                                    <span className="text-xs md:text-sm font-medium truncate">
                                        {copied ? 'Link copied!' : 'Copy link & message'}
                                    </span>
                                </div>
                                <FaCopy className={`flex-shrink-0 ${copied ? 'text-emerald-400' : 'text-gray-400'}`} />
                            </button>
                        </div>

                        {isMobile && typeof navigator !== 'undefined' && navigator.share && (
                            <div className="p-4 pt-0">
                                <button
                                    onClick={handleNativeShare}
                                    className={`w-full py-3 ${a.button} rounded-xl font-bold flex items-center justify-center gap-2`}
                                >
                                    <FaShare /> Share via device
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ShareButton;