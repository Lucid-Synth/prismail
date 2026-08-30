import { useState, type ButtonHTMLAttributes, type JSX } from "react";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Sparkles,
  Zap,
  ArrowRight,
  Check,
  Menu,
  X,
  Mail,
} from "lucide-react";


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const viewportOnce = { once: true, amount: 0.3 } as const;

interface Tone {
  name: string;
  color: string;
  glow: string;
  snippet: string;
}

const TONES: Tone[] = [
  {
    name: "Direct",
    color: "#4FC3F7",
    glow: "rgba(79,195,247,0.35)",
    snippet:
      "I've shipped three React Native apps end-to-end. Riverbank's mobile role looks like a fit — worth 15 minutes this week?",
  },
  {
    name: "Curious",
    color: "#8B7CF6",
    glow: "rgba(139,124,246,0.35)",
    snippet:
      "Saw Riverbank is rebuilding the onboarding flow — curious what's driving that. I've solved something similar, happy to compare notes.",
  },
  {
    name: "Bold",
    color: "#F5B942",
    glow: "rgba(245,185,66,0.35)",
    snippet:
      "Your checkout funnel is leaking users at step three. I can show you exactly where, and how I'd fix it — 10 minutes, no deck.",
  },
  {
    name: "Warm",
    color: "#F6788F",
    glow: "rgba(246,120,143,0.35)",
    snippet:
      "I've followed Riverbank's design blog for a year — the recent rebrand post especially. Would love to add something useful to that team.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Drop in your details",
    body: "Name, role, GitHub, portfolio, and the skills you want up front.",
  },
  {
    num: "02",
    title: "Point it at the target",
    body: "Company name and the role you're writing to. Prismail reads the room.",
  },
  {
    num: "03",
    title: "Pick a tone",
    body: "Direct, curious, bold, or warm — the same facts, refracted differently.",
  },
  {
    num: "04",
    title: "Send it",
    body: "A ready-to-paste email lands in seconds. Tweak a line, or don't.",
  },
];

const FEATURES = [
  {
    icon: Target,
    title: "Speaks to the role",
    body: "The company and role you enter shape the hook — not a generic template with blanks filled in.",
  },
  {
    icon: Sparkles,
    title: "A tone that's actually yours",
    body: "Four distinct voices, not four synonyms for 'professional.' Pick the one that sounds like you.",
  },
  {
    icon: Zap,
    title: "Seconds, not hours",
    body: "One form, one generation. No blank page, no fifteen rewrites before you hit send.",
  },
];



