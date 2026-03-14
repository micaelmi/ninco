"use client";

import { X, Download } from "lucide-react";
import { usePWA } from "@/providers/pwa-provider";

export function InstallPWA() {
  const { showInstallPrompt, installApp, dismissPWA } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="right-4 md:right-4 bottom-4 slide-in-from-bottom-5 left-4 md:left-auto z-50 fixed md:max-w-sm animate-in">
      <div className="flex items-start gap-3 bg-card shadow-lg p-4 border border-border rounded-lg">
        <div className="flex justify-center items-center bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-12 h-12 shrink-0">
          <Download className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="mb-1 font-semibold text-foreground text-sm">
            Install Ninco App
          </h3>
          <p className="mb-3 text-muted-foreground text-xs">
            Install our app for a better experience and quick access to your
            finances.
          </p>

          <div className="flex gap-2">
            <button
              onClick={installApp}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-md font-medium text-white text-xs transition-colors"
            >
              Install
            </button>
            <button
              onClick={dismissPWA}
              className="bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md font-medium text-muted-foreground text-xs transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>

        <button
          onClick={dismissPWA}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
