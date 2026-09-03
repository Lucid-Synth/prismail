import { useState, useEffect, type JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Copy, Check, Eye, Trash2, Building2, Briefcase, Menu, Filter, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

type ToneName = "Direct" | "Curious" | "Bold" | "Warm";

interface HistoryItem {
  id: string;
  subject: string;
  preview: string;
  body: string;
  tone: ToneName;
  company: string;
  role: string;
  date: string;
  status: "sent" | "draft";
}

const TONE_META: Record<ToneName, { color: string; glow: string }> = {
  Direct: { color: "#4FC3F7", glow: "rgba(79,195,247,0.35)" },
  Curious: { color: "#8B7CF6", glow: "rgba(139,124,246,0.35)" },
  Bold: { color: "#F5B942", glow: "rgba(245,185,66,0.35)" },
  Warm: { color: "#F6788F", glow: "rgba(246,120,143,0.35)" },
};

const DUMMY_HISTORY: HistoryItem[] = [
  {
    id: "h1",
    subject: "Frontend role at Riverbank — quick 15-min intro?",
    preview: "Hi Alex — I've shipped three React Native apps end-to-end and noticed Riverbank is rebuilding onboarding...",
    body: "Hi Alex,\n\nI've shipped three React Native apps end-to-end and noticed Riverbank is rebuilding the onboarding flow — I'd love to compare notes on what you're optimizing for. I led a similar rebuild at my last team that cut drop-off by 28%.\n\nWorth 15 minutes this week?\n\nBest regards,\nJane Doe\nPortfolio: janedoe.dev\nGitHub: github.com/janedoe",
    tone: "Direct",
    company: "Riverbank",
    role: "Frontend Developer",
    date: "2026-03-02",
    status: "sent",
  },
  {
    id: "h2",
    subject: "Curious about Atlas Labs' design system work",
    preview: "Saw Atlas Labs is rebuilding its component library — curious what prompted the move to a new system...",
    body: "Hi Priya,\n\nSaw Atlas Labs is rebuilding its component library — curious what prompted the move. I've led a migration from Tailwind sprawl to a token-based system and happy to share tradeoffs.\n\nOpen to a short chat?\n\nBest regards,\nJane Doe\nPortfolio: janedoe.dev\nGitHub: github.com/janedoe",
    tone: "Curious",
    company: "Atlas Labs",
    role: "Design Engineer",
    date: "2026-02-28",
    status: "sent",
  },
  {
    id: "h3",
    subject: "Your checkout funnel is leaking at step three",
    preview: "Your checkout funnel is leaking users at step three. I can show you exactly where, and how I'd fix it...",
    body: "Hi Sam,\n\nYour checkout funnel is leaking users at step three. I can show you exactly where, and how I'd fix it — 10 minutes, no deck. I did this for a fintech last quarter and lifted conversion 18%.\n\nBest regards,\nJane Doe\nPortfolio: janedoe.dev\nGitHub: github.com/janedoe",
    tone: "Bold",
    company: "Northpeak",
    role: "Product Engineer",
    date: "2026-02-25",
    status: "draft",
  },
  {
    id: "h4",
    subject: "Longtime reader of Prism's engineering blog",
    preview: "I've followed Prism's design blog for a year — the recent rebrand post especially resonated...",
    body: "Hi Jordan,\n\nI've followed Prism's design blog for a year — the recent rebrand post especially resonated. Would love to add something useful to that team, especially around frontend performance.\n\nBest regards,\nJane Doe\nPortfolio: janedoe.dev\nGitHub: github.com/janedoe",
    tone: "Warm",
    company: "Prism",
    role: "Frontend Developer",
    date: "2026-02-20",
    status: "sent",
  },
  {
    id: "h5",
    subject: "React + TypeScript — impact for Hearth's dashboard",
    preview: "Hearth's dashboard rewrite caught my eye — I've rebuilt similar analytics surfaces in React/TypeScript...",
    body: "Hi Taylor,\n\nHearth's dashboard rewrite caught my eye — I've rebuilt similar analytics surfaces in React/TypeScript and cut render cost by 40%. Worth a brief chat?\n\nBest regards,\nJane Doe\nPortfolio: janedoe.dev\nGitHub: github.com/janedoe",
    tone: "Direct",
    company: "Hearth",
    role: "Fullstack Engineer",
    date: "2026-02-18",
    status: "sent",
  },
  {
    id: "h6",
    subject: "Reaching out about your mobile onboarding role",
    preview: "Riverbank's mobile onboarding role looks like a clear fit for my recent React Native work...",
    body: "Hi Casey,\n\nRiverbank's mobile onboarding role looks like a clear fit for my recent React Native work — three apps shipped, one featured. Would love to show the work directly.\n\nBest regards,\nJane Doe\nPortfolio: janedoe.dev\nGitHub: github.com/janedoe",
    tone: "Warm",
    company: "Riverbank",
    role: "Mobile Developer",
    date: "2026-02-12",
    status: "draft",
  },
];

function initials(name: string): string {
  if (!name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  const chars = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0][0]];
  return chars.join("").toUpperCase();
}

