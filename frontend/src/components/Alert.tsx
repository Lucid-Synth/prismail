import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import type { JSX } from "react";

export type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: string; title: string; iconComp: React.ComponentType<{ size?: number; className?: string }> }
> = {
  error: {
    container: "border-[#F6788F]/30 bg-[#F6788F]/10 backdrop-blur",
    icon: "text-[#F6788F]",
    title: "text-[#FF8FA0]",
    iconComp: AlertCircle,
  },
  success: {
    container: "border-[#34D399]/30 bg-[#34D399]/10 backdrop-blur",
    icon: "text-[#34D399]",
    title: "text-[#6EE7B7]",
    iconComp: CheckCircle2,
  },
  warning: {
    container: "border-[#F5B942]/30 bg-[#F5B942]/10 backdrop-blur",
    icon: "text-[#F5B942]",
    title: "text-[#FCD68B]",
    iconComp: TriangleAlert,
  },
  info: {
    container: "border-[#4FC3F7]/30 bg-[#4FC3F7]/10 backdrop-blur",
    icon: "text-[#4FC3F7]",
    title: "text-[#7DD3FC]",
    iconComp: Info,
  },
};

export function Alert({ variant, title, message, onDismiss }: AlertProps): JSX.Element {
  const style = variantStyles[variant];
  const Icon = style.iconComp;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      role="alert"
      className={`relative flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg shadow-black/20 ${style.container}`}
    >
      {/* left accent bar */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-80 ${
          variant === "error"
            ? "bg-[#F6788F]"
            : variant === "success"
              ? "bg-[#34D399]"
              : variant === "warning"
                ? "bg-[#F5B942]"
                : "bg-[#4FC3F7]"
        }`}
      />

      <Icon size={18} className={`mt-0.5 shrink-0 ${style.icon}`} />

      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-[13px] font-semibold leading-none tracking-tight ${style.title}`}>{title}</p>
        )}
        <p className={`text-[13.5px] leading-relaxed ${title ? "mt-1 text-[#F5F1E8]/85" : "text-[#F5F1E8]/90"}`}>
          {message}
        </p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 rounded-md p-1 text-[#F5F1E8]/40 hover:bg-white/10 hover:text-[#F5F1E8]/80 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}

interface AlertStackProps {
  alerts: Array<{ id: string; variant: AlertVariant; title?: string; message: string }>;
  onDismiss: (id: string) => void;
}

export function AlertStack({ alerts, onDismiss }: AlertStackProps): JSX.Element {
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {alerts.map((a) => (
          <Alert
            key={a.id}
            variant={a.variant}
            title={a.title}
            message={a.message}
            onDismiss={() => onDismiss(a.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