export default function Home(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  function loginButtonHandler(){
  navigate('/login');
}

  function signupButtonHandler(){
    navigate('/signup')
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-[#F5F1E8] font-['Inter',sans-serif] antialiased overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#23262E]/80 bg-[#0B0C10]/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />

          <div className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm text-[#F5F1E8]/70 transition-colors hover:text-[#F5F1E8]">
              How it works
            </a>
            <a href="#tones" className="text-sm text-[#F5F1E8]/70 transition-colors hover:text-[#F5F1E8]">
              Tones
            </a>
            <a href="#pricing" className="text-sm text-[#F5F1E8]/70 transition-colors hover:text-[#F5F1E8]">
              Pricing
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button className="text-sm text-[#F5F1E8]/70 transition-colors hover:text-[#F5F1E8]"
            onClick={loginButtonHandler}
            >
              Log in
            </button>
            <Button className="rounded-full bg-[#F5F1E8] px-5 py-2 text-[#0B0C10] hover:bg-[#F5F1E8]/90"
            onClick={signupButtonHandler}
            >
              Start writing
            </Button>
          </div>

          <button
            className="text-[#F5F1E8] md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-[#23262E] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#how" className="text-sm text-[#F5F1E8]/70">How it works</a>
              <a href="#tones" className="text-sm text-[#F5F1E8]/70">Tones</a>
              <a href="#pricing" className="text-sm text-[#F5F1E8]/70">Pricing</a>
              <button className="text-left text-sm text-[#F5F1E8]/70">Log in</button>
              <Button className="mt-1 w-full rounded-full bg-[#F5F1E8] px-5 py-2 text-[#0B0C10] hover:bg-[#F5F1E8]/90">
                Start writing
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#23262E] bg-white/3 px-3 py-1 font-['JetBrains_Mono',monospace] text-[11px] tracking-wide text-[#F5F1E8]/60"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#4FC3F7]" />
              COLD EMAIL, REFRACTED
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-['Space_Grotesk',sans-serif] text-[2.6rem] font-semibold leading-[1.08] tracking-tight md:text-6xl"
            >
              One profile.
              <br />
              Every tone.
              <br />
              <span className="bg-linear-to-r from-[#4FC3F7] via-[#8B7CF6] to-[#F6788F] bg-clip-text text-transparent">
                The email that replies.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-md text-[15px] leading-relaxed text-[#F5F1E8]/60">
              Feed Prismail your GitHub, your role, and who you're writing to.
              It splits that into four distinct tones of cold email — pick the
              one that sounds like you, and send.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="h-11 rounded-full bg-[#F5F1E8] px-6 text-[15px] font-medium text-[#0B0C10] hover:bg-[#F5F1E8]/90"
                onClick={signupButtonHandler}
                >
                  Generate your first email
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </motion.div>
              <a
                href="#how"
                className="text-sm text-[#F5F1E8]/70 underline decoration-[#23262E] underline-offset-4 transition-colors hover:text-[#F5F1E8]"
              >
                See how it works
              </a>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/35">
              NO CARD REQUIRED 
            </motion.p>
          </motion.div>

          <PrismVisual />
        </div>
      </section>

      {/* Metrics strip */}

      <section className="border-y border-[#23262E] bg-white/2">
        <motion.div
          className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-[#23262E] px-6"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {[
            ["3,200+", "developers writing with Prismail"],
            ["68%", "average open rate"],
            ["41,000+", "emails generated"],
          ].map(([stat, label]) => (
            <motion.div key={stat} variants={fadeUp} className="px-2 py-8 text-center md:px-6">
              <div className="font-['Space_Grotesk',sans-serif] text-2xl font-semibold md:text-3xl">
                {stat}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-[#F5F1E8]/45 md:text-xs">
                {label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="THE FLOW"
          title="From blank page to sent, in four steps"
        />

        <motion.div
          className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#23262E] bg-[#23262E] md:grid-cols-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {STEPS.map((step) => (
            <motion.div key={step.num} variants={fadeUp} className="bg-[#0B0C10] p-7">
              <div className="font-['JetBrains_Mono',monospace] text-xs text-[#F5F1E8]/35">
                {step.num}
              </div>
              <div className="mt-4 font-['Space_Grotesk',sans-serif] text-lg font-medium">
                {step.title}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#F5F1E8]/55">
                {step.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Tone showcase */}
      <section id="tones" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="ONE INPUT, FOUR OUTPUTS"
          title="Same facts. Different light."
          sub="Every tone pulls from the same profile — only the angle changes."
        />

        <motion.div
          className="mt-14 grid gap-4 md:grid-cols-2"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {TONES.map((tone) => (
            <motion.div
              key={tone.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative rounded-xl border border-[#23262E] bg-white/2 p-6 transition-colors hover:border-[#3a3e48]"
              style={{ borderLeftColor: tone.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: tone.color, boxShadow: `0 0 12px ${tone.glow}` }}
                />
                <span className="font-['JetBrains_Mono',monospace] text-xs tracking-wide text-[#F5F1E8]/50">
                  {tone.name.toUpperCase()}
                </span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-[#F5F1E8]/80">
                "{tone.snippet}"
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-[#23262E] bg-white/2">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeading eyebrow="WHY IT WORKS" title="Personalized without the busywork" />

          <motion.div
            className="mt-14 grid gap-8 sm:grid-cols-2 md:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <motion.div key={title} variants={fadeUp}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#23262E] bg-[#0B0C10]">
                  <Icon size={18} className="text-[#F5F1E8]/70" />
                </div>
                <h3 className="mt-4 font-['Space_Grotesk',sans-serif] text-base font-medium">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F5F1E8]/55">
                  {body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading eyebrow="PRICING" title="Free forever." sub="No paid plan. Just start writing." />

        <motion.div
          className="mt-14 flex justify-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.div variants={fadeUp} className="w-full max-w-sm">
            <PricingCard
              name="Free"
              price="$0"
              period="/mo"
              description="Everything you need to sound like you."
              features={["Unlimited emails", "All four tones", "GitHub + portfolio import", "Saved profiles & history"]}
              highlighted={false}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#23262E]">
        <motion.div
          className="mx-auto max-w-6xl px-6 py-24 text-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.h2
            variants={fadeUp}
            className="font-['Space_Grotesk',sans-serif] text-3xl font-semibold tracking-tight md:text-5xl"
          >
            Stop staring at a blank compose window.
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-md text-[15px] text-[#F5F1E8]/55">
            Your details are already the pitch. Prismail just finds the tone.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9">
            <motion.div className="inline-block" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="h-11 rounded-full bg-[#F5F1E8] px-7 text-[15px] font-medium text-[#0B0C10] hover:bg-[#F5F1E8]/90"
              onClick={signupButtonHandler}>
                Generate your first email
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#23262E]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <Logo compact />
          <div className="flex gap-6 text-sm text-[#F5F1E8]/45">
            <a href="#how" className="hover:text-[#F5F1E8]/80">How it works</a>
            <a href="#tones" className="hover:text-[#F5F1E8]/80">Tones</a>
            <a href="#pricing" className="hover:text-[#F5F1E8]/80">Pricing</a>
          </div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#F5F1E8]/30">
            © {new Date().getFullYear()} Prismail
          </p>
        </div>
      </footer>
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

function Logo({ compact = false }: { compact?: boolean }): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L21 20 H3 Z" fill="none" stroke="#F5F1E8" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12 2 L12 20" stroke="url(#prism-grad)" strokeWidth="1.4" />
        <defs>
          <linearGradient id="prism-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="100%" stopColor="#F6788F" />
          </linearGradient>
        </defs>
      </svg>
      {!compact && (
        <span className="font-['Space_Grotesk',sans-serif] text-[17px] font-semibold tracking-tight">
          Prismail
        </span>
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}): JSX.Element {
  return (
    <div className="max-w-xl">
      <div className="font-['JetBrains_Mono',monospace] text-[11px] tracking-wide text-[#F5F1E8]/40">
        {eyebrow}
      </div>
      <h2 className="mt-3 font-['Space_Grotesk',sans-serif] text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 text-[15px] text-[#F5F1E8]/55">{sub}</p>}
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
}): JSX.Element {
  const navigate = useNavigate()

  function loginButtonHandler(){
    navigate('/login');
  }

  return (
    <div
      className={`rounded-2xl border p-8 ${
        highlighted
          ? "border-[#8B7CF6]/50 bg-linear-to-b from-[#8B7CF6]/8 to-transparent"
          : "border-[#23262E] bg-white/2"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-['Space_Grotesk',sans-serif] text-lg font-medium">{name}</span>
        {highlighted && (
          <span className="rounded-full bg-[#8B7CF6]/15 px-2.5 py-1 font-['JetBrains_Mono',monospace] text-[10px] text-[#8B7CF6]">
            MOST USED
          </span>
        )}
      </div>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-['Space_Grotesk',sans-serif] text-4xl font-semibold">{price}</span>
        <span className="text-sm text-[#F5F1E8]/45">{period}</span>
      </div>
      <p className="mt-3 text-sm text-[#F5F1E8]/55">{description}</p>

      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[#F5F1E8]/75">
            <Check size={15} className="shrink-0 text-[#4FC3F7]" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        className={`mt-8 w-full rounded-full px-5 py-2.5 ${
          highlighted
            ? "bg-[#F5F1E8] text-[#0B0C10] hover:bg-[#F5F1E8]/90"
            : "border border-[#23262E] bg-transparent text-[#F5F1E8] hover:bg-white/4"
        }`}
        onClick={loginButtonHandler}
      >
        {highlighted ? "Go Pro" : "Start free"}
      </Button>
    </div>
  );
}


function PrismVisual(): JSX.Element {
  const beamDelay = 0.35;
  const prismDelay = 0.85;
  const splitStart = 1.05;
  const splitStagger = 0.12;

  return (
    <div className="relative flex h-105 items-center justify-center">
      <svg viewBox="0 0 420 420" className="h-full w-full max-w-md" fill="none">
        {/* incoming beam */}
        <motion.line
          x1="10"
          y1="210"
          x2="150"
          y2="210"
          stroke="#F5F1E8"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: beamDelay, ease: "easeOut" }}
        />
        <motion.circle
          cx="10"
          cy="210"
          r="3"
          fill="#F5F1E8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: beamDelay }}
        />

        {/* prism triangle */}
        <motion.path
          d="M150 150 L210 210 L150 270 Z"
          fill="rgba(245,241,232,0.03)"
          stroke="#F5F1E8"
          strokeOpacity="0.6"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: prismDelay, ease: "easeOut" }}
          style={{ transformOrigin: "180px 210px" }}
        />

        {/* split beams */}
        {TONES.map((tone, i) => {
          const yEnd = 90 + i * 82;
          const delay = splitStart + i * splitStagger;
          return (
            <g key={tone.name}>
              <motion.line
                x1="188"
                y1="210"
                x2="390"
                y2={yEnd}
                stroke={tone.color}
                strokeWidth="1.5"
                strokeOpacity="0.85"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay, ease: "easeOut" }}
              />
              <motion.circle
                cx="390"
                cy={yEnd}
                r="4"
                fill={tone.color}
                style={{ filter: `drop-shadow(0 0 6px ${tone.glow})` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.4 }}
              />
            </g>
          );
        })}
      </svg>

      {/* tone labels, positioned over the beam endpoints */}
      <div className="pointer-events-none absolute inset-0">
        {TONES.map((tone, i) => {
          const delay = splitStart + i * splitStagger + 0.35;
          return (
            <motion.div
              key={tone.name}
              className="absolute right-0 flex -translate-y-1/2 items-center gap-1.5 rounded-full border bg-[#0B0C10] px-2.5 py-1"
              style={{
                top: `${(90 + i * 82) / 420 * 100}%`,
                borderColor: `${tone.color}55`,
              }}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay }}
            >
              <Mail size={11} style={{ color: tone.color }} />
              <span className="font-['JetBrains_Mono',monospace] text-[10px]" style={{ color: tone.color }}>
                {tone.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}