function fallbackEmailLabel(email: string): string {
  const v = email.trim();
  if (v) return v;
  return "No email set";
}

function Logo(): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L21 20 H3 Z" fill="none" stroke="#F5F1E8" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12 2 L12 20" stroke="url(#prism-grad-hist)" strokeWidth="1.4" />
        <defs>
          <linearGradient id="prism-grad-hist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="100%" stopColor="#F6788F" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-['Space_Grotesk',sans-serif] text-[17px] font-semibold tracking-tight">Prismail</span>
    </div>
  );
}

export default function History(): JSX.Element {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [toneFilter, setToneFilter] = useState<"All" | ToneName>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [profile, setProfile] = useState<{ id: number; username: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  const displayName = profile?.username ?? "";
  const displayInitials = initials(displayName || "P");

  useEffect(() => {
    async function fetchProfile(): Promise<void> {
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json().catch(() => ({}))) as { id?: number; username?: string };
        if (res.ok && typeof data.id === "number" && typeof data.username === "string") {
          setProfile({ id: data.id, username: data.username });
        }
      } catch {
        // ignore
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleLogout(): void {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  const filtered = DUMMY_HISTORY.filter((h) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || h.subject.toLowerCase().includes(q) || h.company.toLowerCase().includes(q) || h.role.toLowerCase().includes(q);
    const matchesTone = toneFilter === "All" || h.tone === toneFilter;
    return matchesQuery && matchesTone;
  });

  function handleCopy(item: HistoryItem): void {
    const text = `Subject: ${item.subject}\n\n${item.body}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] font-['Inter',sans-serif] text-[#F5F1E8] antialiased">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#23262E] bg-[#0B0C10]/85 px-4 backdrop-blur-md lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md border border-[#23262E] p-2 text-[#F5F1E8]/70 hover:bg-white/5 hover:text-[#F5F1E8]"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Logo />
          <span className="hidden font-['JetBrains_Mono',monospace] text-[11px] tracking-widest text-[#F5F1E8]/30 lg:inline">— HISTORY</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/25 lg:inline">DUMMY DATA — NO BACKEND YET</span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F1E8]/10 text-xs font-medium"
            aria-label="Open profile"
          >
            {displayInitials}
          </button>
        </div>
      </header>

      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayInitials={displayInitials}
        displayName={displayName || "Your name"}
        username={profile?.username}
        fallbackLabel={fallbackEmailLabel("")}
        profileLoading={profileLoading}
        onOpenProfile={() => setDrawerOpen(true)}
        onLogout={handleLogout}
      />

      {/* Profile drawer (right) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-[#23262E] bg-[#0B0C10] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk',sans-serif] text-lg font-semibold">Profile</span>
                <button onClick={() => setDrawerOpen(false)} className="text-[#F5F1E8]/40 hover:text-[#F5F1E8]">✕</button>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1E8]/10 text-base font-medium">{displayInitials}</span>
                <div>
                  <p className="font-['Space_Grotesk',sans-serif] text-base font-medium">{displayName || "Your name"}</p>
                  <p className="font-['JetBrains_Mono',monospace] text-xs text-[#F5F1E8]/45">@{profile?.username ?? "—"}</p>
                </div>
              </div>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 rounded-full border border-[#23262E] py-2.5 text-sm text-[#F5F1E8]/70 hover:bg-white/5"
                >
                  Back to Generate
                </button>
                <button onClick={handleLogout} className="flex-1 rounded-full bg-[#F5F1E8] py-2.5 text-sm font-medium text-[#0B0C10]">
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-['Space_Grotesk',sans-serif] text-2xl font-semibold tracking-tight lg:text-3xl">History</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#F5F1E8]/55">
              Dummy preview of your past generations. Once the backend persists emails, this will show real data with search, filters, and pagination.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#23262E] bg-white/3 px-3 py-1.5 font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/40">
            <Clock3 size={12} />
            {DUMMY_HISTORY.length} EMAILS · SHOWN LOCALLY
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#F5F1E8]/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, company, or role..."
              className="w-full rounded-xl border border-[#23262E] bg-white/2 py-2.5 pl-10 pr-4 text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:border-[#4FC3F7]/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/40 lg:flex">
              <Filter size={12} /> TONE
            </span>
            <div className="flex gap-1.5 overflow-x-auto">
              {(["All", "Direct", "Curious", "Bold", "Warm"] as const).map((t) => {
                const active = toneFilter === t;
                const meta = t !== "All" ? TONE_META[t as ToneName] : null;
                return (
                  <button
                    key={t}
                    onClick={() => setToneFilter(t)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active ? "bg-[#F5F1E8] text-[#0B0C10] border-[#F5F1E8]" : "border-[#23262E] bg-white/2 text-[#F5F1E8]/60 hover:bg-white/5 hover:text-[#F5F1E8]"
                    }`}
                    style={active && meta ? { backgroundColor: meta.color, borderColor: meta.color, color: "#0B0C10" } : undefined}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-[#23262E] bg-white/1 px-6 py-16 text-center"
              >
                <p className="font-['Space_Grotesk',sans-serif] text-base font-medium text-[#F5F1E8]/70">No emails match that filter</p>
                <p className="mt-1 text-sm text-[#F5F1E8]/40">Try a different search or tone.</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setToneFilter("All");
                  }}
                  className="mt-4 rounded-full border border-[#23262E] px-4 py-1.5 text-sm text-[#F5F1E8]/60 hover:bg-white/5"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              filtered.map((item) => {
                const meta = TONE_META[item.tone];
                const isPreview = previewId === item.id;
                const isCopied = copiedId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="group rounded-2xl border border-[#23262E] bg-white/2 p-4 transition-colors hover:border-[#3a3e48] hover:bg-white/[0.035] lg:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.glow}` }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full border px-2 py-0.5 font-['JetBrains_Mono',monospace] text-[10px] tracking-wide"
                              style={{ borderColor: `${meta.color}40`, backgroundColor: `${meta.color}14`, color: meta.color }}
                            >
                              {item.tone.toUpperCase()}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 font-['JetBrains_Mono',monospace] text-[10px] ${
                                item.status === "sent" ? "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/20" : "bg-white/5 text-[#F5F1E8]/40 border border-[#23262E]"
                              }`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                            <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/30">{item.date}</span>
                          </div>
                          <h3 className="mt-2 truncate font-['Space_Grotesk',sans-serif] text-[15px] font-medium leading-tight text-[#F5F1E8]">{item.subject}</h3>
                          <p className="mt-1 line-clamp-1 text-sm text-[#F5F1E8]/55">{item.preview}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/35">
                            <span className="inline-flex items-center gap-1">
                              <Building2 size={12} /> {item.company}
                            </span>
                            <span className="text-[#23262E]">·</span>
                            <span className="inline-flex items-center gap-1">
                              <Briefcase size={12} /> {item.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
                        <button
                          onClick={() => setPreviewId(isPreview ? null : item.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#23262E] px-3 py-1.5 text-xs text-[#F5F1E8]/60 hover:bg-white/5 hover:text-[#F5F1E8]"
                        >
                          <Eye size={13} /> {isPreview ? "Hide" : "View"}
                        </button>
                        <button
                          onClick={() => handleCopy(item)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#23262E] px-3 py-1.5 text-xs text-[#F5F1E8]/60 hover:bg-white/5 hover:text-[#F5F1E8]"
                        >
                          {isCopied ? <Check size={13} className="text-[#4FC3F7]" /> : <Copy size={13} />} {isCopied ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => alert("Delete is dummy — backend not wired yet.")}
                          className="rounded-full border border-[#23262E] p-1.5 text-[#F5F1E8]/40 hover:border-[#F6788F]/30 hover:text-[#F6788F]"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile actions */}
                    <div className="mt-3 flex gap-2 lg:hidden">
                      <button
                        onClick={() => setPreviewId(isPreview ? null : item.id)}
                        className="flex-1 rounded-full border border-[#23262E] py-1.5 text-xs text-[#F5F1E8]/60"
                      >
                        {isPreview ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() => handleCopy(item)}
                        className="flex-1 rounded-full border border-[#23262E] py-1.5 text-xs text-[#F5F1E8]/60"
                      >
                        {isCopied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isPreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 whitespace-pre-line rounded-xl border border-[#23262E] bg-[#0B0C10] p-4 text-[13.5px] leading-relaxed text-[#F5F1E8]/80">
                            {item.body}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#23262E] pt-4">
          <p className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/30">Showing {filtered.length} of {DUMMY_HISTORY.length} · Pagination wired when backend arrives</p>
          <button onClick={() => navigate("/dashboard")} className="rounded-full bg-[#F5F1E8] px-5 py-2 text-sm font-medium text-[#0B0C10] hover:bg-white">
            Generate new email
          </button>
        </div>
      </main>
    </div>
  );
}
