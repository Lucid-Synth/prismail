import { useState, useEffect, type ButtonHTMLAttributes, type JSX } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  User,
  Mail,
  Link2,
  Phone,
  Building2,
  Briefcase,
  Sparkles,
  Wand2,
  Copy,
  Check,
  RotateCcw,
  LogOut,
  X,
  ChevronRight,
  Pencil,
  Save,
  Menu,
} from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertVariant } from "../components/Alert";
import AppSidebar from "../components/AppSidebar";

const API_BASE_URL = (import.meta.env.API_URL as string | undefined) ?? "http://localhost:8000";

interface FormState {
  name: string;
  email: string;
  portfolio: string;
  github: string;
  phone: string;
  company: string;
  role: string;
  skills: string;
  tone: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  portfolio: "",
  github: "",
  phone: "",
  company: "",
  role: "",
  skills: "",
  tone: "Direct",
};

interface Tone {
  name: string;
  color: string;
  glow: string;
}

const TONES: Tone[] = [
  { name: "Direct", color: "#4FC3F7", glow: "rgba(79,195,247,0.35)" },
  { name: "Curious", color: "#8B7CF6", glow: "rgba(139,124,246,0.35)" },
  { name: "Bold", color: "#F5B942", glow: "rgba(245,185,66,0.35)" },
  { name: "Warm", color: "#F6788F", glow: "rgba(246,120,143,0.35)" },
];

