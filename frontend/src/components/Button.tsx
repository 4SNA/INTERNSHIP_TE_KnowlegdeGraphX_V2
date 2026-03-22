import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer outline-none",
          {
            "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 hover:shadow-indigo-500/40": variant === "primary",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-sm border border-zinc-700": variant === "secondary",
            "hover:bg-zinc-800/80 text-zinc-400 hover:text-white": variant === "ghost",
            "border border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100": variant === "outline",
            "h-10 px-5": size === "md",
            "h-8 px-3 text-[11px] rounded-xl": size === "sm",
            "h-7 px-2 text-[10px] rounded-lg": size === "xs",
            "h-12 px-8 text-base rounded-2xl": size === "lg",
            "h-11 w-11 p-0 flex items-center justify-center rounded-2xl": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
