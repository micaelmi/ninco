import Header from "@/components/header";
import Footer from "@/components/footer";
import { ReportsClient } from "@/components/reports/reports-client";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col bg-background selection:bg-primary/20 min-h-screen font-mono text-foreground">
      <Header />

      <main className="flex-1 mx-auto px-4 pt-24 pb-12 max-w-7xl container">
        <ReportsClient userName={user.firstName || 'User'} />
      </main>

      <Footer />
    </div>
  );
}
