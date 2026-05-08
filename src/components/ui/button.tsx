import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[11px] font-black uppercase tracking-widest ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-tr from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-600/25 relative overflow-hidden group",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline: "border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-600/5",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "text-slate-500 hover:text-blue-600 hover:bg-blue-50",
        link: "text-blue-600 underline-offset-4 hover:underline",
        premium: "bg-slate-950 text-white border border-white/10 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950"
      },
      size: {
        default: "h-12 px-8 py-2",
        sm: "h-10 px-6",
        lg: "h-14 px-10 text-[12px]",
        xl: "h-16 px-12 text-[13px]",
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
        {asChild ? props.children : (
          <>
            {props.children}
            {variant === 'default' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            )}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
