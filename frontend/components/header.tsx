import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
    return (
        <header className="top-0 right-0 left-0 z-50 fixed bg-lime-100/70 supports-backdrop-filter:bg-lime-100/60 dark:bg-stone-900/70 dark:supports-backdrop-filter:bg-stone-900/60 backdrop-blur-xl border-border/50 border-b w-full">
            <div className="flex justify-between items-center mx-auto px-4 max-w-7xl h-16 font-mono text-sm container">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/icon.png"
                        alt="Cockatiel Finances Icon"
                        width={32}
                        height={32}
                        priority
                    />
                    <span className="bg-clip-text bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-teal-600 dark:to-teal-500 font-extrabold text-transparent text-lg tracking-tight">
                        Cockatiel Finances
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <SignedIn>
                        <div className="flex items-center gap-4 text-muted-foreground">
                             <Link href="/home" className="font-medium hover:text-foreground text-sm transition-colors">
                                Dashboard
                            </Link>
                             <Link href="/transactions" className="font-medium hover:text-foreground text-sm transition-colors">
                                Transactions
                            </Link>
                        </div>
                        <div className="mx-2 bg-border w-px h-6"></div>
                        <div className="flex items-center gap-2">
                             <ModeToggle />
                            <UserButton afterSignOutUrl="/" appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8 focus:ring-2 focus:ring-ring focus:outline-none rounded-full"
                                }
                            }} />
                        </div>
                    </SignedIn>
                </nav>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <SignedIn>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-5 h-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <div className="flex flex-col gap-6 mt-6 p-4">
                                    <Image
                                        src={"/mascot.png"}
                                        alt={"Mascot"}
                                        width={100}
                                        height={100}
                                        className="-scale-x-100 transform"
                                    />
                                    <Link href="/home" className="font-medium hover:text-foreground text-lg">
                                        Dashboard
                                    </Link>
                                    <Link href="/transactions" className="font-medium hover:text-foreground text-lg">
                                        Transactions
                                    </Link>
                                    <Link href="/privacy" className="font-medium hover:text-foreground text-lg">
                                        Privacy
                                    </Link>
                                    <Link href="/terms" className="font-medium hover:text-foreground text-lg">
                                        Terms
                                    </Link>
                                    <div className="bg-border w-full h-px"></div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="font-medium text-muted-foreground">Theme</span>
                                        <ModeToggle />
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="font-medium text-muted-foreground">Profile</span>
                                        <UserButton afterSignOutUrl="/" appearance={{
                                            elements: {
                                                avatarBox: "w-8 h-8 focus:ring-2 focus:ring-ring focus:outline-none rounded-full"
                                            }
                                        }} />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}