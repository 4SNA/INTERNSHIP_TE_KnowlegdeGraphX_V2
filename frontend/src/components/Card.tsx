import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "glass-panel" | "outline" | "solid";
  hoverable?: boolean;
}

export function Card({
  className,
  variant = "glass",
  hoverable = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[40px] p-6 transition-all duration-300 relative overflow-hidden",
        {
          "bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 shadow-2xl": variant === "glass",
          "bg-zinc-950/60 backdrop-blur-2xl border border-zinc-800/60 shadow-3xl": variant === "glass-panel",
          "bg-transparent border border-zinc-800": variant === "outline",
          "bg-zinc-900 border-zinc-800": variant === "solid",
        },
        hoverable && "hover:border-indigo-500/20 hover:shadow-indigo-500/5 hover:translate-y-[-2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
