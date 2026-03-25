"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Coffee, ShoppingBag, TrendingUp } from "lucide-react";

export function DashboardPreviewSection() {
  return (
    <section className="relative flex flex-col justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <div className="absolute inset-0 bg-linear-to-b from-lime-200 dark:from-stone-950 to-stone-50 dark:to-stone-950 h-32 md:h-64" />

      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="shadow-2xl shadow-stone-900/10 dark:shadow-black/40 border border-stone-200/50 dark:border-stone-800/50 rounded-2xl md:rounded-[32px] ring-1 ring-stone-900/5 dark:ring-white/10 overflow-hidden"
        >
          <div className="relative bg-white dark:bg-stone-900 rounded-2xl md:rounded-[32px] w-full overflow-hidden">
            {/* Window controls mockup */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-950 px-4 py-3 border-stone-200/50 dark:border-stone-800/50 border-b">
              <div className="flex gap-2">
                <div className="bg-rose-400 rounded-full w-3 h-3"></div>
                <div className="bg-amber-400 rounded-full w-3 h-3"></div>
                <div className="bg-emerald-400 rounded-full w-3 h-3"></div>
              </div>
            </div>
            {/* The Image */}
            <Image
              src="/screenshot-dashboard-light.png"
              alt="Ninco Dashboard Overview Desktop"
              width={1920}
              height={1080}
              className="hidden md:block w-full h-auto object-cover"
              priority
            />
            <Image
              src="/screenshot-dashboard-light-mobile.png"
              alt="Ninco Dashboard Overview Mobile"
              width={1080}
              height={1920}
              className="block md:hidden w-full h-auto object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative flex justify-center items-center mx-auto w-full max-w-3xl"
      >
        <div className="relative flex justify-center items-center mt-8 sm:mt-12 w-full">
          <div className="absolute bg-lime-400/20 dark:bg-emerald-500/10 blur-[80px] rounded-full w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] pointer-events-none" />

          <Image
            src="/mascot.png"
            alt="Ninco Mascot"
            width={400}
            height={400}
            className="z-10 relative opacity-100 drop-shadow-2xl w-[60%] md:w-[40%] object-contain"
            priority
          />
        </div>
      </motion.div>
    </section>
  );
}
