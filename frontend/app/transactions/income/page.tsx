import { TransactionForm } from '@/components/forms/transaction-form';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@clerk/nextjs/server';
import { ArrowUpCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function IncomePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="bg-background selection:bg-primary/20 min-h-screen font-mono text-foreground">
      <Header />

      <main className="mx-auto px-4 pt-24 pb-12 max-w-2xl container">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-primary/10 rounded-full w-12 h-12">
                <ArrowUpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Income</CardTitle>
                <CardDescription>
                  Record a new income transaction
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionForm type="INCOME" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
