"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallPrompt(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Save to localStorage that user dismissed the prompt
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if user previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

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
              onClick={handleInstall}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-md font-medium text-white text-xs transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md font-medium text-muted-foreground text-xs transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
