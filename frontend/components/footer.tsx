"use client"

import Link from "next/link";
import Image from "next/image";
import { Github, Mail } from "lucide-react";
import { FeedbackDialog } from "@/components/feedback-dialog";

export default function Footer() {
  return (
    <footer className="bg-linear-to-br from-lime-200/50 dark:from-stone-900/50 to-lime-100/80 dark:to-stone-950/90 backdrop-blur-xl border-t">
      <div className="mx-auto px-4 py-8 max-w-7xl container">
        <div className="flex md:flex-row flex-col justify-between items-center gap-8">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-4">
                <Image
                  src="/mascot.png"
                  alt="Ninco"
                  width={100}
                  height={100}
                />
            <div>
              <h3 className="font-bold text-lg tracking-tight">Ninco</h3>
              <p className="font-mono text-muted-foreground text-sm">
                Smarter money management.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-medium text-sm">
            <Link href="/home" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/transactions" className="text-muted-foreground hover:text-primary transition-colors">
              Transactions
            </Link>
            <Link href="/manage" className="text-muted-foreground hover:text-primary transition-colors">
              Categories & Tags
            </Link>
            <FeedbackDialog>
              <button 
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Feedback
              </button>
            </FeedbackDialog>
          </nav>

          {/* Social & Contact */}
          <div className="flex items-center gap-4">
            <Link 
              href="https://github.com/micaelmi/ninco" 
              target="_blank" 
              rel="noreferrer"
              className="hover:bg-muted p-2 rounded-full text-muted-foreground hover:text-foreground transition-all"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link 
              href="mailto:micaelmiranda124@gmail.com"
              className="hover:bg-muted p-2 rounded-full text-muted-foreground hover:text-foreground transition-all"
            >
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="flex md:flex-row flex-col justify-between items-center gap-4 mt-8 pt-8 border-muted/50 border-t font-mono text-muted-foreground text-xs">
          <p>© {new Date().getFullYear()} Ninco Team. Built with code and seeds.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
