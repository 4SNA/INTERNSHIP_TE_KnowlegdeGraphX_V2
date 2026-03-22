import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 px-0.5">
        {label && (
          <label className="text-[10px] uppercase font-extrabold text-zinc-500 tracking-widest ml-1 pointer-events-none">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 transition-all outline-none",
            "focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 focus:bg-zinc-900 focus-ring hover:border-zinc-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/5 bg-rose-500/5",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
            <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase tracking-widest">
              {error}
            </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
