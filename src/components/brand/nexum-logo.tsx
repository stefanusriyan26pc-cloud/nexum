import { cn } from "@/lib/utils";
import Image from "next/image";

type NexumLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  variant?: "default" | "light";
};

const sizes = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 48, text: "text-2xl" },
  xl: { icon: 64, text: "text-3xl" },
};

export function NexumLogo({
  size = "md",
  showWordmark = true,
  className,
  variant = "default",
}: NexumLogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/nexum-logo.svg"
        alt="Nexum"
        width={icon}
        height={icon}
        priority
        className="shrink-0"
      />
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight",
            text,
            variant === "light" ? "text-white" : "text-slate-900"
          )}
        >
          Nexum
        </span>
      )}
    </div>
  );
}

export function NexumMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/nexum-logo.svg"
      alt="Nexum"
      width={size}
      height={size}
      priority
      className={cn("shrink-0", className)}
    />
  );
}
