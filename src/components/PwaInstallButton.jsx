// src/components/PwaInstallButton.jsx
import { useState } from 'react';
import { FaDownload, FaTimes, FaApple } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import usePwaInstall from '../hooks/usePwaInstall';

export default function PwaInstallButton() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show the icon whenever the app is NOT yet installed
  // On Android/Chrome: uses the native prompt
  // On iOS: opens the "Add to Home Screen" modal
  // On unsupported browsers: clicking it will show a small hint modal
  if (isInstalled) return null;

  const handleClick = async () => {
    const result = await promptInstall();

    if (result === 'ios') {
      // iOS: show custom instructions modal
      setShowIOSModal(true);
    } else if (!result) {
      // Chrome/Edge without a native prompt available (e.g., already dismissed once)
      // Fall back to the iOS-style instructions modal so the button always does something useful
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* ───────── Small Floating Icon (stacks above WhatsApp) ───────── */}
      <div
        className="fixed right-4 sm:right-6 z-40"
        style={{ bottom: 'calc(1.5rem + 64px + 12px)' }}   // WhatsApp bottom-6 (24px) + its height (~64px) + 12px gap
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.4 }}
          onClick={handleClick}
          aria-label="Install CINEVA app"
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-full
                     bg-gradient-to-br from-emerald-500 to-teal-500
                     hover:from-emerald-400 hover:to-teal-400
                     flex items-center justify-center
                     shadow-2xl shadow-emerald-500/50
                     border-2 border-emerald-300/50
                     hover:scale-110 active:scale-95
                     transition-all duration-300"
        >
          {/* Pulsing glow ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400
                           opacity-50 blur-md -z-10 animate-pulse-slow" />

          {/* Very subtle ping ring */}
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping-slow" />

          {/* Icon */}
          <FaDownload className="text-black text-lg sm:text-xl group-hover:animate-bounce" />

          {/* Tiny "app" badge to hint install */}
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full
                           bg-black border-2 border-emerald-400
                           flex items-center justify-center
                           text-[7px] text-emerald-400 font-black">
            ↓
          </span>

          {/* Tooltip on hover (desktop only) */}
          <AnimatePresence>
            {showTooltip && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2
                           whitespace-nowrap px-3 py-1.5 rounded-lg
                           bg-[#0a1614] border border-emerald-900/60
                           text-emerald-200 text-xs font-semibold
                           shadow-xl shadow-black/50 pointer-events-none"
              >
                Install App
                <span className="absolute left-full top-1/2 -translate-y-1/2
                                 border-4 border-transparent border-l-emerald-900/60" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ───────── Instruction Modal (iOS or fallback) ───────── */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm
                       flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="w-full sm:max-w-md bg-[#0a1614] rounded-2xl
                         border border-emerald-900/60 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-emerald-950 via-[#0a1614] to-black
                              p-5 border-b border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500
                                  flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    {isIOS ? (
                      <FaApple className="text-black text-xl" />
                    ) : (
                      <FaDownload className="text-black text-lg" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">Install CINEVA</h3>
                    <p className="text-emerald-400/80 text-xs">
                      {isIOS ? 'Add to Home Screen' : 'How to install'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowIOSModal(false)}
                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60
                               flex items-center justify-center text-white transition-colors"
                    aria-label="Close"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="p-5 space-y-4">
                {isIOS ? (
                  <>
                    <Step n="1" t="Tap the Share button" d="Look for the share icon at the bottom of Safari." />
                    <Step n="2" t="Scroll down and tap" d="Find 'Add to Home Screen' in the share sheet." />
                    <Step n="3" t="Tap Add" d="Confirm to install CINEVA on your home screen." />
                  </>
                ) : (
                  <>
                    <Step n="1" t="Open the browser menu" d="Tap the ⋮ (three dots) in the top-right corner of your browser." />
                    <Step n="2" t="Tap 'Install app' or 'Add to Home screen'" d="The option usually appears at the top of the menu." />
                    <Step n="3" t="Confirm" d="Tap Install / Add and CINEVA will appear on your home screen." />
                  </>
                )}

                <div className="mt-5 pt-4 border-t border-emerald-900/40">
                  <p className="text-[11px] text-emerald-300/70 text-center leading-relaxed">
                    After installation, launch CINEVA from your home screen — it opens full-screen like a native app.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm
                             bg-gradient-to-r from-emerald-500 to-teal-500
                             hover:from-emerald-600 hover:to-teal-600
                             text-black transition-all active:scale-[0.98]"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}

/* Small helper component for the modal steps */
function Step({ n, t, d }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full
                      bg-emerald-500/20 border border-emerald-500/40
                      flex items-center justify-center
                      text-emerald-300 text-xs font-bold">
        {n}
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-semibold">{t}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{d}</p>
      </div>
    </div>
  );
}