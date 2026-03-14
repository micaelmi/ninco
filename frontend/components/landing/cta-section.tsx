import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";

export function CTASection() {
  return (
    <section className="relative bg-emerald-600 dark:bg-emerald-900 py-24 overflow-hidden">
      {/* Background Decorative patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-10 pointer-events-none" />
      <div className="-top-24 -right-24 absolute bg-emerald-500 dark:bg-emerald-800 opacity-50 blur-3xl rounded-full w-96 h-96 pointer-events-none" />
      <div className="-bottom-24 -left-24 absolute bg-teal-500 dark:bg-teal-800 opacity-50 blur-3xl rounded-full w-96 h-96 pointer-events-none" />
      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <h2 className="mb-6 font-extrabold text-white text-4xl sm:text-5xl">
          Ready to take charge of your financial future?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-emerald-100 text-xl">
          Join users who are already tracking their wealth, cutting unnecessary expenses, and saving for their goals with Ninco.
        </p>
        
        <Show when="signed-out">
          <Link href="/sign-up">
            <Button size="lg" className="group bg-white hover:bg-stone-50 shadow-xl px-10 border-none h-14 text-emerald-700 text-lg hover:scale-105 transition-transform">
              Start Tracking Today - It's Free
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="mt-4 text-emerald-200/80 text-sm">
            No credit card required. Setup takes less than 2 minutes.
          </p>
        </Show>
      </div>
    </section>
  );
}
