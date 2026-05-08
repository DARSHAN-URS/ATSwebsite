import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96]",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] relative overflow-hidden group",
        destructive: "bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-600/20",
        outline: "border border-white/10 bg-transparent hover:bg-white/5 hover:text-white hover:border-white/20",
        secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/5",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        link: "text-blue-500 underline-offset-4 hover:underline",
        premium: "bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] border-none"
      },
      size: {
        default: "h-12 px-8 py-2",
        sm: "h-10 px-6",
        lg: "h-14 px-10 text-[11px]",
        xl: "h-20 px-12 text-[12px]",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        {...props} 
      >
        {props.children}
        {variant === 'default' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
