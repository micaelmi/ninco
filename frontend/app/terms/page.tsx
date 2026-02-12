import Header from "@/components/header";
import Footer from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col bg-background selection:bg-primary/20 min-h-screen font-mono text-foreground">
      <Header />
      
      <main className="flex-1 mx-auto px-4 pt-24 pb-12 max-w-4xl container">
        <h1 className="mb-8 font-bold text-4xl tracking-tight">Terms of Service</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Cockatiel Finances, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">2. Description of Service</h2>
            <p>
              Cockatiel Finances provides personal finance management tools. These services are provided "as is" and intended for informational purposes only. We are not financial advisors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">4. Limitation of Liability</h2>
            <p>
              In no event shall Cockatiel Finances be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

           <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">5. Contact</h2>
            <p>
              Questions about the Terms of Service should be sent to us at: <a href="mailto:micaelmiranda124@gmail.com" className="text-primary hover:underline">micaelmiranda124@gmail.com</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
