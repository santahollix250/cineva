// src/components/HeroCard.jsx
import { useState } from "react";
import { FaPlay } from "react-icons/fa";

/**
 * HeroCard — minimal poster-only card used inside the HeroSlider.
 * It reuses the same `movie` object shape as `MovieCard` but renders
 * only the poster (no title, no metadata, no like button), because
 * all the info is already displayed on the left side of the hero.
 * 
 * Color scheme: Midnight Emerald (emerald/teal accents)
 */
export default function HeroCard({ movie }) {
  const [imageError, setImageError] = useState(false);

  const posterUrl = imageError
    ? "https://via.placeholder.com/300x450?text=No+Poster"
    : (movie?.poster ||
       "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop");

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
      <img
        src={posterUrl}
        alt={movie?.title || "Poster"}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setImageError(true)}
        draggable={false}
      />

      {/* Bottom gradient so any overlay text/icons read clearly */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* Subtle play icon hint at bottom-right (always visible, low opacity) */}
      <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 backdrop-blur-sm flex items-center justify-center border border-emerald-400/30 shadow-lg shadow-emerald-500/40">
        <FaPlay className="text-black text-[8px] ml-0.5" />
      </div>

      {/* Premium inner ring with emerald glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-emerald-400/10 pointer-events-none" />
      
      {/* Subtle emerald corner accent */}
      <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-tl-2xl pointer-events-none" />
    </div>
  );
}