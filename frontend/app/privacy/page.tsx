import Header from "@/components/header";
import Footer from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col bg-background selection:bg-primary/20 min-h-screen font-mono text-foreground">
      <Header />
      
      <main className="flex-1 mx-auto px-4 pt-24 pb-12 max-w-4xl container">
        <h1 className="mb-8 font-bold text-4xl tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you use Cockatiel Finances:
            </p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Account Information (via Clerk authentication)</li>
              <li>Financial Data (Income, Expenses, Transaction details)</li>
              <li>Usage Data (how you interact with the application)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and financial records</li>
              <li>Send you technical notices and support messages</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">3. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold text-foreground text-2xl">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:micaelmiranda124@gmail.com" className="text-primary hover:underline">micaelmiranda124@gmail.com</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
