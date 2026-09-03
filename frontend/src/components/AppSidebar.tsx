import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Clock3, Settings, ChevronRight, LogOut, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { JSX } from "react";

const TONES = [
  { name: "Direct", color: "#4FC3F7", glow: "rgba(79,195,247,0.35)" },
  { name: "Curious", color: "#8B7CF6", glow: "rgba(139,124,246,0.35)" },
  { name: "Bold", color: "#F5B942", glow: "rgba(245,185,66,0.35)" },
  { name: "Warm", color: "#F6788F", glow: "rgba(246,120,143,0.35)" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  displayInitials: string;
  displayName: string;
  username?: string;
  fallbackLabel: string;
  profileLoading: boolean;
  onOpenProfile: () => void;
  onLogout: () => void;
}

function Logo(): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L21 20 H3 Z" fill="none" stroke="#F5F1E8" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12 2 L12 20" stroke="url(#prism-grad-sidebar)" strokeWidth="1.4" />
        <defs>
          <linearGradient id="prism-grad-sidebar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="100%" stopColor="#F6788F" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-['Space_Grotesk',sans-serif] text-[17px] font-semibold tracking-tight text-[#F5F1E8]">
        Prismail
      </span>
    </div>
  );
}

export default function AppSidebar({
  open,
  onClose,
  displayInitials,
  displayName,
  username,
  fallbackLabel,
  profileLoading,
  onOpenProfile,
  onLogout,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const isGenerate = location.pathname === "/dashboard";
  const isHistory = location.pathname === "/history";

  function goGenerate(): void {
    onClose();
    if (!isGenerate) navigate("/dashboard");
  }
  function goHistory(): void {
    onClose();
    if (!isHistory) console.log("soon");
  }
  function handleAccount(): void {
    onClose();
    onOpenProfile();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-75 max-w-[86vw] flex-col border-r border-[#23262E] bg-[#0B0C10]"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#23262E] px-5">
              <Logo />
              <button onClick={onClose} className="rounded-md p-1 text-[#F5F1E8]/40 hover:text-[#F5F1E8]" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
              <p className="px-3 pb-2 font-['JetBrains_Mono',monospace] text-[10px] tracking-widest text-[#F5F1E8]/30">MENU</p>
              <div className="space-y-1">
                <button
                  onClick={goGenerate}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isGenerate
                      ? "border border-[#23262E] bg-white/6 font-medium text-[#F5F1E8]"
                      : "text-[#F5F1E8]/60 hover:bg-white/4 hover:text-[#F5F1E8]"
                  }`}
                  aria-current={isGenerate ? "page" : undefined}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${
                      isGenerate ? "bg-[#F5F1E8] text-[#0B0C10]" : "border border-[#23262E] bg-white/2 text-[#F5F1E8]/60"
                    }`}
                  >
                    <Wand2 size={14} />
                  </span>
                  Generate
                  {isGenerate && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#4FC3F7] shadow-[0_0_8px_rgba(79,195,247,0.6)]" />}
                </button>

                <button
                  onClick={goHistory}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isHistory
                      ? "border border-[#23262E] bg-white/6 font-medium text-[#F5F1E8]"
                      : "text-[#F5F1E8]/60 hover:bg-white/4 hover:text-[#F5F1E8]"
                  }`}
                  aria-current={isHistory ? "page" : undefined}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${
                      isHistory ? "bg-[#F5F1E8] text-[#0B0C10]" : "border border-[#23262E] bg-white/2 text-[#F5F1E8]/60"
                    }`}
                  >
                    <Clock3 size={14} />
                  </span>
                  History
                  {isHistory ? (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#8B7CF6] shadow-[0_0_8px_rgba(139,124,246,0.6)]" />
                  ) : (
                    <span className="ml-auto rounded-full border border-[#23262E] bg-white/5 px-2 py-0.5 font-['JetBrains_Mono',monospace] text-[10px] text-[#F5F1E8]/40">
                      Soon
                    </span>
                  )}
                </button>

                <button
                  onClick={handleAccount}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#F5F1E8]/60 transition-colors hover:bg-white/4 hover:text-[#F5F1E8]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#23262E] bg-white/2 text-[#F5F1E8]/60">
                    <Settings size={14} />
                  </span>
                  Account settings
                  <ChevronRight size={14} className="ml-auto text-[#F5F1E8]/25" />
                </button>
              </div>

              <div className="mt-8 px-3">
                <div className="rounded-xl border border-[#23262E] bg-white/2 p-4">
                  <p className="font-['Space_Grotesk',sans-serif] text-sm font-medium text-[#F5F1E8]">Need inspiration?</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#F5F1E8]/45">
                    Pick a tone. Prismail refracts your profile into four distinct voices.
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    {TONES.map((t) => (
                      <span key={t.name} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.color, boxShadow: `0 0 6px ${t.glow}` }} />
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            <div className="border-t border-[#23262E] p-4">
              <div className="flex items-center gap-3 rounded-xl border border-[#23262E] bg-white/3 px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F1E8]/10 text-xs font-medium text-[#F5F1E8]">
                  {displayInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-none text-[#F5F1E8]">
                    {profileLoading ? "Loading..." : displayName || "Your name"}
                  </p>
                  <p className="truncate font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/45">
                    {username ? `@${username}` : fallbackLabel}
                  </p>
                </div>
                <button
                  onClick={handleAccount}
                  className="shrink-0 rounded-md p-1 text-[#F5F1E8]/30 hover:bg-white/5 hover:text-[#F5F1E8]"
                  aria-label="Open profile"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                onClick={onLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#23262E] py-2 text-sm text-[#F5F1E8]/60 transition-colors hover:border-[#F6788F]/40 hover:text-[#F6788F]"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
