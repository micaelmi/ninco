import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/header';
import { ClientPricing } from './client-pricing';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the plan that fits your needs. Upgrade to Premium for more AI credits and features.',
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-8 px-4 pt-24 pb-16 min-h-screen">
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Choose your plan
          </h1>
          <p className="text-muted-foreground text-lg">
            Upgrade for more AI-powered transactions each month.
          </p>
        </div>

        <div className="w-full max-w-4xl">
          <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <ClientPricing />
          </Suspense>
        </div>
      </main>
    </>
  );
}
