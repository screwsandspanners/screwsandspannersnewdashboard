import { useEffect, useState } from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertVariant;
  message: string;
  title?: string;
  duration?: number;
  onClose?: () => void;
}

const styles = {
  success: {
    container: "bg-emerald-50 border-emerald-500 text-emerald-800",
    icon: "✅",
    title: "Success",
  },
  error: {
    container: "bg-red-50 border-red-500 text-red-800",
    icon: "❌",
    title: "Error",
  },
  warning: {
    container: "bg-amber-50 border-amber-500 text-amber-800",
    icon: "⚠️",
    title: "Warning",
  },
  info: {
    container: "bg-blue-50 border-blue-500 text-blue-800",
    icon: "ℹ️",
    title: "Information",
  },
};

export default function Alert({
  type,
  message,
  title,
  duration = 5000,
  onClose,
}: Readonly<AlertProps>) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const style = styles[type];

  return (
    <div
      className={`
        fixed top-6 right-6
        z-50
        w-[380px]
        max-w-[90vw]
        border-l-4
        rounded-xl
        shadow-2xl
        p-5
        animate-[fadeIn_.25s_ease]
        ${style.container}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl">{style.icon}</div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {title ?? style.title}
          </h3>

          <p className="mt-1 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className="text-xl opacity-60 hover:opacity-100 transition"
        >
          ×
        </button>
      </div>
    </div>
  );
}