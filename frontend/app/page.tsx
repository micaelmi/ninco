import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/home");
  }

  return (
    <>
    <Header />
    <main className="flex flex-col justify-center items-center bg-lime-200 dark:bg-stone-950 p-8 min-h-screen text-stone-900 dark:text-stone-50">
      <div className="z-10 lg:flex justify-between items-center w-full max-w-5xl font-mono text-sm">
      </div>

        <Image
          src="/mascot.png"
          alt="Cockatiel Finances Mascot"
          width={300}
          height={300}
          priority
        />
      <div className="relative flex flex-col place-items-center gap-6 text-center">
        <h1 className="bg-clip-text bg-linear-to-r from-emerald-500 dark:from-emerald-400 to-teal-600 dark:to-teal-500 font-extrabold text-transparent text-4xl sm:text-7xl tracking-tight">
          Cockatiel Finances
        </h1>
        <p className="font-semibold text-stone-700 dark:text-stone-400 text-lg">
          Master your money with ease. Simple, powerful, and built for you.
        </p>
        <div className="flex gap-4 mt-6">
          <SignedOut>
             <Link href="/sign-up">
               <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 border border-green-900 text-white transition-colors cursor-pointer">Get Started</Button>
             </Link>
             <Link href="/sign-in">
               <Button className="bg-green-50 hover:bg-green-100 border border-green-900 text-green-900 transition-colors cursor-pointer" size="lg">Sign In</Button>
             </Link>
          </SignedOut>
        </div>
      </div>
    </main>
</>
  );
}