const LOADING_MESSAGES = [
  "Reading your profile...",
  "Scanning your skills...",
  "Researching target company...",
  "Matching the role...",
  "Analyzing portfolio & GitHub...",
  "Refracting into tone...",
  "Drafting the opener...",
  "Weaving your portfolio...",
  "Crafting the pitch...",
  "Balancing confidence and warmth...",
  "Polishing the close...",
  "Adding signature...",
  "Final review...",
  "Almost there...",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

type AlertState = { variant: AlertVariant; title: string; message: string } | null;


type GenState = "idle" | "loading" | "done";

export default function Dashboard(): JSX.Element {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [genState, setGenState] = useState<GenState>("idle");
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const navigate = useNavigate();


  const [profile, setProfile] = useState<{ id: number; username: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    if (!alert) return;
    const ms = alert.variant === "error" ? 6000 : 3500;
    const t = setTimeout(() => setAlert(null), ms);
    return () => clearTimeout(t);
  }, [alert]);

  
  useEffect(() => {
    if (genState !== "loading") return;
    setMessageIndex(0);
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(id);
  }, [genState]);

  useEffect(() => {
    async function fetchProfile(): Promise<void> {
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileLoading(false);
        setProfileError("Not authenticated");
        return;
      }
      try {
        setProfileLoading(true);
        setProfileError(null);
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg =
            data && typeof data === "object" && "detail" in data && typeof (data as { detail: unknown }).detail === "string"
              ? (data as { detail: string }).detail
              : `Failed to load profile (${res.status})`;
          if (res.status === 401) {
            setAlert({ variant: "error", title: "Session expired", message: `${msg} Please log in again.` });
            setTimeout(() => navigate("/login"), 1200);
          }
          setProfileError(msg);
          return;
        }
        const payload = data as { id?: number; username?: string; success?: boolean };
        if (typeof payload.id === "number" && typeof payload.username === "string") {
          setProfile({ id: payload.id, username: payload.username });
        } else {
          setProfileError("Invalid profile response from server");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        const isNetwork = msg.includes("Failed to fetch") || msg.includes("NetworkError");
        setProfileError(isNetwork ? `Cannot reach ${API_BASE_URL}` : msg);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function getErrorMessage(data: unknown, fallback: string): string {
    if (data && typeof data === "object" && "detail" in data) {
      const d = (data as { detail: unknown }).detail;
      if (typeof d === "string") return d;
      if (Array.isArray(d) && d[0]?.msg) return String(d[0].msg);
    }
    // backend validation handler also returns `errors`
    if (data && typeof data === "object" && "errors" in data) {
      const e = (data as { errors: unknown }).errors;
      if (Array.isArray(e) && e[0] && typeof e[0] === "object" && "msg" in e[0]) {
        return String((e[0] as { msg: unknown }).msg);
      }
    }
    return fallback;
  }

  async function handleGenerate(): Promise<void> {
    setAlert(null);
    setGenState("loading");
    setResult(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({
        variant: "error",
        title: "Not authenticated",
        message: "Please log in again. Redirecting to login...",
      });
      setGenState("idle");
      setTimeout(() => navigate("/login"), 800);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        let title = "Generation failed";
        if (res.status === 401) title = "Session expired";
        else if (res.status === 422) title = "Validation error";
        else if (res.status === 400) title = "Invalid input";
        else if (res.status >= 500) title = "Server error";

        const msg = getErrorMessage(data, `Request failed (${res.status}). Please try again.`);

        if (res.status === 401) {
          setAlert({ variant: "error", title, message: `${msg} Please log in again.` });
          setGenState("idle");
          setTimeout(() => navigate("/login"), 1200);
          return;
        }

        setAlert({ variant: "error", title, message: msg });
        setGenState("idle");
        return;
      }

      // backend returns { success: true, email: string }
      const payload = data as { email?: string; success?: boolean };
      const raw = payload.email ?? "";

      if (!raw) {
        setAlert({ variant: "error", title: "Empty response", message: "Server returned no email content." });
        setGenState("idle");
        return;
      }

      let subject = "";
      let body = raw;
      const subjectMatch = raw.match(/^Subject:\s*(.+)$/m);
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
        body = raw.replace(/^Subject:\s*.+$/m, "").trim();
      }

      setResult({ subject, body });
      setGenState("done");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Network error. Is the server running?";
      const isNetwork = msg.includes("Failed to fetch") || msg.includes("NetworkError");
      setAlert({
        variant: "error",
        title: isNetwork ? "Cannot reach server" : "Something went wrong",
        message: isNetwork
          ? `Unable to connect to ${API_BASE_URL}. Please check the backend is running.`
          : msg,
      });
      setGenState("idle");
    }
  }

  function handleCopy(): void {
    if (!result) return;
    const stripMd = (s: string) =>
      s.replace(/\*\*([\s\S]+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
    const cleanSubject = stripMd(result.subject);
    const cleanBody = stripMd(result.body);
    const text = cleanSubject ? `Subject: ${cleanSubject}\n\n${cleanBody}` : cleanBody;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleEditSave(newSubject: string, newBody: string): void {
    setResult({ subject: newSubject, body: newBody });
    setAlert({ variant: "success", title: "Saved", message: "Your edits have been saved. You can copy or regenerate again." });
  }

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const activeTone = TONES.find((t) => t.name === form.tone) ?? TONES[0];
  const isFormValid = Boolean(form.name && form.email && form.role && form.company && form.skills);

  const displayName = profile?.username ?? form.name;
  const displayInitials = initials(displayName);

  function handleLogout(): void {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0B0C10] font-['Inter',sans-serif] text-[#F5F1E8] antialiased">
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
          <span className="hidden font-['JetBrains_Mono',monospace] text-[11px] tracking-widest text-[#F5F1E8]/30 lg:inline">— DASHBOARD</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/25 lg:inline">BUILD YOUR EMAIL</span>
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
        fallbackLabel={fallbackEmailLabel(form.email)}
        profileLoading={profileLoading}
        onOpenProfile={() => setDrawerOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 flex-col">

      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={profile}
        profileLoading={profileLoading}
        profileError={profileError}
        fallbackName={form.name}
        fallbackEmail={form.email}
        onRetry={async () => {
          const t = localStorage.getItem("token");
          if (!t) {
            navigate("/login");
            return;
          }
          try {
            setProfileLoading(true);
            setProfileError(null);
            const res = await fetch(`${API_BASE_URL}/auth/profile`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            const data: unknown = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(typeof (data as { detail?: unknown }).detail === "string" ? (data as { detail: string }).detail : `Failed (${res.status})`);
            const p = data as { id?: number; username?: string };
            if (typeof p.id === "number" && typeof p.username === "string") setProfile({ id: p.id, username: p.username });
          } catch (e) {
            setProfileError(e instanceof Error ? e.message : "Failed to reload profile");
          } finally {
            setProfileLoading(false);
          }
        }}
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-widest text-[#F5F1E8]/30 lg:hidden">
            BUILD YOUR EMAIL
          </p>
        </motion.div>

        {/* Global alert slot for generate errors/success */}
        <div className="mb-6 min-h-0">
          <AnimatePresence mode="wait">
            {alert && (
              <Alert
                variant={alert.variant}
                title={alert.title}
                message={alert.message}
                onDismiss={() => setAlert(null)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="h-fit rounded-2xl border border-[#23262E] bg-white/2 p-6"
          >
            <motion.div variants={fadeUp} className="space-y-4">
              <Field id="name" label="Name" icon={User} value={form.name} onChange={(v) => update("name", v)} placeholder="Jane Doe" />
              <Field id="email" label="Email" icon={Mail} type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="jane@email.com" />
              <Field id="role" label="Your role" icon={Briefcase} value={form.role} onChange={(v) => update("role", v)} placeholder="Frontend Developer" />
              <Field id="company" label="Target company" icon={Building2} value={form.company} onChange={(v) => update("company", v)} placeholder="Riverbank" />
              <Field id="skills" label="Skills" icon={Sparkles} value={form.skills} onChange={(v) => update("skills", v)} placeholder="React, TypeScript, Node" />
              <Field id="github" label="GitHub" icon={FiGithub} value={form.github} onChange={(v) => update("github", v)} placeholder="github.com/janedoe" />
              <Field id="portfolio" label="Portfolio" icon={Link2} value={form.portfolio} onChange={(v) => update("portfolio", v)} placeholder="janedoe.dev" />
              <Field id="phone" label="Phone" icon={Phone} type="tel" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+1 555 010 1234" />
            </motion.div>

            {/* Tone picker */}
            <motion.div variants={fadeUp} className="mt-5">
              <label className="mb-2 block font-['JetBrains_Mono',monospace] text-[11px] tracking-wide text-[#F5F1E8]/45">
                TONE
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((tone) => {
                  const active = form.tone === tone.name;
                  return (
                    <button
                      key={tone.name}
                      type="button"
                      onClick={() => update("tone", tone.name)}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                      style={{
                        borderColor: active ? `${tone.color}80` : "#23262E",
                        backgroundColor: active ? `${tone.color}14` : "transparent",
                        boxShadow: active ? `0 0 0 1px ${tone.color}30` : "none",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: tone.color, boxShadow: active ? `0 0 8px ${tone.glow}` : "none" }}
                      />
                      <span className={active ? "text-[#F5F1E8]" : "text-[#F5F1E8]/60"}>{tone.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Button
                onClick={handleGenerate}
                disabled={!isFormValid || genState === "loading"}
                className="mt-6 h-11 w-full rounded-full bg-[#F5F1E8] text-[15px] font-medium text-[#0B0C10] hover:bg-[#F5F1E8]/90"
              >
                <Wand2 size={16} className="mr-1.5" />
                {genState === "loading" ? "Generating..." : "Generate email"}
              </Button>
              {!isFormValid && (
                <p className="mt-2 text-center text-xs text-[#F5F1E8]/30">
                  Name, email, role, company and skills are required.
                </p>
              )}
            </motion.div>
          </motion.div>

          <div className="rounded-2xl border border-[#23262E] bg-white/2 p-6 lg:min-h-150">
            <AnimatePresence mode="wait">
              {genState === "idle" && <IdleState key="idle" />}
              {genState === "loading" && <LoadingState key="loading" message={LOADING_MESSAGES[messageIndex]} tone={activeTone} />}
              {genState === "done" && result && (
                <ResultState
                  key="done"
                  subject={result.subject}
                  body={result.body}
                  tone={activeTone}
                  copied={copied}
                  onCopy={handleCopy}
                  onRegenerate={handleGenerate}
                  onSave={handleEditSave}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

function fallbackEmailLabel(email: string): string {
  const v = email.trim();
  if (v) return v;
  return "No email set";
}


function IdleState(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full min-h-125 flex-col items-center justify-center text-center"
    >
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="mb-5 opacity-30">
        <path d="M12 2 L21 20 H3 Z" stroke="#F5F1E8" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      <p className="font-['Space_Grotesk',sans-serif] text-lg font-medium text-[#F5F1E8]/70">
        Your email will appear here
      </p>
      <p className="mt-2 max-w-xs text-sm text-[#F5F1E8]/40">
        Fill in your details on the left, pick a tone, and hit generate.
      </p>
    </motion.div>
  );
}

function LoadingState({ message, tone }: { message: string; tone: Tone }): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full min-h-125 flex-col items-center justify-center text-center"
    >
      <div className="relative mb-6 h-14 w-14">
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-14 w-14"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        >
          <path
            d="M12 2 L21 20 H3 Z"
            stroke={tone.color}
            strokeWidth="1.3"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${tone.glow})` }}
          />
        </motion.svg>
      </div>

      <div className="flex gap-1.5">
        {TONES.map((t, i) => (
          <motion.span
            key={t.name}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: t.color }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="mt-4 font-['JetBrains_Mono',monospace] text-xs text-[#F5F1E8]/45"
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

function RichText({ text, tone }: { text: string; tone?: Tone }): JSX.Element {
  if (!text.includes("**") && !text.includes("](")) return <>{text}</>;

  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const linkParts: Array<string | { label: string; href: string }> = [];
  let lastIdx = 0;
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(text)) !== null) {
    if (lm.index > lastIdx) linkParts.push(text.slice(lastIdx, lm.index));
    linkParts.push({ label: lm[1], href: lm[2] });
    lastIdx = linkRe.lastIndex;
  }
  if (lastIdx < text.length) linkParts.push(text.slice(lastIdx));

  function renderBold(segment: string, keyPrefix: string): React.ReactNode[] {
    if (!segment.includes("**")) return [segment];
    const nodes: React.ReactNode[] = [];
    const re = /\*\*([\s\S]+?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = re.exec(segment)) !== null) {
      if (m.index > last) nodes.push(<span key={`${keyPrefix}-t-${k++}`}>{segment.slice(last, m.index)}</span>);
      nodes.push(
        <strong
          key={`${keyPrefix}-b-${k++}`}
          className="font-semibold text-[#F5F1E8]"
          style={
            tone
              ? { backgroundColor: `${tone.color}14`, borderRadius: 4, padding: "0 3px" }
              : undefined
          }
        >
          {m[1]}
        </strong>
      );
      last = re.lastIndex;
    }
    if (last < segment.length) nodes.push(<span key={`${keyPrefix}-t-${k++}`}>{segment.slice(last)}</span>);
    return nodes;
  }

  const out: React.ReactNode[] = [];
  linkParts.forEach((part, i) => {
    if (typeof part === "string") {
      out.push(<span key={`seg-${i}`}>{renderBold(part, `seg-${i}`)}</span>);
    } else {
      out.push(
        <a
          key={`link-${i}`}
          href={part.href}
          target="_blank"
          rel="noreferrer"
          className="font-medium underline decoration-[#4FC3F7]/40 underline-offset-4 hover:decoration-[#4FC3F7] hover:text-[#4FC3F7] transition-colors"
        >
          {part.label}
        </a>
      );
    }
  });

  return <>{out}</>;
}

function EmailBody({ body, tone }: { body: string; tone: Tone }): JSX.Element {
  // Split off signature block starting at "Best regards," so it can be styled as a footer
  const sigIdx = body.search(/\n\s*Best regards,?/i);
  if (sigIdx === -1) {
    return (
      <div className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-[#F5F1E8]/85">
        <RichText text={body} tone={tone} />
      </div>
    );
  }
  const main = body.slice(0, sigIdx).trimEnd();
  const sig = body.slice(sigIdx).trimStart();
  return (
    <>
      <div className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-[#F5F1E8]/85">
        <RichText text={main} tone={tone} />
      </div>
      <div className="mt-6 border-t border-[#23262E] pt-4 whitespace-pre-line text-[13.5px] leading-relaxed text-[#F5F1E8]/60">
        <RichText text={sig} tone={tone} />
      </div>
    </>
  );
}

function ResultState({
  subject,
  body,
  tone,
  copied,
  onCopy,
  onRegenerate,
  onSave,
}: {
  subject: string;
  body: string;
  tone: Tone;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onSave: (subject: string, body: string) => void;
}): JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftSubject, setDraftSubject] = useState<string>(subject);
  const [draftBody, setDraftBody] = useState<string>(body);

  useEffect(() => setDraftSubject(subject), [subject]);
  useEffect(() => setDraftBody(body), [body]);

  function handleSave(): void {
    onSave(draftSubject.trim(), draftBody.trim());
    setIsEditing(false);
  }
  function handleCancel(): void {
    setDraftSubject(subject);
    setDraftBody(body);
    setIsEditing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: tone.color, boxShadow: `0 0 8px ${tone.glow}` }}
          />
          <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-wide text-[#F5F1E8]/45">
            {tone.name.toUpperCase()} TONE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-full border border-[#23262E] px-3 py-1.5 text-xs text-[#F5F1E8]/60 transition-colors hover:border-[#3a3e48] hover:text-[#F5F1E8]"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-full border border-[#23262E] px-3 py-1.5 text-xs text-[#F5F1E8]/60 transition-colors hover:border-[#3a3e48] hover:text-[#F5F1E8]"
              >
                <RotateCcw size={13} />
                Regenerate
              </button>
              <button
                onClick={onCopy}
                className="flex items-center gap-1.5 rounded-full border border-[#23262E] px-3 py-1.5 text-xs text-[#F5F1E8]/60 transition-colors hover:border-[#3a3e48] hover:text-[#F5F1E8]"
              >
                {copied ? <Check size={13} className="text-[#4FC3F7]" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-full border border-[#23262E] px-3 py-1.5 text-xs text-[#F5F1E8]/60 transition-colors hover:border-[#3a3e48] hover:text-[#F5F1E8]"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-full bg-[#F5F1E8] px-3.5 py-1.5 text-xs font-medium text-[#0B0C10] transition-colors hover:bg-white"
              >
                <Save size={13} />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="mt-5 border-b border-[#23262E] pb-3">
        <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/35">SUBJECT</span>
        {!isEditing ? (
          <p className="mt-1 text-[15px] font-medium">
            {subject ? <RichText text={subject} tone={tone} /> : <span className="text-[#F5F1E8]/30">No subject</span>}
          </p>
        ) : (
          <>
            <input
              value={draftSubject}
              onChange={(e) => setDraftSubject(e.target.value)}
              placeholder="Subject line"
              className="mt-2 w-full rounded-lg border border-[#23262E] bg-[#0B0C10] px-3 py-2 text-[14px] text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:border-[#4FC3F7]/50 focus:outline-none"
            />
            <p className="mt-1.5 font-['JetBrains_Mono',monospace] text-[10px] text-[#F5F1E8]/30">
              {draftSubject.length}/120
            </p>
          </>
        )}
      </div>

      {/* Body */}
      {!isEditing ? (
        <EmailBody body={body} tone={tone} />
      ) : (
        <div className="mt-5">
          <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/35">BODY</span>
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Edit your email body..."
            rows={14}
            className="mt-2 min-h-70 w-full resize-y rounded-xl border border-[#23262E] bg-[#0B0C10] px-3.5 py-3 text-[14px] leading-relaxed text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:border-[#4FC3F7]/50 focus:outline-none"
          />
          <p className="mt-2 font-['JetBrains_Mono',monospace] text-[10px] text-[#F5F1E8]/30">
            Supports <span className="text-[#F5F1E8]/60">**bold**</span> and{" "}
            <span className="text-[#F5F1E8]/60">[label](https://...)</span>. Signature is auto-separated at “Best regards,”.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function initials(name: string): string {
  if (!name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  const chars = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0][0]];
  return chars.join("").toUpperCase();
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function Field({ id, label, icon: Icon, type = "text", value, onChange, placeholder }: FieldProps): JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-['JetBrains_Mono',monospace] text-[10px] tracking-wide text-[#F5F1E8]/40"
      >
        {label.toUpperCase()}
      </label>
      <div className="group flex items-center gap-2.5 rounded-lg border border-[#23262E] bg-white/2 px-3 py-2 transition-colors focus-within:border-[#4FC3F7]/50 focus-within:bg-white/3">
        <Icon size={14} className="shrink-0 text-[#F5F1E8]/30 transition-colors group-focus-within:text-[#4FC3F7]" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#F5F1E8] placeholder:text-[#F5F1E8]/25 focus:outline-none"
        />
      </div>
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

function Button({ className = "", children, ...props }: ButtonProps): JSX.Element {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F1E8]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0C10] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Logo(): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L21 20 H3 Z" fill="none" stroke="#F5F1E8" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12 2 L12 20" stroke="url(#prism-grad-dash)" strokeWidth="1.4" />
        <defs>
          <linearGradient id="prism-grad-dash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="100%" stopColor="#F6788F" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-['Space_Grotesk',sans-serif] text-[17px] font-semibold tracking-tight">
        Prismail
      </span>
    </div>
  );
}

function ProfileDrawer({
  open,
  onClose,
  profile,
  profileLoading,
  profileError,
  fallbackName,
  fallbackEmail,
  onRetry,
}: {
  open: boolean;
  onClose: () => void;
  profile: { id: number; username: string } | null;
  profileLoading: boolean;
  profileError: string | null;
  fallbackName: string;
  fallbackEmail: string;
  onRetry: () => void;
}): JSX.Element {
  const displayName = profile?.username ?? fallbackName;
  const displayEmail = fallbackEmail;

  function handleLogout(): void {
    localStorage.removeItem("token");
    window.location.href = "/login";
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
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-[#23262E] bg-[#0B0C10] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk',sans-serif] text-lg font-semibold tracking-tight">
                Profile
              </span>
              <button
                onClick={onClose}
                className="text-[#F5F1E8]/40 transition-colors hover:text-[#F5F1E8]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Fetched identity: username + id */}
            <div className="mt-8">
              {profileLoading ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <span className="h-12 w-12 rounded-full bg-[#F5F1E8]/10" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-[#F5F1E8]/10" />
                    <div className="h-3 w-20 rounded bg-[#F5F1E8]/10" />
                  </div>
                </div>
              ) : profileError ? (
                <div className="rounded-xl border border-[#F6788F]/30 bg-[#F6788F]/10 p-4">
                  <p className="text-sm text-[#F6788F]">Failed to load profile</p>
                  <p className="mt-1 text-xs text-[#F5F1E8]/60">{profileError}</p>
                  <button
                    onClick={onRetry}
                    className="mt-3 rounded-full border border-[#F6788F]/30 px-3 py-1 text-xs text-[#F6788F] hover:bg-[#F6788F]/10"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1E8]/10 text-base font-medium">
                    {initials(displayName)}
                  </span>
                  <div>
                    <p className="font-['Space_Grotesk',sans-serif] text-base font-medium">
                      {displayName || "Your name"}
                    </p>
                    <p className="font-['JetBrains_Mono',monospace] text-xs text-[#F5F1E8]/45">
                      @{profile?.username ?? "—"} · ID: {profile?.id ?? "—"}
                    </p>
                    {displayEmail ? (
                      <p className="text-sm text-[#F5F1E8]/45">{displayEmail}</p>
                    ) : null}
                  </div>
                </div>
              )}
              {/* explicit id + username rows for clarity */}
              {!profileLoading && !profileError && profile && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#23262E] bg-white/2 px-3 py-2">
                    <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-wide text-[#F5F1E8]/40">USERNAME</p>
                    <p className="mt-1 text-sm font-medium text-[#F5F1E8]">{profile.username}</p>
                  </div>
                  <div className="rounded-lg border border-[#23262E] bg-white/2 px-3 py-2">
                    <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-wide text-[#F5F1E8]/40">USER ID</p>
                    <p className="mt-1 text-sm font-medium text-[#F5F1E8]">{profile.id}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col divide-y divide-[#23262E] rounded-xl border border-[#23262E]">
              {["Account settings"].map((label) => (
                <button
                  key={label}
                  className="flex items-center justify-between px-4 py-3 text-sm text-[#F5F1E8]/70 transition-colors hover:bg-white/3 hover:text-[#F5F1E8]"
                >
                  {label}
                  <ChevronRight size={15} className="text-[#F5F1E8]/25" />
                </button>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#23262E] py-2.5 text-sm text-[#F5F1E8]/70 transition-colors hover:border-[#F6788F]/40 hover:text-[#F6788F]"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
