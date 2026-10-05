// src/components/WhatsAppFloatingButton.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWhatsapp,
  FaTimes,
  FaUsers,
  FaCommentDots,
} from 'react-icons/fa';

/* ═══════════════════════════════════════════════════════════
   CONFIG — change these links to your own
═══════════════════════════════════════════════════════════ */
const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb6gSfuFcowDBIM2rp2u'; // 👈 your channel link
const WHATSAPP_CHAT_URL    = 'https://wa.me/250783948792';                            // 👈 your chat link

const OPTIONS = [
  {
    id: 'channel',
    label: 'Join Channel',
    sub: 'Get new updates',
    url: WHATSAPP_CHANNEL_URL,
    icon: FaUsers,
    gradient: 'from-emerald-500 to-teal-500',
    ring: 'ring-emerald-400/50',
  },
  {
    id: 'chat',
    label: 'Direct Chat',
    sub: 'Talk with us',
    url: WHATSAPP_CHAT_URL,
    icon: FaCommentDots,
    gradient: 'from-green-500 to-emerald-500',
    ring: 'ring-green-400/50',
  },
];

export default function WhatsAppFloatingButton() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  /* Close menu when user clicks outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const handleOptionClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const toggleMenu = () => setOpen((o) => !o);

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-[76px] right-4 sm:bottom-[80px] sm:right-6 z-50"
    >
      {/* ═══════════════════════════════════════════════════════════
          OPTIONS MENU — pops up when WhatsApp button is tapped
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="absolute bottom-full right-0 mb-3 flex flex-col gap-2 origin-bottom-right"
          >
            {OPTIONS.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    delay: i * 0.06,
                    type: 'spring',
                    stiffness: 300,
                    damping: 22,
                  }}
                  onClick={() => handleOptionClick(opt.url)}
                  className={`group flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-2xl
                              bg-gradient-to-br ${opt.gradient}
                              text-white shadow-xl shadow-emerald-500/30
                              border border-white/20
                              hover:scale-105 active:scale-95
                              transition-all duration-200 min-w-[170px]`}
                  aria-label={opt.label}
                >
                  {/* Icon bubble */}
                  <span
                    className={`relative flex-shrink-0 w-9 h-9 rounded-full
                                bg-black/25 backdrop-blur-sm
                                flex items-center justify-center
                                ring-2 ${opt.ring}`}
                  >
                    <Icon className="text-white text-sm" />
                  </span>

                  {/* Text */}
                  <span className="flex flex-col items-start text-left leading-tight flex-1">
                    <span className="text-xs font-black">{opt.label}</span>
                    <span className="text-[10px] font-medium opacity-90">
                      {opt.sub}
                    </span>
                  </span>

                  {/* Small arrow */}
                  <svg
                    className="w-3.5 h-3.5 opacity-80 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MAIN WHATSAPP BUTTON
      ═══════════════════════════════════════════════════════════ */}
      <motion.button
        onClick={toggleMenu}
        aria-label="WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
        className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full
                   bg-gradient-to-br from-[#25D366] to-[#128C7E]
                   flex items-center justify-center
                   shadow-2xl shadow-emerald-500/50
                   border-2 border-emerald-300/40
                   hover:scale-110 active:scale-95
                   transition-all duration-300"
      >
        {/* Pulsing glow ring */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-400
                         opacity-50 blur-md -z-10 animate-pulse-slow" />
        <span className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping-slow" />

        {/* Icon — swaps between WhatsApp & X */}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes className="text-white text-xl sm:text-2xl" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaWhatsapp className="text-white text-2xl sm:text-3xl" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full
                           bg-red-500 border-2 border-white
                           flex items-center justify-center
                           text-[8px] text-white font-black
                           animate-pulse">
            2
          </span>
        )}
      </motion.button>

      {/* Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.05); }
        }
        @keyframes ping-slow {
          0%   { transform: scale(1);   opacity: 0.7; }
          75%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-pulse-slow { animation: pulse-slow 2.5s ease-in-out infinite; }
        .animate-ping-slow  { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
}