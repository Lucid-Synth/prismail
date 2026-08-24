import { useState, type ButtonHTMLAttributes, type FormEvent, type JSX } from "react";
import { motion, type Variants } from "framer-motion";
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};



export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try{
      
      const formData = new URLSearchParams();

      formData.append('grant_type','password');
      formData.append('username',username);
      formData.append('password', password);
      formData.append('scope','');
      formData.append('client_id','');
      formData.append('client_secret','');

      const response = await fetch('http://localhost:8000/auth/login',{
        method: 'POST',
        headers: {
          'Content-type': "application/x-www-form-urlencoded"
        },
        body: formData 
      })

      if(!response.ok) throw new Error("Submission failed")

      const savedData = await response.json()
      setLoading(false)
      localStorage.setItem('token',savedData.access_token)
      console.log(savedData)
      navigate('/dashboard')
    }
    catch(error){
      console.log("Error: ", error)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0B0C10] font-['Inter',sans-serif] text-[#F5F1E8] antialiased">
      <BrandPanel
        eyebrow="WELCOME BACK"
        title={
          <>
            Every tone,
            <br />
            still yours.
          </>
        }
        body="Log back in and keep sending emails that sound like you wrote them — because you did."
      />

      {/* Form panel */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-16 md:w-1/2">
        <motion.div
          className="w-full max-w-sm"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="mb-10 md:hidden">
            <Logo />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-['Space_Grotesk',sans-serif] text-3xl font-semibold tracking-tight"
          >
            Log in
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-2 text-[15px] text-[#F5F1E8]/55">
            Good to see you again.
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-9 space-y-5">
            <Field
              id="username"
              label="Username"
              icon={User}
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="jane_dev"
              autoComplete="username"
            />

            <Field
              id="password"
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[#F5F1E8]/35 transition-colors hover:text-[#F5F1E8]/70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex justify-end">
              <a
                href="#"
                className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/40 transition-colors hover:text-[#F5F1E8]/70"
              >
                FORGOT PASSWORD?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full bg-[#F5F1E8] text-[15px] font-medium text-[#0B0C10] hover:bg-[#F5F1E8]/90"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  Log in
                  <ArrowRight size={16} className="ml-1.5" />
                </>
              )}
            </Button>
          </motion.form>

          <motion.p variants={fadeUp} className="mt-8 text-center text-sm text-[#F5F1E8]/50">
            New to Prismail?{" "}
            <a href="/signup" className="text-[#F5F1E8] underline decoration-[#23262E] underline-offset-4 hover:decoration-[#F5F1E8]/40">
              Create an account
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}


interface FieldProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  trailing?: React.ReactNode;
}

function Field({
  id,
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
  trailing,
}: FieldProps): JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-['JetBrains_Mono',monospace] text-[11px] tracking-wide text-[#F5F1E8]/45"
      >
        {label.toUpperCase()}
      </label>
      <div className="group flex items-center gap-2.5 rounded-lg border border-[#23262E] bg-white/2 px-3.5 py-2.5 transition-colors focus-within:border-[#4FC3F7]/50 focus-within:bg-white/3">
        <Icon size={16} className="shrink-0 text-[#F5F1E8]/30 transition-colors group-focus-within:text-[#4FC3F7]" />
        <input
          id={id}
          name={id}
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-[15px] text-[#F5F1E8] placeholder:text-[#F5F1E8]/25 focus:outline-none"
        />
        {trailing}
      </div>
      {hint && <p className="mt-1.5 text-xs text-[#F5F1E8]/35">{hint}</p>}
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
        <path d="M12 2 L12 20" stroke="url(#prism-grad-login)" strokeWidth="1.4" />
        <defs>
          <linearGradient id="prism-grad-login" x1="0" y1="0" x2="0" y2="1">
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


function BrandPanel({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
}): JSX.Element {
  const strands = ["#4FC3F7", "#8B7CF6", "#F5B942", "#F6788F"];

  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[#23262E] bg-[#0B0C10] p-12 md:flex">
      <a href="/">
        <Logo />
      </a>

      <div className="max-w-sm">
        <div className="font-['JetBrains_Mono',monospace] text-[11px] tracking-wide text-[#F5F1E8]/40">
          {eyebrow}
        </div>
        <h2 className="mt-3 font-['Space_Grotesk',sans-serif] text-4xl font-semibold leading-[1.1] tracking-tight">
          {title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[#F5F1E8]/55">{body}</p>
      </div>

      <div className="font-['JetBrains_Mono',monospace] text-[11px] text-[#F5F1E8]/30">
        © {new Date().getFullYear()} Prismail
      </div>

      {/* ambient beam strands, decorative only */}
      <svg
        className="pointer-events-none absolute bottom-0 right-0 h-2/3 w-2/3 opacity-[0.35]"
        viewBox="0 0 400 400"
        fill="none"
      >
        {strands.map((color, i) => (
          <line
            key={color}
            x1="0"
            y1={400 - i * 60}
            x2="400"
            y2={400 - i * 130}
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        ))}
      </svg>
    </div>
  );
}