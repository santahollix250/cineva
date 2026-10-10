// src/components/Footer.jsx
import { FaYoutube, FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaWhatsapp, FaGithub, FaCode, FaHeart, FaShieldAlt, FaRocket, FaTelegram, FaDiscord } from 'react-icons/fa';
import { FiMail, FiPhone, FiGlobe, FiClock } from 'react-icons/fi';
import { FaLocationDot } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';

export default function Footer() {
  // Social Links
  const socialLinks = {
    youtube: "https://youtube.com/@irakabahodjabiri?si=P5Ste_J9oYDkGcqG",
    instagram: "https://www.instagram.com/osicardjabir9/",
    twitter: "https://twitter.com/cineva.store",
    facebook: "https://facebook.com/cineva.store",
    tiktok: "https://www.tiktok.com/@flxemov",
    whatsapp: "https://chat.whatsapp.com/0029Vb6gSfuFcowDBIM2rp2u",
    telegram: "https://t.me/cineva.store",
    discord: "https://discord.gg/cineva.store"
  };

  // Contact Info
  const contactInfo = {
    phone: "+250 783 948 792",
    whatsapp: "250783948792",
    email: "irakabahodjabiri@gmail.com",
    address: "Bugesera Heights, Kigali",
    website: "https://cineva.store"
  };

  // Developer Info
  const developer = {
    name: "Lamaer Dev",
    github: "https://github.com/santahollix250",
    email: "santalamaer@gmail.com"
  };

  const openLink = (url) => url && url !== '#' && window.open(url, '_blank');
  const openWhatsApp = (num) => window.open(`https://wa.me/${num}`, '_blank');
  const makeCall = (num) => window.location.href = `tel:${num}`;
  const sendEmail = (email) => window.location.href = `mailto:${email}`;
  const openMap = (addr) => window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`);

  const SocialIcon = ({ Icon, url, gradient, label }) => (
    <button
      onClick={() => openLink(url)}
      className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center transition-all duration-500 hover:scale-110 hover:-translate-y-1 group relative border border-emerald-900/30 hover:border-transparent shadow-lg hover:shadow-xl`}
      aria-label={label}
    >
      <Icon className="text-white text-lg group-hover:scale-110 transition-transform duration-300" />
      <span className="absolute -top-8 text-[10px] bg-gray-900 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap border border-emerald-600/30 shadow-lg z-50 pointer-events-none">
        {label}
      </span>
    </button>
  );

  const ContactItem = ({ icon: Icon, onClick, title, value, subtitle }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-teal-600/20 rounded-xl cursor-pointer transition-all duration-300 group border border-transparent hover:border-emerald-600/30"
    >
      <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-600/30 flex-shrink-0">
        <Icon className="text-black text-sm" />
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">{title}</p>
        <p className="text-white text-xs font-semibold group-hover:text-emerald-400 transition-colors truncate">{value}</p>
        {subtitle && (
          <p className="text-gray-500 text-[10px] flex items-center gap-1 mt-0.5">
            <FiClock className="text-emerald-400 text-[9px]" /> {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <footer className="bg-gradient-to-b from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600 rounded-full filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600 rounded-full filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Main Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="space-y-5 md:col-span-1">
            <div className="flex items-center gap-3 group">
              {/* ⭐ Logo — same SVG as Navbar, pasted directly */}
              <div className="relative">
                {/* Soft glow behind the logo */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

                {/* Rotating accent ring */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-spin-slow opacity-60" />

                {/* The C Play logo */}
                <div className="relative rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="footerCBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#064e3b" />
                        <stop offset="55%" stopColor="#065f46" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="footerCArc" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="45%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                      <linearGradient id="footerCPlay" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a7f3d0" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                      <radialGradient id="footerCGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#footerCBg)" />
                    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#footerCGlow)" />

                    <rect
                      x="2"
                      y="2"
                      width="60"
                      height="60"
                      rx="16"
                      fill="none"
                      stroke="url(#footerCArc)"
                      strokeWidth="1.5"
                      opacity="0.7"
                    />

                    {[
                      { x: 12, y: 32 },
                      { x: 15, y: 20 },
                      { x: 22, y: 12 },
                      { x: 32, y: 8 },
                      { x: 42, y: 12 },
                      { x: 49, y: 20 },
                      { x: 52, y: 32 },
                      { x: 49, y: 44 },
                      { x: 42, y: 52 },
                      { x: 32, y: 56 },
                      { x: 22, y: 52 },
                      { x: 15, y: 44 },
                    ].map((dot, i) => (
                      <circle
                        key={i}
                        cx={dot.x}
                        cy={dot.y}
                        r="1.2"
                        fill="url(#footerCArc)"
                        opacity={i % 2 === 0 ? 0.9 : 0.55}
                      />
                    ))}

                    <path
                      d="M 44 20 A 16 16 0 1 0 44 44"
                      stroke="url(#footerCArc)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />

                    <path
                      d="M 42 20 A 16 16 0 0 0 26 15"
                      stroke="#a7f3d0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.75"
                    />

                    <path
                      d="M 26 24 L 40 32 L 26 40 Z"
                      fill="url(#footerCPlay)"
                      stroke="#065f46"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 28 27 L 28 37 L 35 32 Z"
                      fill="#ecfdf5"
                      opacity="0.35"
                    />

                    <circle cx="20" cy="18" r="1" fill="#a7f3d0" opacity="0.9" />
                  </svg>
                </div>
              </div>

              {/* Brand Name */}
              <div className="flex flex-col">
                <h2 className="text-3xl font-bold leading-none">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent bg-300% animate-gradient">
                    Cineva
                  </span>
                </h2>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-1.5">
                  <FaRocket className="text-emerald-400 text-[10px]" /> Premium Streaming in Rwanda
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Experience the best of Rwandan and international entertainment with our premium streaming platform. Watch anywhere, anytime.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => openWhatsApp(contactInfo.whatsapp)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-sm px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-600/30 group text-black font-bold"
              >
                <FaWhatsapp className="text-lg group-hover:rotate-12 transition-transform" />
                WhatsApp
              </button>
              <button
                onClick={() => makeCall(contactInfo.phone)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-sm px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-600/30 group text-black font-bold"
              >
                <FiPhone className="text-lg group-hover:rotate-12 transition-transform" />
                Call Us
              </button>
            </div>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-5 inline-block">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent border-b-2 border-emerald-600 pb-1">
                Contact Us
              </span>
            </h3>
            <div className="space-y-1.5">
              <ContactItem
                icon={FaWhatsapp}
                onClick={() => openWhatsApp(contactInfo.whatsapp)}
                title="WhatsApp"
                value={contactInfo.whatsapp}
                subtitle="Replies in 1 hour"
              />
              <ContactItem
                icon={FiPhone}
                onClick={() => makeCall(contactInfo.phone)}
                title="Call"
                value={contactInfo.phone}
                subtitle="24/7 Support"
              />
              <ContactItem
                icon={FiMail}
                onClick={() => sendEmail(contactInfo.email)}
                title="Email"
                value={contactInfo.email}
                subtitle="Within 24 hours"
              />
              <ContactItem
                icon={FaLocationDot}
                onClick={() => openMap(contactInfo.address)}
                title="Address"
                value="Kigali, Rwanda"
                subtitle="Bugesera Heights"
              />
            </div>

            {/* Website Link */}
            <div className="mt-5">
              <a
                href={contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-all duration-300 group bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700 hover:border-emerald-600"
              >
                <FiGlobe className="group-hover:rotate-12 transition-transform text-emerald-400" />
                <span className="font-medium">{contactInfo.website.replace('https://', '')}</span>
                <span className="text-xs bg-emerald-600/20 px-2 py-0.5 rounded-full text-emerald-400">Visit</span>
              </a>
            </div>
          </div>

          {/* Social & Dev Column */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-5 inline-block">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent border-b-2 border-emerald-600 pb-1">
                Connect With Us
              </span>
            </h3>

            {/* Social Media Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <SocialIcon
                Icon={FaYoutube}
                url={socialLinks.youtube}
                gradient="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                label="YouTube"
              />
              <SocialIcon
                Icon={FaInstagram}
                url={socialLinks.instagram}
                gradient="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 hover:from-pink-400 hover:via-purple-400 hover:to-orange-400"
                label="Instagram"
              />
              <SocialIcon
                Icon={FaFacebook}
                url={socialLinks.facebook}
                gradient="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                label="Facebook"
              />
              <SocialIcon
                Icon={FaTiktok}
                url={socialLinks.tiktok}
                gradient="bg-gradient-to-br from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 border border-gray-600"
                label="TikTok"
              />
              <SocialIcon
                Icon={FaWhatsapp}
                url={socialLinks.whatsapp}
                gradient="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600"
                label="WhatsApp"
              />
              <SocialIcon
                Icon={FaGithub}
                url={developer.github}
                gradient="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                label="GitHub"
              />
            </div>

            {/* Developer Card */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-600/30">
              <p className="text-xs text-gray-400 flex items-center gap-2 mb-3">
                <FaCode className="text-emerald-400" />
                <span className="flex items-center gap-1">
                  Crafted with <FaHeart className="text-emerald-500 text-xs animate-pulse" /> by
                </span>
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 font-bold text-base">{developer.name}</p>
                  <p className="text-gray-500 text-xs">Full Stack Developer</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openLink(developer.github)}
                    className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors group"
                    title="GitHub"
                  >
                    <FaGithub className="text-gray-300 group-hover:text-white" />
                  </button>
                  <button
                    onClick={() => sendEmail(developer.email)}
                    className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors group"
                    title="Email Developer"
                  >
                    <MdEmail className="text-gray-300 group-hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p className="flex items-center gap-2 order-2 sm:order-1 mt-4 sm:mt-0">
            <FaShieldAlt className="text-emerald-400" />
            © {new Date().getFullYear()} Cineva. All rights reserved.
          </p>
          <div className="flex gap-6 order-1 sm:order-2">
            <a href="/privacy" className="hover:text-emerald-400 transition-colors flex items-center gap-1 group">
              <span className="w-1 h-1 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform"></span>
              Privacy
            </a>
            <a href="/terms" className="hover:text-emerald-400 transition-colors flex items-center gap-1 group">
              <span className="w-1 h-1 bg-teal-400 rounded-full group-hover:scale-150 transition-transform"></span>
              Terms
            </a>
            <a href="/faq" className="hover:text-emerald-400 transition-colors flex items-center gap-1 group">
              <span className="w-1 h-1 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform"></span>
              FAQ
            </a>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradient 3s ease infinite; }

        .bg-300\\% { background-size: 300% auto; }
      `}</style>
    </footer>
  );
}