"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative flex flex-col justify-center items-center bg-lime-200 dark:bg-stone-950 px-4 py-20 min-h-[90vh] overflow-hidden text-center">
      {/* Logo */}
      <div className="top-6 md:top-8 left-6 md:left-8 z-50 absolute">
        <Link href="/" className="flex items-center gap-2">
            <Image
                src="/icon.png"
                alt="Ninco Icon"
                width={32}
                height={32}
                priority
            />
            <span className="bg-clip-text bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-teal-600 dark:to-teal-500 font-extrabold text-transparent text-xl tracking-tight">
                Ninco
            </span>
        </Link>
      </div>
      {/* Background decoration */}
      <div className="top-0 left-1/2 -z-10 absolute bg-emerald-500/20 dark:bg-emerald-500/10 blur-[120px] rounded-full w-[800px] h-[400px] -translate-x-1/2 pointer-events-none" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center mx-auto max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 mb-6 px-3 py-1 rounded-full ring-1 ring-emerald-500/20 ring-inset font-medium text-emerald-800 dark:text-emerald-300 text-sm">
          <span>✨ New: Advanced Analytics</span>
        </div>

        <h1 className="mb-6 font-extrabold text-stone-900 dark:text-stone-50 text-5xl sm:text-7xl leading-[1.1] tracking-tight">
          Take Control of Your <br />
          <span className="bg-clip-text bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-teal-600 dark:to-teal-500 text-transparent">
            Personal Finances
          </span>
        </h1>
        
        <p className="mb-10 max-w-2xl font-medium text-stone-600 dark:text-stone-400 text-lg sm:text-xl">
          Track expenses, set visual budgets, and achieve financial freedom without the spreadsheet headaches. Built for simplicity and speed.
        </p>

        <div className="flex sm:flex-row flex-col gap-4 mb-16">
          <Show when="signed-out">
            <Link href="/sign-up">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 shadow-lg px-8 w-full sm:w-auto h-12 text-white text-base hover:scale-105 transition-all cursor-pointer">
                Start Tracking for Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="bg-white/50 hover:bg-stone-100 dark:bg-stone-900/50 dark:hover:bg-stone-800 backdrop-blur-sm px-8 border-stone-200 dark:border-stone-800 w-full sm:w-auto h-12 text-base transition-all cursor-pointer">
                Sign In
              </Button>
            </Link>
          </Show>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex justify-center items-center mx-auto w-full max-w-3xl"
        >
          <div className="relative flex justify-center items-center mt-8 sm:mt-12 w-full">
            {/* Subtle glow behind mascot */}
            <div className="absolute bg-emerald-500/20 dark:bg-emerald-500/10 blur-[80px] rounded-full w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] pointer-events-none" />
            
            <Image
              src="/mascot.png"
              alt="Ninco Mascot"
              width={400}
              height={400}
              className="z-10 relative opacity-100 drop-shadow-2xl w-[60%] md:w-[40%] object-contain"
              priority
            />

            {/* Floating UI Element */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="hidden md:block bottom-10 left-[10%] lg:left-[5%] z-20 absolute bg-white dark:bg-stone-950 shadow-2xl p-5 border border-stone-200 dark:border-stone-800 rounded-xl"
            >
              <div className="mb-1 font-medium text-stone-500 dark:text-stone-400 text-sm">Total Balance</div>
              <div className="font-extrabold text-stone-900 dark:text-stone-50 text-3xl">$12,450.00</div>
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 mt-2 px-2 py-1 rounded-md w-fit font-medium text-emerald-600 dark:text-emerald-400 text-xs">
                ↗ +$450 this month
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
