"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}

export function MobileMenu({
  open,
  onOpenChange,
  children,
  className,
  side = "right",
}: MobileMenuProps) {
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "z-50 fixed inset-0 bg-black/50 h-screen transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="false"
        className={cn(
          "z-50 fixed inset-y-0 flex flex-col gap-4 bg-background shadow-lg border-l w-3/4 max-w-sm h-screen transition-transform duration-300 ease-in-out",
          side === "right" && "right-0",
          side === "left" && "left-0 border-l-0 border-r",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
          className
        )}
      >
        {children}

        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="top-4 right-4 absolute opacity-70 hover:opacity-100 rounded-xs focus:outline-hidden focus:ring-2 focus:ring-ring ring-offset-background focus:ring-offset-2 transition-opacity cursor-pointer"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}
