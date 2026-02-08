import { OverviewChart } from "@/components/dashboard/overview-chart";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { generateMockData } from "@/lib/mock-data";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowDownCircle, ArrowUpCircle, PlusCircle, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await currentUser();

  if (!user) {
      redirect("/sign-in");
  }

  const data = generateMockData();

  return (
    <div className="bg-background selection:bg-primary/20 min-h-screen font-mono text-foreground">
      <Header />
      
      <main className="mx-auto px-4 pt-24 pb-12 max-w-7xl container">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-8">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                <Image
                    src={"/mascot.png"}
                    alt={"Mascot"}
                    width={90}
                    height={90}
                    className="hidden md:block -scale-x-100 transform"
                />
            <div>
                 <h1 className="font-bold text-3xl tracking-tight">Welcome back, {user.firstName}!</h1>
                 <p className="text-muted-foreground">Here's what's happening with your finances today.</p>
            </div>
            </div>
            <div className="flex gap-2">
                <Button asChild>
                    <Link href="/transactions/income">
                        <PlusCircle className="mr-2 w-4 h-4" /> Add Income
                    </Link>
                </Button>
                 <Button variant="outline" asChild>
                    <Link href="/transactions/expense">
                        <PlusCircle className="mr-2 w-4 h-4" /> Add Expense
                    </Link>
                </Button>
            </div>
        </div>

        {/* Summary Cards */}
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-8">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Total Balance</CardTitle>
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">${data.balance.toLocaleString()}</div>
                    <p className="text-muted-foreground text-xs">+20.1% from last month</p>
                </CardContent>
            </Card>
             <Card className="shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Income</CardTitle>
                    <ArrowUpCircle className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">${data.income.toLocaleString()}</div>
                     <p className="text-muted-foreground text-xs">+12.5% from last month</p>
                </CardContent>
            </Card>
             <Card className="shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Expenses</CardTitle>
                    <ArrowDownCircle className="w-4 h-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">${data.expenses.toLocaleString()}</div>
                     <p className="text-muted-foreground text-xs">+4.3% from last month</p>
                </CardContent>
            </Card>
        </div>

        <div className="gap-8 grid grid-cols-1 lg:grid-cols-7">
            {/* Chart Area */}
            <Card className="col-span-1 lg:col-span-4 shadow-sm">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                        Monthly income vs expenses for the last 6 months.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <OverviewChart data={data.monthlyData} />
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="col-span-1 lg:col-span-3 shadow-sm">
                 <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                        You made {data.recentTransactions.length} transactions this month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Transaction</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.recentTransactions.slice(0, 5).map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{transaction.description}</span>
                                            <span className="text-muted-foreground text-xs">{transaction.category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {transaction.date.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${transaction.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
