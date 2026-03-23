"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { Menu, Settings, Download, FileBarChart } from "lucide-react";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { usePWA } from "@/providers/pwa-provider";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isInstallable, installApp } = usePWA();
    return (
        <header className="top-0 right-0 left-0 z-50 fixed bg-lime-100/70 supports-backdrop-filter:bg-lime-100/60 dark:bg-stone-900/70 dark:supports-backdrop-filter:bg-stone-900/60 backdrop-blur-xl border-border/50 border-b w-full">
            <div className="flex justify-between items-center mx-auto px-4 max-w-7xl h-16 font-mono text-sm container">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/icon.png"
                        alt="Ninco Icon"
                        width={32}
                        height={32}
                        priority
                    />
                    <span className="bg-clip-text bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-teal-600 dark:to-teal-500 font-extrabold text-transparent text-lg tracking-tight">
                        Ninco
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Show when="signed-in">
                        <>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <Link href="/home" className="font-medium hover:text-foreground text-sm transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/transactions" className="font-medium hover:text-foreground text-sm transition-colors">
                                    Transactions
                                </Link>
                                <Link href="/reports" className="font-medium hover:text-foreground text-sm transition-colors">
                                    Reports
                                </Link>
                                <FeedbackDialog>
                                    <button type="button" className="font-medium hover:text-foreground text-sm transition-colors cursor-pointer">
                                        Feedback
                                    </button>
                                </FeedbackDialog>
                            </div>
                            <div className="mx-2 bg-border w-px h-6"></div>
                            <div className="flex items-center gap-2">
                                {isInstallable && (
                                    <Button variant="outline" size="sm" onClick={installApp} className="hidden lg:flex items-center gap-2 mr-2">
                                        <Download className="w-4 h-4" />
                                        Install App
                                    </Button>
                                )}
                                <ModeToggle />
                                <Link href="/manage" className="hover:bg-accent focus:bg-accent p-2 rounded-md outline-none text-muted-foreground transition-colors hover:text-accent-foreground">
                                    <Settings className="w-5 h-5" />
                                    <span className="sr-only">Settings</span>
                                </Link>
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-8 h-8 focus:ring-2 focus:ring-ring focus:outline-none rounded-full"
                                        }
                                    }} />
                            </div>
                        </>
                    </Show>
                </nav>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Show when="signed-in">
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="w-5 h-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} side="right">
                            <div className="flex flex-col gap-6 mt-6 p-4">
                                <Image
                                    src={"/mascot.png"}
                                    alt={"Mascot"}
                                    width={100}
                                    height={100}
                                    className="-scale-x-100 transform"
                                />
                                <Link href="/home" className="font-medium hover:text-foreground text-lg" onClick={() => setMobileMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <Link href="/transactions" className="font-medium hover:text-foreground text-lg" onClick={() => setMobileMenuOpen(false)}>
                                    Transactions
                                </Link>
                                <Link href="/reports" className="font-medium hover:text-foreground text-lg" onClick={() => setMobileMenuOpen(false)}>
                                    Reports
                                </Link>
                                <FeedbackDialog>
                                    <button type="button" className="font-medium hover:text-foreground text-lg text-left cursor-pointer">
                                        Feedback
                                    </button>
                                </FeedbackDialog>
                                <Link href="/manage" className="font-medium hover:text-foreground text-lg" onClick={() => setMobileMenuOpen(false)}>
                                    Settings
                                </Link>
                                {isInstallable && (
                                    <button type="button" onClick={installApp} className="flex items-center gap-4 font-medium text-emerald-600 hover:text-foreground dark:text-emerald-400 text-lg text-left cursor-pointer">
                                        <Download className="w-5 h-5" />
                                        Install App
                                    </button>
                                )}
                                <div className="bg-border w-full h-px"></div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="font-medium text-muted-foreground">Theme</span>
                                    <ModeToggle />
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="font-medium text-muted-foreground">Profile</span>
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-8 h-8 focus:ring-2 focus:ring-ring focus:outline-none rounded-full"
                                            }
                                        }} />
                                </div>
                                <div className="bg-border w-full h-px"></div>
                                <div className="flex gap-4 mt-4">
                                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
                                        Privacy
                                    </Link>
                                    <span className="text-sm">&</span>
                                    <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm">
                                        Terms
                                    </Link>
                                </div>
                            </div>
                        </MobileMenu>
                    </Show>
                </div>
            </div>
        </header>
    );
}